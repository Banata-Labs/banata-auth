# @banata-auth/nextjs

Next.js helpers for Banata Auth.

Use this package when your app needs to:

- proxy `/api/auth/*` requests to a Banata instance
- keep auth cookies on your own domain
- bind auth flows to a Banata project with a server-side API key
- read auth state in server components and server actions

## Installation

```bash
npm install @banata-auth/nextjs
```

## Recommended Setup

```ts
// src/lib/auth-server.ts
import { createBanataAuthServer } from "@banata-auth/nextjs/server";

export const {
  handler,
  isAuthenticated,
  getToken,
  preloadAuthQuery,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = createBanataAuthServer({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
  apiKey: process.env.BANATA_API_KEY!,
});
```

```ts
// src/app/api/auth/[...all]/route.ts
import { handler } from "@/lib/auth-server";

export const { GET, POST, PUT, PATCH, DELETE } = handler;
```

## Note

This package is the normal app-side integration for hosted or self-hosted Banata. Self-hosting does not change the app contract: developers still create a project in the Banata dashboard and bind their app with a project-scoped API key.
