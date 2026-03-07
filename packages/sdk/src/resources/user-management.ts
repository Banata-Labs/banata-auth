import type { PaginatedResult, Session, User } from "@banata-auth/shared";
import type { HttpClient } from "../client";

export interface ListUsersOptions {
	projectId?: string;
	email?: string;
	organizationId?: string;
	role?: string;
	limit?: number;
	before?: string;
	after?: string;
	order?: "asc" | "desc";
}

export interface CreateUserOptions {
	projectId?: string;
	email: string;
	password?: string;
	name: string;
	image?: string;
	username?: string;
	phoneNumber?: string;
	emailVerified?: boolean;
	role?: string | string[];
	metadata?: Record<string, unknown>;
	data?: Record<string, unknown>;
}

export interface UpdateUserOptions {
	userId: string;
	projectId?: string;
	name?: string;
	image?: string | null;
	username?: string;
	phoneNumber?: string | null;
	emailVerified?: boolean;
	password?: string;
	role?: string | string[];
	metadata?: Record<string, unknown>;
	data?: Record<string, unknown>;
}

export interface AdminPermissionStatements {
	[resource: string]: string[];
}

export type AdminPermissionCheckInput =
	| string
	| string[]
	| AdminPermissionStatements;

export type AdminPermissionCheckOptions =
	| {
			projectId?: string;
			userId?: string;
			role?: string | string[];
			permission: AdminPermissionCheckInput;
	  }
	| {
			projectId?: string;
			userId?: string;
			role?: string | string[];
			permissions: AdminPermissionCheckInput;
	  };

interface ListUsersResponse {
	users?: User[];
	data?: User[];
}

interface ListUserSessionsResponse {
	sessions?: Session[];
	data?: Session[];
}

interface WrappedUserResponse {
	user: User;
}

export interface AdminSessionResponse {
	session: Session;
	user: User;
}

function emptyListMetadata() {
	return {
		before: null,
		after: null,
	};
}

/**
 * User Management resource.
 * Handles user CRUD, session management, and account operations.
 */
export class UserManagement {
	constructor(private readonly http: HttpClient) {}

	/**
	 * List users with optional filtering and pagination.
	 */
	async listUsers(options?: ListUsersOptions): Promise<PaginatedResult<User>> {
		const payload = await this.http.post<ListUsersResponse>("/api/auth/admin/list-users", {
			projectId: options?.projectId,
			email: options?.email,
			organizationId: options?.organizationId,
			role: options?.role,
			limit: options?.limit,
			before: options?.before,
			after: options?.after,
			order: options?.order,
		});
		return {
			data: payload.data ?? payload.users ?? [],
			listMetadata: emptyListMetadata(),
		};
	}

	/**
	 * Get a user by ID.
	 */
	async getUser(userId: string, options?: { projectId?: string }): Promise<User> {
		return this.http.post<User>("/api/auth/admin/get-user", {
			userId,
			projectId: options?.projectId,
		});
	}

	/**
	 * Create a new user.
	 */
	async createUser(options: CreateUserOptions): Promise<User> {
		const payload = await this.http.post<WrappedUserResponse>("/api/auth/admin/create-user", {
			projectId: options.projectId,
			email: options.email,
			password: options.password,
			name: options.name,
			image: options.image,
			username: options.username,
			phoneNumber: options.phoneNumber,
			emailVerified: options.emailVerified,
			role: options.role ?? "user",
			metadata: options.metadata,
			data: options.data,
		});
		return payload.user;
	}

	/**
	 * Update an existing user.
	 */
	async updateUser(options: UpdateUserOptions): Promise<User> {
		const { userId, ...body } = options;
		return this.http.post<User>("/api/auth/admin/update-user", {
			userId,
			...body,
		});
	}

	/**
	 * Delete a user.
	 */
	async deleteUser(userId: string, options?: { projectId?: string }): Promise<void> {
		return this.http.post<void>("/api/auth/admin/remove-user", {
			userId,
			projectId: options?.projectId,
		});
	}

	/**
	 * Ban a user.
	 */
	async banUser(options: {
		userId: string;
		projectId?: string;
		reason?: string;
		expiresAt?: Date;
	}): Promise<User> {
		const payload = await this.http.post<WrappedUserResponse>("/api/auth/admin/ban-user", {
			userId: options.userId,
			projectId: options.projectId,
			banReason: options.reason,
			banExpires: options.expiresAt?.getTime(),
		});
		return payload.user;
	}

	/**
	 * Unban a user.
	 */
	async unbanUser(userId: string, options?: { projectId?: string }): Promise<User> {
		const payload = await this.http.post<WrappedUserResponse>("/api/auth/admin/unban-user", {
			userId,
			projectId: options?.projectId,
		});
		return payload.user;
	}

	/**
	 * List active sessions for a user.
	 */
	async listUserSessions(
		userId: string,
		options?: { projectId?: string },
	): Promise<PaginatedResult<Session>> {
		const payload = await this.http.post<ListUserSessionsResponse>(
			"/api/auth/admin/list-user-sessions",
			{
				userId,
				projectId: options?.projectId,
			},
		);
		return {
			data: payload.data ?? payload.sessions ?? [],
			listMetadata: emptyListMetadata(),
		};
	}

	/**
	 * Start impersonating a user.
	 */
	async impersonateUser(
		userId: string,
		options?: { projectId?: string },
	): Promise<AdminSessionResponse> {
		return this.http.post<AdminSessionResponse>("/api/auth/admin/impersonate-user", {
			userId,
			projectId: options?.projectId,
		});
	}

	/**
	 * Stop impersonating the current user.
	 */
	async stopImpersonating(): Promise<AdminSessionResponse> {
		return this.http.post<AdminSessionResponse>("/api/auth/admin/stop-impersonating");
	}

	/**
	 * Revoke a specific session.
	 */
	async revokeSession(sessionId: string, options?: { projectId?: string }): Promise<void> {
		return this.http.post<void>("/api/auth/admin/revoke-user-session", {
			sessionId,
			projectId: options?.projectId,
		});
	}

	/**
	 * Revoke all sessions for a user.
	 */
	async revokeAllSessions(userId: string, options?: { projectId?: string }): Promise<void> {
		return this.http.post<void>("/api/auth/admin/revoke-user-sessions", {
			userId,
			projectId: options?.projectId,
		});
	}

	/**
	 * Set a user's global role.
	 */
	async setRole(
		userId: string,
		role: string | string[],
		options?: { projectId?: string },
	): Promise<User> {
		const payload = await this.http.post<WrappedUserResponse>("/api/auth/admin/set-role", {
			userId,
			role,
			projectId: options?.projectId,
		});
		return payload.user;
	}

	/**
	 * Force-set a user's password.
	 */
	async setUserPassword(
		userId: string,
		newPassword: string,
		options?: { projectId?: string },
	): Promise<boolean> {
		const payload = await this.http.post<{ status?: boolean }>("/api/auth/admin/set-user-password", {
			userId,
			newPassword,
			projectId: options?.projectId,
		});
		return payload.status === true;
	}

	/**
	 * Check whether a user or role has the requested permissions.
	 */
	async hasPermission(options: AdminPermissionCheckOptions): Promise<boolean> {
		const payload = await this.http.post<{ success?: boolean }>("/api/auth/admin/has-permission", {
			...options,
		});
		return payload.success === true;
	}
}
