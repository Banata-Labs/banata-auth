# Banata Auth

An open-source, drop-in WorkOS replacement built on [Better Auth](https://better-auth.com) + [Convex](https://convex.dev) + [Next.js](https://nextjs.org).

## What is Banata Auth?

Banata Auth gives you enterprise-grade authentication infrastructure -- SSO, organizations, RBAC, audit logs, webhooks, and more -- as a set of npm packages you drop into your Convex + Next.js project. No vendor lock-in, MIT licensed, self-hostable.

### Packages

| Package | Description |
|---------|-------------|
| `@banata-auth/sdk` | TypeScript SDK for managing users, orgs, SSO, webhooks, and more |
| `@banata-auth/react` | React provider, hooks, and pre-built auth UI components |
| `@banata-auth/nextjs` | Next.js middleware, route handler, and server utilities |
| `@banata-auth/convex` | Convex integration -- auth factory, plugins, triggers, schema |
| `@banata-auth/shared` | Shared types, validation schemas, error classes, and constants |
| `@banata-auth/ui` | Reusable UI components (shadcn/ui based) |

### Apps

| App | Description |
|-----|-------------|
| `apps/dashboard` | Admin dashboard for managing auth configuration |
| `apps/example-app` | Reference implementation showing how to integrate Banata Auth |
| `apps/auth-ui` | Hosted auth UI pages (sign-in, sign-up, MFA, etc.) |
| `apps/admin-portal` | Self-serve admin portal for end-user organizations |
| `apps/docs` | Documentation site |

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.2
- [Node.js](https://nodejs.org) >= 20
- A [Convex](https://convex.dev) account

### 1. Install Banata Auth in your project

```bash
npm install @banata-auth/convex @banata-auth/nextjs @banata-auth/react @banata-auth/shared
```

### 2. Set up Convex

```bash
npx convex init
```

### 3. Configure your auth

Create `convex/banataAuth/auth.ts`:

```ts
import {
  createBanataAuth,
  createBanataAuthComponent,
  createBanataAuthOptions,
  type BanataAuthConfig,
} from "@banata-auth/convex";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

export const authComponent = createBanataAuthComponent(components.banataAuth, schema);

function getConfig(): BanataAuthConfig {
  return {
    appName: "My App",
    siteUrl: process.env.SITE_URL!,
    secret: process.env.BETTER_AUTH_SECRET!,
    authMethods: {
      emailPassword: true,
      organization: true,
    },
    email: {
      // Wire up your email provider here
      sendVerificationEmail: async ({ email, url }) => { /* ... */ },
      sendResetPassword: async ({ email, url }) => { /* ... */ },
    },
  };
}

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  createBanataAuthOptions(ctx, {
    authComponent,
    authConfig,
    config: getConfig(),
  });

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  createBanataAuth(ctx, {
    authComponent,
    authConfig,
    config: getConfig(),
  });
```

### 4. Set up your Next.js API route

Create `app/api/auth/[...all]/route.ts`:

```ts
import { createRouteHandler } from "@banata-auth/nextjs";

export const { GET, POST } = createRouteHandler({
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});
```

### 5. Add the auth provider

Wrap your app in `layout.tsx`:

```tsx
import { BanataAuthProvider } from "@banata-auth/react";

export default function RootLayout({ children }) {
  return (
    <BanataAuthProvider>
      {children}
    </BanataAuthProvider>
  );
}
```

### 6. Set environment variables

```bash
npx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
npx convex env set SITE_URL "http://localhost:3000"
```

### 7. Run your app

```bash
npx convex dev &
npm run dev
```

## Features

### Stable

- **Email + Password** -- Sign up, sign in, email verification, password reset
- **Social OAuth** -- GitHub, Google, Microsoft, Apple, Discord, and more
- **Magic Links** -- Passwordless email sign-in
- **Passkeys** -- WebAuthn/FIDO2 support
- **Multi-Factor Auth** -- TOTP-based 2FA
- **Organizations** -- Multi-tenant org management with invitations
- **RBAC** -- Role-based access control with custom roles and permissions
- **API Keys** -- Generate and manage API keys for programmatic access
- **Webhooks** -- Real-time event notifications with signature verification
- **Email Templates** -- Block-based email template editor with live preview and 6 built-in auth templates
- **Audit Logs** -- Structured event logging for compliance
- **Admin Dashboard** -- Visual management of all auth configuration
- **Pre-built UI** -- Drop-in sign-in/sign-up forms and auth components

### Preview

These features are functional but under active development. APIs may change.

- **Enterprise SSO** -- SAML 2.0 and OIDC federation (requires Node.js sidecar for SAML XML processing)
- **Directory Sync (SCIM)** -- Automated user/group provisioning via SCIM 2.0

## Development

### Setup

```bash
git clone https://github.com/banata-auth/banata-auth.git
cd banata-auth
bun install
```

### Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all apps and packages in development mode |
| `bun run build` | Build all packages and apps |
| `bun run test` | Run all tests |
| `bun run lint` | Lint all packages |
| `bun run typecheck` | Type-check all packages |
| `bun run clean` | Clean all build artifacts |
| `bun run format` | Format code with Biome |

### Project Structure

```
banata-auth/
  apps/
    dashboard/       # Admin dashboard (Next.js)
    example-app/     # Reference integration
    auth-ui/         # Hosted auth pages
    admin-portal/    # End-user admin portal
    docs/            # Documentation site
  packages/
    shared/          # Types, validation, errors, constants
    sdk/             # TypeScript SDK
    react/           # React provider, hooks, UI components
    nextjs/          # Next.js middleware and utilities
    convex/          # Convex integration and plugins
    ui/              # Reusable UI components
  tooling/
    typescript/      # Shared tsconfig presets
    tailwind/        # Shared Tailwind config
    biome/           # Shared Biome config
```

## License

MIT -- see [LICENSE](./LICENSE).
