import { describe, expect, it } from "vitest";
import {
	defaultSessionPolicies,
	deviceAuthorizationDecisionSchema,
	deviceAuthorizationStartSchema,
	kasilabsPermissionPresets,
	namespacedPermissionSchema,
	permissionNamespaceSchema,
	phoneLinkSchema,
	phoneOtpResendSchema,
	phoneOtpStartSchema,
	phoneOtpVerifySchema,
	phoneUnlinkSchema,
	posOfflineSnapshotIssueSchema,
	requireAudience,
	requireRecentStepUp,
	requireSessionClass,
	requireTrustedDevice,
	refreshTokenReuseDetectionSchema,
	refreshTokenRotationSchema,
	servicePrincipalSchema,
	servicePrincipalTokenRequestSchema,
	supportImpersonationAuditSchema,
	supportImpersonationRequestSchema,
	tokenClaimsSchema,
	tokenHasAudience,
	tokenRevocationCheckSchema,
	tokenRevocationCreateSchema,
	validatePermissionNamespaceCatalog,
	validateTokenContract,
} from "../production-readiness";

describe("production readiness contracts", () => {
	it("requires E.164 phone numbers for phone and WhatsApp OTP starts", () => {
		expect(
			phoneOtpStartSchema.parse({
				projectId: "proj_123",
				phoneNumber: "+254712345678",
				channel: "whatsapp",
			}).channel,
		).toBe("whatsapp");

		expect(() =>
			phoneOtpStartSchema.parse({
				projectId: "proj_123",
				phoneNumber: "0712345678",
			}),
		).toThrow(/E.164/);
	});

	it("accepts only numeric OTP verification codes", () => {
		expect(
			phoneOtpVerifySchema.parse({
				projectId: "proj_123",
				phoneNumber: "+14155550100",
				code: "123456",
			}).purpose,
		).toBe("sign_in");

		expect(() =>
			phoneOtpVerifySchema.parse({
				projectId: "proj_123",
				phoneNumber: "+14155550100",
				code: "abc123",
			}),
		).toThrow();
	});

	it("validates phone resend, link, and unlink contracts", () => {
		expect(
			phoneOtpResendSchema.parse({
				projectId: "proj_123",
				phoneNumber: "+254712345678",
				channel: "sms",
			}).purpose,
		).toBe("sign_in");

		expect(
			phoneLinkSchema.parse({
				projectId: "proj_123",
				userId: "usr_123",
				phoneNumber: "+254712345678",
				verificationId: "phv_123",
			}).userId,
		).toBe("usr_123");

		expect(
			phoneUnlinkSchema.parse({
				projectId: "proj_123",
				userId: "usr_123",
			}).userId,
		).toBe("usr_123");
	});

	it("models QR/device approval without credentials inside the QR payload", () => {
		const start = deviceAuthorizationStartSchema.parse({
			projectId: "proj_123",
			clientId: "client_web",
			deviceName: "Chrome on Windows",
			deviceType: "browser",
			platform: "Windows",
			requestedAudience: "whatspoppin-web",
			requestedScopes: ["chat.operate"],
		});

		expect(start.requestedScopes).toEqual(["chat.operate"]);
		expect("token" in start).toBe(false);

		const decision = deviceAuthorizationDecisionSchema.parse({
			projectId: "proj_123",
			deviceCode: "a".repeat(32),
			approvedByUserId: "usr_123",
		});
		expect(decision.approvedByUserId).toBe("usr_123");
	});

	it("defines conservative policies for high-risk session classes", () => {
		expect(defaultSessionPolicies.admin_console_session.requiresMfa).toBe(true);
		expect(defaultSessionPolicies.support_impersonation_session.refreshAllowed).toBe(false);
		expect(defaultSessionPolicies.pos_offline_device_session.requiresTrustedDevice).toBe(true);
		expect(defaultSessionPolicies.linked_device_session.allowedAudiences).toContain("desktop");
	});

	it("bounds offline POS permission snapshots", () => {
		const snapshot = posOfflineSnapshotIssueSchema.parse({
			projectId: "proj_123",
			deviceId: "dev_123",
			userId: "usr_123",
			organizationId: "org_123",
			sessionId: "ses_123",
			permissions: ["refund.create", "catalog.read"],
		});

		expect(snapshot.audience).toBe("pos");
		expect(snapshot.expiresInSeconds).toBe(12 * 60 * 60);
		expect(() =>
			posOfflineSnapshotIssueSchema.parse({
				...snapshot,
				expiresInSeconds: 7 * 24 * 60 * 60,
			}),
		).toThrow();
	});

	it("validates versioned token claims and audience checks", () => {
		const claims = tokenClaimsSchema.parse({
			iss: "https://auth.banata.dev",
			sub: "usr_123",
			aud: ["whatspoppin-web", "whatspoppin-mobile"],
			exp: 2_000_000_000,
			iat: 1_999_999_000,
			jti: "jwt_123",
			sid: "ses_123",
			project_id: "proj_123",
			session_class: "linked_device_session",
			auth_strength: "linked_device_approval",
			scope: "chat.operate",
			token_version: 1,
		});

		expect(tokenHasAudience(claims, "whatspoppin-web")).toBe(true);
		expect(() => requireAudience(claims, "other-app")).toThrow(/audience/);
	});

	it("rejects tokens outside the expected issuer, project, audience, time, and version contract", () => {
		const claims = tokenClaimsSchema.parse({
			iss: "https://auth.banata.dev",
			sub: "usr_123",
			aud: "whatspoppin-web",
			exp: 2_000_000_000,
			iat: 1_999_999_000,
			nbf: 1_999_999_000,
			jti: "jwt_123",
			sid: "ses_123",
			project_id: "proj_123",
			session_class: "web_user_session",
			auth_strength: "passkey",
			token_version: 2,
		});

		const options = {
			expectedIssuer: "https://auth.banata.dev",
			expectedProjectId: "proj_123",
			expectedAudience: "whatspoppin-web",
			minTokenVersion: 2,
			nowSeconds: 1_999_999_500,
		};

		expect(validateTokenContract(claims, options)).toBe(claims);
		expect(() =>
			validateTokenContract({ ...claims, iss: "https://evil.example" }, options),
		).toThrow(/issuer/);
		expect(() =>
			validateTokenContract({ ...claims, project_id: "proj_other" }, options),
		).toThrow(/project/);
		expect(() =>
			validateTokenContract({ ...claims, aud: "other-app" }, options),
		).toThrow(/audience/);
		expect(() =>
			validateTokenContract({ ...claims, exp: 1_999_000_000 }, options),
		).toThrow(/expired/);
		expect(() =>
			validateTokenContract({ ...claims, nbf: 2_000_100_000 }, options),
		).toThrow(/not valid yet/);
		expect(() =>
			validateTokenContract({ ...claims, token_version: 1 }, options),
		).toThrow(/version/);
	});

	it("validates emergency token revocation contracts", () => {
		expect(
			tokenRevocationCreateSchema.parse({
				projectId: "proj_123",
				subjectType: "session_class",
				subjectId: "linked_device_session",
				reason: "Linked-device incident",
				createdBy: "usr_admin",
			}).subjectType,
		).toBe("session_class");

		expect(
			tokenRevocationCheckSchema.parse({
				projectId: "proj_123",
				jti: "jwt_123",
				sessionClass: "linked_device_session",
			}).sessionClass,
		).toBe("linked_device_session");
	});

	it("models refresh-token rotation and reuse detection without storing raw tokens", () => {
		const rotation = refreshTokenRotationSchema.parse({
			projectId: "proj_123",
			sessionId: "ses_123",
			sessionFamilyId: "sfam_123",
			previousRefreshTokenHash: "p".repeat(64),
			nextRefreshTokenHash: "n".repeat(64),
			rotationCounter: 3,
			rotatedAt: 2_000_000_000,
			expiresAt: 2_000_086_400,
		});

		expect(rotation.rotationCounter).toBe(3);
		expect("refreshToken" in rotation).toBe(false);

		const reuse = refreshTokenReuseDetectionSchema.parse({
			projectId: "proj_123",
			sessionId: "ses_123",
			sessionFamilyId: "sfam_123",
			reusedRefreshTokenHash: "r".repeat(64),
			detectedAt: 2_000_000_100,
			actions: ["revoke_session_family", "force_reauth", "alert_security"],
		});

		expect(reuse.actions).toContain("revoke_session_family");
		expect(() =>
			refreshTokenReuseDetectionSchema.parse({
				...reuse,
				actions: [],
			}),
		).toThrow();
	});

	it("models service principals as scoped non-human identities", () => {
		const principal = servicePrincipalSchema.parse({
			projectId: "proj_123",
			principalId: "svc_automation_bridge",
			name: "Automation bridge worker",
			type: "automation_bridge",
			audience: "ai-automation-worker",
			scopes: ["automation.reply.manage", "ecommerce.sync"],
			credentialKeyId: "cred_123",
			credentialHash: "h".repeat(64),
			lastRotatedAt: 2_000_000_000,
			expiresAt: 2_002_592_000,
		});

		expect(principal.rotationWindowDays).toBe(30);
		expect("credential" in principal).toBe(false);
		expect(() =>
			servicePrincipalSchema.parse({
				...principal,
				rotationWindowDays: 180,
			}),
		).toThrow();

		const tokenRequest = servicePrincipalTokenRequestSchema.parse({
			projectId: "proj_123",
			principalId: "svc_automation_bridge",
			audience: "ai-automation-worker",
			scopes: ["automation.reply.manage"],
		});

		expect(tokenRequest.scopes).toEqual(["automation.reply.manage"]);
	});

	it("requires customer-visible support impersonation evidence", () => {
		const request = supportImpersonationRequestSchema.parse({
			projectId: "proj_123",
			targetUserId: "usr_customer",
			requestedByUserId: "usr_support",
			reason: "Investigating customer-reported login issue",
			supportTicketId: "SUP-1234",
			customerVisible: true,
		});

		expect(request.expiresInSeconds).toBe(30 * 60);
		expect(() =>
			supportImpersonationRequestSchema.parse({
				...request,
				customerVisible: false,
			}),
		).toThrow();

		const audit = supportImpersonationAuditSchema.parse({
			projectId: "proj_123",
			targetUserId: "usr_customer",
			impersonatedByUserId: "usr_support",
			sessionId: "ses_impersonation",
			reason: "Investigating customer-reported login issue",
			supportTicketId: "SUP-1234",
			startedAt: 2_000_000_000,
			expiresAt: 2_000_001_800,
			customerVisible: true,
		});

		expect(audit.customerVisible).toBe(true);
	});

	it("enforces local guard helpers used by server endpoints", () => {
		expect(() => requireSessionClass("web_user_session", ["admin_console_session"])).toThrow();
		expect(() => requireTrustedDevice("untrusted")).toThrow(/trusted device/);
		expect(() => requireRecentStepUp(Date.now() - 10_000, 60)).not.toThrow();
	});

	it("ships KasiLabs evaluation permission presets", () => {
		expect(kasilabsPermissionPresets.aiAutomation).toContain("whatsapp.instance.delete");
		expect(kasilabsPermissionPresets.ecommercePos).toContain("pos.terminal.approve");
		expect(kasilabsPermissionPresets.whatspoppin).toContain("linked_device.approve");
	});

	it("validates app and product-surface permission namespaces", () => {
		const entry = permissionNamespaceSchema.parse({
			projectId: "proj_123",
			appAudience: "ecommerce",
			productSurface: "pos",
			resource: "terminal",
			action: "approve",
			permission: "ecommerce.pos.terminal.approve",
			description: "Approve a POS terminal for offline operation.",
		});

		expect(namespacedPermissionSchema.parse(entry.permission)).toBe(
			"ecommerce.pos.terminal.approve",
		);
		expect(validatePermissionNamespaceCatalog([entry])).toEqual([entry]);
		expect(() =>
			validatePermissionNamespaceCatalog([
				{
					...entry,
					permission: "ecommerce.admin.terminal.approve",
				},
			]),
		).toThrow(/must match namespace/);
		expect(() => validatePermissionNamespaceCatalog([entry, entry])).toThrow(/Duplicate/);
	});
});
