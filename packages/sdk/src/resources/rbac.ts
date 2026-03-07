import type { HttpClient } from "../client";

export interface RoleDefinition {
	id: string;
	name: string;
	slug: string;
	description: string;
	permissions: string[];
	isDefault: boolean;
	createdAt: string;
}

export interface PermissionDefinition {
	id: string;
	name: string;
	slug: string;
	description: string;
	createdAt: string;
}

export interface CreateRoleOptions {
	name: string;
	slug: string;
	description?: string;
}

export interface CreatePermissionOptions {
	name: string;
	slug: string;
	description?: string;
}

export interface AssignRoleOptions {
	organizationId: string;
	userId: string;
	role: string;
}

export interface PermissionCheck {
	resource: string;
	action: string;
}

export interface CheckPermissionOptions {
	projectId: string;
	permission: string | PermissionCheck;
}

export interface CheckPermissionsOptions {
	projectId: string;
	permissions: Array<string | PermissionCheck>;
	operator?: "all" | "any";
}

function normalizePermission(permission: string | PermissionCheck): string {
	if (typeof permission === "string") return permission;
	return `${permission.resource}.${permission.action}`;
}

export class Rbac {
	constructor(private readonly http: HttpClient) {}

	async listRoles(): Promise<RoleDefinition[]> {
		const result = await this.http.post<{ roles: RoleDefinition[] }>(
			"/api/auth/banata/config/roles/list",
			{},
		);
		return result.roles ?? [];
	}

	async createRole(options: CreateRoleOptions): Promise<RoleDefinition> {
		const result = await this.http.post<{ role: RoleDefinition }>(
			"/api/auth/banata/config/roles/create",
			options,
		);
		return result.role;
	}

	async deleteRole(id: string): Promise<void> {
		await this.http.post<void>("/api/auth/banata/config/roles/delete", { id });
	}

	async listPermissions(): Promise<PermissionDefinition[]> {
		const result = await this.http.post<{ permissions: PermissionDefinition[] }>(
			"/api/auth/banata/config/permissions/list",
			{},
		);
		return result.permissions ?? [];
	}

	async createPermission(options: CreatePermissionOptions): Promise<PermissionDefinition> {
		const result = await this.http.post<{ permission: PermissionDefinition }>(
			"/api/auth/banata/config/permissions/create",
			options,
		);
		return result.permission;
	}

	async deletePermission(id: string): Promise<void> {
		await this.http.post<void>("/api/auth/banata/config/permissions/delete", { id });
	}

	async assignRole(options: AssignRoleOptions): Promise<void> {
		await this.http.post<void>("/api/auth/organization/update-member-role", {
			memberIdOrUserId: options.userId,
			role: options.role,
			organizationId: options.organizationId,
		});
	}

	async checkPermission(options: CheckPermissionOptions): Promise<{ allowed: boolean }> {
		return this.http.post<{ allowed: boolean }>("/api/auth/banata/rbac/check-permission", {
			projectId: options.projectId,
			permission: normalizePermission(options.permission),
		});
	}

	async checkPermissions(options: CheckPermissionsOptions): Promise<{ allowed: boolean }> {
		return this.http.post<{ allowed: boolean }>("/api/auth/banata/rbac/check-permissions", {
			projectId: options.projectId,
			permissions: options.permissions.map(normalizePermission),
			operator: options.operator ?? "all",
		});
	}

	async getMyPermissions(projectId: string): Promise<string[]> {
		const result = await this.http.post<{ permissions: string[] }>(
			"/api/auth/banata/rbac/my-permissions",
			{
				projectId,
			},
		);
		return result.permissions ?? [];
	}

	async hasPermission(projectId: string, permission: string | PermissionCheck): Promise<boolean> {
		const result = await this.checkPermission({
			projectId,
			permission,
		});
		return result.allowed;
	}

	async requirePermission(projectId: string, permission: string | PermissionCheck): Promise<void> {
		const allowed = await this.hasPermission(projectId, permission);
		if (!allowed) {
			throw new Error(`Missing permission: ${normalizePermission(permission)}`);
		}
	}

	async revokeRole(options: {
		organizationId: string;
		userId: string;
		fallbackRole?: string;
	}): Promise<void> {
		await this.http.post<void>("/api/auth/organization/update-member-role", {
			memberIdOrUserId: options.userId,
			role: options.fallbackRole ?? "super_admin",
			organizationId: options.organizationId,
		});
	}
}
