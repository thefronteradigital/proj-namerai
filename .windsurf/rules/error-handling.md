---
trigger: always_on
description:
globs:
---

# Error Handling & Validation

**Rules:**

- Handle errors early with guard clauses
- Use `if-return` instead of nested `if-else`
- Keep "happy path" last
- Validate all inputs with Zod
- Throw user-friendly errors for React Query to display

**Example:**

```ts
if (!user) return { success: false, message: "User not found" };
if (!user.verified) return { success: false, message: "Not verified" };

// happy path
return processUser(user);
```

See [lib/utils.ts](mdc:lib/utils.ts) for error utilities.
