# @banata-auth/convex

Convex backend integration for Banata Auth -- auth factory, plugins, triggers, and database schema.

## Installation

```bash
npm install @banata-auth/convex
```

## Quick start

### 1. Define your schema

```ts
// convex/banataAuth/schema.ts
export { default } from "@banata-auth/convex/schema";
```

### 2. Create the auth component and instance

```ts
// convex/banataAuth/auth.ts
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

### 3. Register HTTP routes

```ts
// convex/http.ts
import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./banataAuth/auth";

const http = httpRouter();
authComponent.registerRoutes(http, createAuth);
export default http;
```

### 4. Register triggers (optional)

```ts
import { defineBanataAuthTriggers } from "@banata-auth/convex";

export const triggers = defineBanataAuthTriggers({
  onUserCreated: async (ctx, user) => {
    console.log("New user:", user.email);
  },
});
```

## Features

- Better Auth factory with sensible defaults
- Dashboard config, audit log, and webhook plugins
- Email template plugin with block-based editor support, template CRUD, and HTML rendering
- Lifecycle trigger system for user/session/org events
- Pre-built Convex schema for all auth tables (35 tables)
- Multi-tenant project isolation with `projectId` scoping

## License

MIT
