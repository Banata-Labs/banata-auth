# Auth Readiness Test Guide

Use this guide after pushing or before a production-readiness review. The goal is to prove that Banata Auth works as a managed auth service and that the example app consumes it like a real customer application.

## 1. Local Static Checks

Run from the repo root:

```bash
bun run verify:auth-local-readiness
```

That command runs the full local pre-push set. To run the same checks manually:

```bash
bun install
bun run typecheck
bun run test
bun run verify:auth-readiness
bun run verify:auth-e2e-scenarios
bun run verify:auth-security-review
bun run verify:auth-operations-readiness
bun run verify:auth-maturity-readiness
bun run verify:auth-production-gate-template
bun run --cwd apps/docs build
git diff --check
```

Expected result:

- All commands pass except `bun run verify:auth-production-gates`.
- `bun run verify:auth-production-gates` should fail while external/manual evidence is still pending.

## 2. Example App Customer Harness

Run a shallow live smoke check against the hosted service URLs:

```bash
bun run verify:auth-live-smoke
```

To also verify project-scoped public config, include a project client ID or project ID:

```bash
BANATA_CLIENT_ID=project_client_id_from_dashboard bun run verify:auth-live-smoke
```

Expected result:

- `auth-root` returns 200 or a redirect from the deployed auth service.
- `hosted-ui-root` returns 200 or a redirect from the hosted UI.
- `docs-root` returns 200 or a redirect from the docs site.
- `auth-public-config` passes when a valid `BANATA_CLIENT_ID`, `VITE_BANATA_CLIENT_ID`, or `BANATA_PROJECT_ID` is provided.

Create `apps/example-app/.env.local`:

```env
APP_URL=http://localhost:3002
SERVER_URL=http://localhost:8787
BANATA_API_KEY=your_project_api_key
BANATA_AUTH_URL=https://auth.banata.dev
VITE_BANATA_CLIENT_ID=project_client_id_from_dashboard
VITE_BANATA_HOSTED_AUTH_URL=https://auth-ui.banata.dev
PORT=8787
```

For self-hosted testing, replace `BANATA_AUTH_URL` and `VITE_BANATA_HOSTED_AUTH_URL` with the deployed auth service and hosted UI URLs.

Run:

```bash
bun run --cwd apps/example-app typecheck
bun run --cwd apps/example-app build
bun run --cwd apps/example-app db:reset
bun run --cwd apps/example-app dev
```

Open `http://localhost:3002`.

Verify:

1. `/api/auth/banata/config/public` returns the project auth configuration.
2. The browser can sign up or sign in through the configured project.
3. The hosted sign-in/sign-up button opens the Banata hosted UI with `client_id` and `redirect_url`.
4. Hosted auth redirects back to `/auth/callback?ott=...` when using hosted handoff.
5. `/auth/callback` verifies the one-time token through `/api/auth/cross-domain/one-time-token/verify`.
6. The app redirects to `/app` and `/api/app/bootstrap` returns the authenticated user.
7. Organization create, switch, invite, and role flows use the Banata session.
8. Ticket create, update, comment, and delete flows enforce customer app roles.
9. `BANATA_API_KEY` is only present in server-side requests to Banata Auth.

## 3. Provider And Browser E2E Gates

Run browser E2E against a deployed or production-like environment and attach the report to `testing/auth-production-gates.json`.

Required scenarios:

- email/password sign-up, sign-in, logout
- refresh-token rotation, old-token reuse rejection, and session-family revocation
- email OTP
- phone OTP through SMS or WhatsApp
- GitHub OAuth
- Google OAuth
- passkey registration and sign-in
- TOTP MFA challenge
- session refresh
- hosted UI callback
- customer app return
- project isolation
- wrong-audience token rejection

## 4. External Service Gates

Attach evidence in `testing/auth-production-gates.json` for:

- full monorepo typecheck and test suite passing in CI for the exact launch commit
- real SMS/WhatsApp OTP provider delivery
- phone OTP creating or linking a real session
- real GitHub and Google callback URI/origin proof
- SAML/OIDC SSO and SCIM provisioning/deprovisioning against real IdPs, or explicit beta/disabled launch decision
- KMS/HSM-backed signing, vault, refresh-token, and offline POS snapshot key custody
- production environment variables present in the target deployment, environment-scoped, and excluded from logs
- monitoring, alerting, status reporting, and incident response verification
- security review signoff

After each evidence update:

```bash
bun run verify:auth-production-gates
bun run verify:auth-readiness
```

For each gate marked `passed`, add one meaningful evidence reference for every required item in `testing/auth-production-gate-evidence-template.json`. A short placeholder or a single catch-all link will fail the gate checker.

Production is not ready until `bun run verify:auth-production-gates` passes.
