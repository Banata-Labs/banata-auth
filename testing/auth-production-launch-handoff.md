# Auth Production Launch Handoff

Date: 2026-05-21

This handoff separates what is ready in the repository from what must be proven after deployment.

## Local Readiness

Run these before pushing or cutting a release:

- `bun run verify:auth-local-readiness`

Or run the same checks manually:

- `bun run typecheck`
- `bun run test`
- `bun run verify:auth-readiness`
- `bun run verify:auth-e2e-scenarios`
- `bun run verify:auth-security-review`
- `bun run verify:auth-operations-readiness`
- `bun run verify:auth-env-inventory-template`
- `bun run verify:auth-maturity-readiness`
- `bun run verify:auth-production-gate-template`
- `bun run --cwd apps/docs build`
- `git diff --check`

Expected local result: all commands above pass.

## Customer App Harness

Use `apps/example-app` to test Banata Auth like a real customer app. Configure `apps/example-app/.env.local` with a project API key and the deployed or production-like `BANATA_AUTH_URL`, then follow `apps/example-app/README.md`.

The harness must prove:

- `BANATA_API_KEY` is injected only by the example app server.
- `/api/auth/*` is proxied to the configured Banata auth service.
- hosted sign-in/sign-up opens the configured hosted UI with project `client_id` and customer `redirect_url`.
- hosted auth returns to `/auth/callback` and completes one-time-token handoff.
- `/api/app/bootstrap` returns the authenticated user and organization state.
- customer app organization, role, and ticket APIs enforce the Banata session.

## Production Gate Evidence

After deployment, use `testing/auth-production-gate-evidence-template.json` to collect real evidence for each gate, then update `testing/auth-production-gates.json`.

Use `testing/auth-production-env-inventory-template.json` for the production environment inventory gate. Keep every secret redacted. Record deployment metadata, runtime ownership, environment scope, secret-store references, and log-review evidence only.

Run:

- `bun run verify:auth-production-gates`

Expected production-launch result: this command passes only when every gate is either `passed` with evidence or `disabled-with-owner` with owner-approved evidence.

For `passed` gates, attach one meaningful evidence reference for each required evidence item in `testing/auth-production-gate-evidence-template.json`. Placeholder strings, short notes, or a single catch-all link are not enough.

## Do Not Mark Production Ready Until

- The final service name and production domains are recorded, DNS/HTTPS is live, and dev/staging/prod deployments are isolated.
- SMS and WhatsApp OTP delivery are proven with production-like providers.
- Full monorepo typecheck and tests pass in CI for the exact launch commit.
- Phone OTP creates or links a real authenticated session.
- Browser E2E passes on the deployed auth flows.
- GitHub and Google OAuth callbacks are verified against real provider settings.
- SSO and SCIM are verified against real IdPs or explicitly disabled/beta with an owner.
- KMS/HSM custody evidence exists for signing, vault, refresh-token, webhook, and offline POS keys.
- Production environment variables are present, environment-scoped, and excluded from logs.
- Monitoring, alerting, status reporting, and incident drills are verified.
- Security review signoff is recorded.

## Primary References

- `AUTH_PRODUCTION_READINESS_AUDIT.md`
- `testing/auth-readiness-completion-audit.md`
- `testing/auth-production-gates.json`
- `testing/auth-production-gate-evidence-template.json`
- `testing/auth-production-env-inventory-template.json`
- `testing/auth-readiness-test-guide.md`
- `testing/auth-incident-runbooks.md`
- `apps/example-app/README.md`
- `apps/docs/content/docs/production-readiness.mdx`
