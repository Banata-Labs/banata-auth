import type {
	RuntimeAuthConfig,
	RuntimeBrandingConfig,
} from "@banata-auth/shared";
import type { HttpClient } from "../client";

export interface SocialProviderCredentialRecord {
	clientId: string;
	tenantId: string | null;
	hasClientSecret: boolean;
	enabled: boolean;
	updatedAt: number;
}

export type SocialProviderCredentials = Record<string, SocialProviderCredentialRecord>;

export interface SaveSocialProviderCredentialOptions {
	providerId: string;
	clientId: string;
	clientSecret?: string;
	tenantId?: string;
	enabled?: boolean;
	projectId?: string;
}

export interface ValidateSocialProviderResult {
	providerId: string;
	ready: boolean;
	errors: Array<{ code: string; message: string }>;
	warnings: Array<{ code: string; message: string }>;
	callbackUrls: string[];
}

export interface RateLimitBucket {
	id: string;
	key: string;
	projectId?: string;
	ip: string | null;
	path: string | null;
	identifier: string | null;
	count: number;
	lastRequest: number;
	ageSeconds: number;
}

export interface AuthConfiguration {
	roleAssignment: boolean;
	multipleRoles: boolean;
	apiKeyPermissions: boolean;
}

type SaveAuthConfigurationOptions = Partial<AuthConfiguration> & {
	projectId?: string;
};

type SaveBrandingConfigOptions = Partial<RuntimeBrandingConfig> & {
	projectId?: string;
};

type SaveDashboardConfigOptions = Partial<RuntimeAuthConfig> & {
	projectId?: string;
};

export class Configuration {
	constructor(private readonly http: HttpClient) {}

	async getDashboardConfig(projectId?: string): Promise<RuntimeAuthConfig> {
		return this.http.post<RuntimeAuthConfig>(
			"/api/auth/banata/config/dashboard",
			this.http.withProjectScope({}, projectId),
		);
	}

	async saveDashboardConfig(input: SaveDashboardConfigOptions): Promise<RuntimeAuthConfig> {
		return this.http.post<RuntimeAuthConfig>(
			"/api/auth/banata/config/dashboard/save",
			this.http.withProjectScope(input, input.projectId),
		);
	}

	async getSocialProviderCredentials(projectId?: string): Promise<SocialProviderCredentials> {
		const response = await this.http.post<{ providers: SocialProviderCredentials }>(
			"/api/auth/banata/config/social-providers/get",
			this.http.withProjectScope({}, projectId),
		);
		return response.providers ?? {};
	}

	async saveSocialProviderCredential(
		input: SaveSocialProviderCredentialOptions,
	): Promise<{
		config: RuntimeAuthConfig;
		providers: SocialProviderCredentials;
	}> {
		return this.http.post(
			"/api/auth/banata/config/social-providers/save",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}

	async deleteSocialProviderCredential(
		providerId: string,
		projectId?: string,
	): Promise<{
		config: RuntimeAuthConfig;
		providers: SocialProviderCredentials;
	}> {
		return this.http.post(
			"/api/auth/banata/config/social-providers/delete",
			this.http.withProjectScope({ providerId }, projectId),
		);
	}

	async validateSocialProviderSetup(
		providerId: string,
		projectId?: string,
	): Promise<ValidateSocialProviderResult> {
		return this.http.post<ValidateSocialProviderResult>(
			"/api/auth/banata/config/social-providers/validate",
			this.http.withProjectScope({ providerId }, projectId),
		);
	}

	async listRateLimitBuckets(input: {
		projectId?: string;
		limit?: number;
	} = {}): Promise<{ buckets: RateLimitBucket[] }> {
		return this.http.post<{ buckets: RateLimitBucket[] }>(
			"/api/auth/banata/config/rate-limits/list",
			this.http.withProjectScope(input, input.projectId),
		);
	}

	async resetRateLimitBucket(input: {
		projectId?: string;
		key?: string;
	}): Promise<{ success: boolean; scope: "bucket" | "project" }> {
		return this.http.post<{ success: boolean; scope: "bucket" | "project" }>(
			"/api/auth/banata/config/rate-limits/reset",
			this.http.withProjectScope(input, input.projectId),
		);
	}

	async getBrandingConfig(projectId?: string): Promise<RuntimeBrandingConfig> {
		return this.http.post<RuntimeBrandingConfig>(
			"/api/auth/banata/config/branding/get",
			this.http.withProjectScope({}, projectId),
		);
	}

	async saveBrandingConfig(input: SaveBrandingConfigOptions): Promise<RuntimeBrandingConfig> {
		return this.http.post<RuntimeBrandingConfig>(
			"/api/auth/banata/config/branding/save",
			this.http.withProjectScope(input, input.projectId),
		);
	}

	async getAuthConfiguration(projectId?: string): Promise<AuthConfiguration> {
		return this.http.post<AuthConfiguration>(
			"/api/auth/banata/config/auth-config/get",
			this.http.withProjectScope({}, projectId),
		);
	}

	async saveAuthConfiguration(input: SaveAuthConfigurationOptions): Promise<AuthConfiguration> {
		return this.http.post<AuthConfiguration>(
			"/api/auth/banata/config/auth-config/save",
			this.http.withProjectScope(input, input.projectId),
		);
	}
}
