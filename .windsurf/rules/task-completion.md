---
trigger: always_on
description:
globs:
---

# Task Completion Checklist

Dont proceed until you have 95% confidence, ask me before.

Every completed coding/configuration task must:

1. ✅ Run lint fix: `pnpm run lint-fix`
2. ✅ Run type checking: `pnpm run type`
3. ❌ Skip automatic documentation, .md files

**Never:**

- Auto-create README/docs or MD files
- Skip these checks before marking task complete
