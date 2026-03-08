# @banata-auth/convex

Self-hosting kit for running Banata Auth inside your own Convex deployment.

This package is for:

- Banata's own dogfooding
- GitHub-based self-hosting
- advanced teams that explicitly want the auth runtime in their own infrastructure

If you want the dashboard-first / WorkOS-style integration, start with `@banata-auth/sdk` instead.

## Compatibility

Use:

- `better-auth@1.4.21`
- `@convex-dev/better-auth@0.10.13`

## Required Local Files

```text
convex/
├── convex.config.ts
├── auth.config.ts
├── authNode.ts
├── http.ts
└── banataAuth/
    ├── convex.config.ts
    ├── schema.ts
    ├── auth.ts
    └── adapter.ts
```

The important detail is that you must generate the adapter locally in the consuming app. This package does not remove that requirement.

## Minimal Example

```ts
// convex/banataAuth/schema.ts
export { default } from "@banata-auth/convex/schema";
```

```ts
// convex/banataAuth/adapter.ts
import { createApi } from "@banata-auth/convex/adapter";
import { createAuthOptions } from "./auth";
import schema from "./schema";

export const { create, findOne, findMany, updateOne, updateMany, deleteOne, deleteMany } =
  createApi(schema, createAuthOptions);
```

For the full self-hosted setup, use the repository docs and the example app.
