import type { PhoneOtpChannel, PhoneOtpPurpose } from "@banata-auth/shared";
import type { HttpClient } from "../client";

export interface StartPhoneOtpOptions {
	projectId?: string;
	phoneNumber: string;
	purpose?: PhoneOtpPurpose;
	channel?: PhoneOtpChannel;
	deviceFingerprint?: string;
}

export interface VerifyPhoneOtpOptions {
	projectId?: string;
	phoneNumber: string;
	purpose?: PhoneOtpPurpose;
	code: string;
	verificationId?: string;
}

export interface ResendPhoneOtpOptions {
	projectId?: string;
	phoneNumber: string;
	purpose?: PhoneOtpPurpose;
	channel?: PhoneOtpChannel;
	verificationId?: string;
}

export interface LinkPhoneOptions {
	projectId?: string;
	userId: string;
	phoneNumber: string;
	verificationId: string;
}

export interface UnlinkPhoneOptions {
	projectId?: string;
	userId: string;
	phoneNumber?: string;
}

export interface StartDeviceAuthorizationOptions {
	projectId?: string;
	clientId: string;
	deviceName: string;
	deviceType: "browser" | "mobile" | "desktop" | "pos_terminal" | "service";
	platform: string;
	requestedAudience: string;
	requestedScopes?: string[];
	organizationId?: string;
}

export interface PollDeviceAuthorizationOptions {
	projectId?: string;
	deviceCode: string;
}

export interface DecideDeviceAuthorizationOptions {
	projectId?: string;
	deviceCode: string;
	approvedByUserId: string;
	organizationId?: string;
}

export interface RevokeDeviceOptions {
	projectId?: string;
	deviceId: string;
	revokedByUserId: string;
	reason: string;
}

export interface IssuePosOfflineSnapshotOptions {
	projectId?: string;
	deviceId: string;
	userId: string;
	organizationId: string;
	sessionId: string;
	permissions: string[];
	audience?: string;
	expiresInSeconds?: number;
}

export interface ListDevicesOptions {
	projectId?: string;
	userId?: string;
	organizationId?: string;
}

export class PhoneAndDevices {
	constructor(private readonly http: HttpClient) {}

	async startPhoneOtp(input: StartPhoneOtpOptions) {
		return this.http.post(
			"/api/auth/phone/start",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}

	async verifyPhoneOtp(input: VerifyPhoneOtpOptions) {
		return this.http.post(
			"/api/auth/phone/verify",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}

	async resendPhoneOtp(input: ResendPhoneOtpOptions) {
		return this.http.post(
			"/api/auth/phone/resend",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}

	async linkPhone(input: LinkPhoneOptions) {
		return this.http.post(
			"/api/auth/phone/link",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}

	async unlinkPhone(input: UnlinkPhoneOptions) {
		return this.http.post(
			"/api/auth/phone/unlink",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}

	async startDeviceAuthorization(input: StartDeviceAuthorizationOptions) {
		return this.http.post(
			"/api/auth/device/start",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}

	async pollDeviceAuthorization(input: PollDeviceAuthorizationOptions) {
		return this.http.post(
			"/api/auth/device/poll",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}

	async approveDeviceAuthorization(input: DecideDeviceAuthorizationOptions) {
		return this.http.post(
			"/api/auth/device/approve",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}

	async denyDeviceAuthorization(input: DecideDeviceAuthorizationOptions) {
		return this.http.post(
			"/api/auth/device/deny",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}

	async revokeDevice(input: RevokeDeviceOptions) {
		return this.http.post(
			"/api/auth/device/revoke",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}

	async issuePosOfflineSnapshot(input: IssuePosOfflineSnapshotOptions) {
		return this.http.post(
			"/api/auth/device/offline-snapshot/issue",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}

	async listDevices(input: ListDevicesOptions = {}) {
		return this.http.post(
			"/api/auth/devices",
			this.http.withProjectScope(input as unknown as Record<string, unknown>, input.projectId),
		);
	}
}
