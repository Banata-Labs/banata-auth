import type { SsoConnection, SsoProfile, PaginatedResult } from "@banata-auth/shared";
import type { HttpClient } from "../client";

export interface GetAuthorizationUrlOptions {
	connectionId?: string;
	organizationId?: string;
	provider?: string;
	loginHint?: string;
	redirectUri: string;
	state?: string;
	domainHint?: string;
	projectId?: string;
}

export interface GetProfileAndTokenOptions {
	code: string;
}

export interface CreateConnectionOptions {
	organizationId: string;
	type: "saml" | "oidc";
	name: string;
	domains: string[];
	projectId?: string;
	samlConfig?: {
		idpEntityId: string;
		idpSsoUrl: string;
		idpCertificate: string;
		nameIdFormat?: string;
		signRequest?: boolean;
		allowIdpInitiated?: boolean;
		attributeMapping?: Record<string, string>;
	};
	oidcConfig?: {
		issuer: string;
		clientId: string;
		clientSecret: string;
		scopes?: string[];
	};
}

export interface ListConnectionsOptions {
	organizationId?: string;
	connectionType?: "saml" | "oidc";
	limit?: number;
	before?: string;
	after?: string;
	projectId?: string;
}

/**
 * SSO resource.
 * Handles SSO connection management and authentication flows.
 */
export class SSO {
	constructor(private readonly http: HttpClient) {}

	/**
	 * Get the authorization URL to redirect the user to for SSO.
	 * Supports routing by organization ID or callback URL.
	 */
	async getAuthorizationUrl(
		options: GetAuthorizationUrlOptions,
	): Promise<{ url: string }> {
		return this.http.post<{ url: string }>("/api/auth/sign-in/sso", {
			providerId: options.connectionId,
			organizationId: options.organizationId,
			issuer: options.provider,
			loginHint: options.loginHint,
			domain: options.domainHint,
			callbackURL: options.redirectUri,
		});
	}

	/**
	 * @deprecated Better Auth handles SSO token exchange internally via callback.
	 * This method is kept for backward compatibility but will throw.
	 */
	async getProfileAndToken(
		_options: GetProfileAndTokenOptions,
	): Promise<{ profile: SsoProfile; accessToken: string }> {
		throw new Error(
			"getProfileAndToken() is not supported with Better Auth. " +
			"SSO token exchange is handled internally via the callback URL.",
		);
	}

	// ─── Connection Management ─────────────────────────────────────────────

	async listConnections(
		options?: ListConnectionsOptions,
	): Promise<PaginatedResult<SsoConnection>> {
		return this.http.post<PaginatedResult<SsoConnection>>(
			"/api/auth/banata/sso/list-providers",
			this.http.withProjectScope(
				{
					organizationId: options?.organizationId,
					connectionType: options?.connectionType,
					limit: options?.limit,
					before: options?.before,
					after: options?.after,
				},
				options?.projectId,
			),
		);
	}

	async getConnection(connectionId: string, options?: { projectId?: string }): Promise<SsoConnection> {
		return this.http.post<SsoConnection>(
			"/api/auth/banata/sso/get-provider",
			this.http.withProjectScope(
				{
					providerId: connectionId,
				},
				options?.projectId,
			),
		);
	}

	async createConnection(options: CreateConnectionOptions): Promise<SsoConnection> {
		return this.http.post<SsoConnection>(
			"/api/auth/banata/sso/register",
			this.http.withProjectScope(
				{
					organizationId: options.organizationId,
					type: options.type,
					domain: options.domains?.[0],
					name: options.name,
					domains: options.domains,
					samlConfig: options.samlConfig,
					oidcConfig: options.oidcConfig,
				},
				options.projectId,
			),
		);
	}

	async updateConnection(options: {
		connectionId: string;
		name?: string;
		domains?: string[];
		samlConfig?: Partial<CreateConnectionOptions["samlConfig"]>;
		oidcConfig?: Partial<CreateConnectionOptions["oidcConfig"]>;
		projectId?: string;
	}): Promise<SsoConnection> {
		const { connectionId, projectId, ...body } = options;
		return this.http.post<SsoConnection>(
			"/api/auth/banata/sso/update-provider",
			this.http.withProjectScope(
				{
					providerId: connectionId,
					...body,
				},
				projectId,
			),
		);
	}

	async deleteConnection(connectionId: string, options?: { projectId?: string }): Promise<void> {
		return this.http.post<void>(
			"/api/auth/banata/sso/delete-provider",
			this.http.withProjectScope(
				{
					providerId: connectionId,
				},
				options?.projectId,
			),
		);
	}

	async activateConnection(connectionId: string, options?: { projectId?: string }): Promise<SsoConnection> {
		return this.http.post<SsoConnection>(
			"/api/auth/banata/sso/update-provider",
			this.http.withProjectScope(
				{
					providerId: connectionId,
					active: true,
				},
				options?.projectId,
			),
		);
	}

	async deactivateConnection(connectionId: string, options?: { projectId?: string }): Promise<SsoConnection> {
		return this.http.post<SsoConnection>(
			"/api/auth/banata/sso/update-provider",
			this.http.withProjectScope(
				{
					providerId: connectionId,
					active: false,
				},
				options?.projectId,
			),
		);
	}
}
