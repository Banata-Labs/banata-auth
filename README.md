# Banata Auth

Open-source auth infrastructure with two integration modes:

- Dashboard-first API access via `@banata-auth/sdk`
- Self-hosted Convex runtime via `@banata-auth/convex`, `@banata-auth/nextjs`, and `@banata-auth/react`

## Product Shape

If you want a WorkOS-style experience, treat Banata as the system of record:

- Users, organizations, SSO connections, webhooks, and config live behind Banata HTTP endpoints
- Your application talks to Banata through API keys, the dashboard, and thin client/server helpers

If you want to run the auth engine inside your own Convex deployment, use the self-hosted packages. That path is more flexible, but it is not the same product shape as a dashboard-first managed service.

## Packages

| Package | Role |
|---------|------|
| `@banata-auth/sdk` | Remote admin API client for users, organizations, SSO, RBAC, webhooks, projects, and more |
| `@banata-auth/nextjs` | Next.js proxy and server helpers for Banata auth endpoints |
| `@banata-auth/react` | React provider, hooks, and auth UI components |
| `@banata-auth/convex` | Self-hosting kit for running Banata auth inside your own Convex deployment |
| `@banata-auth/shared` | Shared types, errors, constants, and validation |
| `@banata-auth/ui` | Reusable UI primitives |

## Dashboard-First Quick Start

```ts
import { BanataAuth } from "@banata-auth/sdk";

const banata = new BanataAuth({
  apiKey: process.env.BANATA_AUTH_API_KEY!,
  baseUrl: process.env.BANATA_AUTH_BASE_URL!,
});

const users = await banata.users.listUsers({ limit: 20 });
```

The SDK talks to Banata HTTP endpoints. It does not query your database directly.

## Self-Hosted Quick Start

The self-hosted path is documented separately because it requires local Convex component registration, adapter generation, and HTTP wiring inside your app:

- `convex/convex.config.ts`
- `convex/banataAuth/convex.config.ts`
- `convex/auth.config.ts`
- `convex/banataAuth/schema.ts`
- `convex/banataAuth/auth.ts`
- `convex/banataAuth/adapter.ts`
- `convex/authNode.ts`
- `convex/http.ts`

Use [docs/quickstart](./apps/docs/content/docs/quickstart.mdx) for that flow.

## Notes

- `better-auth@1.4.x` is the supported line for the current Convex integration.
- `@banata-auth/*@0.1.0` was published with broken `workspace:*` internal dependencies. This repo includes the manifest fix for the next release.

## Apps

| App | Purpose |
|-----|---------|
| `apps/dashboard` | Admin dashboard |
| `apps/example-app` | Reference self-hosted integration |
| `apps/auth-ui` | Auth UI pages |
| `apps/admin-portal` | End-user admin portal |
| `apps/docs` | Documentation site |

## Development

```bash
bun install
bun run dev
```

Useful commands:

| Command | Purpose |
|---------|---------|
| `bun run build` | Build packages and apps |
| `bun run test` | Run tests |
| `bun run typecheck` | Type-check the repo |
| `bun run check` | Run Biome checks |

## License

MIT
