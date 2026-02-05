# Kogaion UI — Design System

Design system for the Kogaion launchpad UI, inspired by **Liquid Glass** (Apple) and **Fluent** (Microsoft). Implemented in 2026.

## Overview

- **Liquid Glass**: Translucent surfaces, backdrop blur, light borders.
- **Fluent**: Semantic colors, depth (shadows), motion, accessibility (focus rings, touch targets).

## Files

- `src/styles/theme.css` — Design tokens (CSS variables).
- `src/styles/globals.css` — Imports theme, Tailwind, base styles, and utility classes.
- `src/components/ui/Page/Page.tsx` — Global page layout (header, main, bottom nav).
- `src/components/ui/PageTitle/PageTitle.tsx` — Page title, description, back link, actions.
- `src/components/ui/button.tsx` — Button variants (primary, secondary, outline, ghost).
- `src/components/ui/Card.tsx` — Card component (GlassCard) using design tokens.

---

## Layout

### Page structure

- Use the **Page** component for all app pages. It provides:
  - Full-width header (via `Header`).
  - Main content area with max-width (`--content-max-width` or `--content-narrow` when `narrow` prop is set).
  - Consistent padding via `--content-padding` and safe-area insets.
  - Optional bottom navigation (disable with `noBottomNav`).

### Section spacing

- Use `--section-gap` (e.g. 4rem) between major sections.
- Use `--section-gap-sm` (e.g. 2rem) for tighter grouping.
- Content padding: `--content-padding`, `--content-padding-lg`.

### Content width

- Default: `--content-max-width` (1280px).
- Editorial / narrow: `narrow` prop on Page → `--content-narrow` (720px).

---

## Navigation

### Header

- Logo left, primary nav (desktop) center or after logo, wallet + actions right.
- Height: `--header-height` (4rem).
- Styling: glass or solid background, subtle border.

### Bottom navigation (mobile)

- Fixed bottom, touch targets ≥ `--touch-min` (44px).
- Icons + labels; clear active state (accent or indicator).

### Menus and links

- Use `text-[var(--accent)]` for interactive links; `hover:text-[var(--accent)]` or `hover:opacity-90`.
- Back links: use PageTitle `back` prop or inline link with ← and `text-[var(--text-muted)] hover:text-[var(--accent)]`.

---

## Buttons and actions

### Variants

- **Primary**: main CTA; use default `Button` (accent background).
- **Secondary**: `variant="outline"` — border, transparent background.
- **Ghost**: `variant="ghost"` — no border, hover background.
- **Destructive**: `variant="destructive"` where applicable.

### Placement

- Primary CTA: single prominent placement (e.g. right of title via PageTitle `actions`, or center under hero).
- Secondary actions: grouped next to primary or in a row; stack on mobile when needed.

### Styling

- Min height for touch: `--touch-min` (44px).
- Border radius from theme (`--radius-md`, `--radius-lg`).
- Focus: `focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]`.

---

## Cards, lists, forms

### Cards

- Use `GlassCard` or panel style: `bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-2xl p-6`.
- Featured: add `border-[var(--accent)]/50` or similar.
- Hover (clickable): `hover:scale-[1.02]`, `hover:shadow-[var(--shadow-md)]`, `hover:border-[var(--border-default)]`.

### Lists

- Spacing between items; use `border-[var(--border-default)]` for dividers.
- Row hover: `hover:bg-[var(--bg-elevated)]/50` or similar.

### Form inputs

- Container: `bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg`.
- Text: `text-[var(--text-primary)]`, placeholder: `placeholder-[var(--text-muted)]`.
- Focus: `focus:ring-2 focus:ring-[var(--accent)]`.
- Labels: `text-[var(--text-muted)]` or `text-sm font-medium text-[var(--text-secondary)]`.

---

## Tokens (theme.css)

### Semantic colors

- `--bg-base`, `--bg-layer`, `--bg-elevated`, `--bg-overlay` — Backgrounds.
- `--text-primary`, `--text-secondary`, `--text-muted` — Text.
- `--accent`, `--accent-hover` — Primary accent.
- `--border-subtle`, `--border-default` — Borders.
- `--focus-ring` — Focus outline.

### Glass

- `--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-blur-strong` — Translucency and blur.

### Depth & motion

- `--shadow-sm`, `--shadow-md`, `--shadow-lg` — Shadows.
- `--radius-sm` … `--radius-xl` — Border radius.
- `--transition-fast`, `--transition-normal` — Durations.

### Layout

- `--content-max-width`, `--content-narrow`, `--content-padding`, `--content-padding-lg`.
- `--section-gap`, `--section-gap-sm`, `--header-height`.

### Accessibility

- `--touch-min` — Minimum touch target (44px).

### Compatibility

Legacy aliases (`--cyber-*`, `--obsidian-*`, `--aureate-*`, `--wolf-border`) map to the tokens above. Prefer the main tokens in new code: `var(--accent)`, `var(--bg-layer)`, `var(--border-default)`, etc.

---

## Usage

- Use CSS variables in components: `var(--accent)`, `var(--bg-layer)`, `var(--border-default)`, `var(--text-primary)`, `var(--text-muted)`.
- Use the **Page** and **PageTitle** components for consistent inner pages.
- Use the **Button** component with variants for all actions.
- Cards: use **GlassCard** or the panel classes above; avoid legacy `glass-card` in new code.

---

## References

- Apple Liquid Glass (WWDC 2025).
- Microsoft Fluent Design (depth, light, motion, material).
