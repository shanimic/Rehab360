# Frontend Engineering & Architecture Guidelines

## 1. Directory Structure (Two-Tier Model)
The structure follows the component type — not a one-size-fits-all pattern.

| Type | Location | Structure |
|------|----------|-----------|
| **UI Primitive** | `src/components/ui/` | **Shadcn components.** Single `.tsx` file. Tailwind-only. |
| **Shared Component** | `src/components/shared/` | Reusable, project-specific UI components (e.g., `DataTable`, `UserAvatar`). |
| **Page / Feature** | `src/pages/<feature>/` | `.tsx` + co-located `.css` for layout styles + `/components` subfolder. |

- **No `index.ts` barrel files** — import directly from the file to keep bundle sizes lean and imports explicit.
- **Folder nesting:** Only create a folder if a component requires multiple files (e.g., a complex component with sub-parts and a specific hook).

## 2. Smart vs. Dumb Component Pattern
To maximize reusability and testability, we strictly separate logic from presentation:

- **Dumb (Presentational) Components:** Located in `components/` or `pages/<feature>/components/`. These **must not** call API hooks (TanStack Query). They receive data and callbacks strictly via **props**.
- **Smart (Container/Page) Components:** Located in `pages/`. These handle data fetching via custom hooks and pass the resulting data down.
- **The 150-Line Rule:** If a `.tsx` file exceeds 150 lines, it must be refactored. Extract UI fragments into the local `components/` subfolder.

## 3. UI Primitives & Shadcn
- **Standard:** Use **Shadcn UI** for all core interface elements (Buttons, Dialogs, Tables).
- **Implementation:** Shadcn components reside in `src/components/ui/`. Modify these files directly for global theme adjustments.
- **Pattern:** Follow the Radix UI "Slot" pattern to allow for high flexibility without prop-drilling style overrides.

## 4. TypeScript & Type Safety
- **Local Interfaces:** Define `Props` at the top of the `.tsx` file. 
- **HTML Extension:** UI primitives must extend standard HTML attributes:
    ```ts
    interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
      isLoading?: boolean;
    }
    ```
- **Zod:** Derive types using `z.infer`. Never manually maintain types for data that is already validated by a schema.

## 5. Styling (Hybrid: Tailwind + BEM)
**Track A — UI Primitives & Shared (`components/`)**
- Style exclusively with **Tailwind**. 
- Use `cva()` for variants and `cn()` for class merging.

**Track B — Page Layouts (`pages/`)**
- Use co-located `.css` with **BEM naming** (e.g., `.profile-page__header--expanded`).
- Use CSS Variables (`var(--color-primary)`) from `variables.css`. No hardcoded hex/px values.

## 6. Data Fetching (TanStack Query)
- **Custom Hooks Only:** Never call `useQuery` or `useMutation` directly in a component. 
- **Placement:** Call these hooks only in **Page-level** or **Container** components. 
- **Decoupling:** If a sub-component needs data, pass it as a prop. Do not force the sub-component to fetch its own data, as this makes it non-reusable in different contexts.

## 7. Routing (React Router Data APIs)
- **Data APIs:** Use `createBrowserRouter` with `loaders` and `actions`.
- **Pre-fetching:** Use `loader` functions to fetch critical data before the component renders to avoid "loading spinner waterfalls."
- **Navigation:** Use the `useNavigate` hook for programmatic navigation and `NavLink` for sidebar/header links.

## 8. State Management (Jotai)
- **Scope:** Use Jotai only for truly global state (Auth, Theme). 
- **Hooks:** Prefer `useAtomValue` or `useSetAtom` over the full `useAtom` to prevent unnecessary re-renders in components that only need to read or only need to write.

## 9. Imports & Execution Context
- **Order:** 1. React/Ecosystem -> 2. Libs -> 3. `@/` (Internal) -> 4. Relative (CSS).
- **Logic Flow for Claude:**
    1. Define Zod Schema/Interfaces.
    2. Setup React Router **loader/action** if applicable.
    3. Create the TanStack Query **custom hook**.
    4. Build the **Dumb components** (UI-only, prop-based).
    5. Assemble in the **Smart component** (Page/Container).
    6. Run `npm run lint` and fix all errors.

## 10. ESLint Compliance
No task is complete until `npm run lint` returns **0 errors**. 
**Always state the ESLint outcome in your final message.**