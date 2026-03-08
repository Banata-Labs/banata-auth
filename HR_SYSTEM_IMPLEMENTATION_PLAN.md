# HR System Implementation Plan

## Purpose

This document is the developer handoff for building an internal HR management system on top of Banata Auth as it exists in this repo today.

It is intentionally based on verified repo behavior, not product aspiration.

Use this plan if the target system is:

- one company internal HR app
- employees sign in with company Google Workspace accounts
- developers and IT staff sign in with company GitHub accounts
- Banata handles identity, sessions, organizations, invitations, and auth configuration
- the HR app handles business data such as employees, leave, payroll, departments, approvals, and reports

---

## 1. Current Banata Shape

### What Banata is today

Banata is now documented as a dashboard-first auth product, with:

- `@banata-auth/sdk` for remote admin and management calls
- `@banata-auth/nextjs` for auth route proxying and server helpers
- `@banata-auth/react` for session hooks and auth UI primitives

But the actual runtime is still a hybrid:

- Banata auth execution still runs through the Convex / Better Auth runtime in this repo
- the dashboard is the main configuration surface
- the hosted auth UI is project-scoped
- organizations and RBAC are part of the current runtime model

### Verified behavior to design around

- Dashboard admins sign in with GitHub only
- App users sign in through a project-scoped hosted auth flow
- hosted auth resolves project config from `client_id` or `project_id`
- Google and GitHub social login can both be enabled per project
- SSO connections exist as a separate enterprise path
- organization membership is the real unit of role assignment
- active organization is stored on the session
- RBAC permission checks exist
- custom roles can now hold explicit permission slugs and be managed from the dashboard
- server-side enforcement is still required for all sensitive HR actions

---

## 2. Recommended HR Product Decisions

For the first version of the HR system, use the following model.

### Project layout

- Create one Banata project for the HR app
- Suggested slug: `company-hr`
- Use the Banata project slug as the public `client_id` passed from the HR app into Banata hosted auth

### Organization layout

- Create one Banata organization for the company
- Suggested organization slug: `company`
- All users belong to this organization

If later you need subsidiaries, legal entities, or regional business units, add more organizations then.

### Login modes

- Employees: Google social login
- Developers and IT: GitHub social login
- Optional later: enterprise SSO connection for stricter company routing or SSO enforcement

### Source of truth

- Banata stores auth identities, sessions, org membership, invitations, social provider config, and SSO connections
- The HR app database stores domain records and references Banata user IDs

Do not build a second password system in the HR app.

---

## 3. Dashboard Setup Plan

These are the exact platform setup steps a developer or IT admin should follow first.

### Step 1: Sign into the Banata dashboard

- Sign into Banata with company GitHub
- This is for Banata dashboard administration, not end-user HR login

### Step 2: Create the HR project

- Open the project switcher
- Create a new project named `Company HR`
- Set slug to `company-hr`
- Save the project

### Step 3: Copy the project identifiers

In Settings -> General:

- copy the `Client ID`
- copy the internal `Project ID`

Use them like this:

- `Client ID`: public identifier passed by the HR app to Banata hosted auth
- `Project ID`: server-side scope for SDK calls and permission checks when needed

### Step 4: Configure login methods

In Authentication -> Methods:

- leave `email/password` off unless HR explicitly wants fallback credentials
- leave magic link and email OTP off for the first version unless there is a clear need
- keep `organization` on
- enable `sso` only if you are also configuring enterprise SSO connections

### Step 5: Configure social providers

In Authentication -> Providers:

- add Google credentials for employee sign-in
- add GitHub credentials for developer and IT sign-in
- store both provider secrets in Banata
- enable both providers for the project

Expected result on the hosted auth page:

- employees see a Google login option
- devs and IT see a GitHub login option

### Step 6: Create the company organization

In Organizations:

- create one organization for the company
- suggested name: `Company`
- suggested slug: `company`

The creator becomes the effective org super admin.

### Step 7: Invite internal users

Invite users into the company organization:

- HR admins
- IT admins
- developers who need internal access
- employees if access is invite-driven

For the first version, use Banata invitations plus social login rather than open self-signup.

### Step 8: Optional SSO setup

Only do this if the company wants stricter enterprise auth behavior than normal Google social login.

In Connections:

- create an OIDC or SAML connection
- map it to the company organization
- use domain routing if required

Important:

- the current repo clearly supports connection management
- but the most concrete verified employee login path today is Google social login, not a polished Google-Workspace-specific enterprise onboarding flow

---

## 4. HR App Architecture

The HR app should be a thin consumer of Banata for auth.

### Banata responsibilities

- hosted sign-in
- session issuance
- sign-out
- provider config
- org membership
- invitations
- active organization
- coarse RBAC checks

### HR app responsibilities

- employee records
- department records
- leave requests
- manager approvals
- payroll records
- internal documents
- audit and reporting inside the HR domain

### Identity linkage

Each HR domain record should reference the Banata user ID.

Recommended shape:

```text
Employee
  id
  banataUserId
  workEmail
  departmentId
  managerEmployeeId
  employmentStatus
  ...
```

Do not use email as the primary foreign key.

---

## 5. App Integration Tasks

Build the HR app with the public Banata integration surface, not the self-hosted setup.

### Required packages

- `@banata-auth/sdk`
- `@banata-auth/nextjs`
- `@banata-auth/react`

### Environment variables

At minimum, the HR app should have:

```env
BANATA_AUTH_API_KEY=...
BANATA_AUTH_BASE_URL=...
BANATA_CLIENT_ID=company-hr
BANATA_PROJECT_ID=...
NEXT_PUBLIC_CONVEX_SITE_URL=...
NEXT_PUBLIC_CONVEX_URL=...
```

Notes:

- `BANATA_CLIENT_ID` is what the browser-facing auth flow should use
- `BANATA_PROJECT_ID` is useful for backend SDK calls and scoped permission checks

### Required implementation work

#### 1. Add the auth route proxy

Create the Next.js catch-all auth route and proxy `/api/auth/*` to Banata using `@banata-auth/nextjs`.

This route must preserve project scope so Banata knows the HR app belongs to the `company-hr` project.

#### 2. Add the auth client

Create a browser auth client with the Banata-compatible Better Auth plugins:

- Convex client plugin
- organization client plugin
- SSO client plugin

#### 3. Wrap the app in the Banata React auth provider

Expose:

- current user
- current session
- active organization
- sign-out action

#### 4. Add the sign-in flow

The HR app login button should redirect to Banata hosted auth and include:

- `client_id=company-hr`

Do not render an unscoped auth flow. The hosted auth UI requires project scope to load the correct config.

#### 5. Handle callback and session bootstrap

After login:

- the user lands back in the HR app
- if the user belongs to an organization, Banata may ask them to choose one
- Banata stores the active organization on the session
- the HR app should then fetch the session and continue normally

#### 6. Protect pages and APIs

Use Banata session state to protect:

- `/employees`
- `/payroll`
- `/leave`
- `/admin`
- all HR API routes

Never trust the client UI alone.

---

## 6. Authentication Flows To Implement

## Flow A: Employee login with Google

This is the first-class launch flow.

### User journey

1. Employee opens the HR app login page
2. Employee clicks `Continue with Google`
3. HR app redirects to Banata hosted auth with `client_id=company-hr`
4. Banata reads the project config and shows enabled methods
5. Employee authenticates with Google
6. Banata creates or resolves the user identity
7. If org context is needed, Banata sets or asks for the active organization
8. Employee is redirected back to the HR app
9. HR app loads the Banata session and renders the employee dashboard

### Implementation notes

- This is the simplest verified path for company Google Workspace usage
- It assumes employees authenticate using their company Google accounts
- If you need hard domain restriction or IdP-enforced enterprise login, move to the SSO flow later

## Flow B: Developer / IT login with GitHub

### User journey

1. Developer or IT opens the HR app login page
2. User clicks `Continue with GitHub`
3. Banata handles GitHub auth under the same `company-hr` project
4. Banata returns the user to the HR app
5. HR app resolves session and role-based access

### Why this is separate from dashboard auth

- Banata dashboard login is GitHub-only for Banata admins
- HR app GitHub login is a separate project provider configuration
- both can exist at the same time

## Flow C: Future enterprise SSO

Use this only if the company wants:

- SAML or OIDC-based workforce login
- stricter org routing by domain
- SSO enforcement
- eventual SCIM-driven provisioning

This should be phase two, not launch scope.

---

## 7. User Provisioning Strategy

Use the following launch approach.

### Launch provisioning model

- create the company organization in Banata
- invite HR admins, IT admins, and developers explicitly
- allow employees to log in with Google once their access policy is ready

Recommended policy:

- admins and privileged users are invite-only
- general employees may be invite-only or company-domain-approved depending on security requirements

### Do not rely on these yet

- automatic Google Workspace group-to-role mapping
- fully automated role assignment from IdP groups
- SCIM-driven org and role population for launch

Those are later features.

---

## 8. RBAC Strategy For The HR App

This is the most important design section because the HR system should treat Banata RBAC as the authorization source of truth, while still enforcing all checks on the server.

## What is already real

Banata already has:

- project-scoped permission definitions
- project-scoped role definitions
- org member role assignment
- permission check endpoints
- a seeded `super_admin` role with all project permissions
- role updates that preserve permission assignments
- permission updates that keep linked roles in sync
- a dashboard workflow for assigning permission slugs to custom roles

## Recommended launch RBAC model

For version one of the HR app:

- use Banata for identity, organization membership, role definitions, and permission catalogs
- use Banata `super_admin` for highest-privilege internal admins
- use Banata custom roles such as `employee`, `manager`, `hr_admin`, and `payroll_admin`
- enforce the resulting permission checks in the HR backend using explicit server-side policy checks

### Suggested HR roles

Define these as Banata custom roles:

- `employee`
- `manager`
- `hr_admin`
- `it_admin`
- `developer_admin`
- `payroll_admin`

### Suggested permissions

Create these as Banata permission slugs:

- `employee.read.self`
- `employee.read.team`
- `employee.read.all`
- `employee.update.self`
- `leave.request.create`
- `leave.request.approve`
- `payroll.read`
- `payroll.manage`
- `department.manage`
- `system.audit.read`
- `system.admin`

### Where to enforce them

Enforce permissions in server-side HR routes and server actions:

- employee pages
- payroll pages
- approval endpoints
- export endpoints
- admin settings

### Mapping recommendation

Store an HR access profile in your app database that maps each Banata user ID to:

- department
- manager relationship
- employment status
- payroll profile linkage
- any temporary business-specific overrides

Use Banata for the actual role and permission catalog, and use the HR database for domain context.

---

## 9. Recommended Database Model In The HR App

Keep the HR domain separate from auth.

### Core tables

- `employees`
- `departments`
- `leave_requests`
- `leave_balances`
- `payroll_profiles`
- `documents`
- `audit_events`
- `role_assignments` or `access_profiles`

### Key identity columns

Every user-facing business table should be able to resolve to:

- `banata_user_id`
- `organization_id` if multi-org support is needed later

### Example access profile table

```text
access_profiles
  id
  banataUserId
  hrRole
  departmentId
  isManager
  canViewPayroll
  canManageDepartments
  canAdminSystem
  createdAt
  updatedAt
```

This keeps the HR domain model separate from auth while still using Banata as the role and permission source of truth.

---

## 10. API Usage Plan

Use the Banata SDK from the HR backend for admin and lifecycle operations.

### Good SDK use cases

- list users
- get user by ID
- invite organization members
- change org member roles
- create and update permission catalogs
- create and update custom roles
- create or inspect SSO connections
- check permissions from backend services

### Do not use the SDK for

- HR payroll calculations
- employee hierarchy logic
- leave approval chains
- HR reporting logic

That belongs in the HR app.

---

## 11. Launch Scope

Build these first.

### In scope

- Banata dashboard project setup
- Google employee login
- GitHub login for developers and IT
- company organization in Banata
- invitations for admins and staff
- session-based protection in the HR app
- employee directory
- leave request flow
- manager approval flow
- basic department management
- app-side HR authorization model

### Out of scope for launch

- SCIM auto-provisioning
- Google Workspace group sync
- enterprise SAML rollout
- payroll automation that depends on advanced access-control workflows

---

## 12. Implementation Phases

## Phase 1: Platform setup

- create Banata project
- configure Google and GitHub providers
- create company organization
- invite core admins
- confirm hosted login works with `client_id`

Acceptance criteria:

- employee can sign in with Google
- developer can sign in with GitHub
- session is created
- active org is set

## Phase 2: HR app auth integration

- wire auth route proxy
- add auth client
- add provider wrapper
- build sign-in and sign-out
- protect pages and server routes

Acceptance criteria:

- unauthenticated users cannot access HR pages
- authenticated users receive Banata-backed session state

## Phase 3: HR domain and access model

- create employee and department tables
- link records to Banata user IDs
- implement app-side HR roles and permissions
- add manager approval rules

Acceptance criteria:

- managers can approve team leave
- employees cannot access payroll
- HR admins can manage employee records

## Phase 4: Admin tools

- build admin pages for invitations and employee activation
- add audit views
- add internal access-management pages

Acceptance criteria:

- admins can onboard and disable users safely
- privileged actions are logged

## Phase 5: Enterprise auth enhancements

- evaluate SSO connection rollout
- evaluate SCIM provisioning
- evaluate Banata RBAC migration when platform support is complete

---

## 13. Verified Platform Caveats

These are real caveats from the repo and should influence implementation choices.

### Caveat 1: Project scoping is not perfect internally

Some dashboard surfaces still use Better Auth admin endpoints that are not truly project-aware and are then filtered client-side.

Impact:

- treat project scoping carefully
- always pass explicit project scope in backend code

### Caveat 2: Banata RBAC still needs server-side discipline

Banata now supports custom role-permission assignment, but the HR app must still enforce permission checks on the server and should not rely on hidden UI alone.

Impact:

- every sensitive HR action must check permissions server-side
- business context such as reporting lines and payroll scope still belongs in the HR app

### Caveat 3: Dashboard role editing is not a true update

Role editing is implemented as delete and recreate.

Impact:

- avoid making HR business logic depend on mutable Banata role records in version one

### Caveat 4: SSO exists, but Google social is the clearest launch path

Impact:

- launch on Google social login first
- phase enterprise SSO in only when needed

---

## 14. Final Recommendation

Build the HR system this way:

1. Use Banata for login, session, org membership, invitations, and provider management.
2. Launch employee auth with Google social login.
3. Launch developer and IT auth with GitHub social login.
4. Keep HR business authorization in the HR app for version one.
5. Use Banata custom roles and permission slugs for HR authorization, with `super_admin` reserved for top-level internal admins.
6. Treat SSO and SCIM as phase-two enhancements.

This is the most realistic path that matches the current repo instead of assuming features that are only partially implemented.
