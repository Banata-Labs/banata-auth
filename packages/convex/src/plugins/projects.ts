/**
 * Banata Auth Projects Plugin
 *
 * Provides multi-project support.
 * Each project is a fully isolated auth tenant with its own users, sessions,
 * organizations, branding, email templates, API keys, webhooks, etc.
 */

import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { z } from "zod";
import type {
	PermissionDefinitionRow,
	PluginDBAdapter,
	ProjectRow,
	RoleDefinitionRow,
	SessionUser,
} from "./types";
import { isGlobalAdminUser, requireAuthenticated } from "./types";

// ─── Zod Schemas ──────────────────────────────────────────────────

const createProjectSchema = z.object({
	name: z.string().min(1).max(100),
	slug: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
	description: z.string().max(500).optional(),
	logoUrl: z.string().url().optional(),
});

const updateProjectSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(100).optional(),
	slug: z
		.string()
		.min(1)
		.max(100)
		.regex(/^[a-z0-9-]+$/)
		.optional(),
	description: z.string().max(500).optional(),
	logoUrl: z.string().url().optional(),
});

// ─── Built-in RBAC Seeds ──────────────────────────────────────────

const SUPER_ADMIN_ROLE_SLUG = "super_admin";

interface MemberProjectRow extends Record<string, unknown> {
	projectId?: string;
	userId: string;
}

interface BuiltInPermissionSeed {
	slug: string;
	name: string;
	description: string;
}

const BUILT_IN_PERMISSIONS: BuiltInPermissionSeed[] = [
	{
		slug: "organization.read",
		name: "Read organization",
		description: "View organization details.",
	},
	{
		slug: "organization.update",
		name: "Update organization",
		description: "Update organization metadata and settings.",
	},
	{
		slug: "organization.delete",
		name: "Delete organization",
		description: "Delete an organization.",
	},
	{ slug: "member.invite", name: "Invite members", description: "Invite users to organizations." },
	{ slug: "member.read", name: "Read members", description: "List organization members." },
	{
		slug: "member.update_role",
		name: "Update member role",
		description: "Change member role assignments.",
	},
	{
		slug: "member.remove",
		name: "Remove members",
		description: "Remove members from organizations.",
	},
	{ slug: "role.create", name: "Create roles", description: "Create custom roles." },
	{ slug: "role.read", name: "Read roles", description: "List and inspect roles." },
	{ slug: "role.update", name: "Update roles", description: "Edit custom roles." },
	{ slug: "role.delete", name: "Delete roles", description: "Delete custom roles." },
	{
		slug: "permission.create",
		name: "Create permissions",
		description: "Create custom permissions.",
	},
	{
		slug: "permission.read",
		name: "Read permissions",
		description: "List and inspect permissions.",
	},
	{
		slug: "permission.delete",
		name: "Delete permissions",
		description: "Delete custom permissions.",
	},
	{ slug: "api_key.create", name: "Create API keys", description: "Create API keys." },
	{ slug: "api_key.read", name: "Read API keys", description: "List API keys." },
	{ slug: "api_key.delete", name: "Delete API keys", description: "Revoke API keys." },
	{
		slug: "sso.read",
		name: "Read SSO connections",
		description: "List and inspect enterprise SSO connections.",
	},
	{
		slug: "sso.manage",
		name: "Manage SSO connections",
		description: "Create, update, and delete enterprise SSO connections.",
	},
	{
		slug: "directory.read",
		name: "Read directories",
		description: "List and inspect SCIM directories and synced users.",
	},
	{
		slug: "directory.manage",
		name: "Manage directories",
		description: "Create and delete SCIM directories and tokens.",
	},
	{ slug: "sandbox.create", name: "Create sandboxes", description: "Create AI/runtime sandboxes." },
	{ slug: "sandbox.read", name: "Read sandboxes", description: "View sandbox details." },
	{ slug: "sandbox.delete", name: "Delete sandboxes", description: "Delete sandboxes." },
	{ slug: "browser.launch", name: "Launch browser", description: "Launch browser sandboxes." },
	{ slug: "browser.connect", name: "Connect browser", description: "Connect to browser CDP." },
	{ slug: "billing.read", name: "Read billing", description: "View billing details." },
	{ slug: "billing.manage", name: "Manage billing", description: "Manage billing and plans." },
];

async function ensureProjectRbacSeed(
	db: PluginDBAdapter,
	projectId: string,
	now: number,
): Promise<void> {
	const existingPermissions = await db.findMany<PermissionDefinitionRow>({
		model: "permissionDefinition",
		where: [{ field: "projectId", value: projectId }],
		limit: 1000,
	});
	const existingPermissionSlugs = new Set(existingPermissions.map((p) => p.slug));

	for (const def of BUILT_IN_PERMISSIONS) {
		if (existingPermissionSlugs.has(def.slug)) continue;
		await db.create<PermissionDefinitionRow>({
			model: "permissionDefinition",
			data: {
				projectId,
				name: def.name,
				slug: def.slug,
				description: def.description,
				createdAt: now,
				updatedAt: now,
			},
		});
		existingPermissionSlugs.add(def.slug);
	}

	const allPermissionSlugs = Array.from(existingPermissionSlugs).sort();
	const superAdminRows = await db.findMany<RoleDefinitionRow>({
		model: "roleDefinition",
		where: [
			{ field: "projectId", value: projectId },
			{ field: "slug", value: SUPER_ADMIN_ROLE_SLUG },
		],
		limit: 1,
	});

	if (superAdminRows.length === 0 || !superAdminRows[0]) {
		await db.create<RoleDefinitionRow>({
			model: "roleDefinition",
			data: {
				projectId,
				name: "Super Admin",
				slug: SUPER_ADMIN_ROLE_SLUG,
				description: "Full access across this project and its organizations.",
				permissions: JSON.stringify(allPermissionSlugs),
				isDefault: true,
				createdAt: now,
				updatedAt: now,
			},
		});
		return;
	}

	const superAdmin = superAdminRows[0];
	const currentPerms = superAdmin.permissions
		? (JSON.parse(superAdmin.permissions) as string[])
		: [];
	const mergedPerms = Array.from(new Set([...currentPerms, ...allPermissionSlugs])).sort();
	await db.update<RoleDefinitionRow>({
		model: "roleDefinition",
		where: [{ field: "id", value: superAdmin.id }],
		update: {
			permissions: JSON.stringify(mergedPerms),
			isDefault: true,
			updatedAt: now,
		},
	});
}

async function findMemberProjectIds(db: PluginDBAdapter, userId: string): Promise<string[]> {
	try {
		const memberships = await db.findMany<MemberProjectRow>({
			model: "member",
			where: [{ field: "userId", value: userId }],
			limit: 1000,
		});
		return Array.from(
			new Set(
				memberships
					.map((membership) => membership.projectId)
					.filter((projectId): projectId is string => typeof projectId === "string"),
			),
		);
	} catch {
		// The organization plugin owns the `member` model. If it is disabled,
		// project access falls back to ownership only.
		return [];
	}
}

function sortProjects(projects: ProjectRow[]): ProjectRow[] {
	return [...projects].sort((a, b) => b.createdAt - a.createdAt);
}

async function listAccessibleProjects(
	db: PluginDBAdapter,
	user: SessionUser,
): Promise<ProjectRow[]> {
	if (isGlobalAdminUser(user)) {
		const rows = await db.findMany<ProjectRow>({
			model: "project",
			where: [],
			limit: 1000,
			sortBy: { field: "createdAt", direction: "desc" },
		});
		return rows;
	}

	const projectsById = new Map<string, ProjectRow>();
	const ownedProjects = await db.findMany<ProjectRow>({
		model: "project",
		where: [{ field: "ownerId", value: user.id }],
		limit: 1000,
		sortBy: { field: "createdAt", direction: "desc" },
	});
	for (const project of ownedProjects) {
		projectsById.set(project.id, project);
	}

	const memberProjectIds = await findMemberProjectIds(db, user.id);
	if (memberProjectIds.length > 0) {
		const memberProjects = await db.findMany<ProjectRow>({
			model: "project",
			where: [{ field: "id", operator: "in", value: memberProjectIds }],
			limit: 1000,
			sortBy: { field: "createdAt", direction: "desc" },
		});
		for (const project of memberProjects) {
			projectsById.set(project.id, project);
		}
	}

	return sortProjects(Array.from(projectsById.values()));
}

async function findProjectById(db: PluginDBAdapter, projectId: string): Promise<ProjectRow | null> {
	const rows = await db.findMany<ProjectRow>({
		model: "project",
		where: [{ field: "id", value: projectId }],
		limit: 1,
	});
	return rows[0] ?? null;
}

async function assertProjectReadable(
	ctx: any,
	db: PluginDBAdapter,
	project: ProjectRow,
	user: SessionUser,
): Promise<void> {
	if (isGlobalAdminUser(user) || project.ownerId === user.id) {
		return;
	}

	const memberProjectIds = await findMemberProjectIds(db, user.id);
	if (memberProjectIds.includes(project.id)) {
		return;
	}

	throw ctx.error("FORBIDDEN", { message: "You do not have access to this project" });
}

function assertProjectWritable(ctx: any, project: ProjectRow, user: SessionUser): void {
	if (isGlobalAdminUser(user) || project.ownerId === user.id) {
		return;
	}

	throw ctx.error("FORBIDDEN", { message: "Only the project owner can modify this project" });
}

// ─── Plugin Options ───────────────────────────────────────────────

export interface ProjectsPluginOptions {
	/** Whether to auto-create a default project if none exist. Default: true */
	autoCreateDefault?: boolean;
	/** Default project name when auto-creating. Default: "Default Project" */
	defaultProjectName?: string;
}

// ─── Plugin Definition ────────────────────────────────────────────

export function projectsPlugin(options: ProjectsPluginOptions = {}): BetterAuthPlugin {
	const { autoCreateDefault = true, defaultProjectName = "Default Project" } = options;

	return {
		id: "banata-projects" as const,

		schema: {
			project: {
				fields: {
					name: { type: "string" as const, required: true },
					slug: { type: "string" as const, required: true, unique: true },
					description: { type: "string" as const, required: false },
					logoUrl: { type: "string" as const, required: false },
					ownerId: { type: "string" as const, required: true },
					createdAt: { type: "number" as const, required: true },
					updatedAt: { type: "number" as const, required: true },
				},
			},
		},

		endpoints: {
			// ─── Project CRUD ───────────────────────────────────────

			/**
			 * List all projects the current user has access to.
			 */
			listProjects: createAuthEndpoint(
				"/banata/projects/list",
				{ method: "POST", requireHeaders: true },
				async (ctx) => {
					const { user } = requireAuthenticated(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const projects = await listAccessibleProjects(db, user);
					return ctx.json({ projects });
				},
			),

			/**
			 * Get a single project by ID.
			 */
			getProject: createAuthEndpoint(
				"/banata/projects/get",
				{
					method: "POST",
					requireHeaders: true,
					body: z.object({ id: z.string() }),
				},
				async (ctx) => {
					const { user } = requireAuthenticated(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const project = await findProjectById(db, ctx.body.id);
					if (!project) {
						return ctx.json({ project: null });
					}

					await assertProjectReadable(ctx, db, project, user);
					return ctx.json({ project });
				},
			),

			/**
			 * Create a new project.
			 */
			createProject: createAuthEndpoint(
				"/banata/projects/create",
				{
					method: "POST",
					requireHeaders: true,
					body: createProjectSchema,
				},
				async (ctx) => {
					const { user } = requireAuthenticated(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;

					// Check slug uniqueness
					const existing = await db.findMany<ProjectRow>({
						model: "project",
						where: [{ field: "slug", value: body.slug }],
					});
					if (existing.length > 0) {
						return ctx.json({
							success: false,
							error: `Project slug "${body.slug}" already exists`,
						});
					}

					// Get current user ID from session
					const userId = user.id;
					const now = Date.now();

					const data: Record<string, unknown> = {
						name: body.name,
						slug: body.slug,
						ownerId: userId,
						createdAt: now,
						updatedAt: now,
					};
					if (body.description) data.description = body.description;
					if (body.logoUrl) data.logoUrl = body.logoUrl;

					const project = await db.create<ProjectRow>({
						model: "project",
						data: data as ProjectRow,
					});

					await ensureProjectRbacSeed(db, project.id, now);

					return ctx.json({ success: true, project });
				},
			),

			/**
			 * Update a project's metadata.
			 */
			updateProject: createAuthEndpoint(
				"/banata/projects/update",
				{
					method: "POST",
					requireHeaders: true,
					body: updateProjectSchema,
				},
				async (ctx) => {
					const { user } = requireAuthenticated(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;
					const project = await findProjectById(db, body.id);
					if (!project) {
						throw ctx.error("BAD_REQUEST", { message: "Project not found" });
					}
					assertProjectWritable(ctx, project, user);

					// If slug is being changed, check uniqueness
					if (body.slug) {
						const existing = await db.findMany<ProjectRow>({
							model: "project",
							where: [{ field: "slug", value: body.slug }],
						});
						if (existing.length > 0 && existing[0]!.id !== body.id) {
							return ctx.json({
								success: false,
								error: `Project slug "${body.slug}" already exists`,
							});
						}
					}

					const update: Record<string, unknown> = { updatedAt: Date.now() };
					if (body.name !== undefined) update.name = body.name;
					if (body.slug !== undefined) update.slug = body.slug;
					if (body.description !== undefined) update.description = body.description;
					if (body.logoUrl !== undefined) update.logoUrl = body.logoUrl;

					const updated = await db.update<ProjectRow>({
						model: "project",
						where: [{ field: "id", value: body.id }],
						update,
					});

					return ctx.json({ success: true, project: updated });
				},
			),

			/**
			 * Delete a project.
			 * WARNING: This does NOT cascade-delete project data (users, etc.) — that
			 * requires a more complex migration. This only deletes the project metadata.
			 */
			deleteProject: createAuthEndpoint(
				"/banata/projects/delete",
				{
					method: "POST",
					requireHeaders: true,
					body: z.object({ id: z.string() }),
				},
				async (ctx) => {
					const { user } = requireAuthenticated(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const project = await findProjectById(db, ctx.body.id);
					if (!project) {
						throw ctx.error("BAD_REQUEST", { message: "Project not found" });
					}
					assertProjectWritable(ctx, project, user);

					// Delete the project
					await db.delete({
						model: "project",
						where: [{ field: "id", value: ctx.body.id }],
					});

					return ctx.json({ success: true });
				},
			),

			// ─── Initialization / Bootstrap ─────────────────────────

			/**
			 * Ensure at least one project exists. If none exist and autoCreateDefault
			 * is enabled, creates a "Default Project".
			 * Called by the dashboard on first load.
			 */
			ensureDefaultProject: createAuthEndpoint(
				"/banata/projects/ensure-default",
				{ method: "POST", requireHeaders: true },
				async (ctx) => {
					const { user } = requireAuthenticated(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;

					const existingProjects = await db.findMany<ProjectRow>({
						model: "project",
						where: [],
						limit: 1000,
						sortBy: { field: "createdAt", direction: "desc" },
					});

					if (existingProjects.length > 0) {
						const accessibleProjects = await listAccessibleProjects(db, user);
						const project = accessibleProjects[0] ?? null;
						if (project) {
							await ensureProjectRbacSeed(db, project.id, Date.now());
						}

						return ctx.json({
							created: false,
							project,
						});
					}

					if (!autoCreateDefault) {
						return ctx.json({ created: false, project: null });
					}

					// Create default project
					const userId = user.id;
					const now = Date.now();

					const project = await db.create<ProjectRow>({
						model: "project",
						data: {
							name: defaultProjectName,
							slug: "default",
							ownerId: userId,
							createdAt: now,
							updatedAt: now,
						} as ProjectRow,
					});

					await ensureProjectRbacSeed(db, project.id, now);

					return ctx.json({ created: true, project });
				},
			),
		},
	};
}
