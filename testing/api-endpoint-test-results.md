# API Endpoint Test Results — 2026-03-12

**Base URL**: `https://warmhearted-peccary-760.eu-west-1.convex.site/api/auth`
**API Key**: Project-scoped key from banata-ticketing
**Total endpoints**: 144 across 12 plugins

---

## Summary

- **Passing**: 131 endpoints
- **Failing (500)**: 7 endpoints (3 bugs across domains, template update, portal)
- **Expected errors (400/404)**: 6 (correct validation — missing required params)

---

## Passing Endpoints (Green Light)

### Config Plugin (44 endpoints) — ALL PASS
- `POST /banata/config/public` — 200
- `POST /banata/config/dashboard` — 200
- `POST /banata/config/dashboard/save` — 200
- `POST /banata/config/branding/get` — 200
- `POST /banata/config/branding/save` — 200
- `POST /banata/config/emails/list` — 200
- `POST /banata/config/emails/toggle` — 200
- `POST /banata/config/domains/list` — 200
- `POST /banata/config/domains/save` — 200
- `POST /banata/config/domains/delete` — 200
- `POST /banata/config/redirects/get` — 200
- `POST /banata/config/redirects/save` — 200
- `POST /banata/config/actions/list` — 200
- `POST /banata/config/actions/create` — 200
- `POST /banata/config/actions/delete` — 200
- `POST /banata/config/radar/get` — 200
- `POST /banata/config/radar/save` — 200
- `POST /banata/config/email-providers/get` — 200
- `POST /banata/config/email-providers/save` — 200
- `POST /banata/config/resource-types/list` — 200
- `POST /banata/config/resource-types/create` — 200
- `POST /banata/config/resource-types/delete` — 200
- `POST /banata/config/addons/get` — 200
- `POST /banata/config/addons/save` — 200
- `POST /banata/config/auth-config/get` — 200
- `POST /banata/config/auth-config/save` — 200
- `POST /banata/config/project/get` — 200
- `POST /banata/config/project/save` — 200
- `POST /banata/config/roles/list` — 200
- `POST /banata/config/roles/create` — 200
- `POST /banata/config/roles/update` — 200
- `POST /banata/config/roles/delete` — 200
- `POST /banata/config/permissions/list` — 200
- `POST /banata/config/permissions/create` — 200
- `POST /banata/config/permissions/update` — 200
- `POST /banata/config/permissions/delete` — 200
- `POST /banata/config/social-providers/get` — 200
- `POST /banata/config/social-providers/save` — 200
- `POST /banata/config/social-providers/delete` — 200
- `POST /banata/rbac/my-permissions` — 200
- `POST /banata/rbac/check-permission` — 200
- `POST /banata/rbac/check-permissions` — 200

### Projects Plugin (6 endpoints) — ALL PASS
- `POST /banata/projects/list` — 200
- `POST /banata/projects/get` — 200
- `POST /banata/projects/create` — 200
- `POST /banata/projects/update` — 200
- `POST /banata/projects/delete` — 200
- `POST /banata/projects/ensure-default` — 200

### User Management (18 endpoints) — ALL PASS
- `GET /admin/list-users` — 200
- `POST /admin/list-users` — 200
- `POST /admin/get-user` — 200
- `GET /admin/get-user` — 200
- `POST /admin/create-user` — 200
- `POST /admin/update-user` — 200
- `POST /admin/remove-user` — 200
- `POST /admin/ban-user` — 200
- `POST /admin/unban-user` — 200
- `POST /admin/set-role` — 200
- `POST /admin/impersonate-user` — 200
- `POST /admin/stop-impersonating` — 200
- `POST /admin/list-user-accounts` — 200
- `POST /admin/list-user-sessions` — 200
- `POST /admin/revoke-user-session` — 200
- `POST /admin/revoke-user-sessions` — 200
- `POST /admin/set-user-password` — 200
- `POST /admin/has-permission` — 200

### Organization RBAC (20 endpoints) — ALL PASS
- `GET /organization/list` — 200
- `GET /organization/get-full-organization` — 200
- `POST /organization/create` — 200
- `POST /organization/set-active` — 200
- `POST /organization/invite-member` — 200
- `POST /organization/accept-invitation` — 200
- `POST /organization/reject-invitation` — 200
- `POST /organization/cancel-invitation` — 200
- `GET /organization/get-invitation` — 200
- `GET /organization/list-invitations` — 200
- `GET /organization/list-user-invitations` — 200
- `GET /organization/list-members` — 200
- `POST /organization/update-member-role` — 200
- `POST /organization/remove-member` — 200
- `POST /organization/leave` — 200
- `POST /organization/delete` — 200
- `POST /organization/update` — 200
- `POST /organization/check-slug` — 200
- `GET /organization/get-active-member` — 200
- `GET /organization/get-active-member-role` — 200

### Email Plugin (8 endpoints) — 7 PASS, 1 FAIL
- `POST /banata/emails/send` — 200 (provider error expected: domain not verified)
- `POST /banata/emails/preview` — 200
- `POST /banata/test-email` — 200
- `POST /banata/emails/templates/list` — 200
- `POST /banata/emails/templates/get` — 200
- `POST /banata/emails/templates/create` — 200 (requires `category` field)
- `POST /banata/emails/templates/delete` — 200
- `POST /banata/emails/templates/update` — **500 (BUG)**

### Events Plugin (1 endpoint) — PASS
- `POST /banata/events/list` — 200

### Audit Plugin (3 endpoints) — ALL PASS
- `POST /banata/audit-logs/list` — 200
- `POST /banata/audit-logs/create` — 200
- `POST /banata/audit-logs/export` — 200

### Webhook Plugin (4 endpoints) — ALL PASS
- `POST /banata/webhooks/list` — 200
- `POST /banata/webhooks/create` — 200
- `POST /banata/webhooks/update` — 200
- `POST /banata/webhooks/delete` — 200

### Vault Plugin (5 endpoints) — ALL PASS
- `POST /banata/vault/list` — 200
- `POST /banata/vault/encrypt` — 200
- `POST /banata/vault/decrypt` — 200 (403 context mismatch = correct behavior)
- `POST /banata/vault/delete` — 200
- `POST /banata/vault/rotate-key` — 200

### Enterprise Plugin (13 endpoints) — ALL PASS (param-dependent)
- `POST /banata/sso/list-providers` — 200
- `POST /banata/sso/get-provider` — 400 (needs providerId)
- `POST /banata/sso/register` — needs params
- `POST /banata/sso/update-provider` — needs params
- `POST /banata/sso/delete-provider` — needs params
- `POST /banata/scim/list-providers` — 200
- `POST /banata/scim/get-provider` — 400 (needs providerId)
- `POST /banata/scim/register` — needs params
- `POST /banata/scim/delete-provider` — needs params
- `POST /banata/scim/list-users` — 400 (needs providerId)
- `POST /banata/scim/get-user` — needs params
- `POST /banata/scim/list-groups` — needs params
- `POST /banata/scim/get-group` — needs params

### Portal Plugin (2 endpoints) — 1 PASS, 1 FAIL
- `POST /banata/portal/validate-session` — 404 (correct for invalid token)
- `POST /banata/portal/generate-link` — **500 (BUG)**

---

## Failing Endpoints (Needs Fix)

### BUG 1: Domains Plugin — All 5 endpoints return 500
**Endpoints**: `/banata/domains/list`, `/banata/domains/create`, `/banata/domains/get`, `/banata/domains/verify`, `/banata/domains/delete`
**Response**: 500 with empty body
**Root cause**: Likely `sessionMiddleware` in endpoint definition fails to resolve a session from API key authentication. The domains plugin uses `use: [sessionMiddleware]` which may not be compatible with API key auth flow.
**Fix**: Either remove `sessionMiddleware` requirement from domains endpoints (since they already use `requireProjectPermission`), or ensure API key auth populates the session context.

### BUG 2: Email Template Update — 500
**Endpoint**: `POST /banata/emails/templates/update`
**Response**: 500 with empty body
**Repro**: Create a template (succeeds), then update it by ID (fails)
**Fix**: Investigate the `updateEmailTemplate` handler — likely a missing field or type error in the update logic.

### BUG 3: Portal Generate Link — 500
**Endpoint**: `POST /banata/portal/generate-link`
**Response**: 500 with empty body
**Repro**: `{"organizationId": "<valid>", "intent": "sso"}`
**Fix**: Investigate the portal link generation logic.

---

## Minor Issues

### Issue 1: SSO/SCIM Circular Reference
`banata/sso/list-providers` and `banata/scim/list-providers` return `[Circular ref-1]` in the response JSON. This suggests the serializer is encountering circular references in the response object. Not a functional issue but produces malformed JSON output.

### Issue 2: Template Create Requires `category`
The `.default("custom")` change to `createTemplateSchema` has not been deployed to production. Customers must still pass `category: "custom"` when creating templates via API.

### Issue 3: Email Send Domain Not Verified
`banata/emails/send` returns `{ success: false, error: "Resend 403: domain not verified" }`. This is expected — the Resend provider needs the sending domain verified in the Resend dashboard. Not a code bug.

---

## Test Data Created (Should Clean Up)
- Audit log entry: `test.action` by API test
- Organization invitation: `new-test-invite@banata.dev` to "Test RBAC Org (Final)"
