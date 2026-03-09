# Banata Auth - Convex Functions

## Architecture

All auth data lives inside the `banataAuth` Convex component. The parent app keeps only app-level wiring: HTTP routes, auth config, Node request handling, and the local auth factory that binds the packaged component to dashboard runtime config.

```text
convex/
  _generated/        # Auto-generated types (parent app)
  banataAuth/
    _generated/      # Auto-generated types (component)
    auth.ts          # Dashboard-aware auth factory and runtime config resolution
    adapter.ts       # Local adapter functions generated from createAuthOptions
    schema.ts        # Local schema anchor that re-exports @banata-auth/convex/schema
  auth.config.ts     # Convex auth provider config
  authNode.ts        # Node proxy for auth requests
  convex.config.ts   # defineApp() + app.use(@banata-auth/convex/convex.config)
  http.ts            # HTTP router, registers Better Auth routes
```

## Migrations

Component migrations now live in the package at `@banata-auth/convex/src/component/migrations.ts`, so the local dashboard app no longer needs its own `banataAuth/migrations.ts`.

Available migrations:

```bash
npx convex run --component banataAuth migrations:clearAllData
npx convex run --component banataAuth migrations:backfillProjectId
npx convex run --component banataAuth migrations:removeEnvironmentIds
```

## Development

Push schema and functions to your Convex deployment:

```bash
npx convex dev
```

The Convex bundling is slow. Run `convex dev` from your own terminal and let it watch for changes.
