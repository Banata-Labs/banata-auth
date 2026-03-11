# Customer Integration Frictions - 2026-03-11

Test surface:
- External customer app: `D:\SHUJAA PERSONAL PROJECTS\banata-ticketing-e2e`
- Customer app origin: `http://localhost:3100`
- Hosted dashboard: `https://auth.banata.dev`
- Hosted auth UI: `https://auth-ui.banata.dev`
- Integration style: published npm packages only, rebuilt from scratch, hosted UI path

## 1. Hosted UI integration is still undocumented for customer apps

- The public docs cover the app-owned `/api/auth` proxy and local React forms.
- They do not explain the customer-facing hosted UI contract at all.
- To even begin the hosted flow, the app had to infer:
  - hosted UI base URL
  - required `client_id`
  - optional `redirect_url`
- A customer following only the docs would not know how to start the hosted UI flow.

## 2. Workspace identity and project client ID are easy to confuse

- The hosted dashboard UI prominently showed:
  - workspace name: `shujaa-banata Workspace`
- The actual project used by the hosted auth runtime was:
  - project name: `Default Project`
  - project client ID: `default`
- Using the workspace slug as `client_id` caused:
  - `PROJECT_NOT_FOUND_FOR_THE_SUPPLIED_BANATA_SCOPE`
- Actual request that failed before correction:
  - `POST https://auth-ui.banata.dev/api/auth/banata/config/public`
  - body: `{"clientId":"shujaa-banata"}`
- After switching to `clientId: "default"`, the public config endpoint returned `200`.

## 3. Auth methods must be configured in the dashboard before hosted auth works

- The hosted UI initially failed with:
  - `Unable to load this project's auth configuration.`
- Once the correct `client_id` was used, the hosted UI loaded and reflected the dashboard config.
- The test project had every auth method disabled by default.
- I had to enable `Email + Password` from:
  - `https://auth.banata.dev/authentication/methods`
- This is a real prerequisite for first-run testing and should be explicit in docs.

## 4. Providers are a separate prerequisite from methods

- Enabling a method is not enough for hosted sign-in parity.
- On the hosted dashboard, provider credentials are configured separately under:
  - `Authentication -> Providers`
- The project had:
  - `Configured: 0`
  - `Enabled: 0`
- So even after the hosted UI loaded, there were no social buttons because provider credentials had never been configured for that project.
- Docs should spell out the two-step dependency:
  - enable the method
  - configure the provider for the project

## 5. The test app's original API key was not actually usable as a project-scoped key

- The previous key in the external app produced:
  - `ForbiddenError: This API key is not scoped to a Banata project.`
- I had to mint a fresh key from the hosted dashboard UI under the actual project.
- This means app setup can silently look valid while still failing later in SDK/admin calls.
- Docs should tell customers how to verify they created a project-scoped key, not just “an API key”.

## 6. Hosted UI now loads correctly once the real project client ID and fresh API key are used

- Corrected setup:
  - `BANATA_CLIENT_ID=default`
  - fresh hosted dashboard API key
- Result:
  - `https://auth-ui.banata.dev/sign-in?client_id=default&redirect_url=http://localhost:3100/`
  - loaded successfully
  - rendered email/password inputs
- This confirms the hosted backend itself is working for public config lookup after correct dashboard setup.

## 7. Email/password onboarding is still rough for first-time customer testing

- The hosted sign-up UI immediately warns:
  - `Email verification is required.`
- The methods page describes email/password as having “configurable security policies”.
- But the hosted dashboard did not expose an obvious first-class setting to change or relax that verification requirement.
- Repo audit also shows the dashboard auth methods page only exposes on/off toggles, not email/password policy controls.

## 8. The docs do not clearly say email delivery must be ready before hosted email/password becomes practical

- If a customer enables email/password in the hosted UI path, the next practical dependency is email delivery.
- The current hosted onboarding story does not make this explicit enough.
- The docs should tell customers, before they test sign-up:
  - configure an email provider
  - confirm verification emails can be sent
  - confirm the relevant templates are active

## 9. Hosted UI loses `redirect_url` when navigating from sign-up back to sign-in

- Initial sign-up URL:
  - `https://auth-ui.banata.dev/sign-up?client_id=default&redirect_url=http://localhost:3100/`
- After clicking `Sign in` from the sign-up screen, the URL became:
  - `https://auth-ui.banata.dev/sign-in?client_id=default`
- `redirect_url` was dropped.
- This is a real hosted-UI bug because cross-page auth navigation should preserve the customer app return target.

## 10. Existing-user behavior is not obvious enough in first-run testing

- Sign-up with `gideonshujaa@banata.dev` returned:
  - `User already exists. Use another email.`
- Sign-in with the same email/password returned:
  - `Invalid email or password`
- This is not necessarily incorrect, but the customer experience is opaque:
  - the user exists somewhere in Banata
  - but not with usable password credentials for this project flow
- For first-run testing, this creates confusion around whether identity is global, project-scoped, or both.

## 11. Current blocker to a full external-app session handoff

- I have not completed the final “hosted UI -> authenticated session on the customer app domain” step yet.
- The remaining blocker is not the `client_id` lookup anymore.
- The blocker is getting a verified, project-usable credential flow in the hosted UI path:
  - social providers are not configured for the project
  - email/password sign-up requires verification
  - the dashboard does not currently surface the relevant verification-policy controls clearly enough

## 12. Hosted UI is not yet wired to finish auth on the customer app domain

- Repo audit of the hosted UI confirms it still behaves as a Banata-first flow:
  - sign-in uses the hosted UI's own `/api/auth`
  - successful auth routes to `/org-selector` on `auth-ui.banata.dev`
  - org selection routes to `/callback` on `auth-ui.banata.dev`
- There is no completed external-app handoff path yet that:
  - preserves `redirect_url`
  - exchanges the hosted session into the customer app's `/api/auth` proxy
  - lands the user back on the customer app with a usable cookie on the customer domain
- So today the hosted UI path for customer apps is not just under-documented; it is architecturally incomplete for the WorkOS-style experience we want.

## 13. Verified underlying behavior during this pass

- `POST https://auth-ui.banata.dev/api/auth/banata/config/public` with `{"clientId":"default"}` returned `200`
- `POST https://auth.banata.dev/api/auth/banata/config/public` with `{"clientId":"default"}` returned `200`
- `GET https://auth-ui.banata.dev/api/auth/get-session` returned `200 null` in a clean unauthenticated browser
- The rebuilt customer app on `http://localhost:3100/sign-in` now points to hosted Banata correctly and no longer uses stale localhost Banata URLs

## 14. Code-driven email/password policy sync was broken, then fixed in source

- Reproduced with the published SDK against hosted Banata:
  - `saveDashboardConfig({ emailPassword: { requireEmailVerification: false } })`
  - followed by `getDashboardConfig()`
- Before the fix, the response still returned:
  - `"requireEmailVerification": true`
- Root cause in source:
  - the dashboard config plugin deep-merge helper never merged the nested `emailPassword` object
- Fix is on `main` in source, but this did not require an npm package release because the hosted dashboard/runtime picked it up directly after deploy.

## 15. Hosted dashboard login was misconfigured for production

- Reproduced on `https://auth.banata.dev/api-keys`
- After GitHub login, the dashboard first tried to send the browser to:
  - `http://localhost:3003/api-keys?ott=...`
- After the first fix, it then tried to send the browser to:
  - `https://auth-ui.banata.dev/api-keys?ott=...`
- Both are wrong for dashboard account login.
- Root causes in source:
  - dashboard runtime was falling back to `AUTH_UI_URL ?? "http://localhost:3003"` in production
  - dashboard account auth was also incorrectly using the hosted-UI cross-domain path intended for customer project auth
- Fixes are now on `main` in source:
  - production no longer falls back to localhost for hosted UI URL derivation
  - dashboard account auth no longer uses the hosted-UI handoff path
- After the fix, hosted dashboard login returns correctly to:
  - `https://auth.banata.dev/api-keys`

## 16. Fresh project-scoped hosted API key creation now works end to end

- Created successfully in the hosted dashboard UI:
  - key name: `ticketing-e2e-fresh`
- The raw key value was shown once and copied into the external app env.
- After switching the external app to this fresh key, live SDK config updates succeeded.

## 17. Hosted UI sign-up still hangs with published `@banata-auth/nextjs@0.2.1`

- Current live customer flow:
  - external app opens hosted sign-up on `https://auth-ui.banata.dev/sign-up?client_id=default&redirect_url=http://localhost:3100/`
  - hosted UI posts to the customer app proxy:
    - `POST http://localhost:3100/api/auth/sign-up/email`
- Direct verification of the customer app proxy shows the backend response is healthy:
  - `200`
  - returns JSON user payload
  - returns a session cookie
- But the hosted UI remains stuck on:
  - `Creating account...`
- Root cause found in source:
  - the customer app Next.js auth proxy returns `Set-Cookie`
  - the hosted cross-domain client expects `Set-Better-Auth-Cookie`
  - so the cross-domain auth client never completes the cookie handoff
- Fix is on `main` in source:
  - `@banata-auth/nextjs` route handler now mirrors `Set-Cookie` into `Set-Better-Auth-Cookie` for allowed hosted origins
- This fix still requires a new npm package release before the external app can validate it, because the customer app is intentionally pinned to published npm packages only.

## 18. Hosted public config was temporarily broken by project-scoped rate limiting

- During this pass, hosted public-config reads started failing with:
  - `AUTH_RUNTIME_ERROR`
- Root cause in source:
  - the custom project-scoped rate limiter was trying to add `projectId` to Better Auth's built-in `rateLimit` schema, which Better Auth does not expose as an extensible model
  - then a follow-up attempt used the wrong adapter surface in the `onRequest` hook
- Fixes are now on `main` and deployed:
  - project scope is bound into auth storage per request
  - the custom limiter now scopes by a project-qualified key on Better Auth's native rate-limit table
- Verified healthy again:
  - `POST https://auth.banata.dev/api/auth/banata/config/public` -> `200`
  - `POST https://auth-ui.banata.dev/api/auth/banata/config/public` -> `200`

## 19. Shared-IP testing can still feel harsher than expected even after project scoping

- Project scoping fixed cross-project contamination, but repeated testing from the same IP was still enough to trip the hosted sign-up/sign-in forms.
- Source improvement now deployed:
  - email-based auth limits are bucketed by `project + ip + path + submitted identifier`
- This removed the immediate false-positive `Rate limit exceeded` state for a fresh signup identity on the hosted page.
- Remaining UX gap:
  - the hosted UI still needs clearer retry messaging and a smoother recovery path when throttling does happen.

## 20. Hosted sign-up still needs one more clean end-to-end confirmation

- After the rate-limit fixes, the hosted sign-up page no longer showed the immediate throttle error for a fresh email.
- However, the final browser-driven submit still did not conclusively land back on the customer app during this pass.
- I was able to verify:
  - hosted config lookup works
  - the limiter no longer hard-blocks fresh email identities the same way it did earlier
- I was not yet able to verify in the browser:
  - `hosted sign-up -> customer-app session cookie -> redirected customer app home`
- So this remains an active verification item, not a closed issue.
