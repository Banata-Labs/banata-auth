# Banata Customer Example App

This app is the customer-style readiness harness for Banata Auth. It should behave like an external customer application, not like a first-party dashboard or internal hosted UI.

## What It Tests

- Browser traffic calls this app at `http://localhost:3002`.
- The Vite dev server forwards `/api/*` to the app server at `http://localhost:8787`.
- The app server proxies `/api/auth/*` to `BANATA_AUTH_URL`.
- The app server injects `BANATA_API_KEY` server-side.
- The browser never receives `BANATA_API_KEY`.
- The browser can launch Banata-rendered hosted UI through `VITE_BANATA_HOSTED_AUTH_URL` and `VITE_BANATA_CLIENT_ID`.
- The app completes hosted-auth one-time-token handoff at `/auth/callback`.
- The app reads the authenticated session through `/api/auth/get-session`.
- Customer app APIs use the authenticated Banata session to load organizations, members, and tickets.

The app intentionally does not use `allowInternalProjectScope`. That flag is for first-party Banata surfaces only.

## Environment

Create `apps/example-app/.env.local` from `.env.local.example`:

```env
APP_URL=http://localhost:3002
SERVER_URL=http://localhost:8787
BANATA_API_KEY=banata_live_or_test_project_key
BANATA_AUTH_URL=https://auth.banata.dev
VITE_BANATA_CLIENT_ID=project_client_id_from_dashboard
VITE_BANATA_HOSTED_AUTH_URL=https://auth-ui.banata.dev
PORT=8787
```

Use a project API key and client ID from the Banata dashboard. For self-hosted testing, set `BANATA_AUTH_URL` and `VITE_BANATA_HOSTED_AUTH_URL` to the deployed auth service and hosted UI URLs instead.

## Local Readiness Test

From the repo root:

```bash
bun install
bun run --cwd apps/example-app typecheck
bun run --cwd apps/example-app build
bun run --cwd apps/example-app db:reset
bun run --cwd apps/example-app dev
```

Open `http://localhost:3002`.

Verify:

1. The sign-in page loads available auth methods from `/api/auth/banata/config/public`.
2. Sign-up or sign-in succeeds through the configured Banata project.
3. The hosted sign-in/sign-up button opens `VITE_BANATA_HOSTED_AUTH_URL` with `client_id` and `redirect_url`.
4. Hosted UI redirects back to `/auth/callback` when using hosted auth handoff.
5. `/auth/callback` verifies the one-time token and redirects to `/app`.
6. `/app` loads the authenticated user and organization state.
7. Creating an organization succeeds.
8. Creating, updating, commenting on, and deleting a ticket respects the app role.
9. Browser devtools never show `BANATA_API_KEY` in client JavaScript, local storage, query strings, or request bodies.
10. Server logs and auth errors do not print session tokens, cookies, API keys, or one-time tokens.

## Production Readiness Evidence

Record the result in `testing/auth-production-gates.json` under `browser-e2e-core-auth` only after testing against a deployed or production-like Banata auth service with real configured providers. Local success is useful evidence, but it is not enough to mark the production launch gate complete.
