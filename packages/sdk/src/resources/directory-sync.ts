import type {
	Directory,
	DirectoryUser,
	DirectoryGroup,
	DirectoryProvider,
	PaginatedResult,
} from "@banata-auth/shared";
import type { HttpClient } from "../client";

export class DirectorySync {
	constructor(private readonly http: HttpClient) {}

	async listDirectories(options?: {
		organizationId?: string;
		limit?: number;
		before?: string;
		after?: string;
		projectId?: string;
	}): Promise<PaginatedResult<Directory>> {
		return this.http.post<PaginatedResult<Directory>>(
			"/api/auth/banata/scim/list-providers",
			this.http.withProjectScope(
				{
					organizationId: options?.organizationId,
					limit: options?.limit,
					before: options?.before,
					after: options?.after,
				},
				options?.projectId,
			),
		);
	}

	async getDirectory(directoryId: string, options?: { projectId?: string }): Promise<Directory> {
		return this.http.post<Directory>(
			"/api/auth/banata/scim/get-provider",
			this.http.withProjectScope(
				{
					providerId: directoryId,
				},
				options?.projectId,
			),
		);
	}

	async createDirectory(options: {
		organizationId: string;
		name: string;
		provider: DirectoryProvider;
		projectId?: string;
	}): Promise<Directory & { scimConfig: { baseUrl: string; bearerToken: string } }> {
		return this.http.post(
			"/api/auth/banata/scim/register",
			this.http.withProjectScope(
				{
					organizationId: options.organizationId,
					name: options.name,
					provider: options.provider,
				},
				options.projectId,
			),
		);
	}

	async deleteDirectory(directoryId: string, options?: { projectId?: string }): Promise<void> {
		return this.http.post<void>(
			"/api/auth/banata/scim/delete-provider",
			this.http.withProjectScope(
				{
					providerId: directoryId,
				},
				options?.projectId,
			),
		);
	}

	async listUsers(options: {
		directoryId: string;
		state?: "active" | "suspended" | "deprovisioned";
		limit?: number;
		before?: string;
		after?: string;
		projectId?: string;
	}): Promise<PaginatedResult<DirectoryUser>> {
		return this.http.post<PaginatedResult<DirectoryUser>>(
			"/api/auth/banata/scim/list-users",
			this.http.withProjectScope(
				{
					providerId: options.directoryId,
					state: options.state,
					limit: options.limit,
					before: options.before,
					after: options.after,
				},
				options.projectId,
			),
		);
	}

	async getUser(directoryUserId: string, options?: { projectId?: string }): Promise<DirectoryUser> {
		return this.http.post<DirectoryUser>(
			"/api/auth/banata/scim/get-user",
			this.http.withProjectScope(
				{
					userId: directoryUserId,
				},
				options?.projectId,
			),
		);
	}

	async listGroups(options: {
		directoryId: string;
		limit?: number;
		before?: string;
		after?: string;
		projectId?: string;
	}): Promise<PaginatedResult<DirectoryGroup>> {
		return this.http.post<PaginatedResult<DirectoryGroup>>(
			"/api/auth/banata/scim/list-groups",
			this.http.withProjectScope(
				{
					providerId: options.directoryId,
					limit: options.limit,
					before: options.before,
					after: options.after,
				},
				options.projectId,
			),
		);
	}

	async getGroup(directoryGroupId: string, options?: { projectId?: string }): Promise<DirectoryGroup> {
		return this.http.post<DirectoryGroup>(
			"/api/auth/banata/scim/get-group",
			this.http.withProjectScope(
				{
					groupId: directoryGroupId,
				},
				options?.projectId,
			),
		);
	}
}
