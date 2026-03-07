# @banata-auth/shared

Shared types, schemas, constants, and utilities for the Banata Auth ecosystem.

## Installation

```bash
npm install @banata-auth/shared
```

## What's included

- **Types** — `User`, `Session`, `Organization`, `ApiKey`, `WebhookEndpoint`, `AuditEvent`, and more
- **Email block types** — `EmailBlock`, `EmailTemplateDefinition`, `BLOCK_PALETTE`, block factories, variable interpolation, and built-in auth template definitions
- **Validation schemas** — Zod schemas for emails, passwords, URLs, names
- **Constants** — Rate limit defaults, webhook configuration, error codes
- **Error classes** — `BanataAuthError`, `AuthenticationError`, `RateLimitError`, etc.

## Usage

```ts
import type { User, Organization } from "@banata-auth/shared";
import { emailSchema, passwordSchema } from "@banata-auth/shared";
import { BanataAuthError, NotFoundError } from "@banata-auth/shared";
```

## License

MIT
