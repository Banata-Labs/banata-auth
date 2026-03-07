# Banata Auth - Convex Functions

## Architecture

All auth data lives inside the `banataAuth` **Convex component** — an isolated namespace with its own 34 tables. The parent app (`convex/`) only has HTTP routes and auth config; it accesses component data through adapter function references (`components.banataAuth.adapter.*`).

```
convex/
  _generated/        # Auto-generated types (parent app)
  banataAuth/        # The component (isolated DB namespace)
    _generated/      # Auto-generated types (component)
    adapter.ts       # CRUD handlers with direct ctx.db access
    auth.ts          # Better Auth config, email sending, social providers
    migrations.ts    # Data migrations (ctx.db access to component tables)
    schema.ts        # Re-exports from @banata-auth/convex/schema
    convex.config.ts # defineComponent("banataAuth")
  auth.config.ts     # Convex auth provider config
  auth.ts            # (empty)
  convex.config.ts   # defineApp() + app.use(banataAuth)
  http.ts            # HTTP router, registers Better Auth routes
```

## Migrations

Migrations run inside the component and have direct `ctx.db` access to all 34 tables. They are `internalMutation` functions defined in `banataAuth/migrations.ts`.

### Available Migrations

**Clear all data (nuclear reset):**
```bash
npx convex run --component banataAuth migrations:clearAllData
```

**Backfill projectId on orphaned records:**
```bash
# Auto-detect first project:
npx convex run --component banataAuth migrations:backfillProjectId

# Specify target project:
npx convex run --component banataAuth migrations:backfillProjectId '{"targetProjectId": "abc123"}'
```

**Remove legacy environmentId fields:**
```bash
npx convex run --component banataAuth migrations:removeEnvironmentIds
```

### Batched Execution

All migrations are batched (default 500 records per run). If a migration returns `done: false`, re-run with `startFromTable`:

```bash
npx convex run --component banataAuth migrations:clearAllData '{"startFromTable": "organization"}'
```

## Development

Push schema and functions to your Convex deployment:

```bash
npx convex dev
```

The Convex bundling is slow (several minutes). Run `convex dev` from your own terminal and let it watch for changes.
