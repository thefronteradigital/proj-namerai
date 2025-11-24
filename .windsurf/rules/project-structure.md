---
trigger: always_on
description:
globs:
---

# File & Directory Structure

**Conventions:** Lowercase with dashes (`auth-wizard`), feature-based, flat structures

**Feature Structure:**

```
features/[feature]/
  ├── actions/      # Server actions
  ├── components/   # UI components (exported component + index.ts)
  ├── hooks/        # Feature hooks
  ├── schemas/      # Zod validation schemas
  ├── services/     # DB/API calls
  ├── types/        # TypeScript types
  ├── utils/        # Feature utilities
  └── constants/    # Feature constants
```

**App Router:**

```
app/
  ├── (auth)/       # Auth layout group (login, register)
  ├── api/          # API routes
  └── [feature]/    # Feature pages
```

**Shared:**

```
components/       # Shared UI (layout, forms, feedback, data-display, ui)
components/shared # Shared UI (general shared features component)
hooks/           # Global hooks
lib/             # auth, s3
providers/       # React context providers
db/              # Drizzle schema & seeds
utils/           # Global utils
constants/       # Global constants
```

**File Organization:**

- Export components: default or named with index.ts
- File order: Exported → Subcomponents → Helpers → Types
- Global utils: `/utils`, Feature utils: `features/[feature]/utils`
- Global constants: `/constants`, Feature constants: `features/[feature]/constants`
- DB schema: [schema.ts](mdc:db/schema.ts)
