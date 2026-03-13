# @banata-auth/react

## 0.2.1

### Patch Changes

- [`88eb08f`](https://github.com/Banata-Labs/banata-auth/commit/88eb08f4e1696c1cfd47e34eb5bc0a2f102630c3) Thanks [@Shujaagideon](https://github.com/Shujaagideon)! - Fix subpath typing for package consumers and update the Next.js helper to default hosted auth integrations to `https://auth.banata.dev`.

## 0.2.0

### Minor Changes

- [`39777a1`](https://github.com/Banata-Labs/banata-auth/commit/39777a100b44e90a54e3b565a2cc8a29c7388a83) Thanks [@Shujaagideon](https://github.com/Shujaagideon)! - Add hosted-auth callback helpers and cross-origin route proxy support for Next.js, plus dashboard-backed configuration management APIs in the SDK.

  This release also exports the client plugin support needed for hosted auth handoff flows and extends shared runtime config types for branding and email-password policy synchronization.

### Patch Changes

- Updated dependencies [[`39777a1`](https://github.com/Banata-Labs/banata-auth/commit/39777a100b44e90a54e3b565a2cc8a29c7388a83)]:
  - @banata-auth/shared@0.1.1

## 0.1.2

### Patch Changes

- [`6f3e777`](https://github.com/Banata-Labs/banata-auth/commit/6f3e777b475fb37b58883f5686449a4e6191106e) Thanks [@Shujaagideon](https://github.com/Shujaagideon)! - Enforce dashboard-first project binding in the public app integration flow.

  `@banata-auth/nextjs` now supports server-side project API keys for route proxying and token refresh, while `@banata-auth/react` exposes the custom Banata organization client typing needed for arbitrary role slugs.

## 0.1.1

### Patch Changes

- [`42ade64`](https://github.com/Banata-Labs/banata-auth/commit/42ade64c33de76bcb98b9fa8c65b5feb09b818bf) Thanks [@Shujaagideon](https://github.com/Shujaagideon)! - Align the public package surface around dashboard-first usage, fix published internal dependency ranges, and narrow Better Auth compatibility to the validated 1.4.x line for the current app-side integrations.
