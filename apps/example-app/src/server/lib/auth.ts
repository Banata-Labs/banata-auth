import { database } from "@server/db/client";
import { organizationRoles, ticketComments, tickets } from "@server/db/schema";
import type {
	ActiveOrganization,
	AppRole,
	AuthSession,
	AuthUser,
	OrganizationInvitation,
	OrganizationMember,
	OrganizationSummary,
	TicketCommentRecord,
	TicketRecord,
} from "@shared/contracts";
import { and, desc, eq } from "drizzle-orm";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { env } from "./env";
import { asNullableString, asString, createId, isRecord, toIsoDate } from "./utils";

function unauthorized(message = "Authentication required"): never {
	throw new HTTPException(401, { message });
}

function forbidden(message = "Forbidden"): never {
	throw new HTTPException(403, { message });
}

function upstreamError(status: number, message: string): never {
	throw new HTTPException((status >= 400 && status < 600 ? status : 500) as never, {
		message,
	});
}

async function banataRequest(
	c: Context,
	path: string,
	init?: {
		method?: "GET" | "POST";
		body?: Record<string, unknown>;
	},
) {
	const headers = new Headers({
		"content-type": "application/json",
		cookie: c.req.header("cookie") ?? "",
		"x-api-key": env.banataApiKey,
		"x-forwarded-host": new URL(c.req.url).host,
		"x-forwarded-proto": new URL(c.req.url).protocol.replace(/:$/, ""),
	});

	const betterAuthCookie = c.req.header("better-auth-cookie");
	if (betterAuthCookie) {
		headers.set("better-auth-cookie", betterAuthCookie);
	}

	const response = await fetch(`${env.banataAuthUrl}${path}`, {
		method: init?.method ?? "POST",
		headers,
		redirect: "manual",
		body: init?.method === "GET" ? undefined : JSON.stringify(init?.body ?? {}),
	});

	if (response.status === 401) {
		unauthorized();
	}

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		upstreamError(response.status, text || `Banata request failed for ${path}`);
	}

	if (response.status === 204) {
		return null;
	}

	const payload = (await response.json().catch(() => null)) as unknown;
	return payload;
}

function unwrapPayload<T>(payload: unknown): T | null {
	if (!payload) {
		return null;
	}

	if (isRecord(payload) && isRecord(payload.data)) {
		return payload.data as T;
	}

	return payload as T;
}

function unwrapArray<T>(payload: unknown, keys: string[]): T[] {
	if (!payload) {
		return [];
	}

	if (Array.isArray(payload)) {
		return payload as T[];
	}

	if (isRecord(payload)) {
		for (const key of keys) {
			const candidate = payload[key];
			if (Array.isArray(candidate)) {
				return candidate as T[];
			}
		}

		if (Array.isArray(payload.data)) {
			return payload.data as T[];
		}
	}

	return [];
}

function normalizeUser(payload: unknown): AuthUser {
	if (!isRecord(payload)) {
		unauthorized();
	}

	return {
		id: asString(payload.id),
		email: asString(payload.email),
		name: asString(payload.name) || asString(payload.email),
		image: asNullableString(payload.image),
	};
}

function normalizeSession(payload: unknown): AuthSession {
	if (!isRecord(payload)) {
		unauthorized();
	}

	return {
		id: asString(payload.id),
		userId: asString(payload.userId),
		activeOrganizationId: asNullableString(payload.activeOrganizationId),
		expiresAt: toIsoDate(asString(payload.expiresAt) || Date.now()),
	};
}

function normalizeOrganization(payload: unknown): OrganizationSummary {
	if (!isRecord(payload)) {
		throw new HTTPException(500, { message: "Invalid organization payload" });
	}

	return {
		id: asString(payload.id),
		name: asString(payload.name),
		slug: asString(payload.slug),
		logo: asNullableString(payload.logo),
		metadata: isRecord(payload.metadata) ? payload.metadata : null,
		createdAt: toIsoDate(asString(payload.createdAt) || Date.now()),
		updatedAt: toIsoDate(asString(payload.updatedAt) || asString(payload.createdAt) || Date.now()),
	};
}

function normalizeInvitation(payload: unknown): OrganizationInvitation {
	if (!isRecord(payload)) {
		throw new HTTPException(500, { message: "Invalid invitation payload" });
	}

	return {
		id: asString(payload.id),
		email: asString(payload.email),
		role: asString(payload.role) || "member",
		status: (asString(payload.status) as OrganizationInvitation["status"]) || "pending",
		createdAt: toIsoDate(asString(payload.createdAt) || Date.now()),
		expiresAt: toIsoDate(asString(payload.expiresAt) || Date.now()),
	};
}

function normalizeMember(payload: unknown, appRole: AppRole): OrganizationMember {
	if (!isRecord(payload)) {
		throw new HTTPException(500, { message: "Invalid member payload" });
	}

	const userPayload = isRecord(payload.user) ? payload.user : payload;

	return {
		id: asString(payload.id) || asString(payload.userId),
		organizationId: asString(payload.organizationId),
		userId: asString(payload.userId),
		role: asString(payload.role) || "member",
		createdAt: toIsoDate(asString(payload.createdAt) || Date.now()),
		user: normalizeUser(userPayload),
		appRole,
	};
}

export async function requireViewer(c: Context) {
	const payload = await banataRequest(c, "/api/auth/get-session", { method: "GET" });
	const data = unwrapPayload<{ user: unknown; session: unknown }>(payload);
	if (!data?.user || !data?.session) {
		unauthorized();
	}

	return {
		user: normalizeUser(data.user),
		session: normalizeSession(data.session),
	};
}

export async function listOrganizationsForViewer(c: Context): Promise<OrganizationSummary[]> {
	const payload = await banataRequest(c, "/api/auth/organization/list");
	return unwrapArray(payload, ["organizations"]).map(normalizeOrganization);
}

export async function setActiveOrganization(c: Context, organizationId: string) {
	await banataRequest(c, "/api/auth/organization/set-active", {
		body: { organizationId },
	});
}

export async function getActiveOrganization(
	c: Context,
	organizationId: string,
): Promise<ActiveOrganization> {
	const payload = await banataRequest(c, "/api/auth/organization/get-full-organization", {
		body: { organizationId },
	});

	if (!isRecord(payload)) {
		throw new HTTPException(500, { message: "Invalid organization response" });
	}

	const org = normalizeOrganization(payload);
	const memberRows = await database
		.select()
		.from(organizationRoles)
		.where(eq(organizationRoles.organizationId, organizationId));
	const appRoleByUserId = new Map(memberRows.map((row) => [row.userId, row.role as AppRole]));

	return {
		...org,
		members: unwrapArray(payload, ["members"]).map((member) =>
			normalizeMember(
				member,
				appRoleByUserId.get(asString((member as Record<string, unknown>).userId)) ?? "customer",
			),
		),
		invitations: unwrapArray(payload, ["invitations"]).map(normalizeInvitation),
	};
}

export function inferSeedRole(memberRole: string): AppRole {
	if (memberRole === "owner" || memberRole === "admin" || memberRole === "super_admin") {
		return "admin";
	}
	return "customer";
}

export async function ensureAppRole(
	organizationId: string,
	userId: string,
	seedRole: AppRole,
): Promise<AppRole> {
	const existing = await database
		.select()
		.from(organizationRoles)
		.where(
			and(
				eq(organizationRoles.organizationId, organizationId),
				eq(organizationRoles.userId, userId),
			),
		)
		.limit(1);

	if (existing[0]) {
		return existing[0].role as AppRole;
	}

	const now = Date.now();
	await database.insert(organizationRoles).values({
		id: createId("role"),
		organizationId,
		userId,
		role: seedRole,
		createdAt: now,
		updatedAt: now,
	});
	return seedRole;
}

export function requireOrgMembership(
	activeOrganization: ActiveOrganization,
	userId: string,
): OrganizationMember {
	const member = activeOrganization.members.find((entry) => entry.userId === userId);
	if (!member) {
		forbidden("You are not a member of this organization.");
	}
	return member;
}

export function requireAppRole(role: AppRole | null, allowed: AppRole[]) {
	if (!role || !allowed.includes(role)) {
		forbidden("You do not have access to this action.");
	}
}

export async function listTicketsForViewer(
	organizationId: string,
	viewerId: string,
	role: AppRole,
): Promise<TicketRecord[]> {
	const ticketRows = await database
		.select()
		.from(tickets)
		.where(eq(tickets.organizationId, organizationId))
		.orderBy(desc(tickets.updatedAt));

	const visibleTickets =
		role === "customer"
			? ticketRows.filter((ticket) => ticket.createdByUserId === viewerId)
			: ticketRows;

	const comments = await database
		.select()
		.from(ticketComments)
		.orderBy(desc(ticketComments.createdAt));

	const commentsByTicket = new Map<string, TicketCommentRecord[]>();
	for (const comment of comments) {
		const entry: TicketCommentRecord = {
			id: comment.id,
			ticketId: comment.ticketId,
			authorUserId: comment.authorUserId,
			authorName: comment.authorName,
			authorImage: comment.authorImage,
			body: comment.body,
			createdAt: toIsoDate(comment.createdAt),
		};
		const bucket = commentsByTicket.get(comment.ticketId) ?? [];
		bucket.unshift(entry);
		commentsByTicket.set(comment.ticketId, bucket);
	}

	return visibleTickets.map((ticket) => ({
		id: ticket.id,
		organizationId: ticket.organizationId,
		title: ticket.title,
		description: ticket.description,
		status: ticket.status as TicketRecord["status"],
		priority: ticket.priority as TicketRecord["priority"],
		createdByUserId: ticket.createdByUserId,
		createdByName: ticket.createdByName,
		createdByImage: ticket.createdByImage,
		assigneeUserId: ticket.assigneeUserId,
		assigneeName: ticket.assigneeName,
		assigneeImage: ticket.assigneeImage,
		createdAt: toIsoDate(ticket.createdAt),
		updatedAt: toIsoDate(ticket.updatedAt),
		comments: commentsByTicket.get(ticket.id) ?? [],
	}));
}
