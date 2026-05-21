# Banata Auth Product Readiness Assessment For KasiLabs Evaluation

Date: 2026-05-21

This document is written from KasiLabs' perspective as a prospective customer and integration partner evaluating the current `BetterAuth_WorkOS_Clone` codebase. The goal is to give Banata a grounded product and engineering assessment: what already works, what needs improvement, and which changes would make Banata Auth fit KasiLabs' use cases while also making the product stronger for other customers.

This is not an internal KasiLabs implementation plan. It is a report of findings from the codebase and a set of recommended product improvements for the Banata team.

The conclusion is clear: this repository is a strong foundation, but it is not production-ready for KasiLabs' full use case yet. It already has the right shape for a managed auth platform, but it needs hardening, missing auth methods, device-linking, tenant isolation guarantees, operational controls, and deeper end-to-end verification before a customer should use it as the identity authority for critical products.

## External Standards Used

This audit uses the local codebase as the source of truth, then measures it against current identity/security baselines:

- OWASP Application Security Verification Standard: https://owasp.org/www-project-application-security-verification-standard/
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP Session Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- OWASP OAuth2 Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html
- NIST SP 800-63-4 Digital Identity Guidelines: https://pages.nist.gov/800-63-4/
- NIST SP 800-63B-4 Authentication and Authenticator Management: https://pages.nist.gov/800-63-4/sp800-63b.html
- OpenID Connect Core 1.0: https://openid.net/specs/openid-connect-core-1_0-18.html
- OAuth 2.0 Device Authorization Grant, RFC 8628: https://www.rfc-editor.org/rfc/rfc8628

## Executive Verdict

The project can become the kind of shared auth platform KasiLabs needs, but not by being embedded inside a customer's application monorepo. Banata Auth should be treated as a standalone identity product with its own deployment, database, secrets boundary, monitoring, release process, audit controls, and security review.

For KasiLabs, Banata Auth would need to act as the central identity provider while KasiLabs products become relying clients:

- AI Automation uses it for web users, organization membership, admin roles, service tokens, and WhatsApp instance ownership.
- Ecommerce POS uses it for merchant accounts, staff roles, offline device trust, and local POS re-auth.
- Whatspoppin uses it for user accounts, business accounts, linked devices, QR login, mobile controller sessions, and customer/business identity context.
- Other Banata customers use the SDK and hosted UI as managed auth clients.

The current repository is closest to this model already. It has a dashboard, hosted auth UI, SDKs, project-scoped API keys, a Convex auth runtime, org/RBAC, SSO/SCIM scaffolding, vault, webhooks, audit logs, bot protection hooks, and customer app proxy packages.

The main gaps are:

- No implemented phone-number login flow.
- No WhatsApp-style QR linked-device/session model.
- No explicit session class model for web, mobile, linked device, offline POS, service, and admin sessions.
- No mature production key-management model beyond deriving vault encryption from `BETTER_AUTH_SECRET`.
- Partial SSO/SCIM implementation that requires real end-to-end verification before it is marketed as production-ready.
- Limited full-flow test coverage for OAuth, passkeys, OTP, hosted UI handoff, Convex JWT validation, and multi-tenant isolation.
- The current system is still Convex-centered. That may be acceptable for v1, but it should be an explicit architectural choice, not an accident.

## Current Codebase Shape

### Apps

The repository is a monorepo with these major apps:

- `apps/dashboard`: the Banata Auth management dashboard. It configures projects, auth methods, providers, roles, permissions, webhooks, branding, domains, users, organizations, audit logs, etc.
- `apps/auth-ui`: hosted auth screens for project-scoped customer sign-in/sign-up flows.
- `apps/admin-portal`: an end-user/admin portal surface.
- `apps/docs`: documentation.
- `apps/example-app`: a reference customer integration.

### Packages

The reusable packages are the product surface:

- `@banata-auth/convex`: Convex component/schema/auth runtime/plugins.
- `@banata-auth/nextjs`: Next.js proxy route, server helpers, middleware/proxy, bot-protection helpers.
- `@banata-auth/react`: React provider, hooks, auth UI components, Better Auth client plugin exports.
- `@banata-auth/sdk`: remote admin API client.
- `@banata-auth/shared`: shared types, constants, validators, IDs, errors.
- `@banata-auth/ui`: reusable UI primitives.

### Important Current Wiring

The main managed-service integration path is:

1. A customer app installs `@banata-auth/nextjs` and `@banata-auth/react`.
2. The app creates `/api/auth/[...all]`.
3. The app server injects a project-scoped `BANATA_API_KEY` into the proxied auth request.
4. Browser auth requests stay on the customer app domain.
5. The Banata Auth backend resolves the project from the API key and handles the request with project-specific runtime config.

Evidence:

- `packages/nextjs/src/route-handler.ts` requires `apiKey` for normal customer apps and only allows missing API key when `allowInternalProjectScope` is set.
- `packages/nextjs/src/server.ts` builds the higher-level server helper around that route handler.
- `apps/docs/content/docs/quickstart.mdx` documents `BANATA_API_KEY` as server-only customer binding.

The first-party dashboard/auth-ui path uses `allowInternalProjectScope`. That is legitimate for first-party hosted surfaces, but it must remain locked away from customer apps.

## Connection Audit

This section answers whether the system is connected correctly today.

| Area | Current state | Connected correctly? | Notes |
| --- | --- | --- | --- |
| Customer Next.js auth proxy | `@banata-auth/nextjs` exposes `createRouteHandler` and `createBanataAuthServer`; customer apps inject a server-side API key. | Mostly yes | This is the right model. It needs more E2E proof with real apps and real OAuth redirects. |
| First-party dashboard auth | Dashboard uses `createBanataAuthServer` with `allowInternalProjectScope: true`. | Yes, with caution | This bypass should remain first-party only. It should be impossible for customer apps to use accidentally. |
| Hosted auth UI | `apps/auth-ui` proxies to the configured Convex site URL and uses project/client scope cookies and query params. | Partially | The intended flow exists. Needs E2E tests for callback, cross-domain cookie handoff, one-time-token handoff, and customer app return. |
| Project runtime config | Runtime config is loaded by project/API key and merged with stored dashboard config and provider vault secrets. | Partially | Good direction. Defaults disable many methods, and more tests are needed for every method toggle. |
| Project API key scoping | Auth node action resolves project by API key and rejects scope mismatch. | Mostly yes | Strong foundation. Needs adversarial tests for every management endpoint, including plugin endpoints. |
| Convex JWT/JWKS | `@banata-auth/convex` uses Better Auth Convex integration and `getAuthConfigProvider`. | Partially | Works for Convex integration shape. Needs app audience rules and cross-app rejection tests. |
| Email/password | Better Auth email/password is configured and exposed in hosted UI. | Yes for foundation | Need real email delivery, verification, reset, lockout, and risk tests. |
| Social OAuth | Provider credentials can be stored and loaded; hosted UI renders social buttons. | Partially | Needs real GitHub/Google E2E. Callback URI/origin handling must be verified for dashboard, hosted UI, and customer app domains. |
| Magic link | Plugin exists and UI links exist when enabled. | Partially | Need delivery, expiry, replay, callback, and project-isolation tests. |
| Email OTP | Plugin exists and hosted UI has an email OTP page. | Partially | Need provider delivery, brute-force, resend, lockout, and no-enumeration tests. |
| Phone OTP | User schema has phone fields. | No | No real phone/SMS/WhatsApp login flow found. This is a major gap for phone-first customers such as KasiLabs. |
| Passkeys | Passkey plugin and hosted UI button exist. | Partially | Needs real browser E2E, RP ID/origin management, recovery path, and per-project configuration tests. |
| TOTP MFA | Two-factor plugin and dashboard account/security UI exist. | Partially | Needs end-to-end sign-in challenge coverage and admin step-up policy integration. |
| Organizations | Organization/member/invitation logic exists with RBAC checks. | Mostly | Needs broader tests for all role changes, invite acceptance, project isolation, and cross-org access. |
| Roles and permissions | Role and permission definitions exist with dashboard management. | Mostly | Needs a formal permission namespace per customer app and product surface. |
| API keys | API key plugin and project metadata scoping exist. | Mostly | Needs key rotation UX, last-used tracking, scoped permissions, emergency revoke, and customer docs. |
| Vault | AES-GCM vault exists and provider secrets are stored through it. | Partially | Good foundation, but production should move key custody to KMS/HSM and split key purposes. |
| Audit logs | Audit plugin and dashboard read/export path exist. | Partially | Useful but not immutable/tamper-evident. Needs stronger retention and high-risk alerting. |
| Webhooks | Endpoint CRUD, HMAC signing, immediate delivery, and delivery records exist. | Partially | Missing full durable retry worker, replay, dead-letter, and endpoint secret rotation. |
| Rate limiting | Custom project-scoped Better Auth plugin exists. | Partially | Needs production tuning, distributed/edge behavior review, dashboards, and bypass tests. |
| Bot protection | Helper package supports several providers and dashboard radar config exists. | Partially | Needs enforcement wired by default for sensitive routes and tested with selected provider. |
| SSO | SSO provider schema and management endpoints exist; Better Auth SSO is mounted in Node path. | Scaffolded/partial | Real SAML/OIDC flows need proof. Some SSO paths are deliberately blocked. Do not claim production SSO yet. |
| SCIM | Schema and management endpoints exist. | Scaffolded/partial | Needs real provisioning/deprovisioning tests and token rotation. |
| Linked devices / QR login | Not found beyond passkey/TOTP QR references. | No | Must be built for WhatsApp-like companion sessions and POS terminal registration. |
| Offline POS auth | Not found as a first-class auth flow. | No | Needs device registration, signed permission snapshots, refresh policy, and revocation sync. |
| Service-to-service auth | API keys exist; service principal model is not explicit. | Partial | Need non-human principals, scopes, rotation, and app audience. |
| Admin/support impersonation | Some admin/impersonation fields appear in session schema. | Partial | Needs explicit policy, audit, approval, expiry, and customer-visible logs before production. |

The most important pattern: the core managed-auth spine is connected, but the customer-specific trust flows required by KasiLabs are not yet built. That is expected for a foundation repo, but it is not acceptable for production identity authority.

## Verification Performed

The full monorepo `bun run typecheck` and `bun run test` commands were attempted, but each exceeded the 120 second command timeout. The visible output showed many packages building and many tests passing, but this is not a full clean-suite result.

Targeted checks were completed successfully:

- `bun run --cwd packages\convex test`: 10 files, 72 tests passed.
- `bun run --cwd packages\nextjs test`: 4 files, 55 tests passed.
- `bun run --cwd apps\dashboard test`: 6 files, 27 tests passed.
- `bun run --cwd packages\convex typecheck`: passed.
- `bun run --cwd packages\nextjs typecheck`: passed.
- `bun run --cwd apps\dashboard typecheck`: passed.

This verifies important foundations, but it does not prove production readiness. The missing proof is end-to-end behavior against real deployed auth services, real OAuth providers, real passkeys, real email/SMS providers, and real Convex consumer apps.

## What Is Already Good

### 1. Managed auth product shape exists

The repository is not just shared UI. It has:

- Dashboard-first management.
- Project-scoped API keys.
- Hosted auth UI.
- SDK.
- Admin portal.
- Docs.
- Self-hosting path.
- Convex runtime integration.

This is the right direction for Banata Auth as a managed identity product.

### 2. Customer app API key boundary is well conceived

The `@banata-auth/nextjs` route handler injects the project API key server-side and blocks project-scoped auth without a key unless explicitly using internal first-party mode.

This protects against a browser directly choosing arbitrary `projectId` or `clientId` for normal customer apps. It also aligns with the model KasiLabs needs for Ecommerce, AI Automation, and Whatspoppin: app servers hold project/client binding secrets; browsers get sessions, not global authority.

### 3. Project scoping is a first-class concept

The schema includes `projectId` fields on users, sessions, accounts, verifications, orgs, members, invitations, SSO providers, SCIM providers, API keys, audit events, webhooks, config, domains, vault secrets, portal sessions, roles, permissions, and more.

The auth runtime also has adapter wrapping for key core models:

- `user`
- `session`
- `account`
- `verification`

This is a good start, but plugin tables need just as much test coverage as the core models.

### 4. Convex JWT/JWKS integration already exists

The `@banata-auth/convex` package uses the Better Auth Convex plugin and exposes `getAuthConfigProvider()` for Convex JWT validation. This is important because many KasiLabs products currently use Convex heavily, and other Banata customers may also want Convex-compatible auth.

The current model can support:

- Central auth issuing a Convex-valid token.
- Consumer Convex apps trusting the central auth provider.
- Server helpers fetching Convex auth tokens.

However, token audience and issuer boundaries must be made explicit for multi-app production use.

### 5. Organization and RBAC foundation exists

The code has:

- Organizations.
- Members.
- Invitations.
- Roles.
- Permission definitions.
- Permission checks.
- Project owners and wildcard access.

This maps well to KasiLabs' product needs:

- Merchant organization.
- Staff.
- AI automation operators.
- WhatsApp business owners.
- POS cashiers.
- Admin/support roles.

It also maps well to external customers.

### 6. Vault, audit logs, webhooks, and bot-protection hooks exist

The code already contains:

- AES-GCM encrypted vault secrets.
- HMAC signed webhooks.
- Audit event tables and list/export endpoints.
- Project-scoped rate limiting.
- Bot-protection wrappers for providers such as BotID, Turnstile, reCAPTCHA, and hCaptcha.

These are important production building blocks.

## Critical Gaps

### Gap 1: Phone-number login is not implemented

The schema has phone fields:

- `user.phoneNumber`
- `user.phoneNumberVerified`
- indexes for phone lookup

But I did not find a real phone auth method, SMS OTP sender, WhatsApp OTP sender, phone sign-in screen, phone verification lifecycle, or account-linking rules for phone identities.

For KasiLabs, phone auth is not optional. Many users and customers will identify by phone number before email:

- Whatspoppin normal users.
- Whatspoppin business users.
- WhatsApp-connected merchants.
- POS staff in restaurants or shops.
- Customers placing orders through WhatsApp/Whatspoppin.

Needed additions:

- `phoneIdentity` or equivalent model, or a strict extension of the user/account model.
- `phoneVerification` flow with OTP issue, attempt tracking, expiry, resend throttling, and lockout.
- Support for SMS provider and WhatsApp provider.
- Optional fallback to voice call later.
- E.164 normalization and uniqueness rules per project.
- Phone merge/link flows when the same person already has an email/social identity.
- Fraud controls for OTP flooding, SIM swap risk, impossible travel, and abuse.

### Gap 2: Linked-device and QR login are missing

The repo supports passkeys and TOTP QR codes, but those are not the same as WhatsApp-style linked devices.

Banata should support flows where:

- A desktop/web/secondary device displays a QR code.
- A trusted mobile session scans it.
- The mobile app approves or rejects linking.
- The server issues a limited linked-device session.
- The user can revoke the linked device later.
- The device receives a session class that is not the same as a normal browser session.

This should be based on the security shape of OAuth Device Authorization Grant from RFC 8628, adapted to Banata's product model:

- Short-lived `device_code`.
- Human-readable `user_code` where useful.
- QR code containing a link or challenge, not raw credentials.
- Polling interval enforcement.
- Expiry.
- user-facing confirmation of device name, location, and requested scope.
- phishing-resistant UX warnings.
- explicit approval from an authenticated primary device.

New models likely needed:

- `deviceAuthorization`
- `linkedDevice`
- `deviceSession`
- `deviceTrustEvent`
- `deviceRevocation`

New endpoints likely needed:

- `POST /api/auth/device/start`
- `POST /api/auth/device/poll`
- `POST /api/auth/device/approve`
- `POST /api/auth/device/deny`
- `POST /api/auth/device/revoke`
- `GET /api/auth/devices/list`

For Whatspoppin, this unlocks:

- Mobile controlling web.
- Desktop sessions linked from mobile.
- Business account operators linked to a phone.
- Future device handoff flows like "continue this chat on desktop".

For Ecommerce POS, this unlocks:

- Registering a POS terminal.
- Allowing an owner to approve a cashier tablet.
- Revoking a stolen/offline terminal.

### Gap 3: No explicit session class model

Right now sessions mostly look like generic Better Auth sessions with optional project and active org fields.

Banata should introduce explicit session classes:

- `web_user_session`
- `mobile_user_session`
- `linked_device_session`
- `pos_offline_device_session`
- `admin_console_session`
- `support_impersonation_session`
- `service_to_service_token`
- `api_key_session`

Each class should have different:

- maximum lifetime
- refresh behavior
- re-auth requirements
- allowed audience
- allowed scopes
- IP/device binding policy
- revocation behavior
- audit severity
- MFA/passkey requirements

Example:

- Admin dashboard sessions should require phishing-resistant MFA for privileged actions.
- Offline POS device sessions should be scoped to a merchant, device, and cached permission snapshot.
- Linked Whatspoppin desktop sessions should be revocable from the mobile device and should not permit account recovery actions.
- Service tokens should never behave like user sessions.

### Gap 4: Token issuer/audience strategy is under-specified

The code uses Convex/JWKS integration, but the production model needs precise token contracts.

Banata should define:

- issuer per environment, for example `https://auth.customer-domain.example` or `https://auth.banata.dev`
- audience per app, for example `ai-automation`, `ecommerce-pos`, `whatspoppin`, `admin-console`
- subject format, for example stable user ID, not email or phone
- organization claim format
- active org claim rules
- session class claim
- device ID claim
- auth strength claim
- token lifetime
- refresh token rotation
- revocation/version claims
- JWKS rotation policy
- key ID (`kid`) rotation and rollback process

OpenID Connect expects tokens to carry stable issuer and audience semantics. Consumer apps must reject tokens for the wrong app/audience, even if they are signed by the same central auth authority.

### Gap 5: Key management is not production-grade yet

The vault plugin encrypts values with AES-GCM and derives keys from `BETTER_AUTH_SECRET`. That is useful, but it is not enough for a high-value identity service.

Issues:

- `BETTER_AUTH_SECRET` becomes too powerful. If it is leaked, both auth signing/encryption behavior and vault decryption are at risk.
- Key rotation currently appears app-level and versioned in data, but not integrated with external KMS/HSM.
- There is no documented separation between signing keys, vault encryption keys, OAuth provider secrets, webhook signing secrets, and service bridge secrets.
- There is no documented break-glass process.
- There is no documented emergency global token revocation.

Needed target:

- Separate signing key set for JWT/JWKS.
- Separate vault master key in KMS/HSM, not an app env var when possible.
- Separate Better Auth app secret.
- Separate webhook signing secret per endpoint.
- Separate service-to-service secrets with short rotation windows.
- Automated rotation playbooks.
- Key compromise runbook.
- Strict env var inventory and ownership.

### Gap 6: SSO/SCIM need end-to-end proof

The code has SSO/SCIM management tables and enterprise plugin endpoints. It also mounts Better Auth SSO in the Node runtime. However:

- Some unsafe Better Auth SSO management paths are explicitly blocked.
- `providersLimit` is set to `0` in the Node SSO options.
- The docs describe SAML/OIDC behavior, but docs are not proof of runtime correctness.

Before production:

- Test SAML login with a real IdP and a mock IdP.
- Test OIDC login with a real IdP.
- Test domain-based SSO routing.
- Test SCIM token creation, provisioning, deprovisioning, and group/role mapping.
- Verify SAML signature validation, replay protection, audience validation, and ACS URLs.
- Verify OIDC issuer, audience, JWKS, nonce/state, and redirect URI behavior.

Until then, SSO should be considered "foundation present, production proof missing."

### Gap 7: Audit logs are useful but not immutable

The audit plugin records events in Convex tables and exposes list/export. That is useful for dashboards, but compliance-grade audit needs stronger guarantees:

- append-only write policy
- no arbitrary delete/update by normal admins
- tamper-evident event hash chain or external immutable sink
- event IDs that do not rely on random client-side construction
- retention policy by plan/customer
- export to object storage or SIEM
- alerting for privileged actions

Also, the manual audit create endpoint currently requires `audit.read`; production should distinguish:

- `audit.read`
- `audit.export`
- `audit.write_custom`
- `audit.manage_retention`

### Gap 8: Webhook delivery is partial

The webhook system signs payloads and records deliveries. It attempts delivery immediately. The comments mention retry via Convex scheduler, but the current helper does not show a complete scheduled retry pipeline.

Needed:

- Durable outbox.
- Scheduled retry worker.
- Backoff per delivery.
- Dead-letter state.
- Manual replay.
- Per-endpoint delivery logs.
- Secret rotation for webhook endpoints.
- Delivery idempotency keys.
- Event type schema versioning.
- Tenant rate limits.

### Gap 9: Middleware only checks cookie presence

The Next middleware/proxy correctly documents that it checks cookie presence, not validity. That is acceptable as a UX optimization, but it should never be mistaken for authorization.

Production docs and examples should be strict:

- Middleware may hide pages or redirect.
- Server components/actions/API routes must validate auth with server helpers.
- Backend functions must enforce permissions again.

This matters for KasiLabs and similar customers because frontend shell checks are not enough for POS orders, messaging instances, AI tools, payment actions, or admin settings.

### Gap 10: End-to-end coverage is not enough

Unit tests exist and pass for important packages, but the risk in auth systems is mostly in integrated behavior.

Missing or insufficient proof areas:

- GitHub OAuth real callback flow.
- Google OAuth real callback flow.
- OAuth state preservation across hosted UI and customer app proxy.
- Project API key cannot read or write another project.
- Explicit browser `projectId` cannot override API key project.
- Hosted UI cross-domain callback and one-time-token handoff.
- Convex JWT accepted by intended app and rejected by other apps.
- Passkey register/login/delete on real browser.
- Email OTP and magic link delivery with real email provider.
- Phone OTP with SMS/WhatsApp provider.
- MFA challenge during login.
- Organization role assignment and permission enforcement across endpoints.
- Linked-device QR flow once implemented.
- Offline POS device token lifecycle once implemented.

## Recommended Product Direction For Banata

### Principle 1: Auth should remain its own product and security boundary

Banata Auth should not be a package buried inside any customer's application. It should remain a standalone service with:

- separate repository or clearly isolated monorepo workspace
- separate deployment
- separate database
- separate secrets
- separate domain
- separate monitoring
- separate incident runbooks
- separate release approvals

Customer apps should depend on it. It should not depend on customer app internals.

### Principle 2: Apps are relying clients

Each customer app should be a client of Banata Auth:

- AI Automation-style messaging/automation products
- Ecommerce POS products
- Whatspoppin-style chat products
- Internal admin consoles
- Other future customer apps

Each app gets:

- client/project identity
- allowed redirect URLs
- allowed origins
- allowed auth methods
- app audience
- permission namespace
- service-to-service credentials where needed

### Principle 3: Users, organizations, devices, sessions, and apps are separate concepts

Do not overload "user" to mean everything.

Core concepts should be:

- User: human identity.
- Organization: business/team/customer tenant.
- Project/App: software client using auth.
- Membership: user role inside org.
- Device: physical/logical device registered to a user/org.
- Session: current authentication state for a user/device.
- Service principal: non-human identity for backend-to-backend calls.
- API key: customer-managed server credential scoped to a project.

### Principle 4: Auth strength must be explicit

Every sensitive action should know whether the current session was authenticated by:

- password only
- email OTP
- phone OTP
- TOTP MFA
- passkey
- social OAuth
- enterprise SSO
- linked device approval
- admin step-up

This lets Banata require step-up auth for:

- deleting a messaging instance
- changing payment settings
- exporting customer data
- inviting admins
- creating long-lived API keys
- approving a POS terminal
- revoking devices
- changing OAuth provider credentials

### Principle 5: Permissions are enforced server-side everywhere

UI permission checks are convenience only. All critical endpoints must enforce:

- authenticated subject
- session class
- app audience
- project/client scope
- organization membership
- permission
- device trust where needed
- recent auth/step-up where needed

## Needed Additions

### 1. Phone and WhatsApp OTP auth

Add a first-class phone auth method.

Models:

- `phoneVerification`
- `phoneOtpAttempt`
- optional `phoneIdentity`

Fields:

- `projectId`
- `phoneNumberE164`
- `purpose`: `sign_in`, `sign_up`, `link_phone`, `step_up`, `recover`
- `otpHash`
- `expiresAt`
- `attemptCount`
- `resendCount`
- `lastSentAt`
- `lockedUntil`
- `channel`: `sms`, `whatsapp`, `voice`
- `providerMessageId`
- `ipAddress`
- `userAgent`

Endpoints:

- `POST /api/auth/phone/start`
- `POST /api/auth/phone/verify`
- `POST /api/auth/phone/resend`
- `POST /api/auth/phone/link`
- `POST /api/auth/phone/unlink`

Security:

- Store OTP hashes, not raw OTPs.
- Use short expiry.
- Rate limit by project, phone, IP, and device fingerprint.
- Do not reveal whether a phone already has an account.
- Prevent account takeover through unverified phone linking.
- Log all phone verification events.
- Support provider fallback but avoid automatic fallback loops attackers can abuse.

### 2. Linked-device QR auth

Add a device authorization flow for Whatspoppin and POS.

Models:

- `deviceAuthorization`
- `linkedDevice`
- `deviceSession`
- `deviceApprovalEvent`

`deviceAuthorization` fields:

- `projectId`
- `clientId`
- `deviceCodeHash`
- `userCodeHash`
- `qrNonceHash`
- `requestedScopes`
- `requestedAudience`
- `deviceName`
- `deviceType`
- `platform`
- `ipAddress`
- `userAgent`
- `expiresAt`
- `pollIntervalSeconds`
- `status`: `pending`, `approved`, `denied`, `expired`, `consumed`
- `approvedByUserId`
- `approvedAt`

Endpoints:

- `POST /api/auth/device/start`
- `POST /api/auth/device/poll`
- `POST /api/auth/device/approve`
- `POST /api/auth/device/deny`
- `POST /api/auth/device/revoke`
- `GET /api/auth/devices`

UX requirements:

- The approving device must show device name, approximate location, app, and requested access.
- The QR screen must show a short code too, so the approver can compare.
- The secondary device must never receive credentials inside the QR itself.
- The approval screen must make phishing risk clear.

Session results:

- Whatspoppin web linked session: can chat, browse, and operate normal UX, but cannot change recovery methods without step-up.
- POS terminal session: scoped to merchant/org, device, app audience, and offline permission snapshot.
- Admin-linked session: requires MFA/passkey approval and shorter lifetime.

### 3. Session class and device trust

Extend session metadata or add a related session table for:

- `sessionClass`
- `authStrength`
- `deviceId`
- `deviceTrustLevel`
- `audience`
- `scopes`
- `lastStepUpAt`
- `riskScore`
- `revokedAt`
- `revokedReason`
- `rotatedFromSessionId`

Add server helper functions:

- `requireSessionClass(...)`
- `requireAudience(...)`
- `requireOrgPermission(...)`
- `requireRecentStepUp(...)`
- `requireTrustedDevice(...)`

### 4. Token contracts

Define a versioned JWT contract.

Minimum claims:

- `iss`
- `sub`
- `aud`
- `exp`
- `iat`
- `nbf`
- `jti`
- `sid`
- `project_id`
- `org_id`
- `session_class`
- `device_id`
- `auth_strength`
- `scope`
- `token_version`

Rules:

- Access tokens should be short-lived.
- Refresh tokens should rotate.
- Refresh token reuse should revoke the session family.
- Apps must reject tokens for other audiences.
- Signing key rotation must support overlap and rollback.
- Emergency revocation must be possible by user, org, app, session class, or global key event.

### 5. KMS-backed secrets and signing keys

Replace the current "everything depends on BETTER_AUTH_SECRET" posture with separated key material.

Proposed secrets:

- `BANATA_AUTH_APP_SECRET`
- `BANATA_JWT_SIGNING_KEY_KMS_ID`
- `BANATA_VAULT_KMS_KEY_ID`
- `BANATA_REFRESH_TOKEN_PEPPER_KMS_ID`
- `BANATA_WEBHOOK_SIGNING_PEPPER`
- per-provider OAuth credentials in vault
- per-customer webhook secrets
- per-app service credentials

Required operational controls:

- key rotation schedule
- emergency rotation runbook
- break-glass admin access
- production secret access logging
- no plaintext secret dumps in logs
- no env var list output in support logs

### 6. Production SSO and SCIM hardening

SSO:

- Verify SAML AuthnRequest, ACS URL, SP metadata, IdP metadata, certificates, signed assertions, replay cache, audience, recipient, nameID, email domain, and clock skew.
- Verify OIDC discovery, issuer, client ID, client secret, JWKS, nonce, state, PKCE where applicable, and claims mapping.
- Support domain verification before routing users by email domain.

SCIM:

- Store SCIM tokens hashed.
- Support token rotation.
- Validate schemas.
- Support deprovisioning policy.
- Log all provisioning changes.
- Map groups to roles carefully.

### 7. Immutable audit and alerting

Add:

- append-only audit write path
- tamper-evident hash chain
- optional external sink to object storage/SIEM
- retention controls by plan
- alerts for high-risk events
- event taxonomy and schema versioning

High-risk events:

- admin login
- MFA disabled
- passkey removed
- OAuth provider changed
- API key created
- webhook created
- vault secret read
- linked device approved
- POS terminal approved
- organization owner changed
- support impersonation started

### 8. Webhook delivery outbox

Add:

- `webhookOutbox` or use `webhookDelivery` as durable queue
- scheduled retry worker
- exponential backoff
- dead-letter status
- manual replay endpoint
- endpoint secret rotation
- delivery attempt detail page
- idempotent event IDs

### 9. Customer-facing product readiness

For external customers, add:

- project setup wizard
- redirect URI validation UI
- provider setup checklists
- environment separation: dev, staging, prod
- API key rotation UI
- audit export UI
- org admin portal with scoped capabilities
- billing/plan gates later
- published security policy
- status page
- data retention policy
- DPA/privacy materials later

## KasiLabs Evaluation Scenarios

These scenarios are included because they are the practical flows KasiLabs would need to see working before adopting Banata Auth. They are also representative of broader customer needs: phone-first users, business accounts, staff permissions, offline devices, and linked-device login.

### AI Automation

Needs:

- Web user sign-in.
- Organization ownership.
- Staff roles.
- Service token for automation bridge.
- WhatsApp instance ownership.
- Permission: `whatsapp.instance.create`, `whatsapp.instance.delete`, `automation.reply.manage`, `ecommerce.sync`.
- Step-up required for deleting instances, rotating secrets, connecting payment providers.

### Ecommerce POS

Needs:

- Merchant organization.
- Staff/cashier roles.
- Device registration for POS terminals.
- Offline permission snapshot signed by Banata Auth.
- Local session unlock by PIN/passkey where possible.
- Owner approval for new terminal.
- Remote revocation of lost terminals.
- Audit for refunds, payment setup, catalog changes, and staff changes.

### Whatspoppin

Needs:

- Normal user identity.
- Business identity.
- Phone-first auth.
- Passkey/social/email optional.
- QR linked-device login.
- Mobile controller sessions.
- Business operator roles.
- Customer chat identity.
- Session handoff between phone and web.

### How These Improvements Benefit Other Banata Customers

The same platform capabilities would help other customers that need:

- Project creation.
- Hosted auth UI.
- Custom domain support.
- OAuth provider setup.
- API key integration.
- SDK.
- Webhooks.
- Audit logs.
- Org/RBAC.
- SSO/SCIM for larger customers.

## Required Fixes And Direction By Priority

### P0: Do before using this as production authority

1. Decide final service name/domain and deploy isolation.
2. Define token issuer, audiences, claims, and session classes.
3. Enforce audience checks in all consumer apps.
4. Add phone/WhatsApp OTP auth.
5. Add linked-device QR auth.
6. Add refresh token rotation/reuse detection if not already guaranteed by Better Auth in production deployment.
7. Separate signing keys, app secret, and vault keys.
8. Add production env var inventory and runbooks.
9. Add full end-to-end tests for hosted UI, OAuth, Convex JWT, org/RBAC, and project isolation.
10. Add security review gates before launch.

### P1: Do before onboarding external customers

1. Harden SSO and SCIM with real IdP tests.
2. Finish webhook retry/outbox.
3. Add immutable/tamper-evident audit option.
4. Add customer environment separation.
5. Add admin portal polish and least-privilege controls.
6. Add rate limit dashboards and abuse controls.
7. Add provider setup validation.
8. Add API key rotation UI and SDK docs.
9. Add operational monitoring and status reporting.

### P2: Do for mature platform quality

1. KMS/HSM backed signing and vault keys.
2. BYOK option for enterprise.
3. Device risk scoring.
4. Advanced anomaly detection.
5. Session replay/forensics tooling.
6. Fine-grained authorization beyond simple roles, if needed.
7. Enterprise compliance packaging.

## Suggested Implementation Phases

### Phase 1: Stabilize current foundation

Goal: make current code trustworthy for internal dev/staging.

Work:

- Document architecture and env vars.
- Confirm dashboard, auth-ui, and customer app proxy all work locally.
- Add missing integration tests for project API key scoping.
- Add tests proving browser-provided project IDs cannot override API-key scope.
- Add tests for hosted UI callback and one-time-token handoff.
- Add tests for Convex token issue/validation.
- Add explicit app audience configuration.
- Remove or clearly mark docs for features not production-proven.

Exit criteria:

- Targeted tests pass.
- One demo app can sign up/sign in through hosted auth.
- Convex app accepts correct token and rejects wrong-audience token.
- Project A cannot access Project B.

### Phase 2: Customer use-case coverage

Goal: support real customer products, including KasiLabs' initial evaluation scenarios.

Work:

- Implement phone OTP.
- Implement WhatsApp OTP provider path.
- Implement linked-device QR flow.
- Implement device and session class model.
- Implement POS device approval and revocation primitives.
- Implement permission presets for AI Automation, Ecommerce POS, and Whatspoppin.
- Migrate customer apps to trust Banata Auth as the shared auth authority.

Exit criteria:

- Whatspoppin can login by phone and link a desktop device.
- Ecommerce can register a POS terminal and receive an offline permission snapshot.
- AI Automation-style products can enforce org membership and app permissions through Banata Auth tokens.

### Phase 3: Production hardening

Goal: make it safe for real users and customer data.

Work:

- KMS-backed key separation.
- Refresh token family tracking.
- Emergency revocation.
- Immutable audit export.
- Webhook outbox/retry.
- SSO/SCIM real provider validation.
- Monitoring, alerting, incident runbooks.
- Security headers, CSP, cookie policy, CSRF/origin policy review.
- Pen test or focused external review.

Exit criteria:

- Security checklist signed off.
- Incident runbooks exist.
- Key rotation tested.
- Token revocation tested.
- SSO/SCIM tested.
- Webhook retries tested.

### Phase 4: Customer-ready managed platform

Goal: make this suitable for broader managed-platform customers beyond KasiLabs.

Work:

- Customer onboarding flow.
- Environment management.
- Billing/plan limits if needed.
- Published docs and API reference.
- Status page.
- Data retention controls.
- Customer support tooling.
- Admin portal hardening.

Exit criteria:

- A new customer can create a project, configure auth, integrate an app, and observe users/audit logs without engineering assistance.

## Production Launch Gates

Do not call this production-ready until these are true:

- Full monorepo typecheck passes without timeout or hidden failures.
- Full monorepo test suite passes in CI.
- E2E browser tests pass for email/password, social OAuth, OTP, passkey, logout, session refresh, and hosted UI callback.
- Project isolation tests pass.
- App audience rejection tests pass.
- Key rotation is tested.
- Session revocation is tested.
- Device revocation is tested.
- Rate limits are tested.
- Audit logs are tested.
- Webhook signatures and retry are tested.
- SSO/SCIM are either fully tested or disabled/marked beta.
- Production env vars are documented and present.
- Security headers and cookie settings are reviewed.
- Logging excludes secrets and tokens.
- Incident runbooks exist.

## Recommended Data Model Additions

### `authClient`

Represents a relying application.

Fields:

- `projectId`
- `clientId`
- `name`
- `type`: `first_party`, `customer_app`, `mobile_app`, `desktop_app`, `service`
- `allowedRedirectUris`
- `allowedOrigins`
- `allowedAudiences`
- `enabledAuthMethods`
- `createdAt`
- `updatedAt`

### `device`

Represents a registered device.

Fields:

- `projectId`
- `organizationId`
- `userId`
- `deviceName`
- `deviceType`
- `platform`
- `publicKey`
- `trustLevel`
- `lastSeenAt`
- `revokedAt`
- `createdAt`

### `deviceAuthorization`

Represents QR/device approval.

Fields:

- `projectId`
- `clientId`
- `deviceCodeHash`
- `userCodeHash`
- `status`
- `requestedScopes`
- `requestedAudience`
- `expiresAt`
- `pollIntervalSeconds`
- `approvedByUserId`
- `approvedAt`
- `createdAt`

### `sessionPolicy`

Represents configured behavior per session class.

Fields:

- `projectId`
- `sessionClass`
- `maxLifetimeSeconds`
- `idleTimeoutSeconds`
- `refreshAllowed`
- `requiresMfa`
- `requiresTrustedDevice`
- `allowedAudiences`
- `createdAt`
- `updatedAt`

### `tokenRevocation`

Represents revocation events.

Fields:

- `projectId`
- `subjectType`
- `subjectId`
- `sessionId`
- `jti`
- `reason`
- `effectiveAt`
- `createdBy`
- `createdAt`

## Recommended Test Plan

### Unit tests

- OTP generation/hashing/expiry.
- Phone normalization.
- Project scope resolution.
- API key hashing and project lookup.
- Device code polling rules.
- Token claim builder.
- Audience validation.
- Session policy evaluation.
- Permission evaluation.
- Vault encryption/decryption/rotation.
- Webhook signing/verification.

### Integration tests

- Auth route proxy injects API key.
- Explicit project mismatch returns 403.
- OAuth state survives redirect.
- Hosted UI returns to customer callback.
- Convex token issued and validated.
- API key cannot manage another project.
- Org member cannot access another org.
- Audit event written for sensitive operations.
- Webhook delivery record created.

### E2E tests

- Email/password signup/signin/logout.
- GitHub OAuth.
- Email OTP.
- Phone OTP.
- Passkey registration and sign-in.
- MFA setup and sign-in challenge.
- QR linked-device approval.
- POS terminal registration.
- Admin API key rotation.
- SSO with test IdP.
- SCIM provisioning/deprovisioning.

## Open Questions

1. Should Banata Auth remain Convex-backed for v1, or should Banata move to a Postgres/KMS-based identity service while still issuing Convex-compatible tokens?
2. Should Banata support customer-managed custom auth domains from the start, or begin with Banata-hosted domains and add custom domains later?
3. Should a customer like KasiLabs use one Banata project with multiple clients, or separate projects per app?
4. What is the minimum auth strength for business owners, staff, POS cashiers, and Whatspoppin normal users?
5. What device trust level is required for AI actions that can send messages or spend money?
6. How should Banata handle account recovery for phone-first users?
7. How long can offline POS sessions operate without recontacting Banata Auth?
8. Which customers need SSO/SCIM first?

## Final Recommendation

Banata should improve this project rather than starting from scratch. It already contains the hard-to-recreate product skeleton: dashboard, hosted auth UI, SDKs, Convex integration, org/RBAC, project API keys, audit, webhooks, vault, and docs.

But Banata should not treat it as done. The work ahead is to turn it from "auth platform foundation" into a hardened identity authority:

1. Make tenancy and token boundaries explicit.
2. Add phone/WhatsApp OTP and QR linked devices.
3. Introduce session/device classes.
4. Separate keys and harden secrets.
5. Prove everything with integration and E2E tests.
6. Add production operations: monitoring, runbooks, alerts, rotation, and incident response.

Once those are done, Banata Auth would be much better positioned to satisfy KasiLabs' requirements and would also become more credible for other customers with phone-first, device-heavy, multi-app, or enterprise identity needs.
