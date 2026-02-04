# Kogaion UI — Design System

Design system for the Kogaion launchpad UI, inspired by **Liquid Glass** (Apple) and **Fluent** (Microsoft). Implemented in 2026.

## Overview

- **Liquid Glass**: Translucent surfaces, backdrop blur, light borders.
- **Fluent**: Semantic colors, depth (shadows), motion, accessibility (focus rings, touch targets).

## Files

- `src/styles/theme.css` — Design tokens (CSS variables).
- `src/styles/globals.css` — Imports theme, Tailwind, base styles, and utility classes (e.g. `.glass-card`, `.shadow-cyber-sm`).

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

### Accessibility
- `--touch-min` — Minimum touch target (44px).

### Compatibility aliases
Legacy names still supported: `--cyber-bg`, `--cyber-surface`, `--cyber-accent`, `--cyber-border-elevated`, `--cyber-bg-elevated`, and Tailwind theme colors (`--obsidian-*`, `--aureate-*`, `--wolf-border`) map to the new tokens.

## Usage

- Use CSS variables in components: `var(--accent)`, `var(--bg-layer)`, etc.
- Use Tailwind with theme colors where extended (e.g. `text-aureate-base` → accent).
- Cards: add class `glass-card` for glass panel style.
- Buttons and focus: use `focus-visible:ring-2 focus-visible:ring-[var(--cyber-accent)]` (or theme focus utilities).

## References

- Apple Liquid Glass (WWDC 2025).
- Microsoft Fluent Design (depth, light, motion, material).
