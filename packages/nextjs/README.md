# @banata-auth/nextjs

Next.js integration for Banata Auth -- route handler proxy, middleware, and server-side utilities.

## Installation

```bash
npm install @banata-auth/nextjs
```

## Quick start

### Route handler

```ts
// app/api/auth/[...all]/route.ts
import { createRouteHandler } from "@banata-auth/nextjs";

const handler = createRouteHandler({
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});

export const { GET, POST } = handler;
```

### Server-side auth

```ts
import { createBanataAuthServer } from "@banata-auth/nextjs/server";

const { handler, isAuthenticated, getToken } = createBanataAuthServer({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});

// In a Server Component or API route
const authenticated = await isAuthenticated();
```

## Features

- Secure proxy route handler with header allowlisting
- Server-side session and auth token retrieval
- Middleware helpers for auth-gated routes

## License

MIT
