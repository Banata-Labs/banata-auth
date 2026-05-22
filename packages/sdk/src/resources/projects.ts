import type { HttpClient } from "../client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SdkProject {
	id: string;
	name: string;
	slug: string;
	description?: string;
	logoUrl?: string;
	ownerId: string;
	createdAt: number;
	updatedAt: number;
}

export interface CreateProjectOptions {
	name: string;
	slug: string;
	description?: string;
	logoUrl?: string;
}

export interface UpdateProjectOptions {
	name?: string;
	slug?: string;
	description?: string;
	logoUrl?: string;
}

export interface ProjectDomain {
	id: string;
	origin: string;
	oauthCallbackUrls: string[];
	createdAt: number;
	updatedAt: number;
	verified: boolean;
}

export interface AddProjectDomainOptions {
	origin: string;
	projectId?: string;
}

export interface ListProjectDomainsOptions {
	projectId?: string;
	providerIds?: string[];
}

export interface RemoveProjectDomainOptions {
	origin: string;
	projectId?: string;
}

export interface VerifyProjectDomainOptions {
	origin: string;
	projectId?: string;
}

// ---------------------------------------------------------------------------
// Projects Resource
// ---------------------------------------------------------------------------

/**
 * Manage projects.
 *
 * Each project is a fully isolated auth tenant with its own users, sessions,
 * organizations, branding, email templates, API keys, webhooks, etc.
 */
export class Projects {
	constructor(private readonly http: HttpClient) {}

	/**
	 * List all projects.
	 */
	async listProjects(): Promise<SdkProject[]> {
		const res = await this.http.post<{ projects: SdkProject[] }>("/api/auth/banata/projects/list");
		return res.projects;
	}

	/**
	 * Get a single project by ID.
	 */
	async getProject(id: string): Promise<SdkProject | null> {
		const res = await this.http.post<{ project: SdkProject | null }>(
			"/api/auth/banata/projects/get",
			{ id },
		);
		return res.project;
	}

	/**
	 * Create a new project.
	 * Returns the project and seeds RBAC permissions + super_admin role.
	 */
	async createProject(data: CreateProjectOptions): Promise<{
		success: boolean;
		project?: SdkProject;
		error?: string;
	}> {
		return this.http.post("/api/auth/banata/projects/create", data);
	}

	/**
	 * Update a project's metadata.
	 */
	async updateProject(
		id: string,
		update: UpdateProjectOptions,
	): Promise<{ success: boolean; project?: SdkProject; error?: string }> {
		return this.http.post("/api/auth/banata/projects/update", { id, ...update });
	}

	/**
	 * Delete a project.
	 *
	 * Note: This deletes the project record only. Project-scoped data (users,
	 * organizations, etc.) is not automatically cascade-deleted. Use the
	 * `clearAllData` migration for a full reset.
	 */
	async deleteProject(id: string): Promise<{ success: boolean }> {
		return this.http.post("/api/auth/banata/projects/delete", { id });
	}

	/**
	 * Ensure at least one project exists. If none exist, creates a
	 * "Default Project" with seeded RBAC permissions.
	 */
	async ensureDefaultProject(): Promise<{
		created: boolean;
		project: SdkProject | null;
	}> {
		return this.http.post("/api/auth/banata/projects/ensure-default");
	}

	/**
	 * Add an HTTPS origin for OAuth callbacks in the API key's project.
	 */
	async addProjectDomain(input: AddProjectDomainOptions): Promise<ProjectDomain> {
		const response = await this.http.post<{ domain: ProjectDomain }>(
			"/api/auth/banata/config/project-domains/add",
			this.http.withProjectScope({ origin: input.origin }, input.projectId),
		);
		return response.domain;
	}

	/**
	 * List HTTPS project origins and their OAuth callback URLs.
	 */
	async listProjectDomains(input: ListProjectDomainsOptions = {}): Promise<ProjectDomain[]> {
		const response = await this.http.post<{ domains: ProjectDomain[] }>(
			"/api/auth/banata/config/project-domains/list",
			this.http.withProjectScope({ providerIds: input.providerIds }, input.projectId),
		);
		return response.domains;
	}

	/**
	 * Remove an HTTPS origin from the API key's project.
	 */
	async removeProjectDomain(input: RemoveProjectDomainOptions): Promise<void> {
		await this.http.post<void>(
			"/api/auth/banata/config/project-domains/remove",
			this.http.withProjectScope({ origin: input.origin }, input.projectId),
		);
	}

	/**
	 * Verify that an HTTPS origin is present for the API key's project.
	 */
	async verifyProjectDomain(input: VerifyProjectDomainOptions): Promise<ProjectDomain> {
		const response = await this.http.post<{ domain: ProjectDomain }>(
			"/api/auth/banata/config/project-domains/verify",
			this.http.withProjectScope({ origin: input.origin }, input.projectId),
		);
		return response.domain;
	}
}
