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
|-- convex.config.ts
|-- auth.config.ts
|-- authNode.ts
|-- http.ts
`-- banataAuth/
    |-- auth.ts
    |-- adapter.ts
    `-- schema.ts
```

The packaged component now provides:

- `@banata-auth/convex/convex.config` for component registration
- the component schema
- packaged component migrations

The remaining local files are the ones that still need app context:

- `banataAuth/auth.ts` binds your local env and auth config
- `banataAuth/adapter.ts` closes over that auth factory
- `banataAuth/schema.ts` stays as a local schema anchor for Convex component codegen

## Minimal Example

```ts
// convex/convex.config.ts
import banataAuth from "@banata-auth/convex/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();

app.use(banataAuth);

export default app;
```

```ts
// convex/banataAuth/adapter.ts
import { createBanataAuthAdapter } from "@banata-auth/convex/adapter";
import { createAuthOptions } from "./auth";

export const { create, findOne, findMany, updateOne, updateMany, deleteOne, deleteMany } =
	createBanataAuthAdapter(createAuthOptions);
```

For the full self-hosted setup, use the repository docs and the example app.
