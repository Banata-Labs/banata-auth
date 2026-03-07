# @banata-auth/react

React components, hooks, and providers for Banata Auth — session management, auth forms, and Convex integration.

## Installation

```bash
npm install @banata-auth/react
```

## Quick start

### Provider setup

```tsx
import { BanataAuthProvider } from "@banata-auth/react";

function App({ children }) {
  return (
    <BanataAuthProvider>
      {children}
    </BanataAuthProvider>
  );
}
```

### Hooks

```tsx
import { useUser, useSession } from "@banata-auth/react";

function Profile() {
  const { user, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  return <div>Hello, {user?.name}</div>;
}
```

### Auth forms

```tsx
import { SignInForm, SignUpForm, AuthCard } from "@banata-auth/react";

function LoginPage() {
  return (
    <AuthCard title="Sign in">
      <SignInForm />
    </AuthCard>
  );
}
```

## Features

- `BanataAuthProvider` with Convex adapter support
- `useUser`, `useSession`, `useOrganization` hooks
- Pre-built `SignInForm`, `SignUpForm`, `SocialButtons` components
- `AuthBoundary` for conditional rendering based on auth state

## License

MIT
