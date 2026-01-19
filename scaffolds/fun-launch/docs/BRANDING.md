# Kogaion Brand System

Complete brand guidelines for Kogaion platform.

## Color Palette

### Dark Ritual Palette

- **Background**: `#020617` (`ritual-bg`)
- **Elevated Background**: `#0a0f1f` (`ritual-bgElevated`)
- **Hover Background**: `#111827` (`ritual-bgHover`)

### Accent Colors

- **Amber/Gold** (Primary):
  - Default: `#f59e0b` (`ritual-amber-400`)
  - Hover: `#d97706` (`ritual-amber-500`)
  - Light: `#fbbf24` (`ritual-amber-300`)
  - Dark: `#b45309` (`ritual-amber-600`)

- **Rust Red** (Secondary):
  - Default: `#dc2626` (`ritual-rust-DEFAULT`)
  - Light: `#fb7185` (`ritual-rust-400`)
  - Dark: `#991b1b` (`ritual-rust-600`)

### Usage

- **Primary Actions**: Use amber/gold gradient
- **Secondary Actions**: Use rust red for emphasis
- **Backgrounds**: Always use dark ritual palette
- **Text**: Gray-100 to Gray-300 for readability
- **Headings**: Use amber-400 for emphasis

## Typography

### Fonts

- **Headings**: Cinzel (serif)
  - Import: `@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap');`
  - Usage: `font-heading`
  - Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

- **Body/UI**: Inter (sans-serif)
  - Import: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');`
  - Usage: `font-body`
  - Weights: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Font Sizes

- **Hero Headlines**: `text-4xl md:text-6xl lg:text-7xl`
- **Section Headings**: `text-3xl md:text-4xl`
- **Card Titles**: `text-xl md:text-2xl`
- **Body Text**: `text-base md:text-lg`
- **Small Text**: `text-sm`

## Logo & Icons

### Logo Files

- **Full Logo**: `/public/brand/kogaion-logo.svg`
  - Use for headers, landing pages
  - Dimensions: 200x60 (viewBox)

- **Icon**: `/public/brand/kogaion-icon.svg`
  - Use for favicons, buttons, small spaces
  - Dimensions: 64x64 (viewBox)

### Usage Guidelines

- Always maintain aspect ratio
- Use amber/gold color for logo in light contexts
- Use white/light gray in dark contexts
- Minimum size: 32px for icon, 120px for logo

## Components

### Button

```tsx
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Tertiary Action</Button>
```

- **Default**: Amber gradient background, dark text
- **Outline**: Transparent, amber border, amber text
- **Ghost**: Transparent, amber text only

### Card

```tsx
<div className="bg-ritual-bgElevated rounded-lg border border-ritual-amber-500/20 p-6">
  {/* Content */}
</div>
```

### Badge

```tsx
<span className="px-2 py-1 text-xs bg-ritual-bgHover rounded border border-ritual-amber-500/20 text-gray-400">
  Badge Text
</span>
```

### Progress

Use Framer Motion for animated progress fills with glow effects.

## Animations

### Mist Animation

```css
.animate-mist {
  animation: mist 8s ease-in-out infinite;
}
```

Use for background gradients and atmospheric effects.

### Glow Effects

```css
.glow-amber {
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}
```

Apply to buttons, cards, and interactive elements on hover.

## Voice & Tone

### Platform Voice (Kogaion Helper)

- Mythic but readable
- Helpful and knowledgeable
- References: "mountain" (curve), "ascent" (progress), "pack" (holders), "graduation" (DAMM v2)
- Never acts as token bot
- Never leaks secrets

### User-Owned Token Voice

- 100% user-controlled
- No Kogaion branding in token bots
- Users define system prompt, traits, tone, branding
- Kogaion only provides the builder tools

## Accessibility

- **Contrast**: Ensure WCAG AA compliance (4.5:1 for text)
- **Focus States**: Always visible focus rings (amber)
- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML

## Examples

### Hero Section

```tsx
<h1 className="text-4xl md:text-6xl font-heading font-bold text-ritual-amber-400">
  Summon Tokens.
  <br />
  Ascend Markets.
</h1>
```

### Card

```tsx
<div className="bg-ritual-bgElevated p-6 rounded-lg border border-ritual-amber-500/20">
  <h3 className="text-xl font-heading font-semibold text-ritual-amber-400">
    Title
  </h3>
  <p className="text-gray-300 font-body">
    Content
  </p>
</div>
```

---

**Last Updated**: 2024-01-01
