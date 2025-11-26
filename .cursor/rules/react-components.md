---
trigger: always_on
description:
globs: *.tsx
---

# React Component Rules

**Always:**

- Functional components only (never class)
- Destructure props in signature
- Define prop types with TypeScript interfaces
- Keep components under 200 lines

**Example:**

```tsx
interface UserCardProps {
  name: string;
  age?: number;
}

export function UserCard({ name, age }: UserCardProps) {
  return (
    <div className="p-4 border rounded">
      <p>{name}</p>
      {age && <p>{age}</p>}
    </div>
  );
}
```

**State:**

- `useState` for simple local state
- `useReducer` for multiple related actions
- Avoid Context overuse — prop drilling is often clearer
- Zustand/Redux only for large global state

**Hooks:**

- `useMemo`/`useCallback` only when needed
- `useEffect` only for side effects (API, listeners)
- Don't derive state in `useEffect` — compute during render
- Always include all dependencies

**Guidelines:**

- Early returns for loading/error states
- Extract complex JSX into subcomponents
- Stable, unique keys (never array indexes)
- Prefix event handlers with `handle`
