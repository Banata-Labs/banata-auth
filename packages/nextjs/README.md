# @banata-auth/nextjs

Next.js helpers for Banata Auth.

Use this package when your Next.js app needs to:

- proxy `/api/auth/*` requests to Banata auth endpoints
- read auth state on the server
- fetch authenticated Convex data in server components

## Installation

```bash
npm install @banata-auth/nextjs
```

## Server Helpers

```ts
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
});
```

## Route Handler

```ts
import { handler } from "@/lib/auth-server";

export const { GET, POST } = handler;
```

## Note

This package is a thin app-side helper. It should be used with Banata's public auth surface, not as a reason to expose the full self-hosted runtime by default.
