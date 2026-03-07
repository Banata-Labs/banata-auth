import type { HttpClient } from "../client";

export type PortalIntent =
	| "sso"
	| "dsync"
	| "domain_verification"
	| "audit_logs"
	| "log_streams"
	| "users";

export interface GeneratePortalLinkOptions {
	/** The organization to generate a portal link for. */
	organizationId: string;
	/** The portal section to open. */
	intent: PortalIntent;
	/** URL to redirect the admin back to after completing the portal flow. */
	returnUrl?: string;
	/** Session lifetime in seconds. Default: 300 (5 minutes). Max: 3600 (1 hour). */
	expiresIn?: number;
}

export interface PortalLinkResult {
	/** The generated portal URL with embedded session token. */
	link: string;
	/** The portal session ID. */
	sessionId: string;
	/** The portal intent. */
	intent: PortalIntent;
	/** The organization ID. */
	organizationId: string;
	/** ISO 8601 expiration timestamp. */
	expiresAt: string;
}

/**
 * Portal resource.
 *
 * Generates short-lived admin portal links for organization IT admins.
 * Each link grants access to a specific portal section (SSO config,
 * Directory Sync, Audit Logs, etc.) within an organization context.
 */
export class Portal {
	constructor(private readonly http: HttpClient) {}

	/**
	 * Generate a short-lived admin portal link for an organization's IT admin.
	 *
	 * @param options - Portal link generation options
	 * @returns The generated portal link and session metadata
	 */
	async generateLink(options: GeneratePortalLinkOptions): Promise<PortalLinkResult> {
		return this.http.post<PortalLinkResult>("/banata/portal/generate-link", options);
	}
}
