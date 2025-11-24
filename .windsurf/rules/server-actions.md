---
trigger: glob
description:
globs: features/*/actions/*.ts
---

# Server Actions

Use `next-safe-action` for type-safe server actions (see existing actions in features).

**Pattern:**

```ts
import { action } from "next-safe-action";
import { z } from "zod";
import type { ActionResponse } from "@/types/shared";

const schema = z.object({
  name: z.string().min(1),
});

export const createUser = action(
  schema,
  async (input): Promise<ActionResponse> => {
    if (!input.name) return { success: false, message: "Name required" };

    await db.user.create({ data: input });
    return { success: true, message: "User created" };
  }
);
```

**Rules:**

- Validate with Zod schemas
- Return consistent `ActionResponse` objects
- Avoid try/catch for expected errors — return structured results
- Handle errors early with guard clauses
