# @banata-auth/nextjs

## 0.1.3

### Patch Changes

- [`ee8a9d1`](https://github.com/Banata-Labs/banata-auth/commit/ee8a9d12c750619155735fafef49304731253d94) Thanks [@Shujaagideon](https://github.com/Shujaagideon)! - Strip decompression headers from proxied auth responses so social sign-in redirects work reliably in Next.js apps.

## 0.1.2

### Patch Changes

- [`6f3e777`](https://github.com/Banata-Labs/banata-auth/commit/6f3e777b475fb37b58883f5686449a4e6191106e) Thanks [@Shujaagideon](https://github.com/Shujaagideon)! - Enforce dashboard-first project binding in the public app integration flow.

  `@banata-auth/nextjs` now supports server-side project API keys for route proxying and token refresh, while `@banata-auth/react` exposes the custom Banata organization client typing needed for arbitrary role slugs.

- Updated dependencies [[`6f3e777`](https://github.com/Banata-Labs/banata-auth/commit/6f3e777b475fb37b58883f5686449a4e6191106e)]:
  - @banata-auth/react@0.1.2

## 0.1.1

### Patch Changes

- [`42ade64`](https://github.com/Banata-Labs/banata-auth/commit/42ade64c33de76bcb98b9fa8c65b5feb09b818bf) Thanks [@Shujaagideon](https://github.com/Shujaagideon)! - Align the public package surface around dashboard-first usage, fix published internal dependency ranges, and narrow Better Auth compatibility to the validated 1.4.x line for the current app-side integrations.

- Updated dependencies [[`42ade64`](https://github.com/Banata-Labs/banata-auth/commit/42ade64c33de76bcb98b9fa8c65b5feb09b818bf)]:
  - @banata-auth/react@0.1.1
