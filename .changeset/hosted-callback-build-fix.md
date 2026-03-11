---
"@banata-auth/nextjs": patch
---

Fix the hosted auth callback helper so it can be used in a normal Next.js page without forcing consumers to wrap it in `Suspense` just to avoid a `useSearchParams()` prerender error.
