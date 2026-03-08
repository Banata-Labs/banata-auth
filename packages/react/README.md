# @banata-auth/react

React provider, hooks, and auth UI for Banata Auth.

## Installation

```bash
npm install @banata-auth/react
```

## Provider

```tsx
import { BanataAuthProvider } from "@banata-auth/react";
import { authClient } from "@/lib/auth-client";

function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <BanataAuthProvider
      adapter={{
        fetchSession: async () => {
          const result = await authClient.getSession();
          if (!result.data) return null;
          return {
            user: result.data.user,
            session: result.data.session,
            organization: result.data.session.activeOrganization ?? null,
          };
        },
        signOut: async () => {
          await authClient.signOut();
        },
      }}
    >
      {children}
    </BanataAuthProvider>
  );
}
```

## Hooks

```tsx
import { useUser, useSession } from "@banata-auth/react";

function Profile() {
  const { user, isLoading } = useUser();
  const { session } = useSession();

  if (isLoading) return <div>Loading...</div>;

  return <div>{user?.email} / {session?.id}</div>;
}
```

## UI Components

```tsx
import { AuthCard, SignInForm } from "@banata-auth/react";
import { authClient } from "@/lib/auth-client";

export function SignInPage() {
  return (
    <AuthCard title="Sign in">
      <SignInForm authClient={authClient} />
    </AuthCard>
  );
}
```

## Note

Use `BanataConvexProvider` only when you also need Convex token exchange. The standard auth hooks rely on `BanataAuthProvider`.
