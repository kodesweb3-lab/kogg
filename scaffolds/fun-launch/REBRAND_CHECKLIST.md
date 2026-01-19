# Kogaion Rebrand Verification Checklist

Use this checklist to verify the rebrand is complete and functional.

## Visual Verification

### Design System
- [ ] Background color is `#020617` (ritual-bg)
- [ ] Amber/gold accents visible (`#f59e0b`)
- [ ] Rust red used sparingly for emphasis
- [ ] Cinzel font used for headings
- [ ] Inter font used for body/UI text
- [ ] Logo displays correctly (`/brand/kogaion-logo.svg`)
- [ ] Icon displays correctly (`/brand/kogaion-icon.svg`)

### Landing Page (/)
- [ ] Hero section shows Kogaion logo
- [ ] Headline: "Summon Tokens. Ascend Markets."
- [ ] Mist animation in background (subtle)
- [ ] CTAs: "Launch a Token" and "Explore the Pack"
- [ ] Sections: What is Kogaion, How the Ritual Works, AI Wolves, Safety/LP Locked, Final CTA
- [ ] Copy is mythic but readable (no cringe)

### Navigation
- [ ] Header shows Kogaion logo + text
- [ ] Nav items: Home, Discover, Launch, Lore, Wolves, Docs
- [ ] Active nav item highlighted in amber
- [ ] Hover states work correctly

### Pages
- [ ] `/lore` page loads with Kogainon mountain story
- [ ] `/wolves` page shows 5 preset personas (Fire, Frost, Blood, Moon, Stone)
- [ ] `/discover` page lists tokens from database
- [ ] `/create-pool` uses Kogaion styling

## Functional Verification

### Token Personality Builder
- [ ] Preset tab shows 5 wolves (Fire, Frost, Blood, Moon, Stone)
- [ ] Selecting preset populates fields
- [ ] Custom tab allows starting from scratch
- [ ] System prompt editor is always editable
- [ ] Style sliders work (chaos, friendliness, formality, aggression, humor)
- [ ] Branding fields work (catchphrases, emojis, voice style)
- [ ] Rules fields work (allowed, forbidden topics)
- [ ] Live preview chat sandbox works (uses HuggingFace)
- [ ] Save button stores persona data

### Ask Kogaion Helper
- [ ] Floating button appears (bottom-right, 🐺 icon)
- [ ] Clicking opens chat modal
- [ ] Chat uses Kogaion system prompt (platform guide only)
- [ ] Responses are helpful and mythic
- [ ] Never acts as token bot
- [ ] Never leaks secrets

### Bot Activation
- [ ] "Activate Token Bot" button appears on token page (if wallet connected)
- [ ] Clicking opens BotActivationModal
- [ ] Modal shows Token Personality Builder
- [ ] User can build persona and save
- [ ] User can enter BotFather token
- [ ] Payment transaction created (0.1 SOL to treasury)
- [ ] Bot activates after payment confirmation
- [ ] Worker loads bot with USER'S persona (not Kogaion voice)

### Database
- [ ] `BotPersona` table has new fields: `personaStyleJson`, `brandingJson`, `presetUsed`
- [ ] Persona data stored correctly
- [ ] Bot tokens encrypted (AES-256-GCM)
- [ ] Worker uses user's `systemPrompt` (not Kogaion)

## Separation of Concerns

### Platform Helper (Ask Kogaion)
- [ ] Uses strict Kogaion system prompt
- [ ] Only helps with platform features
- [ ] Never acts as token bot
- [ ] Never represents specific tokens

### Token Bots
- [ ] Use 100% user-owned system prompt
- [ ] No Kogaion branding in responses
- [ ] User controls all aspects (traits, tone, branding, rules)
- [ ] Presets are starting points only

## Polish & Accessibility

### Animations
- [ ] Framer Motion installed and working
- [ ] Mist animation subtle and smooth
- [ ] Glow effects on hover (amber)
- [ ] Progress fills animate smoothly
- [ ] Modal transitions smooth

### Accessibility
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus states visible (amber ring)
- [ ] Contrast ratios meet WCAG AA (4.5:1)
- [ ] ARIA labels on interactive elements
- [ ] Screen reader friendly
- [ ] Skip to content link (if needed)

## Documentation

- [ ] `docs/BRANDING.md` created with complete brand system
- [ ] `docs/PERSONALITY_BUILDER.md` created with user ownership explained
- [ ] `README.md` updated with Kogaion story and architecture
- [ ] All docs reference user ownership clearly

## Build & Deploy

- [ ] `pnpm build` succeeds
- [ ] `pnpm typecheck` passes
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] All environment variables documented
- [ ] `.env` not committed to Git

## Critical Checks

- [ ] **NO Kogaion voice in token bots** - bots use user's system prompt
- [ ] **NO secrets in code** - all secrets in environment variables
- [ ] **Encryption working** - bot tokens encrypted at rest
- [ ] **Persona 100% user-owned** - Kogaion only provides builder
- [ ] **Platform helper separate** - Ask Kogaion ≠ token bots

---

**Status**: ⚠️ **FAIL** if any critical checks fail

**Last Updated**: 2024-01-01
