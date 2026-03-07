import type {
	Organization,
	OrganizationInvitation,
	OrganizationMember,
	PaginatedResult,
} from "@banata-auth/shared";
import type { HttpClient } from "../client";

export interface ListOrganizationsOptions {
	limit?: number;
	before?: string;
	after?: string;
	order?: "asc" | "desc";
}

export interface CreateOrganizationOptions {
	name: string;
	slug?: string;
	logo?: string;
	metadata?: Record<string, unknown>;
	requireMfa?: boolean;
	allowedEmailDomains?: string[];
	maxMembers?: number;
}

export interface UpdateOrganizationOptions {
	organizationId: string;
	name?: string;
	slug?: string;
	logo?: string | null;
	metadata?: Record<string, unknown>;
	requireMfa?: boolean;
	ssoEnforced?: boolean;
	allowedEmailDomains?: string[] | null;
	maxMembers?: number | null;
}

export interface ListMembersOptions {
	organizationId: string;
	role?: string;
	limit?: number;
	before?: string;
	after?: string;
}

export interface SendInvitationOptions {
	organizationId: string;
	email: string;
	role: string;
}

/**
 * Organizations resource.
 * Handles organization CRUD, member management, and invitations.
 */
export class Organizations {
	constructor(private readonly http: HttpClient) {}

	async listOrganizations(
		options?: ListOrganizationsOptions,
	): Promise<PaginatedResult<Organization>> {
		return this.http.post<PaginatedResult<Organization>>("/api/auth/organization/list", {
			limit: options?.limit,
			before: options?.before,
			after: options?.after,
			order: options?.order,
		});
	}

	async getOrganization(organizationId: string): Promise<Organization> {
		return this.http.post<Organization>("/api/auth/organization/get-full-organization", {
			organizationId,
		});
	}

	async createOrganization(options: CreateOrganizationOptions): Promise<Organization> {
		return this.http.post<Organization>("/api/auth/organization/create", options);
	}

	async updateOrganization(options: UpdateOrganizationOptions): Promise<Organization> {
		const { organizationId, ...data } = options;
		return this.http.post<Organization>("/api/auth/organization/update", {
			organizationId,
			data,
		});
	}

	async deleteOrganization(organizationId: string): Promise<void> {
		return this.http.post<void>("/api/auth/organization/delete", {
			organizationId,
		});
	}

	// ─── Members ───────────────────────────────────────────────────────────

	async listMembers(options: ListMembersOptions): Promise<PaginatedResult<OrganizationMember>> {
		return this.http.post<PaginatedResult<OrganizationMember>>(
			"/api/auth/organization/list-members",
			{
				organizationId: options.organizationId,
				role: options.role,
				limit: options.limit,
				before: options.before,
				after: options.after,
			},
		);
	}

	async removeMember(options: {
		organizationId: string;
		memberIdOrUserId: string;
	}): Promise<void> {
		return this.http.post<void>("/api/auth/organization/remove-member", options);
	}

	async updateMemberRole(options: {
		organizationId: string;
		memberIdOrUserId: string;
		role: string;
	}): Promise<OrganizationMember> {
		return this.http.post<OrganizationMember>("/api/auth/organization/update-member-role", options);
	}

	// ─── Invitations ───────────────────────────────────────────────────────

	async sendInvitation(options: SendInvitationOptions): Promise<OrganizationInvitation> {
		return this.http.post<OrganizationInvitation>("/api/auth/organization/invite-member", options);
	}

	async revokeInvitation(invitationId: string): Promise<void> {
		return this.http.post<void>("/api/auth/organization/cancel-invitation", {
			invitationId,
		});
	}

	async listInvitations(options: {
		organizationId: string;
		status?: string;
		limit?: number;
		before?: string;
		after?: string;
	}): Promise<PaginatedResult<OrganizationInvitation>> {
		return this.http.post<PaginatedResult<OrganizationInvitation>>(
			"/api/auth/organization/list-invitations",
			{
				organizationId: options.organizationId,
				status: options.status,
				limit: options.limit,
				before: options.before,
				after: options.after,
			},
		);
	}
}
