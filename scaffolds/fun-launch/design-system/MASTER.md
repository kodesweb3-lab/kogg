# Kogaion Design System (Master)

Single source of truth for UI/UX across the platform. Aligned with [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) principles: Cyberpunk UI style, accessibility, and consistent patterns.

## Pattern & Style

- **Pattern**: Hero-Centric + Trust (landing); clear CTAs, social proof where relevant.
- **Style**: Cyberpunk UI + Dark Mode (OLED) + Glassmorphism. Tech/crypto launchpad identity.
- **Mood**: High-tech, precise, premium; subtle steampunk/copper accents.

## Colors (CSS Variables)

| Role | Token | Usage |
|------|--------|--------|
| Background | `--cyber-bg`, `--tech-bg` | Page, panels |
| Elevated | `--cyber-bg-elevated`, `--tech-surface` | Cards, dropdowns |
| Primary accent | `--cyber-accent`, `--tech-accent` | CTAs, links, focus |
| Secondary accent | `--cyber-accent-2` | Highlights, badges |
| Text primary | `--text-primary` | Body, headings |
| Text muted | `--text-muted`, `--text-subtle` | Captions, hints |
| Border | `--cyber-border`, `--border-default` | Dividers, inputs |

Defined in: `src/styles/design-tokens.css`, `src/styles/kogaion-enhanced.css`.

## Typography

- **Heading / Display**: Orbitron (font-heading, font-display)
- **Body**: Inter (font-body)
- **Mono**: JetBrains Mono (font-mono)

Scale: Use clamp() or Tailwind for fluid type. Headings: letter-spacing 0.02em–0.05em.

## Spacing & Radius

- **Touch target minimum**: 44px (`--button-min-height-touch`)
- **Radius**: `--radius-sm` (6px), `--radius-md` (10px), `--radius-lg` (16px), `--radius-xl` (24px)
- **Transitions**: 150–300ms for hover/focus (`--transition-fast`, `--transition-normal`)

## Effects

- Hover: smooth transition 150–300ms; subtle border/glow change.
- Focus: visible focus ring (2px offset, accent color). Use `:focus-visible`.
- Shadows: `--shadow-elevation-*`, `--shadow-glow-cyan` for emphasis.

## Anti-patterns (Avoid)

- No emojis as primary UI icons (use SVG: Heroicons/Lucide or custom).
- Avoid generic “AI purple/pink” gradients for primary UI; keep cyan/copper identity.
- No harsh animations; respect `prefers-reduced-motion`.
- Don’t rely on color alone for meaning (pair with icon or text).

## Pre-delivery Checklist

- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Text contrast ≥ 4.5:1 (WCAG AA) for body text
- [ ] Focus states visible for keyboard navigation (`:focus-visible`)
- [ ] `prefers-reduced-motion` respected (globals.css)
- [ ] Responsive breakpoints: 375px, 768px, 1024px, 1440px
- [ ] Touch targets ≥ 44px on mobile (buttons, nav items)

## File Reference

- **Tokens**: `src/styles/design-tokens.css`, `src/styles/kogaion-enhanced.css`
- **Globals**: `src/styles/globals.css`
- **Theme (wolf)**: `src/styles/wolf-themes.css`
