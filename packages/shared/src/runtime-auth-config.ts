export interface RuntimeAuthMethods {
	sso: boolean;
	emailPassword: boolean;
	passkey: boolean;
	magicLink: boolean;
	emailOtp: boolean;
	twoFactor: boolean;
	organization: boolean;
	anonymous: boolean;
	username: boolean;
}

export interface RuntimeSocialProviderStatus {
	enabled: boolean;
	demo: boolean;
}

export interface RuntimeAuthFeatures {
	hostedUi: boolean;
	signUp: boolean;
	mfa: boolean;
	localization: boolean;
}

export interface RuntimeAuthSessions {
	maxSessionLength: string;
	accessTokenDuration: string;
	inactivityTimeout: string;
	corsOrigins: string[];
}

export interface RuntimeAuthConfig {
	authMethods: RuntimeAuthMethods;
	socialProviders: Record<string, RuntimeSocialProviderStatus>;
	features: RuntimeAuthFeatures;
	sessions: RuntimeAuthSessions;
}

export function listEnabledSocialProviderIds(
	config: Pick<RuntimeAuthConfig, "socialProviders"> | null | undefined,
): string[] {
	if (!config) return [];
	return Object.entries(config.socialProviders)
		.filter(([, provider]) => provider.enabled)
		.map(([providerId]) => providerId);
}
