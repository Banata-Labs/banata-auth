# @banata-auth/nextjs

## 0.2.3

### Patch Changes

- [`88eb08f`](https://github.com/Banata-Labs/banata-auth/commit/88eb08f4e1696c1cfd47e34eb5bc0a2f102630c3) Thanks [@Shujaagideon](https://github.com/Shujaagideon)! - Fix subpath typing for package consumers and update the Next.js helper to default hosted auth integrations to `https://auth.banata.dev`.

- Updated dependencies [[`88eb08f`](https://github.com/Banata-Labs/banata-auth/commit/88eb08f4e1696c1cfd47e34eb5bc0a2f102630c3)]:
  - @banata-auth/react@0.2.1

## 0.2.2

### Patch Changes

- [`8b4f593`](https://github.com/Banata-Labs/banata-auth/commit/8b4f593253be6096aca7d16fa811662fef97b069) Thanks [@Shujaagideon](https://github.com/Shujaagideon)! - Mirror `Set-Cookie` into `Set-Better-Auth-Cookie` on cross-origin auth proxy responses so hosted Banata auth flows can complete sign-up and sign-in against customer app Next.js route handlers.

## 0.2.1

### Patch Changes

- [`5ffbae0`](https://github.com/Banata-Labs/banata-auth/commit/5ffbae04dca303a55efb748b2ee0adf4fdcf675a) Thanks [@Shujaagideon](https://github.com/Shujaagideon)! - Fix the hosted auth callback helper so it can be used in a normal Next.js page without forcing consumers to wrap it in `Suspense` just to avoid a `useSearchParams()` prerender error.

## 0.2.0

### Minor Changes

- [`39777a1`](https://github.com/Banata-Labs/banata-auth/commit/39777a100b44e90a54e3b565a2cc8a29c7388a83) Thanks [@Shujaagideon](https://github.com/Shujaagideon)! - Add hosted-auth callback helpers and cross-origin route proxy support for Next.js, plus dashboard-backed configuration management APIs in the SDK.

  This release also exports the client plugin support needed for hosted auth handoff flows and extends shared runtime config types for branding and email-password policy synchronization.

### Patch Changes

- Updated dependencies [[`39777a1`](https://github.com/Banata-Labs/banata-auth/commit/39777a100b44e90a54e3b565a2cc8a29c7388a83)]:
  - @banata-auth/react@0.2.0
  - @banata-auth/shared@0.1.1

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
