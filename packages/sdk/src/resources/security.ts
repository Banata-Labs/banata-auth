import type { TokenRevocationSubjectType } from "@banata-auth/shared";
import type { HttpClient } from "../client";

export interface CreateTokenRevocationOptions {
	projectId?: string;
	subjectType: TokenRevocationSubjectType;
	subjectId?: string;
	sessionId?: string;
	jti?: string;
	reason: string;
	createdBy: string;
	effectiveAt?: number;
}

export interface CheckTokenRevocationOptions {
	projectId?: string;
	subjectType?: TokenRevocationSubjectType;
	subjectId?: string;
	sessionId?: string;
	jti?: string;
	sessionClass?:
		| "web_user_session"
		| "mobile_user_session"
		| "linked_device_session"
		| "pos_offline_device_session"
		| "admin_console_session"
		| "support_impersonation_session"
		| "service_to_service_token"
		| "api_key_session";
}

export class SecurityControls {
	constructor(private readonly http: HttpClient) {}

	async createTokenRevocation(input: CreateTokenRevocationOptions) {
		return this.http.post(
			"/api/auth/token/revoke",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}

	async checkTokenRevocation(input: CheckTokenRevocationOptions) {
		return this.http.post(
			"/api/auth/token/revocation/check",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}
}
