

# Plan: Bigger Logo + Dark Mode on Auth Page

## Changes

### 1. Navbar logo — increase size
**`src/components/Navbar.tsx` (line 136)**
- Change logo container from `w-11 h-11` → `w-14 h-14` and rounded from `rounded-xl` → `rounded-2xl`

### 2. Auth page — add dark mode logo support
**`src/pages/Auth.tsx`**
- Import `logoDark` from `steersolo-logo-dark.jpg` and `useTheme` from `next-themes`
- Use theme-aware logo selection: `const logo = theme === 'dark' ? logoDark : logoLight`
- Remove `bg-white` ring on desktop logo container in dark mode (line 260)
- Remove `bg-white` behavior on mobile logo container (line 320)

### 3. Auth page — zoom out / reduce padding
**`src/pages/Auth.tsx`**
- Reduce inner padding on the right-side card panel (the form area) to give more breathing room — e.g. change `p-8 lg:p-12` to `p-6 lg:p-10` or similar if overly cramped
- This "zooms out" the edges so content doesn't feel so tight

