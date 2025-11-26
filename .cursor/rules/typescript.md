---
trigger: always_on
description:
globs: *.ts,*.tsx
---

# TypeScript Rules

**Always:**

- Use TypeScript, never plain JS
- Prefer `interface` over `type`
- Avoid `enum` — use maps or union types
- Use `function` keyword for pure functions
- Early returns for invalid/error states
- Avoid `any`

**Example:**

```ts
interface User {
  name: string;
  age?: number;
}

function getUser(id: string): User | null {
  if (!id) return null;
  // happy path last
  return fetchUser(id);
}
```

Keep conditionals concise: `if (!user) return null`
