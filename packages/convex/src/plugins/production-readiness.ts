import {
	deviceAuthorizationDecisionSchema,
	deviceAuthorizationPollSchema,
	deviceAuthorizationStartSchema,
	deviceRevokeSchema,
	phoneLinkSchema,
	phoneOtpResendSchema,
	phoneOtpStartSchema,
	phoneOtpVerifySchema,
	phoneUnlinkSchema,
	posOfflineSnapshotIssueSchema,
	tokenRevocationCheckSchema,
	tokenRevocationCreateSchema,
} from "@banata-auth/shared";
import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { z } from "zod";
import {
	type SmsProviderCredentials,
	type SmsProviderId,
	sendSmsOtp,
	validateSmsCredentials,
} from "./sms-sender";
import type { PluginDBAdapter, WhereClause } from "./types";

type SendPhoneOtpParams = {
	projectId: string;
	phoneNumber: string;
	channel: "sms" | "whatsapp" | "voice";
	purpose: string;
	otp: string;
};

type OfflinePermissionSnapshotPayload = {
	version: 1;
	projectId: string;
	deviceId: string;
	userId: string;
	organizationId: string;
	sessionId: string;
	sessionClass: "pos_offline_device_session";
	audience: string;
	permissions: string[];
	issuedAt: number;
	expiresAt: number;
};

type SignedOfflinePermissionSnapshot = {
	serialized: string;
	signature: string;
	keyId?: string;
	algorithm?: string;
};

export interface ProductionReadinessPluginOptions {
	sendPhoneOtp?: (params: SendPhoneOtpParams) => Promise<{ providerMessageId?: string } | void>;
	signOfflinePermissionSnapshot?: (
		payload: OfflinePermissionSnapshotPayload,
	) => Promise<SignedOfflinePermissionSnapshot>;
	now?: () => number;
}

interface PhoneVerificationRow extends Record<string, unknown> {
	id: string;
	projectId: string;
	phoneNumberE164: string;
	purpose: string;
	otpHash: string;
	expiresAt: number;
	attemptCount: number;
	resendCount: number;
	lastSentAt: number;
	lockedUntil?: number;
	status: string;
}

interface PhoneIdentityRow extends Record<string, unknown> {
	id: string;
	projectId: string;
	userId: string;
	phoneNumberE164: string;
	unlinkedAt?: number;
}

interface DeviceAuthorizationRow extends Record<string, unknown> {
	id: string;
	projectId: string;
	clientId: string;
	deviceCodeHash: string;
	requestedScopes?: string;
	requestedAudience: string;
	deviceName: string;
	deviceType: string;
	platform: string;
	expiresAt: number;
	pollIntervalSeconds: number;
	lastPolledAt?: number;
	status: string;
	approvedByUserId?: string;
	approvedAt?: number;
	organizationId?: string;
}

interface DeviceRow extends Record<string, unknown> {
	id: string;
	projectId: string;
	userId?: string;
	organizationId?: string;
	deviceType: string;
	trustLevel: string;
	revokedAt?: number;
}

interface SmsProviderConfigRow extends Record<string, unknown> {
	id: string;
	configJson: string;
}

interface SmsProviderConfigJson {
	providers: Record<
		string,
		SmsProviderCredentials & {
			enabled?: boolean;
		}
	>;
	activeProvider: string | null;
}

const PHONE_OTP_TTL_MS = 10 * 60 * 1000;
const PHONE_OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const PHONE_OTP_MAX_ATTEMPTS = 5;
const DEVICE_AUTH_TTL_MS = 5 * 60 * 1000;
const DEVICE_POLL_INTERVAL_SECONDS = 5;

function randomDigits(length: number): string {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => String(byte % 10)).join("");
}

function randomToken(byteLength = 32): string {
	const bytes = new Uint8Array(byteLength);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string): Promise<string> {
	const bytes = new TextEncoder().encode(value);
	const digest = await crypto.subtle.digest("SHA-256", bytes);
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getHeader(
	ctx: { headers?: Headers; request?: { headers: Headers } },
	name: string,
): string | undefined {
	return ctx.headers?.get(name) ?? ctx.request?.headers.get(name) ?? undefined;
}

async function findLatestPhoneVerification(
	db: PluginDBAdapter,
	params: { projectId: string; phoneNumber: string; purpose: string; verificationId?: string },
): Promise<PhoneVerificationRow | null> {
	const where = params.verificationId
		? [
				{ field: "id", value: params.verificationId },
				{ field: "projectId", value: params.projectId },
			]
		: [
				{ field: "projectId", value: params.projectId },
				{ field: "phoneNumberE164", value: params.phoneNumber },
				{ field: "purpose", value: params.purpose },
				{ field: "status", value: "pending" },
			];

	const rows = await db.findMany<PhoneVerificationRow>({
		model: "phoneVerification",
		where,
		limit: 1,
		sortBy: { field: "createdAt", direction: "desc" },
	});
	return rows[0] ?? null;
}

async function findDeviceAuthorization(
	db: PluginDBAdapter,
	projectId: string,
	deviceCode: string,
): Promise<DeviceAuthorizationRow | null> {
	const deviceCodeHash = await sha256Hex(`${projectId}:${deviceCode}`);
	return await db.findOne<DeviceAuthorizationRow>({
		model: "deviceAuthorization",
		where: [
			{ field: "projectId", value: projectId },
			{ field: "deviceCodeHash", value: deviceCodeHash },
		],
	});
}

async function loadSmsProviderConfig(
	db: PluginDBAdapter,
	projectId: string,
): Promise<{ provider: SmsProviderId; credentials: SmsProviderCredentials } | null> {
	const rows = await db.findMany<SmsProviderConfigRow>({
		model: "smsProviderConfig",
		where: [{ field: "projectId", value: projectId }],
		limit: 1,
	});
	if (rows.length === 0 || !rows[0]?.configJson) return null;

	let config: SmsProviderConfigJson;
	try {
		config = JSON.parse(rows[0].configJson) as SmsProviderConfigJson;
	} catch {
		return null;
	}

	const activeId = config.activeProvider;
	if (!activeId) return null;
	const providerConfig = config.providers[activeId];
	if (!providerConfig?.enabled) return null;

	const credentials: SmsProviderCredentials = {
		apiKey: providerConfig.apiKey,
		apiSecret: providerConfig.apiSecret,
		accountSid: providerConfig.accountSid,
		authToken: providerConfig.authToken,
		fromNumber: providerConfig.fromNumber,
		senderId: providerConfig.senderId,
		username: providerConfig.username,
		phoneNumberId: providerConfig.phoneNumberId,
		templateName: providerConfig.templateName,
		templateLanguage: providerConfig.templateLanguage,
		apiBaseUrl: providerConfig.apiBaseUrl,
	};
	const validation = validateSmsCredentials(activeId as SmsProviderId, credentials);
	if (!validation.valid) return null;

	return { provider: activeId as SmsProviderId, credentials };
}

async function deliverPhoneOtp(
	db: PluginDBAdapter,
	params: SendPhoneOtpParams,
	configuredSender?: ProductionReadinessPluginOptions["sendPhoneOtp"],
): Promise<{ providerMessageId?: string } | void> {
	if (configuredSender) return configuredSender(params);

	const providerConfig = await loadSmsProviderConfig(db, params.projectId);
	if (!providerConfig) return undefined;

	const result = await sendSmsOtp(
		providerConfig.provider,
		{
			to: params.phoneNumber,
			channel: params.channel,
			purpose: params.purpose,
			otp: params.otp,
			body: `Your Banata verification code is ${params.otp}.`,
		},
		providerConfig.credentials,
	);
	if (!result.success) {
		throw new Error(result.error ?? "Phone OTP delivery failed");
	}
	return { providerMessageId: result.messageId };
}

export function productionReadinessPlugin(
	options: ProductionReadinessPluginOptions = {},
): BetterAuthPlugin {
	const getNow = options.now ?? (() => Date.now());

	return {
		id: "banata-production-readiness",
		schema: {
			phoneVerification: {
				fields: {
					projectId: { type: "string", required: true },
					phoneNumberE164: { type: "string", required: true },
					purpose: { type: "string", required: true },
					otpHash: { type: "string", required: true },
					expiresAt: { type: "number", required: true },
					attemptCount: { type: "number", required: true },
					resendCount: { type: "number", required: true },
					lastSentAt: { type: "number", required: true },
					lockedUntil: { type: "number", required: false },
					channel: { type: "string", required: true },
					providerMessageId: { type: "string", required: false },
					ipAddress: { type: "string", required: false },
					userAgent: { type: "string", required: false },
					deviceFingerprint: { type: "string", required: false },
					status: { type: "string", required: true },
					verifiedUserId: { type: "string", required: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			phoneIdentity: {
				fields: {
					projectId: { type: "string", required: true },
					userId: { type: "string", required: true },
					phoneNumberE164: { type: "string", required: true },
					verifiedAt: { type: "number", required: true },
					linkedAt: { type: "number", required: true },
					unlinkedAt: { type: "number", required: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			device: {
				fields: {
					projectId: { type: "string", required: true },
					organizationId: { type: "string", required: false },
					userId: { type: "string", required: false },
					deviceName: { type: "string", required: true },
					deviceType: { type: "string", required: true },
					platform: { type: "string", required: true },
					publicKey: { type: "string", required: false },
					trustLevel: { type: "string", required: true },
					lastSeenAt: { type: "number", required: false },
					revokedAt: { type: "number", required: false },
					revokedReason: { type: "string", required: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			deviceAuthorization: {
				fields: {
					projectId: { type: "string", required: true },
					clientId: { type: "string", required: true },
					deviceCodeHash: { type: "string", required: true },
					userCodeHash: { type: "string", required: true },
					qrNonceHash: { type: "string", required: true },
					requestedScopes: { type: "string", required: false },
					requestedAudience: { type: "string", required: true },
					deviceName: { type: "string", required: true },
					deviceType: { type: "string", required: true },
					platform: { type: "string", required: true },
					ipAddress: { type: "string", required: false },
					userAgent: { type: "string", required: false },
					expiresAt: { type: "number", required: true },
					pollIntervalSeconds: { type: "number", required: true },
					lastPolledAt: { type: "number", required: false },
					status: { type: "string", required: true },
					approvedByUserId: { type: "string", required: false },
					approvedAt: { type: "number", required: false },
					organizationId: { type: "string", required: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			deviceSession: {
				fields: {
					projectId: { type: "string", required: true },
					deviceId: { type: "string", required: true },
					sessionId: { type: "string", required: true },
					userId: { type: "string", required: true },
					organizationId: { type: "string", required: false },
					sessionClass: { type: "string", required: true },
					permissionSnapshot: { type: "string", required: false },
					issuedAt: { type: "number", required: true },
					expiresAt: { type: "number", required: true },
					revokedAt: { type: "number", required: false },
					createdAt: { type: "number", required: true },
				},
			},
			deviceApprovalEvent: {
				fields: {
					projectId: { type: "string", required: true },
					deviceAuthorizationId: { type: "string", required: true },
					deviceId: { type: "string", required: false },
					actorUserId: { type: "string", required: true },
					action: { type: "string", required: true },
					ipAddress: { type: "string", required: false },
					userAgent: { type: "string", required: false },
					createdAt: { type: "number", required: true },
				},
			},
			tokenRevocation: {
				fields: {
					projectId: { type: "string", required: true },
					subjectType: { type: "string", required: true },
					subjectId: { type: "string", required: false },
					sessionId: { type: "string", required: false },
					jti: { type: "string", required: false },
					reason: { type: "string", required: true },
					effectiveAt: { type: "number", required: true },
					createdBy: { type: "string", required: true },
					createdAt: { type: "number", required: true },
				},
			},
		},
		endpoints: {
			phoneStart: createAuthEndpoint(
				"/phone/start",
				{ method: "POST", body: phoneOtpStartSchema, requireHeaders: true },
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = getNow();
					const otp = randomDigits(6);
					const otpHash = await sha256Hex(
						`${body.projectId}:${body.phoneNumber}:${body.purpose}:${otp}`,
					);
					const delivery = await deliverPhoneOtp(db, {
						projectId: body.projectId,
						phoneNumber: body.phoneNumber,
						channel: body.channel,
						purpose: body.purpose,
						otp,
					}, options.sendPhoneOtp);

					const row = await db.create({
						model: "phoneVerification",
						data: {
							projectId: body.projectId,
							phoneNumberE164: body.phoneNumber,
							purpose: body.purpose,
							otpHash,
							expiresAt: now + PHONE_OTP_TTL_MS,
							attemptCount: 0,
							resendCount: 0,
							lastSentAt: now,
							channel: body.channel,
							providerMessageId: delivery?.providerMessageId,
							ipAddress: getHeader(ctx, "x-forwarded-for"),
							userAgent: getHeader(ctx, "user-agent"),
							deviceFingerprint: body.deviceFingerprint,
							status: "pending",
							createdAt: now,
							updatedAt: now,
						},
					});

					return ctx.json({
						verificationId: (row as Record<string, unknown>).id,
						expiresAt: new Date(now + PHONE_OTP_TTL_MS).toISOString(),
						channel: body.channel,
						deliveryConfigured: Boolean(options.sendPhoneOtp) || Boolean(delivery?.providerMessageId),
					});
				},
			),
			phoneResend: createAuthEndpoint(
				"/phone/resend",
				{ method: "POST", body: phoneOtpResendSchema, requireHeaders: true },
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = getNow();
					const verification = await findLatestPhoneVerification(db, {
						projectId: body.projectId,
						phoneNumber: body.phoneNumber,
						purpose: body.purpose,
						verificationId: body.verificationId,
					});
					if (!verification || verification.status !== "pending") {
						throw ctx.error("NOT_FOUND", { message: "Verification not found." });
					}
					const lastSentAt =
						typeof verification.lastSentAt === "number" ? verification.lastSentAt : 0;
					if (now - lastSentAt < PHONE_OTP_RESEND_COOLDOWN_MS) {
						throw ctx.error("TOO_MANY_REQUESTS", { message: "Verification was sent recently." });
					}

					const otp = randomDigits(6);
					const otpHash = await sha256Hex(
						`${body.projectId}:${body.phoneNumber}:${body.purpose}:${otp}`,
					);
					const delivery = await deliverPhoneOtp(db, {
						projectId: body.projectId,
						phoneNumber: body.phoneNumber,
						channel: body.channel,
						purpose: body.purpose,
						otp,
					}, options.sendPhoneOtp);

					await db.update({
						model: "phoneVerification",
						where: [{ field: "id", value: verification.id }],
						update: {
							otpHash,
							expiresAt: now + PHONE_OTP_TTL_MS,
							attemptCount: 0,
							resendCount: verification.resendCount + 1,
							lastSentAt: now,
							channel: body.channel,
							providerMessageId: delivery?.providerMessageId,
							status: "pending",
							updatedAt: now,
						},
					});

					return ctx.json({
						verificationId: verification.id,
						expiresAt: new Date(now + PHONE_OTP_TTL_MS).toISOString(),
						channel: body.channel,
						deliveryConfigured: Boolean(options.sendPhoneOtp) || Boolean(delivery?.providerMessageId),
					});
				},
			),
			phoneVerify: createAuthEndpoint(
				"/phone/verify",
				{ method: "POST", body: phoneOtpVerifySchema, requireHeaders: true },
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = getNow();
					const verification = await findLatestPhoneVerification(db, {
						projectId: body.projectId,
						phoneNumber: body.phoneNumber,
						purpose: body.purpose,
						verificationId: body.verificationId,
					});
					if (!verification) {
						throw ctx.error("NOT_FOUND", { message: "Verification not found." });
					}
					if (verification.lockedUntil && verification.lockedUntil > now) {
						throw ctx.error("TOO_MANY_REQUESTS", {
							message: "Verification is temporarily locked.",
						});
					}
					if (verification.expiresAt <= now) {
						await db.update({
							model: "phoneVerification",
							where: [{ field: "id", value: verification.id }],
							update: { status: "expired", updatedAt: now },
						});
						throw ctx.error("UNAUTHORIZED", { message: "Verification code expired." });
					}

					const expected = await sha256Hex(
						`${body.projectId}:${body.phoneNumber}:${body.purpose}:${body.code}`,
					);
					if (expected !== verification.otpHash) {
						const attemptCount = verification.attemptCount + 1;
						await db.update({
							model: "phoneVerification",
							where: [{ field: "id", value: verification.id }],
							update: {
								attemptCount,
								lockedUntil:
									attemptCount >= PHONE_OTP_MAX_ATTEMPTS ? now + 15 * 60 * 1000 : undefined,
								status: attemptCount >= PHONE_OTP_MAX_ATTEMPTS ? "locked" : "pending",
								updatedAt: now,
							},
						});
						throw ctx.error("UNAUTHORIZED", { message: "Invalid verification code." });
					}

					await db.update({
						model: "phoneVerification",
						where: [{ field: "id", value: verification.id }],
						update: { status: "verified", updatedAt: now },
					});

					return ctx.json({ verified: true, phoneNumber: body.phoneNumber, purpose: body.purpose });
				},
			),
			phoneLink: createAuthEndpoint(
				"/phone/link",
				{ method: "POST", body: phoneLinkSchema, requireHeaders: true },
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = getNow();
					const verification = await db.findOne<PhoneVerificationRow>({
						model: "phoneVerification",
						where: [
							{ field: "id", value: body.verificationId },
							{ field: "projectId", value: body.projectId },
							{ field: "phoneNumberE164", value: body.phoneNumber },
							{ field: "status", value: "verified" },
						],
					});
					if (!verification || verification.expiresAt <= now) {
						throw ctx.error("UNAUTHORIZED", { message: "Verified phone challenge is required." });
					}

					const existing = await db.findOne<PhoneIdentityRow>({
						model: "phoneIdentity",
						where: [
							{ field: "projectId", value: body.projectId },
							{ field: "phoneNumberE164", value: body.phoneNumber },
						],
					});
					if (existing && !existing.unlinkedAt && existing.userId !== body.userId) {
						throw ctx.error("CONFLICT", { message: "Phone number is already linked." });
					}

					if (existing) {
						await db.update({
							model: "phoneIdentity",
							where: [{ field: "id", value: existing.id }],
							update: {
								userId: body.userId,
								verifiedAt: now,
								linkedAt: now,
								unlinkedAt: undefined,
								updatedAt: now,
							},
						});
					} else {
						await db.create({
							model: "phoneIdentity",
							data: {
								projectId: body.projectId,
								userId: body.userId,
								phoneNumberE164: body.phoneNumber,
								verifiedAt: now,
								linkedAt: now,
								createdAt: now,
								updatedAt: now,
							},
						});
					}

					await db.update({
						model: "user",
						where: [
							{ field: "id", value: body.userId },
							{ field: "projectId", value: body.projectId },
						],
						update: {
							phoneNumber: body.phoneNumber,
							phoneNumberVerified: true,
							updatedAt: now,
						},
					});

					return ctx.json({ linked: true, userId: body.userId, phoneNumber: body.phoneNumber });
				},
			),
			phoneUnlink: createAuthEndpoint(
				"/phone/unlink",
				{ method: "POST", body: phoneUnlinkSchema, requireHeaders: true },
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = getNow();
					const where: WhereClause[] = [
						{ field: "projectId", value: body.projectId },
						{ field: "userId", value: body.userId },
					];
					if (body.phoneNumber) {
						where.push({ field: "phoneNumberE164", value: body.phoneNumber });
					}

					const identities = await db.findMany<PhoneIdentityRow>({
						model: "phoneIdentity",
						where,
						limit: 10,
					});
					for (const identity of identities) {
						await db.update({
							model: "phoneIdentity",
							where: [{ field: "id", value: identity.id }],
							update: { unlinkedAt: now, updatedAt: now },
						});
					}

					await db.update({
						model: "user",
						where: [
							{ field: "id", value: body.userId },
							{ field: "projectId", value: body.projectId },
						],
						update: {
							phoneNumber: undefined,
							phoneNumberVerified: false,
							updatedAt: now,
						},
					});

					return ctx.json({ unlinked: true, userId: body.userId, count: identities.length });
				},
			),
			deviceStart: createAuthEndpoint(
				"/device/start",
				{ method: "POST", body: deviceAuthorizationStartSchema, requireHeaders: true },
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = getNow();
					const deviceCode = randomToken(32);
					const userCode = `${randomDigits(3)}-${randomDigits(3)}`;
					const qrNonce = randomToken(16);

					const row = await db.create({
						model: "deviceAuthorization",
						data: {
							projectId: body.projectId,
							clientId: body.clientId,
							deviceCodeHash: await sha256Hex(`${body.projectId}:${deviceCode}`),
							userCodeHash: await sha256Hex(`${body.projectId}:${userCode}`),
							qrNonceHash: await sha256Hex(`${body.projectId}:${qrNonce}`),
							requestedScopes: JSON.stringify(body.requestedScopes),
							requestedAudience: body.requestedAudience,
							deviceName: body.deviceName,
							deviceType: body.deviceType,
							platform: body.platform,
							ipAddress: getHeader(ctx, "x-forwarded-for"),
							userAgent: getHeader(ctx, "user-agent"),
							expiresAt: now + DEVICE_AUTH_TTL_MS,
							pollIntervalSeconds: DEVICE_POLL_INTERVAL_SECONDS,
							status: "pending",
							organizationId: body.organizationId,
							createdAt: now,
							updatedAt: now,
						},
					});

					return ctx.json({
						deviceAuthorizationId: (row as Record<string, unknown>).id,
						deviceCode,
						userCode,
						qr: {
							nonce: qrNonce,
							approvePath: "/device/approve",
							deviceName: body.deviceName,
							requestedAudience: body.requestedAudience,
						},
						expiresAt: new Date(now + DEVICE_AUTH_TTL_MS).toISOString(),
						interval: DEVICE_POLL_INTERVAL_SECONDS,
					});
				},
			),
			devicePoll: createAuthEndpoint(
				"/device/poll",
				{ method: "POST", body: deviceAuthorizationPollSchema, requireHeaders: true },
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = getNow();
					const authz = await findDeviceAuthorization(db, body.projectId, body.deviceCode);
					if (!authz) throw ctx.error("NOT_FOUND", { message: "Device authorization not found." });
					if (authz.expiresAt <= now && authz.status === "pending") {
						await db.update({
							model: "deviceAuthorization",
							where: [{ field: "id", value: authz.id }],
							update: { status: "expired", updatedAt: now },
						});
						return ctx.json({ status: "expired" });
					}
					if (authz.lastPolledAt && now - authz.lastPolledAt < authz.pollIntervalSeconds * 1000) {
						throw ctx.error("TOO_MANY_REQUESTS", { message: "Polling too quickly." });
					}
					await db.update({
						model: "deviceAuthorization",
						where: [{ field: "id", value: authz.id }],
						update: { lastPolledAt: now, updatedAt: now },
					});
					return ctx.json({
						status: authz.status,
						approvedAt: authz.approvedAt ? new Date(authz.approvedAt).toISOString() : null,
						pollIntervalSeconds: authz.pollIntervalSeconds,
					});
				},
			),
			deviceApprove: createAuthEndpoint(
				"/device/approve",
				{ method: "POST", body: deviceAuthorizationDecisionSchema, requireHeaders: true },
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = getNow();
					const authz = await findDeviceAuthorization(db, body.projectId, body.deviceCode);
					if (!authz || authz.status !== "pending") {
						throw ctx.error("BAD_REQUEST", { message: "Device authorization is not pending." });
					}
					if (authz.expiresAt <= now) {
						throw ctx.error("UNAUTHORIZED", { message: "Device authorization expired." });
					}

					const device = await db.create({
						model: "device",
						data: {
							projectId: body.projectId,
							organizationId: body.organizationId ?? authz.organizationId,
							userId: body.approvedByUserId,
							deviceName: authz.deviceName,
							deviceType: authz.deviceType,
							platform: authz.platform,
							trustLevel: "trusted",
							lastSeenAt: now,
							createdAt: now,
							updatedAt: now,
						},
					});
					await db.update({
						model: "deviceAuthorization",
						where: [{ field: "id", value: authz.id }],
						update: {
							status: "approved",
							approvedByUserId: body.approvedByUserId,
							approvedAt: now,
							updatedAt: now,
						},
					});
					await db.create({
						model: "deviceApprovalEvent",
						data: {
							projectId: body.projectId,
							deviceAuthorizationId: authz.id,
							deviceId: (device as Record<string, unknown>).id,
							actorUserId: body.approvedByUserId,
							action: "approved",
							ipAddress: getHeader(ctx, "x-forwarded-for"),
							userAgent: getHeader(ctx, "user-agent"),
							createdAt: now,
						},
					});

					return ctx.json({
						status: "approved",
						deviceId: (device as Record<string, unknown>).id,
						sessionClass:
							authz.deviceType === "pos_terminal"
								? "pos_offline_device_session"
								: "linked_device_session",
					});
				},
			),
			deviceDeny: createAuthEndpoint(
				"/device/deny",
				{ method: "POST", body: deviceAuthorizationDecisionSchema, requireHeaders: true },
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = getNow();
					const authz = await findDeviceAuthorization(db, body.projectId, body.deviceCode);
					if (!authz) throw ctx.error("NOT_FOUND", { message: "Device authorization not found." });
					await db.update({
						model: "deviceAuthorization",
						where: [{ field: "id", value: authz.id }],
						update: { status: "denied", approvedByUserId: body.approvedByUserId, updatedAt: now },
					});
					return ctx.json({ status: "denied" });
				},
			),
			deviceRevoke: createAuthEndpoint(
				"/device/revoke",
				{ method: "POST", body: deviceRevokeSchema, requireHeaders: true },
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = getNow();
					await db.update({
						model: "device",
						where: [
							{ field: "id", value: body.deviceId },
							{ field: "projectId", value: body.projectId },
						],
						update: {
							trustLevel: "revoked",
							revokedAt: now,
							revokedReason: body.reason,
							updatedAt: now,
						},
					});
					await db.create({
						model: "deviceApprovalEvent",
						data: {
							projectId: body.projectId,
							deviceId: body.deviceId,
							deviceAuthorizationId: "",
							actorUserId: body.revokedByUserId,
							action: "revoked",
							ipAddress: getHeader(ctx, "x-forwarded-for"),
							userAgent: getHeader(ctx, "user-agent"),
							createdAt: now,
						},
					});
					return ctx.json({ revoked: true, deviceId: body.deviceId });
				},
			),
			deviceIssueOfflineSnapshot: createAuthEndpoint(
				"/device/offline-snapshot/issue",
				{ method: "POST", body: posOfflineSnapshotIssueSchema, requireHeaders: true },
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = getNow();
					const device = await db.findOne<DeviceRow>({
						model: "device",
						where: [
							{ field: "id", value: body.deviceId },
							{ field: "projectId", value: body.projectId },
						],
					});
					if (!device || device.deviceType !== "pos_terminal") {
						throw ctx.error("NOT_FOUND", { message: "POS terminal device not found." });
					}
					if (device.revokedAt || device.trustLevel === "revoked") {
						throw ctx.error("UNAUTHORIZED", { message: "POS terminal device is revoked." });
					}
					if (device.trustLevel !== "trusted" && device.trustLevel !== "managed") {
						throw ctx.error("FORBIDDEN", { message: "Trusted POS terminal is required." });
					}

					const expiresAt = now + body.expiresInSeconds * 1000;
					const payload: OfflinePermissionSnapshotPayload = {
						version: 1,
						projectId: body.projectId,
						deviceId: body.deviceId,
						userId: body.userId,
						organizationId: body.organizationId,
						sessionId: body.sessionId,
						sessionClass: "pos_offline_device_session",
						audience: body.audience,
						permissions: body.permissions,
						issuedAt: now,
						expiresAt,
					};
					const signed = (await options.signOfflinePermissionSnapshot?.(payload)) ?? {
						serialized: JSON.stringify(payload),
						signature: "UNSIGNED_DEVELOPMENT_ONLY",
						algorithm: "none",
					};

					await db.create({
						model: "deviceSession",
						data: {
							projectId: body.projectId,
							deviceId: body.deviceId,
							sessionId: body.sessionId,
							userId: body.userId,
							organizationId: body.organizationId,
							sessionClass: "pos_offline_device_session",
							permissionSnapshot: JSON.stringify({ payload, signed }),
							issuedAt: now,
							expiresAt,
							createdAt: now,
						},
					});

					return ctx.json({
						sessionClass: "pos_offline_device_session",
						audience: body.audience,
						expiresAt: new Date(expiresAt).toISOString(),
						snapshot: signed.serialized,
						signature: signed.signature,
						keyId: signed.keyId,
						algorithm: signed.algorithm,
						signingConfigured: Boolean(options.signOfflinePermissionSnapshot),
					});
				},
			),
			tokenRevoke: createAuthEndpoint(
				"/token/revoke",
				{ method: "POST", body: tokenRevocationCreateSchema, requireHeaders: true },
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = getNow();
					const row = await db.create({
						model: "tokenRevocation",
						data: {
							projectId: body.projectId,
							subjectType: body.subjectType,
							subjectId: body.subjectId,
							sessionId: body.sessionId,
							jti: body.jti,
							reason: body.reason,
							effectiveAt: body.effectiveAt ?? now,
							createdBy: body.createdBy,
							createdAt: now,
						},
					});

					return ctx.json({ revoked: true, revocation: row });
				},
			),
			tokenRevocationCheck: createAuthEndpoint(
				"/token/revocation/check",
				{ method: "POST", body: tokenRevocationCheckSchema, requireHeaders: true },
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = getNow();
					const candidates: WhereClause[][] = [
						[
							{ field: "projectId", value: body.projectId },
							{ field: "subjectType", value: "global" },
						],
					];
					if (body.subjectType && body.subjectId) {
						candidates.push([
							{ field: "projectId", value: body.projectId },
							{ field: "subjectType", value: body.subjectType },
							{ field: "subjectId", value: body.subjectId },
						]);
					}
					if (body.sessionId) {
						candidates.push([
							{ field: "projectId", value: body.projectId },
							{ field: "sessionId", value: body.sessionId },
						]);
					}
					if (body.jti) {
						candidates.push([
							{ field: "projectId", value: body.projectId },
							{ field: "jti", value: body.jti },
						]);
					}
					if (body.sessionClass) {
						candidates.push([
							{ field: "projectId", value: body.projectId },
							{ field: "subjectType", value: "session_class" },
							{ field: "subjectId", value: body.sessionClass },
						]);
					}

					for (const where of candidates) {
						const rows = await db.findMany<Record<string, unknown>>({
							model: "tokenRevocation",
							where,
							limit: 1,
							sortBy: { field: "effectiveAt", direction: "desc" },
						});
						const row = rows[0];
						if (row && typeof row.effectiveAt === "number" && row.effectiveAt <= now) {
							return ctx.json({ revoked: true, revocation: row });
						}
					}

					return ctx.json({ revoked: false });
				},
			),
			deviceList: createAuthEndpoint(
				"/devices",
				{
					method: "POST",
					body: z.object({
						projectId: z.string().min(1),
						userId: z.string().min(1).optional(),
						organizationId: z.string().min(1).optional(),
					}),
					requireHeaders: true,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const where: WhereClause[] = [{ field: "projectId", value: body.projectId }];
					if (body.userId) where.push({ field: "userId", value: body.userId });
					if (body.organizationId) {
						where.push({ field: "organizationId", value: body.organizationId });
					}
					const devices = await db.findMany({ model: "device", where, limit: 100 });
					return ctx.json({ devices });
				},
			),
		},
	};
}
