import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(relativePath) {
	const absolutePath = join(root, relativePath);
	if (!existsSync(absolutePath)) {
		return null;
	}
	return readFileSync(absolutePath, "utf8");
}

const artifactChecks = [
	{
		id: "phone-otp-contracts",
		requirement:
			"Phone and WhatsApp OTP contracts exist with E.164 validation, purpose, channel, and verify schemas.",
		file: "packages/shared/src/production-readiness.ts",
		patterns: [/phoneOtpStartSchema/, /phoneOtpVerifySchema/, /e164PhoneNumberSchema/, /whatsapp/],
	},
	{
		id: "linked-device-contracts",
		requirement:
			"Linked-device QR authorization contracts exist for start, poll, decision, revoke, device type, audience, and scope.",
		file: "packages/shared/src/production-readiness.ts",
		patterns: [
			/deviceAuthorizationStartSchema/,
			/deviceAuthorizationPollSchema/,
			/deviceAuthorizationDecisionSchema/,
			/deviceRevokeSchema/,
			/posOfflineSnapshotIssueSchema/,
			/requestedAudience/,
			/requestedScopes/,
		],
	},
	{
		id: "session-token-contracts",
		requirement:
			"Session classes, auth strengths, token claims, full token contract validation, step-up guard, and trusted-device guard are explicit.",
		file: "packages/shared/src/production-readiness.ts",
		patterns: [
			/sessionClasses/,
			/authStrengths/,
			/servicePrincipalSchema/,
			/servicePrincipalTokenRequestSchema/,
			/supportImpersonationRequestSchema/,
			/supportImpersonationAuditSchema/,
			/tokenClaimsSchema/,
			/tokenRevocationCreateSchema/,
			/tokenRevocationCheckSchema/,
			/refreshTokenRotationSchema/,
			/refreshTokenReuseDetectionSchema/,
			/requireAudience/,
			/validateTokenContract/,
			/requireRecentStepUp/,
			/requireTrustedDevice/,
		],
	},
	{
		id: "kasilabs-permission-presets",
		requirement:
			"Permission presets exist for AI Automation, Ecommerce POS, and Whatspoppin evaluation scenarios.",
		file: "packages/shared/src/production-readiness.ts",
		patterns: [
			/kasilabsPermissionPresets/,
			/whatsapp\.instance\.delete/,
			/pos\.terminal\.approve/,
			/linked_device\.approve/,
		],
	},
	{
		id: "permission-namespace-contracts",
		requirement:
			"Permission namespaces are explicit per app and product surface for multi-app customer projects.",
		file: "packages/shared/src/production-readiness.ts",
		patterns: [
			/permissionNamespaceSchema/,
			/namespacedPermissionSchema/,
			/validatePermissionNamespaceCatalog/,
			/appAudience/,
			/productSurface/,
		],
		also: [
			{
				file: "packages/shared/src/__tests__/production-readiness.test.ts",
				patterns: [/validates app and product-surface permission namespaces/],
			},
			{
				file: "apps/docs/content/docs/roles-permissions.mdx",
				patterns: [
					/app\.product_surface\.resource\.action/,
					/validatePermissionNamespaceCatalog/,
				],
			},
		],
	},
	{
		id: "convex-durable-models",
		requirement:
			"Convex schema has durable auth client, phone, device, device authorization, device session, session policy, and token revocation tables.",
		file: "packages/convex/src/component/schema.ts",
		patterns: [
			/authClient: defineTable/,
			/servicePrincipal: defineTable/,
			/impersonationCustomerVisible/,
			/phoneVerification: defineTable/,
			/phoneIdentity: defineTable/,
			/device: defineTable/,
			/deviceAuthorization: defineTable/,
			/deviceSession: defineTable/,
			/sessionPolicy: defineTable/,
			/tokenRevocation: defineTable/,
			/refreshSessionFamilyId/,
			/refreshReuseDetectedAt/,
		],
	},
	{
		id: "convex-endpoints",
		requirement: "Better Auth plugin exposes phone OTP and linked-device endpoints.",
		file: "packages/convex/src/plugins/production-readiness.ts",
		patterns: [
			/phoneStart: createAuthEndpoint/,
			/phoneResend: createAuthEndpoint/,
			/phoneVerify: createAuthEndpoint/,
			/phoneLink: createAuthEndpoint/,
			/phoneUnlink: createAuthEndpoint/,
			/deviceStart: createAuthEndpoint/,
			/devicePoll: createAuthEndpoint/,
			/deviceApprove: createAuthEndpoint/,
			/deviceDeny: createAuthEndpoint/,
			/deviceRevoke: createAuthEndpoint/,
			/deviceIssueOfflineSnapshot: createAuthEndpoint/,
			/tokenRevoke: createAuthEndpoint/,
			/tokenRevocationCheck: createAuthEndpoint/,
			/deviceList: createAuthEndpoint/,
		],
	},
	{
		id: "convex-plugin-mounted",
		requirement: "Production readiness plugin is exported and mounted in Banata Auth options.",
		file: "packages/convex/src/auth.ts",
		patterns: [/productionReadinessPlugin/, /config\.productionReadiness/],
	},
	{
		id: "sdk-phone-device-surface",
		requirement: "SDK exposes customer-facing phone OTP and linked-device resource methods.",
		file: "packages/sdk/src/resources/phone-and-devices.ts",
		patterns: [
			/startPhoneOtp/,
			/resendPhoneOtp/,
			/verifyPhoneOtp/,
			/linkPhone/,
			/unlinkPhone/,
			/startDeviceAuthorization/,
			/pollDeviceAuthorization/,
			/approveDeviceAuthorization/,
			/denyDeviceAuthorization/,
			/revokeDevice/,
			/issuePosOfflineSnapshot/,
			/listDevices/,
		],
	},
	{
		id: "sdk-security-controls",
		requirement: "SDK exposes emergency token revocation controls.",
		file: "packages/sdk/src/resources/security.ts",
		patterns: [/createTokenRevocation/, /checkTokenRevocation/],
		also: [
			{
				file: "packages/sdk/src/client.ts",
				patterns: [/readonly security: SecurityControls/, /new SecurityControls/],
			},
		],
	},
	{
		id: "docs-production-readiness",
		requirement:
			"Docs include launch gates, token/session contract, phone/device guidance, key rotation, and incident runbooks.",
		file: "apps/docs/content/docs/production-readiness.mdx",
		patterns: [
			/Required Launch Gates/,
			/Customer App Readiness Harness/,
			/apps\/example-app/,
			/Session Classes/,
			/service principals/,
			/supportImpersonationRequestSchema/,
			/Token Contract/,
			/\/api\/auth\/token\/revoke/,
			/refreshTokenRotationSchema/,
			/refreshTokenReuseDetectionSchema/,
			/Phone And WhatsApp OTP/,
			/Key Rotation Runbook/,
			/Incident Runbooks/,
		],
	},
	{
		id: "docs-phone-linked-devices",
		requirement: "Docs include phone OTP, linked-device flow, and revocation examples.",
		file: "apps/docs/content/docs/phone-and-linked-devices.mdx",
		patterns: [
			/Phone OTP/,
			/Mobile Primary Login/,
			/Linked Device Flow/,
			/SDK Usage/,
			/banata\.phoneAndDevices\.startPhoneOtp/,
			/Revocation/,
			/typical POS lifecycle/,
			/short-lived permission bundles/,
			/maximum exposure window is the snapshot expiry/,
			/\/api\/auth\/phone\/resend/,
			/\/api\/auth\/phone\/link/,
			/\/api\/auth\/phone\/unlink/,
			/SMS And WhatsApp Providers/,
			/Twilio/,
			/Meta WhatsApp Cloud API/,
			/\/api\/auth\/device\/start/,
			/\/api\/auth\/device\/offline-snapshot\/issue/,
		],
	},
	{
		id: "provider-configuration-surfaces",
		requirement:
			"Email and phone OTP provider configuration surfaces include Cloudflare Email Service and multiple SMS/WhatsApp providers.",
		file: "packages/convex/src/plugins/email-sender.ts",
		patterns: [/cloudflare/, /sendViaCloudflare/, /email\/sending\/send/],
		also: [
			{
				file: "packages/convex/src/plugins/sms-sender.ts",
				patterns: [
					/twilio/,
					/messagebird/,
					/vonage/,
					/africas_talking/,
					/mobitech/,
					/meta_whatsapp/,
				],
			},
			{
				file: "apps/dashboard/src/app/sms/providers/page.tsx",
				patterns: [
					/SMS Providers/,
					/Twilio/,
					/Africa's Talking/,
					/Mobitech/,
					/Meta WhatsApp Cloud API/,
				],
			},
			{
				file: "apps/docs/content/docs/emails.mdx",
				patterns: [/Cloudflare Email Service/, /Email Routing alone/, /Validate Provider Setup/],
			},
			{
				file: "packages/convex/src/plugins/config.ts",
				patterns: [
					/\/banata\/config\/email-providers\/validate/,
					/\/banata\/config\/sms-providers\/validate/,
					/validateEmailProviderSetup/,
					/validateSmsProviderSetup/,
				],
			},
			{
				file: "apps/dashboard/src/lib/dashboard-api.ts",
				patterns: [/validateEmailProviderConfig/, /validateSmsProviderConfig/],
			},
			{
				file: "packages/convex/src/plugins/email-sender.test.ts",
				patterns: [/validates Cloudflare Email Service credentials/, /reply_to/],
			},
			{
				file: "packages/convex/src/plugins/sms-sender.test.ts",
				patterns: [
					/Twilio WhatsApp/,
					/Mobitech SMS OTP/,
					/Meta WhatsApp OTP with an approved template/,
				],
			},
		],
	},
	{
		id: "service-principal-contracts",
		requirement:
			"Service-to-service auth is modeled as non-human principals with explicit audience, scopes, credential hash, and rotation window.",
		file: "packages/shared/src/production-readiness.ts",
		patterns: [
			/servicePrincipalSchema/,
			/servicePrincipalTokenRequestSchema/,
			/servicePrincipalTypes/,
			/credentialHash/,
			/rotationWindowDays/,
		],
		also: [
			{
				file: "packages/convex/src/component/schema.ts",
				patterns: [/servicePrincipal: defineTable/, /projectId_principalId/, /projectId_credentialKeyId/],
			},
			{
				file: "apps/docs/content/docs/api-keys.mdx",
				patterns: [/service principal/, /service_to_service_token/, /rotation window/],
			},
		],
	},
	{
		id: "support-impersonation-controls",
		requirement:
			"Support impersonation is short-lived, approved, ticketed, and customer-visible instead of a normal user session.",
		file: "packages/shared/src/production-readiness.ts",
		patterns: [
			/supportImpersonationRequestSchema/,
			/supportImpersonationAuditSchema/,
			/customerVisible: z\.literal\(true\)/,
			/expiresInSeconds/,
			/supportTicketId/,
		],
		also: [
			{
				file: "packages/convex/src/component/schema.ts",
				patterns: [/impersonationReason/, /impersonationSupportTicketId/, /impersonationCustomerVisible/],
			},
			{
				file: "packages/convex/src/plugins/user-management.ts",
				patterns: [/support_impersonation_session/, /impersonationCustomerVisible: true/, /supportTicketId/],
			},
			{
				file: "apps/docs/content/docs/production-readiness.mdx",
				patterns: [/Support impersonation/, /customer-visible/, /supportImpersonationAuditSchema/],
			},
		],
	},
	{
		id: "admin-portal-least-privilege",
		requirement:
			"Admin Portal links are short-lived, organization-scoped, intent-scoped, and protected by a seeded portal.create permission.",
		file: "packages/convex/src/plugins/portal.ts",
		patterns: [
			/permission: "portal\.create"/,
			/MAX_EXPIRES_IN_MS/,
			/PORTAL_INTENTS/,
			/validatePortalSession/,
		],
		also: [
			{
				file: "packages/convex/src/plugins/config.ts",
				patterns: [
					/portal\.create/,
					/Create Admin Portal links/,
					/Generate short-lived, scoped Admin Portal links/,
				],
			},
			{
				file: "apps/docs/content/docs/production-readiness.mdx",
				patterns: [
					/Admin Portal Least Privilege/,
					/portal\.create/,
					/one organization and one portal intent/,
				],
			},
		],
	},
	{
		id: "env-inventory",
		requirement:
			"Environment inventory includes split production key custody and phone-provider variables.",
		file: "apps/docs/content/docs/env-vars.mdx",
		patterns: [
			/BANATA_AUTH_APP_SECRET/,
			/BANATA_JWT_SIGNING_KEY_KMS_ID/,
			/BANATA_VAULT_KMS_KEY_ID/,
			/BANATA_REFRESH_TOKEN_PEPPER_KMS_ID/,
			/BANATA_WEBHOOK_SIGNING_PEPPER/,
			/WHATSAPP_CLOUD_API_TOKEN/,
		],
	},
	{
		id: "key-custody-contract",
		requirement:
			"Shared contracts require separated production key custody references with access logging.",
		file: "packages/shared/src/key-custody.ts",
		patterns: [
			/productionKeyPurposes/,
			/jwt_signing/,
			/vault_encryption/,
			/refresh_token_pepper/,
			/offline_pos_snapshot_signing/,
			/validateProductionKeyCustody/,
			/accessLoggingEnabled/,
		],
		also: [
			{
				file: "packages/shared/src/__tests__/key-custody.test.ts",
				patterns: [/rejects missing key purposes/, /rejects reused custody references/, /requires access logging/],
			},
		],
	},
	{
		id: "production-gate-evidence",
		requirement: "Production launch gates have a strict evidence manifest, evidence template, and failing verifier.",
		file: "testing/auth-production-gates.json",
		patterns: [
			/"final-domain-deploy-isolation"/,
			/"ci-monorepo-checks"/,
			/"browser-e2e-core-auth"/,
			/"kms-key-custody"/,
			/"production-env-inventory"/,
			/"security-review-signoff"/,
			/"status": "pending"/,
		],
		also: [
			{
				file: "scripts/auth-production-gates-check.mjs",
				patterns: [
					/requiredIds/,
					/final-domain-deploy-isolation/,
					/ci-monorepo-checks/,
					/production-env-inventory/,
					/missing required production gate/,
					/unknown production gate/,
					/duplicate production gate/,
					/weak evidence reference/,
					/requiredEvidence/,
					/at least/,
					/PENDING/,
					/process\.exitCode = 1/,
				],
			},
			{
				file: "testing/auth-production-gate-evidence-template.json",
				patterns: [
					/"final-domain-deploy-isolation"/,
					/"ci-monorepo-checks"/,
					/"sms-whatsapp-provider-delivery"/,
					/"browser-e2e-core-auth"/,
					/"production-env-inventory"/,
					/"security-review-signoff"/,
					/"requiredEvidence"/,
				],
			},
			{
				file: "scripts/auth-production-gate-template-check.mjs",
				patterns: [
					/requiredIds/,
					/requiredIdSet/,
					/unknown gate template/,
					/duplicate gate template/,
					/requiredEvidence/,
					/READY/,
				],
			},
			{
				file: "testing/auth-production-launch-handoff.md",
				patterns: [
					/Auth Production Launch Handoff/,
					/final service name and production domains/,
					/Customer App Harness/,
					/verify:auth-production-gates/,
					/Do Not Mark Production Ready Until/,
				],
			},
		],
	},
	{
		id: "auth-e2e-scenario-manifest",
		requirement:
			"Auth browser E2E requirements are explicitly enumerated so provider/deployment proof cannot skip required flows.",
		file: "testing/auth-e2e-scenarios.json",
		patterns: [
			/"email-password"/,
			/"github-oauth"/,
			/"google-oauth"/,
			/"phone-otp-whatsapp"/,
			/"passkey"/,
			/"mfa-totp"/,
			/"hosted-ui-callback"/,
			/"customer-app-return"/,
			/"project-isolation"/,
		],
		also: [
			{
				file: "scripts/auth-e2e-scenarios-check.mjs",
				patterns: [/requiredScenarioIds/, /hosted-ui-callback/, /project-isolation/],
			},
			{
				file: "package.json",
				patterns: [/verify:auth-e2e-scenarios/],
			},
		],
	},
	{
		id: "example-app-customer-harness",
		requirement:
			"Example app consumes Banata Auth like a real customer app through hosted auth URL, server-side API key injection, and hosted callback handoff.",
		file: "apps/example-app/src/server/lib/banata.ts",
		patterns: [
			/env\.banataAuthUrl/,
			/env\.banataApiKey/,
			/"x-api-key"/,
			/"x-forwarded-host"/,
			/mirrorCrossDomainCookie/,
		],
		also: [
			{
				file: "apps/example-app/src/server/lib/env.ts",
				patterns: [/BANATA_API_KEY/, /BANATA_AUTH_URL/, /https:\/\/auth\.banata\.dev/],
			},
			{
				file: "apps/example-app/src/client/routes/auth-callback.tsx",
				patterns: [/completeHostedAuth/, /\/api\/auth/],
			},
			{
				file: "apps/example-app/src/client/lib/hosted-ui-url.ts",
				patterns: [
					/VITE_BANATA_CLIENT_ID/,
					/VITE_BANATA_HOSTED_AUTH_URL/,
					/https:\/\/auth-ui\.banata\.dev/,
					/redirect_url/,
					/client_id/,
				],
			},
			{
				file: "apps/example-app/src/client/components/hosted-auth-link.tsx",
				patterns: [/buildHostedAuthUrl/, /Hosted sign-in/, /Hosted sign-up/],
			},
			{
				file: "apps/example-app/README.md",
				patterns: [
					/customer-style readiness harness/,
					/BANATA_API_KEY/,
					/BANATA_AUTH_URL/,
					/VITE_BANATA_CLIENT_ID/,
					/VITE_BANATA_HOSTED_AUTH_URL/,
					/never receives `BANATA_API_KEY`/,
				],
			},
		],
		forbiddenPatterns: [/allowInternalProjectScope/],
	},
	{
		id: "readiness-test-guide",
		requirement:
			"Step-by-step readiness guide covers local checks, customer example app testing, browser E2E, external gates, and production gate verification.",
		file: "testing/auth-readiness-test-guide.md",
		patterns: [
			/Local Static Checks/,
			/verify:auth-local-readiness/,
			/Example App Customer Harness/,
			/Provider And Browser E2E Gates/,
			/External Service Gates/,
			/verify:auth-production-gates/,
			/BANATA_AUTH_URL/,
			/VITE_BANATA_HOSTED_AUTH_URL/,
		],
	},
	{
		id: "local-readiness-command",
		requirement:
			"Single-command local readiness check runs full local tests, readiness verifiers, example app checks, and whitespace validation.",
		file: "scripts/auth-local-readiness-check.mjs",
		patterns: [
			/verify:auth-readiness/,
			/verify:auth-e2e-scenarios/,
			/verify:auth-security-review/,
			/verify:auth-operations-readiness/,
			/verify:auth-maturity-readiness/,
			/verify:auth-production-gate-template/,
			/apps\/docs/,
			/apps\/example-app/,
			/git/,
			/diff/,
			/--check/,
		],
		also: [
			{
				file: "package.json",
				patterns: [/verify:auth-local-readiness/],
			},
			{
				file: "testing/auth-production-launch-handoff.md",
				patterns: [/verify:auth-local-readiness/, /apps\/docs build/, /single catch-all link/],
			},
			{
				file: "testing/auth-readiness-completion-audit.md",
				patterns: [
					/Single-command local readiness check/,
					/verify:auth-local-readiness/,
					/Docs build and search index/,
				],
			},
		],
	},
	{
		id: "ci-readiness-workflow",
		requirement:
			"CI runs the local auth readiness command so the launch commit can produce monorepo typecheck/test/readiness evidence.",
		file: ".github/workflows/ci.yml",
		patterns: [
			/bun-version: "1\.3\.6"/,
			/bun install --frozen-lockfile/,
			/bun run lint/,
			/bun run verify:auth-local-readiness/,
			/bun run build/,
		],
		also: [
			{
				file: ".github/workflows/e2e.yml",
				patterns: [/bun-version: "1\.3\.6"/, /bun run test:e2e/],
			},
			{
				file: "testing/auth-readiness-completion-audit.md",
				patterns: [/Full monorepo CI proof/, /launch-run evidence recorded/],
			},
		],
	},
	{
		id: "completion-audit",
		requirement:
			"Completion audit maps audit recommendations to artifacts and explicitly identifies remaining external gates.",
		file: "testing/auth-readiness-completion-audit.md",
		patterns: [
			/Prompt-To-Artifact Checklist/,
			/Production Launch Gates Evidence Matrix/,
			/Customer-style example app/,
			/Step-by-step readiness testing guide/,
			/Full monorepo typecheck passes without timeout or hidden failures/,
			/Full monorepo test suite passes in CI/,
			/SSO\/SCIM are either fully tested or disabled\/marked beta/,
			/Completion Decision/,
			/Not complete/,
			/sms-whatsapp-provider-delivery/,
			/security-review-signoff/,
		],
	},
	{
		id: "security-review-checklist",
		requirement:
			"Focused security review checklist covers headers, CSP, cookies, CSRF/origin, OAuth callback, and secret redaction review.",
		file: "testing/auth-security-review-checklist.json",
		patterns: [
			/"security-headers"/,
			/"content-security-policy"/,
			/"cookie-policy"/,
			/"csrf-origin-policy"/,
			/"secret-log-redaction"/,
			/"oauth-callback-policy"/,
		],
		also: [
			{
				file: "scripts/auth-security-review-check.mjs",
				patterns: [/requiredIds/, /secret-log-redaction/, /oauth-callback-policy/],
			},
			{
				file: "package.json",
				patterns: [/verify:auth-security-review/],
			},
		],
	},
	{
		id: "nextjs-security-helpers",
		requirement:
			"Next.js package exposes reusable security headers, CSRF/origin, and auth cookie policy helpers.",
		file: "packages/nextjs/src/security.ts",
		patterns: [
			/buildBanataSecurityHeaders/,
			/applyBanataSecurityHeaders/,
			/assertTrustedOrigin/,
			/validateAuthCookiePolicy/,
			/content-security-policy/,
			/strict-transport-security/,
			/SameSite/i,
		],
		also: [
			{
				file: "packages/nextjs/src/__tests__/security.test.ts",
				patterns: [/rejects missing or untrusted origins/, /reports auth cookies missing production attributes/],
			},
			{
				file: "packages/nextjs/src/index.ts",
				patterns: [/buildBanataSecurityHeaders/, /assertTrustedOrigin/, /validateAuthCookiePolicy/],
			},
		],
	},
	{
		id: "bot-protection-sensitive-routes",
		requirement:
			"Bot protection defaults cover sensitive auth mutations including OTP, phone, and linked-device routes.",
		file: "packages/nextjs/src/bot-protection.ts",
		patterns: [
			/BANATA_DEFAULT_BOT_PROTECTED_PATHS/,
			/\/api\/auth\/sign-in/,
			/\/api\/auth\/email-otp/,
			/\/api\/auth\/phone/,
			/\/api\/auth\/device\/start/,
			/\/api\/auth\/device\/poll/,
		],
		also: [
			{
				file: "packages/nextjs/src/__tests__/bot-protection.test.ts",
				patterns: [
					/protects sensitive auth routes by default/,
					/blocks bot traffic on phone OTP routes/,
					/failOpen is false/,
				],
			},
			{
				file: "apps/docs/content/docs/bot-protection.mdx",
				patterns: [/\/api\/auth\/magic-link/, /\/api\/auth\/email-otp/, /\/api\/auth\/phone/, /\/api\/auth\/device\/start/],
			},
		],
	},
	{
		id: "log-redaction-helpers",
		requirement:
			"Shared log redaction helpers exist and the dashboard auth route uses them for sensitive auth logs.",
		file: "packages/shared/src/log-redaction.ts",
		patterns: [
			/redactUrl/,
			/redactSensitiveString/,
			/redactSensitiveObject/,
			/authorization/,
			/api\[-_\]\?key/,
			/session/,
		],
		also: [
			{
				file: "packages/shared/src/__tests__/log-redaction.test.ts",
				patterns: [/redacts sensitive URL query parameters/, /redacts nested object fields/],
			},
			{
				file: "apps/dashboard/src/app/api/auth/[...all]/route.ts",
				patterns: [/redactUrl/, /redactSensitiveObject/, /setCookieCount/],
			},
		],
	},
	{
		id: "operations-readiness-checklist",
		requirement:
			"Operational readiness checklist covers monitoring, alerting, status reporting, data retention, release approvals, customer onboarding controls, and environment separation.",
		file: "testing/auth-operations-readiness.json",
		patterns: [
			/"monitoring-signals"/,
			/"alert-routing"/,
			/"status-reporting"/,
			/"data-retention-policy"/,
			/"release-approval"/,
			/"environment-separation"/,
			/"customer-facing-product-readiness"/,
		],
		also: [
			{
				file: "scripts/auth-operations-readiness-check.mjs",
				patterns: [/requiredIds/, /monitoring-signals/, /customer-facing-product-readiness/],
			},
			{
				file: "package.json",
				patterns: [/verify:auth-operations-readiness/],
			},
		],
	},
	{
		id: "operations-readiness-contract",
		requirement:
			"Shared operations evidence contract enumerates required monitoring signals, alerts, incident drills, retention subjects, and customer-facing readiness controls.",
		file: "packages/shared/src/operations-readiness.ts",
		patterns: [
			/requiredAuthMonitoringSignals/,
			/auth_request_latency_p95/,
			/webhook_dead_letter_count/,
			/audit_sink_failures/,
			/requiredAuthAlertRoutes/,
			/requiredIncidentDrills/,
			/requiredRetentionSubjects/,
			/requiredCustomerReadinessControls/,
			/customerReadinessControlSchema/,
			/validateOperationsReadinessEvidence/,
		],
		also: [
			{
				file: "packages/shared/src/__tests__/operations-readiness.test.ts",
				patterns: [
					/rejects missing monitoring signals/,
					/rejects incomplete retention coverage/,
					/rejects incomplete customer-facing readiness controls/,
				],
			},
			{
				file: "apps/docs/content/docs/production-readiness.mdx",
				patterns: [/Operations Evidence Contract/, /requiredCustomerReadinessControls/],
			},
		],
	},
	{
		id: "maturity-readiness-plan",
		requirement:
			"P2 mature-platform recommendations are explicitly tracked without claiming availability before evidence exists.",
		file: "packages/shared/src/maturity-readiness.ts",
		patterns: [
			/maturityCapabilityIds/,
			/enterprise-byok/,
			/device-risk-scoring/,
			/auth-anomaly-detection/,
			/session-forensics/,
			/fine-grained-authorization/,
			/enterprise-compliance-packaging/,
			/validateMaturityReadinessPlan/,
		],
		also: [
			{
				file: "testing/auth-maturity-readiness.json",
				patterns: [
					/"enterprise-byok"/,
					/"device-risk-scoring"/,
					/"enterprise-compliance-packaging"/,
				],
			},
			{
				file: "scripts/auth-maturity-readiness-check.mjs",
				patterns: [/requiredIds/, /enterprise-byok/, /device-risk-scoring/],
			},
			{
				file: "apps/docs/content/docs/production-readiness.mdx",
				patterns: [/Mature Platform Capabilities/, /validateMaturityReadinessPlan/],
			},
		],
	},
	{
		id: "webhook-hardening",
		requirement: "Webhook delivery records expose retry, dead-letter, and replay operations.",
		file: "packages/convex/src/plugins/webhook.ts",
		patterns: [
			/listWebhookDeliveries: createAuthEndpoint/,
			/replayWebhookDelivery: createAuthEndpoint/,
			/deadLetteredAt/,
			/replayOfDeliveryId/,
		],
		also: [
			{
				file: "packages/sdk/src/resources/webhooks.ts",
				patterns: [/listDeliveries/, /replayDelivery/],
			},
			{
				file: "apps/docs/content/docs/webhooks.mdx",
				patterns: [/Delivery Operations/, /replayOfDeliveryId/],
			},
		],
	},
	{
		id: "audit-hardening",
		requirement: "Audit events include tamper-evident hash chain fields and external sink status.",
		file: "packages/convex/src/plugins/audit.ts",
		patterns: [/createAuditEventWithHash/, /previousHash/, /externalSinkStatus/, /sha256Hex/],
		also: [
			{
				file: "apps/docs/content/docs/audit-logs.mdx",
				patterns: [/Tamper-Evident Chain/, /externalSinkStatus/],
			},
		],
	},
	{
		id: "scim-hardening",
		requirement: "SCIM directories support hashed token custody and token rotation.",
		file: "packages/convex/src/plugins/enterprise.ts",
		patterns: [
			/rotateDirectoryToken: createAuthEndpoint/,
			/defaultKeyHasher/,
			/tokenHash/,
			/\/banata\/scim\/rotate-token/,
		],
		also: [
			{
				file: "packages/sdk/src/resources/directory-sync.ts",
				patterns: [/rotateToken/, /\/banata\/scim\/rotate-token/],
			},
			{
				file: "apps/docs/content/docs/scim.mdx",
				patterns: [/rotateToken/, /shown once/],
			},
		],
	},
	{
		id: "sso-provider-validation",
		requirement: "SSO connections expose provider setup validation before production routing.",
		file: "packages/convex/src/plugins/enterprise.ts",
		patterns: [
			/validateSsoProvider: createAuthEndpoint/,
			/validateSsoConnection/,
			/validateSsoConnectionReadiness/,
			/domain_not_verified/,
			/saml_assertions_not_required_signed/,
		],
		also: [
			{
				file: "packages/convex/src/plugins/enterprise.test.ts",
				patterns: [
					/requires verified routing domains before production SSO routing/,
					/domain_not_verified/,
				],
			},
			{
				file: "packages/convex/src/plugins/domains.ts",
				patterns: [/recomputeProviderDomainVerification/, /domainVerified: nextValue/],
			},
			{
				file: "packages/sdk/src/resources/sso.ts",
				patterns: [/validateConnection/, /ValidateConnectionResult/],
			},
			{
				file: "apps/docs/content/docs/sso.mdx",
				patterns: [/Validate Provider Setup/, /validateConnection/],
			},
		],
	},
	{
		id: "plugin-project-scope-guard",
		requirement:
			"Project-scoped plugin endpoints reject API-key/body project scope mismatches and use API-key scope when body scope is omitted.",
		file: "packages/convex/src/plugins/types.ts",
		patterns: [
			/requireProjectScopedPermission/,
			/resolveProjectIdFromApiKey/,
			/Project scope does not match the supplied API key/,
		],
		also: [
			{
				file: "packages/convex/src/plugins/types.test.ts",
				patterns: [
					/rejects explicit project scope that does not match the API key/,
					/uses project scope from the API key when the request body omits projectId/,
				],
			},
			{
				file: "packages/convex/src/plugins/enterprise.ts",
				patterns: [/requireProjectScopedPermission/, /permission: "sso\.manage"/],
			},
			{
				file: "packages/convex/src/plugins/domains.ts",
				patterns: [/requireProjectScopedPermission/, /permission: "sso\.manage"/],
			},
		],
	},
	{
		id: "social-provider-validation",
		requirement:
			"Social OAuth provider setup exposes validation before GitHub/Google production callback proof.",
		file: "packages/convex/src/plugins/config.ts",
		patterns: [
			/validateSocialProviderSetup: createAuthEndpoint/,
			/validateSocialProviderSetup/,
			/missing_https_callback_origin/,
			/\/banata\/config\/social-providers\/validate/,
		],
		also: [
			{
				file: "packages/sdk/src/resources/configuration.ts",
				patterns: [
					/validateSocialProviderSetup/,
					/ValidateSocialProviderResult/,
					/\/api\/auth\/banata\/config\/social-providers\/validate/,
				],
			},
			{
				file: "apps/docs/content/docs/social-oauth.mdx",
				patterns: [/validateSocialProviderSetup/, /real browser sign-in/],
			},
		],
	},
	{
		id: "rate-limit-operations",
		requirement:
			"Project-scoped rate limits expose operator inspection and reset controls for abuse response.",
		file: "packages/convex/src/plugins/config.ts",
		patterns: [
			/listRateLimitBuckets: createAuthEndpoint/,
			/resetRateLimitBucket: createAuthEndpoint/,
			/\/banata\/config\/rate-limits\/list/,
			/\/banata\/config\/rate-limits\/reset/,
		],
		also: [
			{
				file: "packages/sdk/src/resources/configuration.ts",
				patterns: [/listRateLimitBuckets/, /resetRateLimitBucket/, /RateLimitBucket/],
			},
			{
				file: "apps/docs/content/docs/radar.mdx",
				patterns: [/Rate Limit Operations/, /resetRateLimitBucket/],
			},
		],
	},
	{
		id: "api-key-rotation-controls",
		requirement: "API key rotation is exposed in the SDK, dashboard UI, and docs.",
		file: "packages/sdk/src/resources/api-keys.ts",
		patterns: [/async rotate/, /revokeOld/, /createKey/, /deleteKey/],
		also: [
			{
				file: "apps/dashboard/src/app/api-keys/page.tsx",
				patterns: [/handleRotate/, /RotateCw/, /Replacement API key created/],
			},
			{
				file: "apps/docs/content/docs/api-keys.mdx",
				patterns: [/rotate action/, /banata\.apiKeys\.rotate/],
			},
			{
				file: "apps/docs/content/docs/sdk.mdx",
				patterns: [/API Key Rotation/, /apiKeys\.rotate/],
			},
		],
	},
	{
		id: "unit-coverage",
		requirement:
			"Shared, Convex, and SDK tests cover the production-readiness contracts and endpoint/resource registration.",
		file: "packages/shared/src/__tests__/production-readiness.test.ts",
		patterns: [/phone/i, /device/, /token/, /kasilabsPermissionPresets/],
		also: [
			{
				file: "packages/convex/src/plugins/production-readiness.test.ts",
				patterns: [/phone OTP/, /linked-device/, /durable schema/],
			},
			{
				file: "packages/sdk/src/__tests__/client.test.ts",
				patterns: [/startPhoneOtp/, /startDeviceAuthorization/],
			},
		],
	},
];

const externalGates = [
	"Final service name/domain decision recorded and deploy isolation proven across production, staging, and development.",
	"Real SMS/WhatsApp provider delivery configured and tested with production-like credentials.",
	"Phone OTP verification creates/links a real authenticated user session in the final product flow.",
	"Browser E2E tests pass for email/password, OAuth, email OTP, phone OTP, passkey, MFA, logout, session refresh, hosted UI callback, and customer-app return.",
	"GitHub/Google OAuth callback URI and origin handling verified against real providers.",
	"SAML/OIDC SSO and SCIM provisioning/deprovisioning verified against real IdPs.",
	"KMS/HSM-backed signing, vault, and refresh-token key custody integrated with the target production provider.",
	"Production environment variables present, environment-scoped, and excluded from logs.",
	"Monitoring, alerting, status reporting, and incident response process verified in the production deployment.",
	"Security review or focused external review signed off before real customer launch.",
];

let failed = false;

for (const check of artifactChecks) {
	const content = read(check.file);
	const missingPatterns = [];
	if (!content) {
		missingPatterns.push("file missing");
	} else {
		for (const pattern of check.patterns) {
			if (!pattern.test(content)) {
				missingPatterns.push(pattern.toString());
			}
		}
	}

	for (const extra of check.also ?? []) {
		const extraContent = read(extra.file);
		if (!extraContent) {
			missingPatterns.push(`${extra.file}: file missing`);
			continue;
		}
		for (const pattern of extra.patterns) {
			if (!pattern.test(extraContent)) {
				missingPatterns.push(`${extra.file}: ${pattern.toString()}`);
			}
		}
	}

	for (const pattern of check.forbiddenPatterns ?? []) {
		if (content && pattern.test(content)) {
			missingPatterns.push(`forbidden ${pattern.toString()}`);
		}
	}

	if (missingPatterns.length > 0) {
		failed = true;
		console.error(`FAIL ${check.id}: ${check.requirement}`);
		for (const missing of missingPatterns) {
			console.error(`  missing ${missing}`);
		}
	} else {
		console.log(`PASS ${check.id}`);
	}
}

console.log("\nExternal production gates still requiring environment/provider evidence:");
for (const gate of externalGates) {
	console.log(`- ${gate}`);
}

if (failed) {
	process.exitCode = 1;
}
