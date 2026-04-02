# Frontend Engineering & Architecture Guidelines

## 1. Directory Structure (Two-Tier Model)
The structure follows the component type — not a one-size-fits-all pattern.

| Type | Location | Structure |
|------|----------|-----------|
| UI Primitive | `src/components/ui/` | Single `.tsx` file. Tailwind-only, no CSS file. |
| Page / Feature | `src/pages/<feature>/` | `.tsx` + co-located `.css` for layout styles. |
| Complex Feature | `src/pages/<feature>/components/` | Sub-folder only when a feature grows large enough to warrant it. |

- **No `index.ts` barrel files** per component — import directly from the file.
- **No mandatory folder-per-component** — a folder is only appropriate when multiple related files belong together.

## 2. Component Decomposition & Props
- **The 150-Line Rule:** If a `.tsx` file exceeds 150 lines, it must be refactored. Extract UI fragments into a `components/` subfolder inside the feature directory.
- **Prop-Driven Design:** Favor passing data via props over complex internal state.
- **Composition:** Use the `children` pattern or "Slot" pattern (passing components as props) to keep components flexible and avoid deep prop drilling.

## 3. TypeScript & Type Safety
- **Local Interfaces:** Define interfaces for Props and local state at the top of the `.tsx` file.
- **Shared Interfaces:** Reusable domain models (e.g., `User`, `LoginRequest`) must be stored in `src/types/index.ts`.
- **Naming:** Use plain PascalCase with a descriptive suffix that reflects the role:
    - Component props: `AuthLayoutProps`, `ButtonProps`
    - API shapes: `LoginRequest`, `LoginResponse`
    - Domain models: `User`, `RoleOption`
    - No `I` prefix for interfaces. No `T` prefix for types.
- **HTML Element Extension:** Primitive component props should extend the relevant HTML interface:
    ```ts
    interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { ... }
    ```
- **Zod Integration:** Derive TypeScript types from Zod schemas using `z.infer<typeof schema>`. Never manually sync types that can be inferred.

## 4. Styling (Hybrid: Tailwind + Vanilla CSS/BEM)
The project uses two distinct styling tracks depending on component type. Never mix them in the same component.

**Track A — UI Primitives (`components/ui/`)**
- Style exclusively with **Tailwind utility classes**. No companion CSS file.
- Use `cva()` (class-variance-authority) for variant-driven components (e.g., `variant: 'default' | 'outline' | 'ghost'`).
- Always wrap class merging with `cn()` from `@/lib/utils` so callers can pass a `className` override.
    ```ts
    import { cn } from '@/lib/utils'
    className={cn(buttonVariants({ variant, size }), className)}
    ```

**Track B — Page Layouts (`pages/`)**
- Use a co-located `.css` file for structural and layout styles.
- Follow **BEM naming**:
    - Block: `.auth-layout`
    - Element: `.auth-layout__content`
    - Modifier: `.auth-layout--compact`
- Never use hardcoded hex codes or pixel values. Always reference CSS custom properties from `variables.css`:
    ```css
    color: var(--color-primary);
    border-radius: var(--radius-input);
    ```
- Scope all classes with the block prefix to prevent global namespace pollution.

## 5. Imports
- **Alias:** Use `@/` for all imports outside the current file (resolves to `src/`).
- **Grouping** (blank line between each group):
    1. React and React ecosystem
    2. Third-party libraries
    3. `@/` internal imports
    4. Relative imports (co-located CSS)
- **Type imports:** Use `import type` for type-only imports:
    ```ts
    import type { LoginRequest } from '@/types'
    ```
- **CSS:** Always import co-located stylesheets relatively:
    ```ts
    import './AuthLayout.css'
    ```

## 6. UI Primitive Pattern (shadcn-style)
Components in `components/ui/` follow the shadcn architecture:
- **Radix UI** for accessible, headless primitives (`@radix-ui/react-slot`, `@radix-ui/react-label`, etc.).
- **CVA** for type-safe variant logic.
- **Tailwind** for all styling.
- **`React.forwardRef`** on all primitive components.
- **`cn()` on `className`** so the prop remains overridable from outside.
- Export the component and its props interface from the same file.

## 7. Data Fetching (TanStack Query)
- **Never call `useQuery` or `useMutation` directly inside a component.** Always wrap each API interaction in a dedicated custom hook (e.g., `useLoginMutation`, `useGetPatient`).
- **HTTP client:** Use **axios** for all HTTP calls — not `fetch`.
- **Custom hooks** live in a `hooks/` directory co-located with the feature, or in a shared `src/hooks/` if used across features.
- **Query key factory:** The target pattern for managing cache keys consistently — introduce it when `useQuery` is first used.

## 8. Form Management (TanStack Form + Zod)
- **Validation:** Every form must have a corresponding **Zod Schema**.
- **Logic/UI Split:** Keep the Zod schema and form logic clear of the main render loop.
- **Field Components:** Use a modular approach for form fields (e.g., `TextInput`, `Select`) that consume TanStack Form's field API to maintain consistent styling.

## 9. Execution Context for the Agent
- **Logic Flow:** When generating a new feature, follow this order:
    1. Define the Zod Schema / TypeScript interfaces.
    2. Create the folder structure (per the two-tier model above).
    3. Write the custom hooks for data fetching.
    4. Write sub-components if needed.
    5. Assemble the main component.
    6. Write the BEM CSS (if a page-level component) or Tailwind classes (if a UI primitive).
- **Early Returns:** Always handle `loading`, `error`, and `empty` states using early returns at the top of the component to keep the "Happy Path" JSX flat.
