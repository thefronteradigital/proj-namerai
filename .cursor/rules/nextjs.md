---
trigger: always_on
description:
globs:
---

# Next.js Rules

See [middleware.ts](mdc:middleware.ts) for auth flow.

**"use client" — Minimize usage**
Use Server Components by default. Only use "use client" for:

- Hooks (`useState`, `useEffect`)
- Browser APIs (`window`, `localStorage`)
- Event handlers (`onClick`, `onChange`)
- Client-only libraries (charts, animations)

**Data Fetching Strategy:**

1. Server Components: fetch directly (preferred)
2. `getServerSideProps`: dynamic per-request data
3. `getStaticProps`: build-time data with revalidation
4. Client-side: user-specific or interactive data

**Navigation:**

- Use App Router (see [app/layout.tsx](mdc:app/layout.tsx))
- Optimize for Web Vitals (LCP, CLS, FID)

**Performance:**

- Prefer SSR and RSC over CSR
- Dynamic imports for non-critical UI
- Avoid unnecessary global state

- Implement streaming with Suspense
