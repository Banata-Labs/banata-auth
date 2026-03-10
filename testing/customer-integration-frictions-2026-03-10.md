# Customer Integration Frictions - 2026-03-10

## 1. Hosted dashboard GitHub sign-in is a hard blocker

- Product surface tested: `https://auth.banata.dev/sign-in`
- Reproduced in a clean headed `agent-browser` session after the latest Convex prod deploy.
- Clicking `Continue with GitHub` returns the user to the same sign-in page with:
  - `Unable to sign in with github`
- Browser console shows:
  - `POST /api/auth/sign-in/social` -> `403`
- This blocks the very first dashboard login step for a new customer.
- Local dashboard (`http://localhost:3000`) did not reproduce the same failure.

## 2. React docs and published package types disagree on `SignInForm`

- Docs currently show `SignInForm` accepting:
  - `onSuccess`
  - `onError`
- Published package tested: `@banata-auth/react@0.1.2`
- Actual result during customer-app build:
  - `Property 'onError' does not exist on type 'SignInFormProps'`
- Impact:
  - A customer copying the docs example hits a TypeScript build error immediately.
- Temporary workaround in the test app:
  - remove `onError` and rely on the component's built-in error handling

## 3. Base URL/env naming is still unclear across docs

- `@banata-auth/nextjs` docs use `NEXT_PUBLIC_CONVEX_SITE_URL`
- `@banata-auth/sdk` docs use `BANATA_AUTH_BASE_URL`
- In practice, the customer has to determine whether these are:
  - the same value
  - different values
  - dashboard origin vs `.convex.site`
- This is not obvious from the docs alone.

## 4. Server-side session payload retrieval is not documented for Next.js

- Docs cover:
  - route proxy setup
  - `isAuthenticated()`
  - `getToken()`
- The test app also needs the full signed-in user/session payload in Server Components and server actions.
- There is no obvious documented helper for that flow.
- Temporary workaround in the test app:
  - call the app's own proxied `/api/auth/get-session` route from the server with forwarded cookies

## 5. The documented `createAuthClient({ baseURL: "/api/auth" })` breaks `next build`

- Docs currently show:
  - `createAuthClient({ baseURL: "/api/auth" })`
- In the App Router ticketing app, the published package tries to resolve the base URL during server prerender.
- Actual build failure:
  - `Invalid base URL: /api/auth. Please provide a valid base URL.`
- Impact:
  - A customer who copies the docs literally hits a production build failure even though dev mode can appear fine.
- Temporary workaround in the test app:
  - use an absolute server-side fallback:
    - `http://localhost:3001/api/auth` during SSR
    - `"/api/auth"` in the browser

## 6. Relative auth client URLs also fail at runtime in the browser

- After patching for SSR, the sign-in page still crashed in dev with:
  - `Invalid base URL: /api/auth. Please provide a valid base URL.`
- That means the published auth client currently expects an absolute URL in practice, not the relative `"/api/auth"` shown in docs.
- Impact:
  - Customers can hit a runtime failure even after fixing the build issue.
- Temporary workaround in the test app:
  - use `NEXT_PUBLIC_SITE_URL + "/api/auth"` for both server and browser

## 7. Relative `callbackURL` redirects the user into Banata instead of back to the customer app

- The rebuilt customer app used:
  - `callbackURL="/"` on `SignInForm`
- Result after GitHub OAuth:
  - user landed on `http://localhost:3000/` (Banata dashboard root)
  - not `http://localhost:3001/` (the customer app)
- This suggests the callback is being resolved relative to the Banata instance rather than the app origin.
- Impact:
  - successful social sign-in can dump the user into the provider dashboard instead of returning them to their own product.
- Temporary workaround in the test app:
  - use an absolute callback URL:
    - `http://localhost:3001/`

## 8. Organization bootstrap can fail because list and create are inconsistent

- After auth finally returned to the customer app, the first server render tried to bootstrap the helpdesk workspace.
- Observed behavior:
  - `listOrganizations({ limit: 50 })` did not return `company-support-desk`
  - `createOrganization({ slug: "company-support-desk" })` then failed with:
    - `Organization slug already exists`
- Impact:
  - a customer can complete auth successfully and still hit a hard 500 on first load
  - the API surface makes it unclear whether the issue is eventual consistency, project scope, pagination, or list filtering
- Temporary workaround in the test app:
  - catch duplicate-slug errors
  - refetch organizations
  - reuse the existing organization if it appears on the second read

## 9. First authenticated page load is highly rate-limit sensitive

- After login, the customer app's first authenticated render triggered Banata admin/RBAC calls for:
  - organization bootstrap/listing
  - multiple permission checks
- Observed failure:
  - `Rate limit exceeded.`
- Impact:
  - a customer can authenticate successfully and still hit a 500 on the very first page load
  - the obvious implementation pattern of parallel permission checks is fragile
- Temporary workaround in the test app:
  - remove the redundant organization list call
  - switch the permission checks from parallel to sequential requests

## 10. Hosted production was drifting from the actual auth backend

- The hosted frontend for `https://auth.banata.dev` was already deployed, but its
  Convex production backend (`warmhearted-peccary-760`) had not been redeployed
  after the API key metadata fix landed.
- Result:
  - hosted dashboard returned:
    - `400 {"code":"METADATA_IS_DISABLED","message":"Metadata is disabled."}`
  - local dashboard did not
- Root cause confirmed:
  - there was no automated Convex production deploy wired into the Vercel build
  - CI and Vercel could both be green while the hosted Convex auth runtime stayed stale
- Action taken:
  - manually deployed the clean `origin/main` snapshot to Convex prod
  - added a Vercel deployment script path in `apps/dashboard/package.json`
  - documented the required `CONVEX_DEPLOY_KEY` setup in `apps/dashboard/README.md`
- Remaining blocker:
  - hosted GitHub sign-in is still failing with a 403 before the redirect, so
    the production API key UI could not be re-verified end-to-end in the hosted app
