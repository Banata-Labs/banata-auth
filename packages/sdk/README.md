# @banata-auth/sdk

Dashboard-first Banata Auth API client.

This package is the public product surface that should feel closest to WorkOS:

- it authenticates with an API key
- it talks to Banata HTTP endpoints
- it does not access your database directly

Start in the Banata dashboard: create a project, issue a project-scoped API key, then initialize the SDK with that key.
The API key is the project selector. You should not need to pass a separate `projectId` for the normal managed-service flow.

## Installation

```bash
npm install @banata-auth/sdk
```

## Usage

```ts
import { BanataAuth } from "@banata-auth/sdk";

const banata = new BanataAuth({
  apiKey: process.env.BANATA_AUTH_API_KEY!,
  baseUrl: process.env.BANATA_AUTH_BASE_URL!,
});

const users = await banata.users.listUsers({ limit: 20 });

await banata.rbac.updateRole({
  id: "role_123",
  permissions: ["employee.read", "leave.approve"],
});
```

## Resources

- `users`
- `organizations`
- `sso`
- `directories`
- `webhooks`
- `rbac`
- `projects`
- `vault`
- `auditLogs`
- `events`
- `emails`
- `domains`
- `portal`
- `apiKeys`

## Notes

- Pass `baseUrl` explicitly. This is the Banata API origin your app should call.
- For self-hosting, use the repo's self-hosting docs instead of this package README.
