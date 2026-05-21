import { database } from "@server/db/client";
import { organizationRoles, ticketComments, tickets } from "@server/db/schema";
import {
	ensureAppRole,
	getActiveOrganization,
	inferSeedRole,
	listOrganizationsForViewer,
	listTicketsForViewer,
	requireAppRole,
	requireOrgMembership,
	requireViewer,
	setActiveOrganization,
} from "@server/lib/auth";
import { env } from "@server/lib/env";
import { createId } from "@server/lib/utils";
import type {
	AddCommentInput,
	AppRole,
	CreateOrganizationInput,
	CreateTicketInput,
	InviteMemberInput,
	SwitchOrganizationInput,
	UpdateMemberRoleInput,
	UpdateTicketInput,
} from "@shared/contracts";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const createOrganizationSchema = z.object({
	name: z.string().min(2).max(80),
});

const switchOrganizationSchema = z.object({
	organizationId: z.string().min(1),
});

const inviteMemberSchema = z.object({
	organizationId: z.string().min(1),
	email: z.string().email(),
});

const updateMemberRoleSchema = z.object({
	organizationId: z.string().min(1),
	userId: z.string().min(1),
	role: z.enum(["admin", "agent", "customer"]),
});

const createTicketSchema = z.object({
	organizationId: z.string().min(1),
	title: z.string().min(4).max(160),
	description: z.string().min(10).max(4000),
	priority: z.enum(["low", "medium", "high", "urgent"]),
});

const updateTicketSchema = z.object({
	organizationId: z.string().min(1),
	status: z.enum(["open", "in_progress", "waiting_on_customer", "resolved"]).optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
	assigneeUserId: z.string().nullable().optional(),
});

const addCommentSchema = z.object({
	organizationId: z.string().min(1),
	body: z.string().min(1).max(2000),
});

async function parseJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
	const parsed = schema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) {
		throw new HTTPException(400, { message: parsed.error.issues[0]?.message || "Invalid request" });
	}
	return parsed.data;
}

function upstreamError(status: number, message: string): never {
	throw new HTTPException((status >= 400 && status < 600 ? status : 500) as never, {
		message,
	});
}

export const appRoutes = new Hono();

appRoutes.get("/bootstrap", async (c) => {
	const viewer = await requireViewer(c);
	const organizations = await listOrganizationsForViewer(c);

	let activeOrganizationId = viewer.session.activeOrganizationId ?? organizations[0]?.id ?? null;

	if (!viewer.session.activeOrganizationId && organizations[0]) {
		await setActiveOrganization(c, organizations[0].id);
		activeOrganizationId = organizations[0].id;
	}

	const activeOrganization = activeOrganizationId
		? await getActiveOrganization(c, activeOrganizationId)
		: null;

	const member = activeOrganization
		? requireOrgMembership(activeOrganization, viewer.user.id)
		: null;

	const appRole =
		activeOrganization && member
			? await ensureAppRole(activeOrganization.id, viewer.user.id, inferSeedRole(member.role))
			: null;

	return c.json({
		user: viewer.user,
		session: { ...viewer.session, activeOrganizationId },
		organizations,
		activeOrganization,
		appRole,
	});
});

appRoutes.post("/organizations", async (c) => {
	await requireViewer(c);
	const body = await parseJson<CreateOrganizationInput>(c.req.raw, createOrganizationSchema);

	const response = await fetch(
		`${env.banataAuthUrl}/api/auth/organization/create`,
		{
			method: "POST",
			headers: {
				"content-type": "application/json",
				cookie: c.req.header("cookie") ?? "",
				"x-api-key": env.banataApiKey,
				"x-forwarded-host": new URL(c.req.url).host,
				"x-forwarded-proto": new URL(c.req.url).protocol.replace(/:$/, ""),
			},
			body: JSON.stringify({
				name: body.name,
				slug: body.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-+|-+$/g, ""),
			}),
		},
	);

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		upstreamError(response.status, text || "Failed to create organization");
	}

	const payload = (await response.json()) as Record<string, unknown>;
	const organizationId =
		typeof payload.id === "string"
			? payload.id
			: typeof payload.data === "object" &&
					payload.data !== null &&
					typeof (payload.data as Record<string, unknown>).id === "string"
				? ((payload.data as Record<string, unknown>).id as string)
				: null;

	if (organizationId) {
		await setActiveOrganization(c, organizationId);
	}

	return c.json({ success: true, organizationId });
});

appRoutes.post("/organizations/active", async (c) => {
	await requireViewer(c);
	const body = await parseJson<SwitchOrganizationInput>(c.req.raw, switchOrganizationSchema);
	await setActiveOrganization(c, body.organizationId);
	return c.json({ success: true });
});

appRoutes.post("/members/invite", async (c) => {
	const viewer = await requireViewer(c);
	const body = await parseJson<InviteMemberInput>(c.req.raw, inviteMemberSchema);
	const organization = await getActiveOrganization(c, body.organizationId);
	const member = requireOrgMembership(organization, viewer.user.id);
	const appRole = await ensureAppRole(organization.id, viewer.user.id, inferSeedRole(member.role));
	requireAppRole(appRole, ["admin"]);

	const response = await fetch(
		`${env.banataAuthUrl}/api/auth/organization/invite-member`,
		{
			method: "POST",
			headers: {
				"content-type": "application/json",
				cookie: c.req.header("cookie") ?? "",
				"x-api-key": env.banataApiKey,
				"x-forwarded-host": new URL(c.req.url).host,
				"x-forwarded-proto": new URL(c.req.url).protocol.replace(/:$/, ""),
			},
			body: JSON.stringify({
				organizationId: body.organizationId,
				email: body.email,
				role: "member",
			}),
		},
	);

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		upstreamError(response.status, text || "Failed to invite member");
	}

	return c.json({ success: true });
});

appRoutes.patch("/members/role", async (c) => {
	const viewer = await requireViewer(c);
	const body = await parseJson<UpdateMemberRoleInput>(c.req.raw, updateMemberRoleSchema);
	const organization = await getActiveOrganization(c, body.organizationId);
	const member = requireOrgMembership(organization, viewer.user.id);
	const appRole = await ensureAppRole(organization.id, viewer.user.id, inferSeedRole(member.role));
	requireAppRole(appRole, ["admin"]);

	const target = organization.members.find((entry) => entry.userId === body.userId);
	if (!target) {
		throw new HTTPException(404, { message: "Member not found" });
	}

	const now = Date.now();
	await database
		.insert(organizationRoles)
		.values({
			id: createId("role"),
			organizationId: body.organizationId,
			userId: body.userId,
			role: body.role,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: [organizationRoles.organizationId, organizationRoles.userId],
			set: { role: body.role, updatedAt: now },
		});

	return c.json({ success: true });
});

appRoutes.get("/tickets", async (c) => {
	const viewer = await requireViewer(c);
	const organizationId = c.req.query("organizationId");
	if (!organizationId) {
		throw new HTTPException(400, { message: "organizationId is required" });
	}

	const organization = await getActiveOrganization(c, organizationId);
	const member = requireOrgMembership(organization, viewer.user.id);
	const appRole = await ensureAppRole(organization.id, viewer.user.id, inferSeedRole(member.role));
	const records = await listTicketsForViewer(organization.id, viewer.user.id, appRole);
	return c.json({ tickets: records });
});

appRoutes.post("/tickets", async (c) => {
	const viewer = await requireViewer(c);
	const body = await parseJson<CreateTicketInput>(c.req.raw, createTicketSchema);
	const organization = await getActiveOrganization(c, body.organizationId);
	const member = requireOrgMembership(organization, viewer.user.id);
	await ensureAppRole(organization.id, viewer.user.id, inferSeedRole(member.role));

	const now = Date.now();
	const ticketId = createId("ticket");

	await database.insert(tickets).values({
		id: ticketId,
		organizationId: body.organizationId,
		title: body.title,
		description: body.description,
		status: "open",
		priority: body.priority,
		createdByUserId: viewer.user.id,
		createdByName: viewer.user.name,
		createdByImage: viewer.user.image,
		assigneeUserId: null,
		assigneeName: null,
		assigneeImage: null,
		createdAt: now,
		updatedAt: now,
	});

	return c.json({ success: true, ticketId });
});

appRoutes.get("/tickets/:ticketId", async (c) => {
	const viewer = await requireViewer(c);
	const organizationId = c.req.query("organizationId");
	if (!organizationId) {
		throw new HTTPException(400, { message: "organizationId is required" });
	}

	const organization = await getActiveOrganization(c, organizationId);
	const member = requireOrgMembership(organization, viewer.user.id);
	const appRole = await ensureAppRole(organization.id, viewer.user.id, inferSeedRole(member.role));
	const records = await listTicketsForViewer(organization.id, viewer.user.id, appRole);
	const ticket = records.find((entry) => entry.id === c.req.param("ticketId"));
	if (!ticket) {
		throw new HTTPException(404, { message: "Ticket not found" });
	}
	return c.json(ticket);
});

appRoutes.patch("/tickets/:ticketId", async (c) => {
	const viewer = await requireViewer(c);
	const body = await parseJson<UpdateTicketInput>(c.req.raw, updateTicketSchema);
	const organization = await getActiveOrganization(c, body.organizationId);
	const member = requireOrgMembership(organization, viewer.user.id);
	const appRole = await ensureAppRole(organization.id, viewer.user.id, inferSeedRole(member.role));
	requireAppRole(appRole, ["admin", "agent"]);

	const existing = await database
		.select()
		.from(tickets)
		.where(
			and(eq(tickets.id, c.req.param("ticketId")), eq(tickets.organizationId, body.organizationId)),
		)
		.limit(1);

	if (!existing[0]) {
		throw new HTTPException(404, { message: "Ticket not found" });
	}

	const assignee =
		body.assigneeUserId === null
			? null
			: (organization.members.find((entry) => entry.userId === body.assigneeUserId) ?? null);

	await database
		.update(tickets)
		.set({
			status: body.status ?? existing[0].status,
			priority: body.priority ?? existing[0].priority,
			assigneeUserId:
				body.assigneeUserId === undefined ? existing[0].assigneeUserId : (assignee?.userId ?? null),
			assigneeName:
				body.assigneeUserId === undefined
					? existing[0].assigneeName
					: (assignee?.user.name ?? null),
			assigneeImage:
				body.assigneeUserId === undefined
					? existing[0].assigneeImage
					: (assignee?.user.image ?? null),
			updatedAt: Date.now(),
		})
		.where(eq(tickets.id, c.req.param("ticketId")));

	return c.json({ success: true });
});

appRoutes.post("/tickets/:ticketId/comments", async (c) => {
	const viewer = await requireViewer(c);
	const body = await parseJson<AddCommentInput>(c.req.raw, addCommentSchema);
	const organization = await getActiveOrganization(c, body.organizationId);
	const member = requireOrgMembership(organization, viewer.user.id);
	const appRole = await ensureAppRole(organization.id, viewer.user.id, inferSeedRole(member.role));
	const records = await listTicketsForViewer(organization.id, viewer.user.id, appRole);
	const ticket = records.find((entry) => entry.id === c.req.param("ticketId"));
	if (!ticket) {
		throw new HTTPException(404, { message: "Ticket not found" });
	}

	await database.insert(ticketComments).values({
		id: createId("comment"),
		ticketId: ticket.id,
		authorUserId: viewer.user.id,
		authorName: viewer.user.name,
		authorImage: viewer.user.image,
		body: body.body,
		createdAt: Date.now(),
	});

	await database
		.update(tickets)
		.set({
			updatedAt: Date.now(),
			status: appRole === "customer" ? "waiting_on_customer" : ticket.status,
		})
		.where(eq(tickets.id, ticket.id));

	return c.json({ success: true });
});

appRoutes.delete("/tickets/:ticketId", async (c) => {
	const viewer = await requireViewer(c);
	const organizationId = c.req.query("organizationId");
	if (!organizationId) {
		throw new HTTPException(400, { message: "organizationId is required" });
	}

	const organization = await getActiveOrganization(c, organizationId);
	const member = requireOrgMembership(organization, viewer.user.id);
	const appRole = await ensureAppRole(organization.id, viewer.user.id, inferSeedRole(member.role));
	requireAppRole(appRole, ["admin"]);

	await database.delete(ticketComments).where(eq(ticketComments.ticketId, c.req.param("ticketId")));
	await database.delete(tickets).where(eq(tickets.id, c.req.param("ticketId")));
	return c.json({ success: true });
});
