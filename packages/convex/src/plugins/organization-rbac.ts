import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { z } from "zod";
import {
	type PermissionDefinitionRow,
	type PluginDBAdapter,
	type ProjectRow,
	type RoleDefinitionRow,
	type WhereClause,
	getProjectScope,
	getRolePermissions,
	isGlobalAdminUser,
	parseRoleSlugs,
	projectScopeSchema,
	requireAuthenticated,
} from "./types";

interface OrganizationRow extends Record<string, unknown> {
	id: string;
	name: string;
	slug: string;
	logo?: string;
	metadata?: unknown;
	projectId?: string;
	createdAt: number;
	updatedAt: number;
}

interface MemberRow extends Record<string, unknown> {
	id: string;
	organizationId: string;
	userId: string;
	role: string;
	projectId?: string;
	createdAt: number;
	updatedAt: number;
}

interface InvitationRow extends Record<string, unknown> {
	id: string;
	organizationId: string;
	email: string;
	role: string;
	inviterId: string;
	status: string;
	expiresAt: number;
	projectId?: string;
	createdAt: number;
}

const SUPER_ADMIN_ROLE_SLUG = "super_admin";
const RESERVED_ROLES = new Set([SUPER_ADMIN_ROLE_SLUG]);
const INVITATION_EXPIRY_MS = 1000 * 60 * 60 * 48;

interface ProjectOwnerRow extends Pick<ProjectRow, "id" | "ownerId"> {}

const createOrganizationSchema = z
	.object({
		name: z.string().min(1),
		slug: z.string().min(1),
		logo: z.string().optional(),
		metadata: z.record(z.string(), z.unknown()).optional(),
		keepCurrentActiveOrganization: z.boolean().optional(),
	})
	.merge(projectScopeSchema);

const organizationIdSchema = z
	.object({
		organizationId: z.string().optional(),
		organizationSlug: z.string().optional(),
	})
	.merge(projectScopeSchema);

const inviteMemberSchema = z
	.object({
		email: z.string().email(),
		role: z.union([z.string(), z.array(z.string())]),
		organizationId: z.string().optional(),
		resend: z.boolean().optional(),
	})
	.merge(projectScopeSchema);

const updateMemberRoleSchema = z
	.object({
		memberId: z.string().optional(),
		memberIdOrUserId: z.string().optional(),
		role: z.union([z.string(), z.array(z.string())]),
		organizationId: z.string().optional(),
	})
	.merge(projectScopeSchema);

const removeMemberSchema = z
	.object({
		memberIdOrEmail: z.string().optional(),
		memberIdOrUserId: z.string().optional(),
		organizationId: z.string().optional(),
	})
	.merge(projectScopeSchema);

const acceptRejectInviteSchema = z
	.object({
		invitationId: z.string(),
	})
	.merge(projectScopeSchema);

const cancelInviteSchema = z
	.object({
		invitationId: z.string(),
	})
	.merge(projectScopeSchema);

const getInvitationSchema = z
	.object({
		id: z.string(),
	})
	.merge(projectScopeSchema);

const listInvitationsSchema = z
	.object({
		organizationId: z.string().optional(),
	})
	.merge(projectScopeSchema);

const listUserInvitationsSchema = z
	.object({
		email: z.string().email().optional(),
	})
	.merge(projectScopeSchema);

async function getSessionOrThrow(ctx: any): Promise<{
	userId: string;
	activeOrganizationId?: string;
	token?: string;
	userRole?: string;
}> {
	const { session, user } = await requireAuthenticated(ctx);
	return {
		userId: user.id,
		userRole: user.role,
		activeOrganizationId: session.activeOrganizationId as string | undefined,
		token: session.token as string | undefined,
	};
}

function parseRoles(role: string | string[]): string[] {
	return parseRoleSlugs(role);
}

async function setActiveOrganizationIfPossible(
	db: PluginDBAdapter,
	token: string | undefined,
	organizationId: string | null,
): Promise<void> {
	if (!token) return;
	await db.update({
		model: "session",
		where: [{ field: "token", value: token }],
		update: {
			activeOrganizationId: organizationId,
			updatedAt: new Date(),
		},
	});
}

async function resolveOrganization(
	db: PluginDBAdapter,
	params: {
		organizationId?: string;
		organizationSlug?: string;
		activeOrganizationId?: string;
		scopeWhere: WhereClause[];
	},
): Promise<OrganizationRow | null> {
	if (params.organizationId) {
		const rows = await db.findMany<OrganizationRow>({
			model: "organization",
			where: [{ field: "id", value: params.organizationId }, ...params.scopeWhere],
			limit: 1,
		});
		return rows[0] ?? null;
	}
	if (params.organizationSlug) {
		const rows = await db.findMany<OrganizationRow>({
			model: "organization",
			where: [{ field: "slug", value: params.organizationSlug }, ...params.scopeWhere],
			limit: 1,
		});
		return rows[0] ?? null;
	}
	if (params.activeOrganizationId) {
		const rows = await db.findMany<OrganizationRow>({
			model: "organization",
			where: [{ field: "id", value: params.activeOrganizationId }, ...params.scopeWhere],
			limit: 1,
		});
		return rows[0] ?? null;
	}
	return null;
}

async function findMemberOrThrow(
	ctx: any,
	db: PluginDBAdapter,
	organizationId: string,
	userId: string,
	scopeWhere: WhereClause[],
): Promise<MemberRow> {
	const rows = await db.findMany<MemberRow>({
		model: "member",
		where: [
			{ field: "organizationId", value: organizationId },
			{ field: "userId", value: userId },
			...scopeWhere,
		],
		limit: 1,
	});
	if (!rows[0]) {
		throw ctx.error("FORBIDDEN", { message: "You are not a member of this organization" });
	}
	return rows[0];
}

async function ensureRoleExistsForProject(
	ctx: any,
	db: PluginDBAdapter,
	projectId: string | undefined,
	roles: string[],
): Promise<void> {
	if (!projectId) return;
	const rows = await db.findMany<RoleDefinitionRow>({
		model: "roleDefinition",
		where: [{ field: "projectId", value: projectId }],
		limit: 1000,
	});
	const slugs = new Set(rows.map((r) => r.slug));
	const missing = roles.filter((r) => !slugs.has(r));
	if (missing.length > 0) {
		throw ctx.error("BAD_REQUEST", {
			message: `Unknown role(s): ${missing.join(", ")}`,
		});
	}
}

function memberHasRole(member: MemberRow, roleSlug: string): boolean {
	return parseRoleSlugs(member.role).includes(roleSlug);
}

async function hasProjectWildcardAccess(
	db: PluginDBAdapter,
	params: {
		userId: string;
		userRole?: string;
		projectId?: string;
	},
): Promise<boolean> {
	if (isGlobalAdminUser({ role: params.userRole })) {
		return true;
	}
	if (!params.projectId) {
		return false;
	}

	const projectRows = await db.findMany<ProjectOwnerRow>({
		model: "project",
		where: [{ field: "id", value: params.projectId }],
		limit: 1,
	});
	return projectRows[0]?.ownerId === params.userId;
}

async function getMemberPermissions(
	db: PluginDBAdapter,
	params: {
		projectId?: string;
		member: MemberRow;
	},
): Promise<Set<string>> {
	const roleSlugs = parseRoleSlugs(params.member.role);
	if (roleSlugs.includes(SUPER_ADMIN_ROLE_SLUG)) {
		return new Set(["*"]);
	}
	return getRolePermissions(db, {
		projectId: params.projectId,
		roleSlugs,
	});
}

async function requireOrganizationPermission(
	ctx: any,
	db: PluginDBAdapter,
	params: {
		projectId?: string;
		organizationId: string;
		userId: string;
		userRole?: string;
		scopeWhere: WhereClause[];
		permission: string;
	},
): Promise<MemberRow | null> {
	if (
		await hasProjectWildcardAccess(db, {
			userId: params.userId,
			userRole: params.userRole,
			projectId: params.projectId,
		})
	) {
		return null;
	}

	const member = await findMemberOrThrow(
		ctx,
		db,
		params.organizationId,
		params.userId,
		params.scopeWhere,
	);
	const permissions = await getMemberPermissions(db, {
		projectId: params.projectId,
		member,
	});
	if (permissions.has("*") || permissions.has(params.permission)) {
		return member;
	}

	throw ctx.error("FORBIDDEN", { message: `Missing permission: ${params.permission}` });
}

async function ensureOrganizationRetainsSuperAdmin(
	ctx: any,
	db: PluginDBAdapter,
	params: {
		organizationId: string;
		scopeWhere: WhereClause[];
		target: MemberRow;
		nextRoleSlugs?: string[];
	},
): Promise<void> {
	if (!memberHasRole(params.target, SUPER_ADMIN_ROLE_SLUG)) {
		return;
	}
	if (params.nextRoleSlugs?.includes(SUPER_ADMIN_ROLE_SLUG)) {
		return;
	}

	const members = await db.findMany<MemberRow>({
		model: "member",
		where: [{ field: "organizationId", value: params.organizationId }, ...params.scopeWhere],
		limit: 1000,
	});
	const otherSuperAdmins = members.filter(
		(member) => member.id !== params.target.id && memberHasRole(member, SUPER_ADMIN_ROLE_SLUG),
	);
	if (otherSuperAdmins.length === 0) {
		throw ctx.error("BAD_REQUEST", {
			message: "Organization must retain at least one super_admin",
		});
	}
}

async function ensureSuperAdminRole(
	db: PluginDBAdapter,
	projectId: string | undefined,
): Promise<void> {
	if (!projectId) return;
	const now = Date.now();
	const roles = await db.findMany<RoleDefinitionRow>({
		model: "roleDefinition",
		where: [
			{ field: "projectId", value: projectId },
			{ field: "slug", value: SUPER_ADMIN_ROLE_SLUG },
		],
		limit: 1,
	});
	if (roles[0]) return;

	const perms = await db.findMany<PermissionDefinitionRow>({
		model: "permissionDefinition",
		where: [{ field: "projectId", value: projectId }],
		limit: 1000,
	});
	await db.create<RoleDefinitionRow>({
		model: "roleDefinition",
		data: {
			projectId,
			name: "Super Admin",
			slug: SUPER_ADMIN_ROLE_SLUG,
			description: "Full access across this project and its organizations.",
			permissions: JSON.stringify(perms.map((p) => p.slug).sort()),
			isDefault: true,
			createdAt: now,
			updatedAt: now,
		},
	});
}

export function organizationRbacPlugin(): BetterAuthPlugin {
	return {
		id: "banata-organization-rbac",
		schema: {
			organization: {
				fields: {
					name: { type: "string", required: true },
					slug: { type: "string", required: true },
					logo: { type: "string", required: false },
					metadata: { type: "string", required: false },
					projectId: { type: "string", required: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			member: {
				fields: {
					organizationId: { type: "string", required: true },
					userId: { type: "string", required: true },
					role: { type: "string", required: true },
					projectId: { type: "string", required: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			invitation: {
				fields: {
					organizationId: { type: "string", required: true },
					email: { type: "string", required: true },
					role: { type: "string", required: true },
					inviterId: { type: "string", required: true },
					projectId: { type: "string", required: false },
					status: { type: "string", required: true },
					expiresAt: { type: "number", required: true },
					createdAt: { type: "number", required: true },
				},
			},
		},
		endpoints: {
			createOrganization: createAuthEndpoint(
				"/organization/create",
				{ method: "POST", body: createOrganizationSchema, requireHeaders: true },
				async (ctx) => {
					const { userId, token } = await getSessionOrThrow(ctx);
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(body as Record<string, unknown>);
					const now = Date.now();

					const existingSlug = await db.findMany<OrganizationRow>({
						model: "organization",
						where: [{ field: "slug", value: body.slug }, ...scope.where],
						limit: 1,
					});
					if (existingSlug[0]) {
						throw ctx.error("BAD_REQUEST", { message: "Organization slug already exists" });
					}

					await ensureSuperAdminRole(db, scope.data.projectId);
					const organization = await db.create<OrganizationRow>({
						model: "organization",
						data: {
							...scope.data,
							name: body.name,
							slug: body.slug,
							logo: body.logo,
							metadata: body.metadata ? JSON.stringify(body.metadata) : undefined,
							createdAt: now,
							updatedAt: now,
						},
					});

					const member = await db.create<MemberRow>({
						model: "member",
						data: {
							...scope.data,
							organizationId: organization.id,
							userId,
							role: SUPER_ADMIN_ROLE_SLUG,
							createdAt: now,
							updatedAt: now,
						},
					});

					if (!body.keepCurrentActiveOrganization) {
						await setActiveOrganizationIfPossible(db, token, organization.id);
					}

					return ctx.json({ ...organization, members: [member] });
				},
			),

			listOrganizations: createAuthEndpoint(
				"/organization/list",
				{ method: "POST", body: projectScopeSchema, requireHeaders: true },
				async (ctx) => {
					const { userId, userRole } = await getSessionOrThrow(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);

					if (
						await hasProjectWildcardAccess(db, {
							userId,
							userRole,
							projectId: scope.projectId,
						})
					) {
						const organizations = await db.findMany<OrganizationRow>({
							model: "organization",
							where: [...scope.where],
							limit: 1000,
							sortBy: { field: "createdAt", direction: "desc" },
						});
						return ctx.json({
							data: organizations.map((org) => ({
								...org,
								metadata:
									typeof org.metadata === "string"
										? JSON.parse(org.metadata as string)
										: org.metadata,
							})),
							listMetadata: { before: null, after: null },
						});
					}

					const memberships = await db.findMany<MemberRow>({
						model: "member",
						where: [{ field: "userId", value: userId }, ...scope.where],
						limit: 1000,
					});
					if (memberships.length === 0) {
						return ctx.json({
							data: [],
							listMetadata: { before: null, after: null },
						});
					}

					const orgIds = memberships.map((m) => m.organizationId);
					const organizations = await db.findMany<OrganizationRow>({
						model: "organization",
						where: [{ field: "id", operator: "in", value: orgIds }, ...scope.where],
						limit: 1000,
						sortBy: { field: "createdAt", direction: "desc" },
					});
					return ctx.json({
						data: organizations.map((org) => ({
							...org,
							metadata:
								typeof org.metadata === "string"
									? JSON.parse(org.metadata as string)
									: org.metadata,
						})),
						listMetadata: { before: null, after: null },
					});
				},
			),

			getFullOrganization: createAuthEndpoint(
				"/organization/get-full-organization",
				{ method: "POST", body: organizationIdSchema, requireHeaders: true },
				async (ctx) => {
					const { userId, activeOrganizationId, userRole } = await getSessionOrThrow(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);

					const org = await resolveOrganization(db, {
						organizationId: ctx.body.organizationId,
						organizationSlug: ctx.body.organizationSlug,
						activeOrganizationId,
						scopeWhere: scope.where,
					});
					if (!org) return ctx.json(null);

					await requireOrganizationPermission(ctx, db, {
						projectId: scope.projectId,
						organizationId: org.id,
						userId,
						userRole,
						scopeWhere: scope.where,
						permission: "member.read",
					});

					const members = await db.findMany<MemberRow>({
						model: "member",
						where: [{ field: "organizationId", value: org.id }, ...scope.where],
						limit: 1000,
					});
					const invitations = await db.findMany<InvitationRow>({
						model: "invitation",
						where: [{ field: "organizationId", value: org.id }, ...scope.where],
						limit: 1000,
					});

					return ctx.json({
						...org,
						metadata:
							typeof org.metadata === "string" ? JSON.parse(org.metadata as string) : org.metadata,
						members,
						invitations,
					});
				},
			),

			setActiveOrganization: createAuthEndpoint(
				"/organization/set-active",
				{ method: "POST", body: organizationIdSchema, requireHeaders: true },
				async (ctx) => {
					const { userId, token, userRole } = await getSessionOrThrow(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const org = await resolveOrganization(db, {
						organizationId: ctx.body.organizationId,
						organizationSlug: ctx.body.organizationSlug,
						scopeWhere: scope.where,
					});
					if (!org) {
						await setActiveOrganizationIfPossible(db, token, null);
						return ctx.json(null);
					}

					if (
						!(await hasProjectWildcardAccess(db, {
							userId,
							userRole,
							projectId: scope.projectId,
						}))
					) {
						await findMemberOrThrow(ctx, db, org.id, userId, scope.where);
					}
					await setActiveOrganizationIfPossible(db, token, org.id);
					return ctx.json(org);
				},
			),

			inviteMember: createAuthEndpoint(
				"/organization/invite-member",
				{ method: "POST", body: inviteMemberSchema, requireHeaders: true },
				async (ctx) => {
					const { userId, activeOrganizationId, userRole } = await getSessionOrThrow(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;
					const scope = getProjectScope(body as Record<string, unknown>);
					const projectId = scope.data.projectId;
					const orgId = body.organizationId ?? activeOrganizationId;
					if (!orgId) throw ctx.error("BAD_REQUEST", { message: "Organization required" });

					await requireOrganizationPermission(ctx, db, {
						projectId: scope.projectId,
						organizationId: orgId,
						userId,
						userRole,
						scopeWhere: scope.where,
						permission: "member.invite",
					});

					const roles = parseRoles(body.role);
					if (roles.some((r) => RESERVED_ROLES.has(r) && r !== SUPER_ADMIN_ROLE_SLUG)) {
						throw ctx.error("BAD_REQUEST", { message: "Reserved roles are not assignable" });
					}
					await ensureRoleExistsForProject(ctx, db, projectId, roles);

					const email = body.email.toLowerCase();
					const existingPending = await db.findMany<InvitationRow>({
						model: "invitation",
						where: [
							{ field: "organizationId", value: orgId },
							{ field: "email", value: email },
							{ field: "status", value: "pending" },
							...scope.where,
						],
						limit: 1,
					});
					if (existingPending[0] && !body.resend) {
						throw ctx.error("BAD_REQUEST", { message: "User is already invited" });
					}

					const now = Date.now();
					if (existingPending[0] && body.resend) {
						const invitation = await db.update<InvitationRow>({
							model: "invitation",
							where: [{ field: "id", value: existingPending[0].id }, ...scope.where],
							update: {
								role: roles.join(","),
								expiresAt: now + INVITATION_EXPIRY_MS,
								status: "pending",
							},
						});
						return ctx.json(invitation);
					}

					const invitation = await db.create<InvitationRow>({
						model: "invitation",
						data: {
							...scope.data,
							organizationId: orgId,
							email,
							role: roles.join(","),
							inviterId: userId,
							status: "pending",
							expiresAt: now + INVITATION_EXPIRY_MS,
							createdAt: now,
						},
					});
					return ctx.json(invitation);
				},
			),

			acceptInvitation: createAuthEndpoint(
				"/organization/accept-invitation",
				{ method: "POST", body: acceptRejectInviteSchema, requireHeaders: true },
				async (ctx) => {
					const { session, user } = await requireAuthenticated(ctx);
					const userId = user.id;
					const token = session.token;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const inviteRows = await db.findMany<InvitationRow>({
						model: "invitation",
						where: [{ field: "id", value: ctx.body.invitationId }, ...scope.where],
						limit: 1,
					});
					const invitation = inviteRows[0];
					if (!invitation || invitation.status !== "pending" || invitation.expiresAt < Date.now()) {
						throw ctx.error("BAD_REQUEST", { message: "Invitation not found" });
					}
					// Ensure the authenticated user's email matches the invitation target
					if (invitation.email !== user.email) {
						throw ctx.error("FORBIDDEN", {
							message: "This invitation is not addressed to you",
						});
					}

					const now = Date.now();
					await db.update<InvitationRow>({
						model: "invitation",
						where: [{ field: "id", value: invitation.id }, ...scope.where],
						update: { status: "accepted" },
					});

					const existingMember = await db.findMany<MemberRow>({
						model: "member",
						where: [
							{ field: "organizationId", value: invitation.organizationId },
							{ field: "userId", value: userId },
							...scope.where,
						],
						limit: 1,
					});
					const member =
						existingMember[0] ??
						(await db.create<MemberRow>({
							model: "member",
							data: {
								...scope.data,
								organizationId: invitation.organizationId,
								userId,
								role: invitation.role,
								createdAt: now,
								updatedAt: now,
							},
						}));

					await setActiveOrganizationIfPossible(db, token, invitation.organizationId);
					return ctx.json({ invitation: { ...invitation, status: "accepted" }, member });
				},
			),

			rejectInvitation: createAuthEndpoint(
				"/organization/reject-invitation",
				{ method: "POST", body: acceptRejectInviteSchema, requireHeaders: true },
				async (ctx) => {
					// Verify the caller is the invitation target
					const { session, user } = await requireAuthenticated(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const inviteRows = await db.findMany<InvitationRow>({
						model: "invitation",
						where: [{ field: "id", value: ctx.body.invitationId }, ...scope.where],
						limit: 1,
					});
					const invitation = inviteRows[0];
					if (!invitation || invitation.status !== "pending") {
						throw ctx.error("BAD_REQUEST", { message: "Invitation not found" });
					}
					// Ensure the authenticated user's email matches the invitation target
					if (invitation.email !== user.email) {
						throw ctx.error("FORBIDDEN", {
							message: "You can only reject invitations addressed to you",
						});
					}
					const updated = await db.update<InvitationRow>({
						model: "invitation",
						where: [{ field: "id", value: invitation.id }, ...scope.where],
						update: { status: "rejected" },
					});
					return ctx.json({ invitation: updated, member: null });
				},
			),

			cancelInvitation: createAuthEndpoint(
				"/organization/cancel-invitation",
				{ method: "POST", body: cancelInviteSchema, requireHeaders: true },
				async (ctx) => {
					const { userId, userRole } = await getSessionOrThrow(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const inviteRows = await db.findMany<InvitationRow>({
						model: "invitation",
						where: [{ field: "id", value: ctx.body.invitationId }, ...scope.where],
						limit: 1,
					});
					const invitation = inviteRows[0];
					if (!invitation) throw ctx.error("BAD_REQUEST", { message: "Invitation not found" });
					await requireOrganizationPermission(ctx, db, {
						projectId: scope.projectId,
						organizationId: invitation.organizationId,
						userId,
						userRole,
						scopeWhere: scope.where,
						permission: "member.invite",
					});
					const updated = await db.update<InvitationRow>({
						model: "invitation",
						where: [{ field: "id", value: invitation.id }, ...scope.where],
						update: { status: "canceled" },
					});
					return ctx.json(updated);
				},
			),

			getInvitation: createAuthEndpoint(
				"/organization/get-invitation",
				{ method: "POST", body: getInvitationSchema, requireHeaders: true },
				async (ctx) => {
					const { user } = await requireAuthenticated(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const rows = await db.findMany<InvitationRow>({
						model: "invitation",
						where: [{ field: "id", value: ctx.body.id }, ...scope.where],
						limit: 1,
					});
					if (!rows[0]) throw ctx.error("BAD_REQUEST", { message: "Invitation not found" });
					const invitation = rows[0];
					// Allow access if the caller is the invitation target or an org admin
					if (invitation.email !== user.email) {
						const memberRows = await db.findMany<MemberRow>({
							model: "member",
							where: [
								{ field: "organizationId", value: invitation.organizationId },
								{ field: "userId", value: user.id },
								...scope.where,
							],
							limit: 1,
						});
						if (!memberRows[0]) {
							throw ctx.error("FORBIDDEN", {
								message: "You do not have access to this invitation",
							});
						}
					}
					return ctx.json(invitation);
				},
			),

			listInvitations: createAuthEndpoint(
				"/organization/list-invitations",
				{ method: "POST", body: listInvitationsSchema, requireHeaders: true },
				async (ctx) => {
					const { userId, activeOrganizationId, userRole } = await getSessionOrThrow(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const orgId = ctx.body.organizationId ?? activeOrganizationId;
					if (!orgId) throw ctx.error("BAD_REQUEST", { message: "Organization required" });
					await requireOrganizationPermission(ctx, db, {
						projectId: scope.projectId,
						organizationId: orgId,
						userId,
						userRole,
						scopeWhere: scope.where,
						permission: "member.invite",
					});
					const rows = await db.findMany<InvitationRow>({
						model: "invitation",
						where: [{ field: "organizationId", value: orgId }, ...scope.where],
						limit: 1000,
					});
					return ctx.json({
						data: rows,
						listMetadata: { before: null, after: null },
					});
				},
			),

			listUserInvitations: createAuthEndpoint(
				"/organization/list-user-invitations",
				{ method: "POST", body: listUserInvitationsSchema, requireHeaders: true },
				async (ctx) => {
					// Always use the authenticated user's own email to prevent enumeration (S9)
					const { user } = await requireAuthenticated(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const targetEmail = user.email?.toLowerCase();
					if (!targetEmail) throw ctx.error("BAD_REQUEST", { message: "Email is required" });

					const rows = await db.findMany<InvitationRow>({
						model: "invitation",
						where: [
							{ field: "email", value: targetEmail },
							{ field: "status", value: "pending" },
							...scope.where,
						],
						limit: 1000,
					});
					return ctx.json(rows);
				},
			),

			listMembers: createAuthEndpoint(
				"/organization/list-members",
				{ method: "POST", body: listInvitationsSchema, requireHeaders: true },
				async (ctx) => {
					const { userId, activeOrganizationId, userRole } = await getSessionOrThrow(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const orgId = ctx.body.organizationId ?? activeOrganizationId;
					if (!orgId) throw ctx.error("BAD_REQUEST", { message: "Organization required" });
					await requireOrganizationPermission(ctx, db, {
						projectId: scope.projectId,
						organizationId: orgId,
						userId,
						userRole,
						scopeWhere: scope.where,
						permission: "member.read",
					});
					const members = await db.findMany<MemberRow>({
						model: "member",
						where: [{ field: "organizationId", value: orgId }, ...scope.where],
						limit: 1000,
					});
					return ctx.json({
						data: members,
						listMetadata: { before: null, after: null },
					});
				},
			),

			updateMemberRole: createAuthEndpoint(
				"/organization/update-member-role",
				{ method: "POST", body: updateMemberRoleSchema, requireHeaders: true },
				async (ctx) => {
					const { userId, activeOrganizationId, userRole } = await getSessionOrThrow(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;
					const scope = getProjectScope(body as Record<string, unknown>);
					const orgId = body.organizationId ?? activeOrganizationId;
					if (!orgId) throw ctx.error("BAD_REQUEST", { message: "Organization required" });

					await requireOrganizationPermission(ctx, db, {
						projectId: scope.projectId,
						organizationId: orgId,
						userId,
						userRole,
						scopeWhere: scope.where,
						permission: "member.update_role",
					});
					const roles = parseRoles(body.role);
					if (roles.some((r) => RESERVED_ROLES.has(r) && r !== SUPER_ADMIN_ROLE_SLUG)) {
						throw ctx.error("BAD_REQUEST", { message: "Reserved roles are not assignable" });
					}
					await ensureRoleExistsForProject(ctx, db, scope.data.projectId, roles);

					const memberIdentifier = body.memberId ?? body.memberIdOrUserId;
					if (!memberIdentifier) {
						throw ctx.error("BAD_REQUEST", { message: "Member identifier required" });
					}

					let memberWhere: WhereClause[] = [
						{ field: "id", value: memberIdentifier },
						...scope.where,
					];
					const byId = await db.findMany<MemberRow>({
						model: "member",
						where: memberWhere,
						limit: 1,
					});
					if (!byId[0]) {
						memberWhere = [
							{ field: "organizationId", value: orgId },
							{ field: "userId", value: memberIdentifier },
							...scope.where,
						];
					}
					const targetRows = await db.findMany<MemberRow>({
						model: "member",
						where: memberWhere,
						limit: 1,
					});
					const target = targetRows[0];
					if (!target) {
						throw ctx.error("BAD_REQUEST", { message: "Member not found" });
					}
					await ensureOrganizationRetainsSuperAdmin(ctx, db, {
						organizationId: orgId,
						scopeWhere: scope.where,
						target,
						nextRoleSlugs: roles,
					});

					const updated = await db.update<MemberRow>({
						model: "member",
						where: memberWhere,
						update: {
							role: roles.join(","),
							updatedAt: Date.now(),
						},
					});
					return ctx.json(updated);
				},
			),

			removeMember: createAuthEndpoint(
				"/organization/remove-member",
				{ method: "POST", body: removeMemberSchema, requireHeaders: true },
				async (ctx) => {
					const { userId, activeOrganizationId, token, userRole } = await getSessionOrThrow(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;
					const scope = getProjectScope(body as Record<string, unknown>);
					const orgId = body.organizationId ?? activeOrganizationId;
					if (!orgId) throw ctx.error("BAD_REQUEST", { message: "Organization required" });

					await requireOrganizationPermission(ctx, db, {
						projectId: scope.projectId,
						organizationId: orgId,
						userId,
						userRole,
						scopeWhere: scope.where,
						permission: "member.remove",
					});

					const identifier = body.memberIdOrEmail ?? body.memberIdOrUserId;
					if (!identifier) {
						throw ctx.error("BAD_REQUEST", { message: "Member identifier required" });
					}

					let target: MemberRow | null = null;
					if (identifier.includes("@")) {
						const userRows = await db.findMany<{ id: string; email: string }>({
							model: "user",
							where: [{ field: "email", value: identifier.toLowerCase() }, ...scope.where],
							limit: 1,
						});
						if (userRows[0]) {
							const rows = await db.findMany<MemberRow>({
								model: "member",
								where: [
									{ field: "organizationId", value: orgId },
									{ field: "userId", value: userRows[0].id },
									...scope.where,
								],
								limit: 1,
							});
							target = rows[0] ?? null;
						}
					} else {
						const rows = await db.findMany<MemberRow>({
							model: "member",
							where: [{ field: "id", value: identifier }, ...scope.where],
							limit: 1,
						});
						if (rows[0]) {
							target = rows[0];
						} else if (body.memberIdOrUserId) {
							const byUserRows = await db.findMany<MemberRow>({
								model: "member",
								where: [
									{ field: "organizationId", value: orgId },
									{ field: "userId", value: body.memberIdOrUserId },
									...scope.where,
								],
								limit: 1,
							});
							target = byUserRows[0] ?? null;
						}
					}

					if (!target || target.organizationId !== orgId) {
						throw ctx.error("BAD_REQUEST", { message: "Member not found" });
					}
					if (target.userId === userId) {
						throw ctx.error("BAD_REQUEST", { message: "Use leave endpoint to leave organization" });
					}
					await ensureOrganizationRetainsSuperAdmin(ctx, db, {
						organizationId: orgId,
						scopeWhere: scope.where,
						target,
						nextRoleSlugs: [],
					});

					await db.delete({
						model: "member",
						where: [{ field: "id", value: target.id }, ...scope.where],
					});
					if (target.userId === userId) {
						await setActiveOrganizationIfPossible(db, token, null);
					}
					return ctx.json({ member: target });
				},
			),

			leaveOrganization: createAuthEndpoint(
				"/organization/leave",
				{ method: "POST", body: organizationIdSchema, requireHeaders: true },
				async (ctx) => {
					const { userId, token, activeOrganizationId } = await getSessionOrThrow(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const orgId = ctx.body.organizationId ?? activeOrganizationId;
					if (!orgId) throw ctx.error("BAD_REQUEST", { message: "Organization required" });

					const member = await findMemberOrThrow(ctx, db, orgId, userId, scope.where);
					await ensureOrganizationRetainsSuperAdmin(ctx, db, {
						organizationId: orgId,
						scopeWhere: scope.where,
						target: member,
						nextRoleSlugs: [],
					});
					await db.delete({
						model: "member",
						where: [{ field: "id", value: member.id }, ...scope.where],
					});
					if (activeOrganizationId === orgId) {
						await setActiveOrganizationIfPossible(db, token, null);
					}
					return ctx.json(member);
				},
			),

			deleteOrganization: createAuthEndpoint(
				"/organization/delete",
				{ method: "POST", body: organizationIdSchema, requireHeaders: true },
				async (ctx) => {
					const { userId, userRole } = await getSessionOrThrow(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const org = await resolveOrganization(db, {
						organizationId: ctx.body.organizationId,
						organizationSlug: ctx.body.organizationSlug,
						scopeWhere: scope.where,
					});
					if (!org) throw ctx.error("BAD_REQUEST", { message: "Organization not found" });
					await requireOrganizationPermission(ctx, db, {
						projectId: scope.projectId,
						organizationId: org.id,
						userId,
						userRole,
						scopeWhere: scope.where,
						permission: "organization.delete",
					});

					await db.delete({
						model: "invitation",
						where: [{ field: "organizationId", value: org.id }, ...scope.where],
					});
					await db.delete({
						model: "member",
						where: [{ field: "organizationId", value: org.id }, ...scope.where],
					});
					await db.delete({
						model: "organization",
						where: [{ field: "id", value: org.id }, ...scope.where],
					});
					return ctx.json(org);
				},
			),

			updateOrganization: createAuthEndpoint(
				"/organization/update",
				{
					method: "POST",
					body: z
						.object({
							organizationId: z.string().optional(),
							data: z
								.object({
									name: z.string().optional(),
									slug: z.string().optional(),
									logo: z.string().optional(),
									metadata: z.record(z.string(), z.unknown()).optional(),
								})
								.partial(),
						})
						.merge(projectScopeSchema),
					requireHeaders: true,
				},
				async (ctx) => {
					const { userId, activeOrganizationId, userRole } = await getSessionOrThrow(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const orgId = ctx.body.organizationId ?? activeOrganizationId;
					if (!orgId) throw ctx.error("BAD_REQUEST", { message: "Organization required" });

					await requireOrganizationPermission(ctx, db, {
						projectId: scope.projectId,
						organizationId: orgId,
						userId,
						userRole,
						scopeWhere: scope.where,
						permission: "organization.update",
					});
					if (ctx.body.data.slug) {
						const conflict = await db.findMany<OrganizationRow>({
							model: "organization",
							where: [{ field: "slug", value: ctx.body.data.slug }, ...scope.where],
							limit: 1,
						});
						if (conflict[0] && conflict[0].id !== orgId) {
							throw ctx.error("BAD_REQUEST", { message: "Organization slug already exists" });
						}
					}

					const updated = await db.update<OrganizationRow>({
						model: "organization",
						where: [{ field: "id", value: orgId }, ...scope.where],
						update: {
							...ctx.body.data,
							metadata: ctx.body.data.metadata ? JSON.stringify(ctx.body.data.metadata) : undefined,
							updatedAt: Date.now(),
						},
					});
					return ctx.json(updated);
				},
			),

			checkOrganizationSlug: createAuthEndpoint(
				"/organization/check-slug",
				{
					method: "POST",
					body: z.object({ slug: z.string() }).merge(projectScopeSchema),
					requireHeaders: true,
				},
				async (ctx) => {
					// Require authentication to prevent unauthenticated slug enumeration
					await requireAuthenticated(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const existing = await db.findMany<OrganizationRow>({
						model: "organization",
						where: [{ field: "slug", value: ctx.body.slug }, ...scope.where],
						limit: 1,
					});
					if (existing[0]) {
						throw ctx.error("BAD_REQUEST", { message: "Organization slug already taken" });
					}
					return ctx.json({ status: true });
				},
			),

			getActiveMember: createAuthEndpoint(
				"/organization/get-active-member",
				{ method: "POST", body: projectScopeSchema, requireHeaders: true },
				async (ctx) => {
					const { userId, activeOrganizationId } = await getSessionOrThrow(ctx);
					if (!activeOrganizationId) {
						throw ctx.error("BAD_REQUEST", { message: "No active organization" });
					}
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const member = await findMemberOrThrow(
						ctx,
						db,
						activeOrganizationId,
						userId,
						scope.where,
					);
					return ctx.json(member);
				},
			),

			getActiveMemberRole: createAuthEndpoint(
				"/organization/get-active-member-role",
				{
					method: "POST",
					body: z
						.object({
							userId: z.string().optional(),
							organizationId: z.string().optional(),
							organizationSlug: z.string().optional(),
						})
						.merge(projectScopeSchema),
					requireHeaders: true,
				},
				async (ctx) => {
					const session = await getSessionOrThrow(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const org = await resolveOrganization(db, {
						organizationId: ctx.body.organizationId,
						organizationSlug: ctx.body.organizationSlug,
						activeOrganizationId: session.activeOrganizationId,
						scopeWhere: scope.where,
					});
					if (!org) throw ctx.error("BAD_REQUEST", { message: "Organization not found" });

					await findMemberOrThrow(ctx, db, org.id, session.userId, scope.where);
					const targetUserId = ctx.body.userId ?? session.userId;
					const rows = await db.findMany<MemberRow>({
						model: "member",
						where: [
							{ field: "organizationId", value: org.id },
							{ field: "userId", value: targetUserId },
							...scope.where,
						],
						limit: 1,
					});
					if (!rows[0]) throw ctx.error("BAD_REQUEST", { message: "Member not found" });
					return ctx.json({ role: rows[0].role });
				},
			),
		},
	};
}
