---
trigger: always_on
description:
globs: *.tsx
---

# UI & Styling

**Stack:** Shadcn UI, Radix UI, Tailwind (see [components/ui](mdc:components/ui))

**Rules:**

- Mobile-first responsive design
- Prefer `flex` or `grid` layouts
- Avoid `absolute`, `flex-1`, `flex-grow`
- Optimize images: WebP, lazy loading, `next/image`

**Example:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

See [globals.css](mdc:app/globals.css) for global styles.
