# @banata-auth/ui

Reusable UI components for Banata Auth — built on Radix UI and Tailwind CSS.

## Installation

```bash
npm install @banata-auth/ui
```

## What's included

Foundational UI primitives used by `@banata-auth/react` and the Banata Auth dashboard:

- Button, Input, Label, Card
- Dialog, Dropdown Menu, Tabs
- Table, Badge, Separator
- Toast notifications
- And more

## Usage

```tsx
import { Button } from "@banata-auth/ui";
import { Card, CardHeader, CardContent } from "@banata-auth/ui";

function MyComponent() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## License

MIT
