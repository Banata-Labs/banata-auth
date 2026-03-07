# @banata-auth/sdk

Server-side SDK for the Banata Auth platform — manage users, organizations, SSO, RBAC, webhooks, and more.

## Installation

```bash
npm install @banata-auth/sdk
```

## Quick start

```ts
import { BanataAuth } from "@banata-auth/sdk";

const banataAuth = new BanataAuth({
  apiKey: "sk_live_...",
  baseUrl: "https://your-convex-site.convex.site",
});

// List users
const users = await banataAuth.userManagement.listUsers();

// Create organization
const org = await banataAuth.organizations.createOrganization({
  name: "Acme Corp",
});

// Manage webhooks
const endpoint = await banataAuth.webhooks.createEndpoint({
  url: "https://example.com/webhooks",
  eventTypes: ["user.created"],
});

// Verify webhook signatures
const event = await banataAuth.webhooks.constructEvent({
  payload: body,
  sigHeader: headers["webhook-signature"],
  secret: webhookSecret,
});
```

## Resources

| Resource | Description |
|----------|-------------|
| `userManagement` | CRUD users, list sessions, ban/unban |
| `organizations` | Create/manage organizations and members |
| `sso` | SSO connection management |
| `directorySync` | SCIM directory sync |
| `rbac` | Role-based access control |
| `apiKeys` | API key lifecycle management |
| `webhooks` | Webhook endpoints and signature verification |
| `emails` | Send emails and manage templates (`emails.send()`, `emails.templates.list()`) |
| `auditLogs` | Audit event creation and querying |
| `events` | Event streaming |
| `portal` | Admin portal link generation |
| `vault` | Secret storage |
| `domains` | Domain verification |
| `projects` | Multi-tenant project management |

## Features

- Automatic retry with exponential backoff (5xx and 429)
- `Retry-After` header support for rate limiting
- Typed error classes (`AuthenticationError`, `RateLimitError`, etc.)
- Configurable timeout and retry count

## License

MIT
