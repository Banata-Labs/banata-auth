import type { DomainVerification, PaginatedResult } from "@banata-auth/shared";
import type { HttpClient } from "../client";

export class Domains {
	constructor(private readonly http: HttpClient) {}

	async createVerification(options: {
		organizationId: string;
		domain: string;
		projectId?: string;
	}): Promise<DomainVerification> {
		return this.http.post<DomainVerification>(
			"/api/auth/banata/domains/create",
			this.http.withProjectScope(
				{
					organizationId: options.organizationId,
					domain: options.domain,
				},
				options.projectId,
			),
		);
	}

	async getVerification(verificationId: string, options?: { projectId?: string }): Promise<DomainVerification> {
		return this.http.post<DomainVerification>(
			"/api/auth/banata/domains/get",
			this.http.withProjectScope(
				{
					id: verificationId,
				},
				options?.projectId,
			),
		);
	}

	async verify(verificationId: string, options?: { projectId?: string }): Promise<DomainVerification> {
		return this.http.post<DomainVerification>(
			"/api/auth/banata/domains/verify",
			this.http.withProjectScope(
				{
					id: verificationId,
				},
				options?.projectId,
			),
		);
	}

	async list(options: {
		organizationId: string;
		limit?: number;
		before?: string;
		after?: string;
		projectId?: string;
	}): Promise<PaginatedResult<DomainVerification>> {
		return this.http.post<PaginatedResult<DomainVerification>>(
			"/api/auth/banata/domains/list",
			this.http.withProjectScope(
				{
					organizationId: options.organizationId,
					limit: options.limit,
					before: options.before,
					after: options.after,
				},
				options.projectId,
			),
		);
	}

	async delete(verificationId: string, options?: { projectId?: string }): Promise<void> {
		return this.http.post<void>(
			"/api/auth/banata/domains/delete",
			this.http.withProjectScope(
				{
					id: verificationId,
				},
				options?.projectId,
			),
		);
	}
}
