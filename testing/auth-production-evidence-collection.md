# Auth Production Evidence Collection

Use this guide after the code is deployed and an authorized operator has access to the production Vercel, Convex, provider, monitoring, and security-review systems.

Do not paste secrets, OTP codes, cookies, private keys, access tokens, refresh tokens, provider client secrets, or raw customer identifiers into this repository. Record redacted metadata, screenshots or exports stored in the approved evidence store, run URLs, message IDs with redacted recipients, and reviewer decisions.

## Prerequisites

- GitHub access to `Banata-Labs/banata-auth`.
- Vercel access for dashboard, hosted UI, docs, and any customer harness projects.
- Convex access for the production auth deployment.
- Access to the selected SMS, WhatsApp, email, GitHub OAuth, Google OAuth, SSO, SCIM, KMS/HSM, monitoring, alerting, status-page, and incident-management systems.
- A location for private evidence artifacts that should not be committed to the repository.

## 1. CI And Release Evidence

Collect:

- GitHub Actions CI run URL for the exact launch commit.
- GitHub Actions Release run URL for the exact launch commit.
- Confirmation that `bun run verify:auth-local-readiness` passed in CI.
- Artifact or log-retention location.

Commands:

```bash
git rev-parse HEAD
gh run list --branch main --limit 10
gh run view <ci-run-id>
gh run view <release-run-id>
```

Update:

- `testing/auth-production-gates.json` gate `ci-monorepo-checks`.
- `testing/auth-readiness-completion-audit.md` command/evidence notes.

## 2. Domain And Deployment Isolation

Collect:

- Final service names and domains for auth, hosted UI, docs, dashboard, and customer callback hosts.
- Vercel project IDs and deployment IDs for production, staging, and development.
- Convex deployment identifiers for production, staging, and development.
- Proof that databases, secrets, OAuth apps, email providers, SMS providers, webhook endpoints, and API keys are environment-specific.
- Rollback or migration plan for any domain cutover.

Commands:

```bash
bun run verify:auth-live-smoke
vercel.cmd project ls
vercel.cmd deployments ls --prod
bunx convex env list --prod
```

The Vercel and Convex commands require an authorized account or token. Commit only redacted identifiers and evidence references.

Update:

- `testing/auth-production-gates.json` gate `final-domain-deploy-isolation`.

## 3. Production Environment Inventory

Collect:

- Redacted production variable inventory for Convex, Vercel, and customer harness server/client environments.
- Secret-store or deployment metadata showing every required variable is present.
- Proof that production, staging, and development values are separate.
- Log review evidence showing secrets, tokens, cookies, OTPs, and environment dumps are not printed.

Commands:

```bash
bun run verify:auth-env-inventory-template
bunx convex env list --prod
vercel.cmd env ls production
```

Fill a copy of `testing/auth-production-env-inventory-template.json` with redacted metadata. Keep raw values out of git.

Update:

- `testing/auth-production-gates.json` gate `production-env-inventory`.

## 4. SMS, WhatsApp, And Phone OTP Session Evidence

Collect:

- Selected SMS provider name, environment, sender identity, and credential reference.
- Selected WhatsApp provider name, environment, phone number ID, template name, and credential reference.
- Successful SMS OTP send log with provider message ID and redacted recipient.
- Successful WhatsApp OTP send log with provider message ID and redacted recipient.
- Phone OTP sign-in that creates a real deployed session.
- Phone link flow attaching an E.164 phone identity to an existing user.
- Expired, replayed, and wrong-code failures without account enumeration.
- Audit events for start, verify, link, unlink, and failed attempts.

Use the deployed app and provider dashboards. Record message IDs, timestamps, environment names, and redacted recipients only.

Update:

- `testing/auth-production-gates.json` gates `sms-whatsapp-provider-delivery` and `phone-otp-session-issuance`.
- `testing/auth-e2e-scenarios.json` scenarios `phone-otp-sms` and `phone-otp-whatsapp`.

## 5. Browser E2E Evidence

Collect browser reports for:

- Email/password sign-up, sign-in, logout, and session refresh.
- Refresh-token rotation, old-token reuse rejection, and session-family revocation.
- GitHub and Google OAuth.
- Email OTP, phone OTP SMS, and phone OTP WhatsApp.
- Passkey registration/sign-in and MFA challenge.
- Hosted UI callback and customer-app return.
- Project isolation and wrong-audience token rejection.

Commands:

```bash
bun run verify:auth-e2e-scenarios
bun run test:e2e
```

`bun run test:e2e` should fail until every required scenario is marked `passed` with evidence.

Update:

- `testing/auth-e2e-scenarios.json`.
- `testing/auth-production-gates.json` gate `browser-e2e-core-auth`.

## 6. Real OAuth Provider Evidence

Collect:

- GitHub OAuth app callback URI screenshot or config export.
- Google OAuth app callback URI screenshot or config export.
- Successful callback logs for dashboard, hosted UI, and customer app domains.
- Origin and redirect URI mismatch rejection evidence.

Expected managed callback pattern:

```text
https://auth.banata.dev/api/auth/callback/{provider}
```

Update:

- `testing/auth-production-gates.json` gate `real-oauth-providers`.

## 7. SSO And SCIM Evidence

Collect:

- SAML or OIDC test IdP metadata and Banata provider configuration evidence.
- Successful enterprise SSO login with signed assertion or OIDC callback evidence.
- SCIM create, update, deactivate, and token rotation evidence.
- If not launching SSO/SCIM, owner-approved `disabled-with-owner` or beta decision evidence.

Update:

- `testing/auth-production-gates.json` gate `sso-scim-real-idp`.

## 8. KMS/HSM Key Custody Evidence

Collect:

- Validated `ProductionKeyCustody` payload for production.
- Distinct custody references for app secret, JWT signing, vault, refresh-token pepper, webhook signing, and offline POS snapshot signing.
- Access logging evidence for each custody provider.
- Emergency rotation drill or rollback evidence.

Commands:

```bash
bun run --cwd packages/shared test -- key-custody
```

Update:

- `testing/auth-production-gates.json` gate `kms-key-custody`.

## 9. Monitoring, Alerts, Status, And Incident Evidence

Collect:

- Validated operations-readiness evidence payload.
- Monitoring dashboards for required auth signals.
- Alert route tests for auth outage, provider failure, audit sink failure, and webhook dead-letter growth.
- Status page or customer communication evidence.
- Incident drill records for key compromise, API key leak, OAuth compromise, webhook outage, audit sink failure, and account takeover.

Commands:

```bash
bun run verify:auth-operations-readiness
```

Update:

- `testing/auth-operations-readiness.json`.
- `testing/auth-production-gates.json` gate `monitoring-alerting-incident-response`.

## 10. Security Review Signoff

Collect:

- Completed security review checklist.
- Reviewer name, date, scope, and signoff decision.
- Findings disposition for headers, CSP, cookies, CSRF/origin, OAuth callbacks, secret redaction, and incident logging.
- Accepted open risks with named owners.

Commands:

```bash
bun run verify:auth-security-review
```

Update:

- `testing/auth-security-review-checklist.json`.
- `testing/auth-production-gates.json` gate `security-review-signoff`.

## Final Verification

After updating evidence files:

```bash
bun run verify:auth-readiness
bun run verify:auth-production-gates
git diff --check
```

Production readiness is not complete until `bun run verify:auth-production-gates` passes.
