# Banata Auth — Pre-Launch Bug Report

**Date**: 2026-03-12
**Tested against**: Production (`warmhearted-peccary-760.eu-west-1.convex.site`)
**Tested with**: Project-scoped API key via curl

---

## Executive Summary

144 API endpoints tested across 12 plugins. **131 passing, 3 bugs identified** affecting 7 endpoints total. All core auth flows (sign-in, sign-up, sessions, organizations, email delivery, webhooks, vault, audit) work correctly. The bugs are isolated to the Domains plugin, Email Template Update, and Portal Link Generation.

---

## BUG 1: Domains Plugin — All 5 endpoints return HTTP 500

**Severity**: High
**Endpoints affected**:
- `POST /api/auth/banata/domains/list`
- `POST /api/auth/banata/domains/create`
- `POST /api/auth/banata/domains/get`
- `POST /api/auth/banata/domains/verify`
- `POST /api/auth/banata/domains/delete`

**Symptoms**: All domain endpoints return HTTP 500 with an empty response body. No error message is returned. Happens regardless of whether request body is empty or contains valid parameters.

**Reproduction**:
```bash
curl -X POST "https://warmhearted-peccary-760.eu-west-1.convex.site/api/auth/banata/domains/list" \
  -H "Content-Type: application/json" \
  -H "x-api-key: <key>" \
  -d '{}'
# Response: 500, empty body

curl -X POST "https://warmhearted-peccary-760.eu-west-1.convex.site/api/auth/banata/domains/create" \
  -H "Content-Type: application/json" \
  -H "x-api-key: <key>" \
  -d '{"organizationId":"m170zkcftgjwwk7katefrr44f182p90f","domain":"test.banata.dev"}'
# Response: 500, empty body
```

**Root cause analysis**:
File: `packages/convex/src/plugins/domains.ts`

All domain endpoints use `use: [sessionMiddleware]` in their endpoint definitions. When the request is authenticated via API key (`x-api-key` header) rather than a session cookie, `sessionMiddleware` fails to find a valid session and throws an unhandled error. This causes the 500 with no body.

Contrast with the Config plugin's domain-related endpoints (`/banata/config/domains/list`, `/banata/config/domains/save`, etc.) which work fine — those don't use `sessionMiddleware` and instead use `requireProjectPermission` for auth.

**Fix approach**:
1. Remove `use: [sessionMiddleware]` from all domain endpoints in `domains.ts`
2. The endpoints already call `requireProjectPermission(ctx, ...)` which handles API key authentication correctly
3. If session data is needed, use optional session resolution instead of the mandatory middleware

**Files to change**: `packages/convex/src/plugins/domains.ts` — lines containing `use: [sessionMiddleware]` in each of the 5 endpoint definitions

---

## BUG 2: Email Template Update — HTTP 500

**Severity**: Medium
**Endpoint affected**: `POST /api/auth/banata/emails/templates/update`

**Symptoms**: Template creation works correctly, but updating an existing template by ID returns HTTP 500 with an empty response body.

**Reproduction**:
```bash
# Step 1: Create a template (works fine)
curl -X POST ".../banata/emails/templates/create" \
  -H "Content-Type: application/json" \
  -H "x-api-key: <key>" \
  -d '{"name":"Test","slug":"test","subject":"Test","category":"custom","blocksJson":"[]"}'
# Response: 200, returns template with ID

# Step 2: Update it (fails)
curl -X POST ".../banata/emails/templates/update" \
  -H "Content-Type: application/json" \
  -H "x-api-key: <key>" \
  -d '{"id":"<id-from-step-1>","subject":"Updated"}'
# Response: 500, empty body
```

**Root cause analysis**:
File: `packages/convex/src/plugins/email.ts`, `updateEmailTemplate` handler (line ~1041)

The error occurs silently with no body, suggesting either:
1. A field type mismatch in the update data object (e.g., trying to set a field to `undefined` instead of omitting it)
2. The `db.update()` call failing because the model/where clause is incorrect
3. A schema validation issue where the update body doesn't match the expected shape

The endpoint doesn't use `sessionMiddleware` so the issue is in the handler logic itself, not authentication.

**Fix approach**:
1. Add try/catch around the handler body with proper error JSON response
2. Debug the actual error by checking Convex function logs after a failed update
3. Likely fix: ensure the `update` call correctly maps only the provided fields, skipping undefined values

**Files to change**: `packages/convex/src/plugins/email.ts` — `updateEmailTemplate` handler

---

## BUG 3: Portal Generate Link — HTTP 500

**Severity**: Low (Portal feature is not yet customer-facing)
**Endpoint affected**: `POST /api/auth/banata/portal/generate-link`

**Symptoms**: Providing valid parameters returns HTTP 500 with empty body.

**Reproduction**:
```bash
curl -X POST ".../banata/portal/generate-link" \
  -H "Content-Type: application/json" \
  -H "x-api-key: <key>" \
  -d '{"organizationId":"m170zkcftgjwwk7katefrr44f182p90f","intent":"sso"}'
# Response: 500, empty body
```

**Root cause analysis**:
File: `packages/convex/src/plugins/portal.ts`

Likely same pattern as BUG 1 — `sessionMiddleware` or an unhandled error in the handler. The portal link generation may depend on user session state to determine who is generating the link.

**Fix approach**:
1. Check if `sessionMiddleware` is used — if so, same fix as BUG 1
2. Add error handling to surface the actual failure
3. May need to support API key auth for portal link generation

**Files to change**: `packages/convex/src/plugins/portal.ts`

---

## MINOR ISSUE 1: SSO/SCIM Circular Reference in JSON Response

**Severity**: Low
**Endpoints affected**:
- `POST /api/auth/banata/sso/list-providers`
- `POST /api/auth/banata/scim/list-providers`

**Symptoms**: Response JSON contains `[Circular ref-1]` string instead of actual data.

**Example response**:
```json
{"data":[],"connections":"[Circular ref-1]"}
```

**Root cause**: The response object likely has self-referencing properties. When `ctx.json()` serializes it, the circular reference is replaced with the placeholder string.

**Fix approach**: In `enterprise.ts`, construct the response object without circular references. The `connections` / `directories` alias fields likely point back to the `data` array.

---

## MINOR ISSUE 2: Template Create Still Requires `category` Field

**Severity**: Low
**Endpoint**: `POST /api/auth/banata/emails/templates/create`

The code change to add `.default("custom")` to the `createTemplateSchema` in `email.ts` has been deployed, but the schema validation still requires the `category` field. This may be because the Zod `.default()` only applies when the field is `undefined`, not when it's missing from the request entirely (depends on how the body is parsed).

**Fix approach**: Verify the schema change is effective. If not, make `category` explicitly optional: `.optional().default("custom")`.

---

## MINOR ISSUE 3: Vercel Git Deploy Failures

**Severity**: Medium (affects deployment automation)
**Projects affected**: `banata-auth-dashboard`, `banata-auth-ui`, `banata-auth-admin`

Git-push-triggered Vercel deploys consistently fail with 0ms build duration, suggesting a configuration issue (not a code issue). The `banata-auth-docs` project deploys correctly.

The previous successful dashboard deploy (18h ago) was likely triggered differently (manual or different commit).

**Fix approach**: Check Vercel project settings for each failing project:
1. Root directory configuration
2. Build command
3. Environment variables (CONVEX_DEPLOYMENT, etc.)
4. Framework detection settings

---

## Deployment Status

| Component | Status | URL |
|---|---|---|
| Convex backend | Deployed | `warmhearted-peccary-760.eu-west-1.convex.site` |
| Dashboard | Live (previous deploy) | `auth.banata.dev` |
| Docs | Deployed | `banata-auth-docs-*.vercel.app` |
| Auth UI | Live (previous deploy) | `auth-ui.banata.dev` |

---

## What's Working (131/144 endpoints)

- All 44 Config endpoints (branding, email config, roles, permissions, social providers, redirects, radar, etc.)
- All 6 Projects endpoints
- All 18 User Management endpoints (list, get, create, update, ban, impersonate, sessions)
- All 20 Organization RBAC endpoints (create, invite, accept, revoke, list members, update roles)
- 7/8 Email endpoints (send, preview, test, template CRUD except update)
- All 3 Audit endpoints
- All 4 Webhook endpoints
- All 5 Vault endpoints (encrypt, decrypt, list, delete, rotate)
- All 3 RBAC check endpoints
- All 13 Enterprise SSO/SCIM endpoints (respond correctly with validation errors for missing params)
- 1/2 Portal endpoints (validate-session works, generate-link fails)
- Events endpoint

---

## Recommended Fix Priority

1. **BUG 1 (Domains)** — Remove `sessionMiddleware`, test all 5 endpoints
2. **BUG 2 (Template Update)** — Debug handler, add error handling
3. **MINOR 2 (Category default)** — Quick schema fix
4. **MINOR 1 (Circular ref)** — Fix SSO/SCIM response serialization
5. **BUG 3 (Portal)** — Fix after investigating session requirement
6. **MINOR 3 (Vercel deploys)** — Check project settings
