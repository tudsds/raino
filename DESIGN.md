---
name: Raino
description: Agentic PCB design workflow platform
colors:
  navy: "#0A1929"
  blue: "#1565C0"
  lightBlue: "#6191D3"
  slate: "#64748B"
typography:
  display:
    fontFamily: "'Noto Serif', serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Noto Serif', serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Noto Serif', serif"
    fontSize: "clamp(1.125rem, 2vw, 1.5rem)"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0"
  body:
    fontFamily: "'Noto Serif', serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  label:
    fontFamily: "'Noto Serif', serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  liquid-glass-card:
    backgroundColor: "rgba(255,255,255,0.06)"
    backdropFilter: "blur(12px) saturate(180%)"
    borderRadius: "{rounded.lg}"
    border: "1px solid rgba(255,255,255,0.12)"
    boxShadow: "0 8px 32px rgba(0,0,0,0.20)"
  primary-button:
    backgroundColor: "{colors.blue}"
    textColor: "#E2E8F0"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  primary-button-hover:
    backgroundColor: "{colors.lightBlue}"
    textColor: "#0A1929"
  depth-panel:
    backgroundColor: "#0D2137"
    borderRadius: "{rounded.md}"
    border: "1px solid rgba(255,255,255,0.12)"
    padding: "24px"
---

# Design System: Raino

## 1. Overview

**Creative North Star: "The luminous workshop"**

Raino's interface channels the clarity of a well-lit electronics workshop — bright surfaces, sharp contrast, tools arranged with purpose. It is the opposite of the dark, neon-accented hacker aesthetic that dominates hardware tooling. Where that aesthetic performs danger and expertise as theater, Raino embodies competence as matter-of-fact. The interface gets out of the way.

The design refuses decoration as a substitute for clarity. Glass surfaces are used structurally — they separate depth layers, not as skin over every card. Motion earns its presence by confirming state or guiding attention. Typography is Noto Serif at every scale, producing a consistent voice from headline to label.

**Key Characteristics:**
- Light-dominant palette on deep navy — readable in any lighting condition
- Noto Serif throughout — one family, one voice, no font switching
- Glass elements convey depth hierarchy, not decoration
- Motion is state-confirming, never ambient

## 2. Colors: The Coastal Palette

The palette draws from the color of light on water at dusk — deep navy base, clear sky blue accents, the luminous line where ocean meets horizon. It is calm yet precise.

### Primary

- **Deep Navy** (#0A1929): Primary background. The dark foundation that makes the blues luminous. Used for the app shell, sidebar surfaces, and primary canvas.
- **Clear Blue** (#1565C0): Primary action color. Buttons, active states, selected indicators. The color that says "this is what you act on."
- **Horizon Light Blue** (#6191D3): Secondary accent. Hover states, focus rings, informational indicators. Softer than the primary, never competes with it.
- **Slate** (#64748B): Neutral text, borders, disabled states. Subdued but never muddy. Reads as quiet confidence.

### Named Rules

**The One-Tenth Rule.** The primary blue appears on no more than 10% of any given screen. Its rarity is the point — it marks what matters. Secondary light blue expands this to 20% for hover and focus states.

**The Contrast Rule.** Every text/background pairing meets WCAG AA (4.5:1 minimum for body text). The navy/slate combination on the deep background is intentional — muted against dark, not washed out.

## 3. Typography

**Font:** Noto Serif (Google Fonts)

**Character:** Authoritative without being formal. The serif gives hardware instructions the same weight as engineering documentation — serious, readable, unpretentious. One family at every scale eliminates font-switching inconsistency.

### Hierarchy

- **Display** (400 weight, clamp(2rem, 5vw, 3.5rem), line-height 1.1): Hero headlines, section titles. Large, breathable, commanding without shouting.
- **Headline** (400 weight, clamp(1.5rem, 3vw, 2.25rem), line-height 1.2): Card titles, panel headings, step labels in the workflow.
- **Title** (500 weight, clamp(1.125rem, 2vw, 1.5rem), line-height 1.3): UI labels, form field labels, button text.
- **Body** (400 weight, 1rem, line-height 1.65, max 70ch): Spec descriptions, BOM line items, engineering notes. Generous leading for extended reading.
- **Label** (500 weight, 0.875rem, line-height 1.4, letter-spacing 0.01em): Table headers, status badges, helper text. Slightly tracked for compact legibility.

### Scale Ratio

1.25 fluid scale between steps. Display to Headline is a full step; Headline to Title is a half step retained for flexibility. The ratio is intentional — sharp hierarchy prevents visual noise.

### Named Rules

**The Serif-Only Rule.** Noto Serif at every scale. No switching to sans-serif for UI labels, no mono for code, no italic for emphasis. The single family is the typographic commitment.

## 4. Elevation

Raino uses a hybrid depth model: subtle shadows for structural elevation, glassmorphism for layer separation. The system is not flat — depth is meaningful.

### Shadow Vocabulary

- **Ambient card shadow** (`0 8px 32px rgba(0,0,0,0.20)`): Liquid glass cards at rest. A soft diffuse glow that separates the card from the background without harsh edges.
- **Depth panel shadow** (`0 4px 16px rgba(0,0,0,0.15)`): Deeper inset panels — BOM tables, spec panels. Structural shadow, not decorative.
- **Focus ring** (`0 0 0 2px #6191D3`): Focus state only. No decorative glows, no ambient halos. The focus ring is earned by keyboard navigation or tab interaction.

### Glass Strategy

Glass surfaces use `backdrop-filter: blur(12px) saturate(180%)` with `background: rgba(255,255,255,0.06)`. The effect is structural: it separates the glass panel from content behind it. Glass never decorates — it distinguishes layer from layer.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only in response to state — hover, focus, active elevation. No ambient motion, no floating shadows, no decorative glows.

**The Layer-Rule Rule.** Glass panels only appear where content exists at multiple depth levels. A single-depth screen uses flat surfaces. Glass is reserved for hierarchical separation, not skin.

## 5. Components

### Buttons

- **Shape:** 8px radius — slightly curved, not，软 not hard-cornered
- **Primary:** Blue (#1565C0) background, #E2E8F0 text, 12px 24px padding. One clear action color per screen.
- **Hover:** Background shifts to light blue (#6191D3), text shifts to navy (#0A1929). The inversion confirms the hover state without a shadow appearing.
- **Focus:** 2px horizon light blue ring with 2px offset. Always keyboard-visible.
- **Active:** Slight scale down (0.98 transform). Tactile confirmation.
- **Spring Motion:** Button press uses a spring-eased transition (cubic-bezier(0.34, 1.56, 0.64, 1)). The overshoot communicates responsiveness without bounce.

### Liquid Glass Cards

- **Background:** rgba(255,255,255,0.06) with blur(12px) saturate(180%) backdrop
- **Border:** 1px solid rgba(255,255,255,0.12)
- **Border Radius:** 16px
- **Shadow:** 0 8px 32px rgba(0,0,0,0.20)
- **Used for:** Spec panels, BOM summaries, quote cards, step containers. The glass conveys depth without demanding attention.

### Depth-Layered Panels

- **Background:** Solid navy (#0D2137) — one step lighter than the app canvas
- **Border:** 1px solid rgba(255,255,255,0.12)
- **Border Radius:** 12px
- **Used for:** Sidebar sections, table containers, form groups. The solid background conveys containment without glass overhead.

### Accordion Thinking

Workflow steps expand and collapse with `grid-template-rows` transition (not height animation). The content reveals cleanly, without collapse animation that feels decorative. Timing: 200ms ease-out.

### Navigation

- **Background:** #0A1929 (app canvas)
- **Active state:** Left border 2px #1565C0, background rgba(255,255,255,0.08)
- **Hover:** Background rgba(255,255,255,0.04)
- **Typography:** Title weight (500), 0.875rem, Noto Serif

### Form Fields

- **Background:** rgba(255,255,255,0.06)
- **Border:** 1px solid rgba(255,255,255,0.12)
- **Border Radius:** 8px
- **Focus:** Border shifts to #6191D3, no glow — the border color change is sufficient
- **Error:** Border shifts to #EF5350, helper text below in error color
- **Disabled:** Opacity 0.5, cursor not-allowed

### Chips / Badges

- **Background:** rgba(255,255,255,0.08)
- **Text:** Slate (#64748B), Label weight
- **Border Radius:** 4px (tight, not rounded)
- **Used for:** Status indicators, part family tags, confidence bands on quotes

## 6. Do's and Don'ts

### Do

- **Do** use the blue accent on primary actions only — buttons, active nav items, selected states. Limit to 10% of a screen.
- **Do** use liquid glass cards for panel content that sits above the primary canvas. The glass separates depth.
- **Do** use Noto Serif at every scale — body, labels, data, buttons. The single family is the commitment.
- **Do** use the spring-motion button with overshoot easing (cubic-bezier(0.34, 1.56, 0.64, 1)). Tactile responsiveness is a feature.
- **Do** use accordion transitions with grid-template-rows. The content reveals cleanly without decorative animation.

### Don't

- **Don't** use the navy background with neon or saturated accent colors. The palette is calm, not electric. Cyberpunk aesthetics are explicitly rejected.
- **Don't** use glassmorphism as skin over every element. Reserve liquid glass for depth-separated panels only. Flat surfaces are the default.
- **Don't** use monospace fonts as a "technical" indicator. Fonts are not credentials. Use Noto Serif throughout.
- **Don't** use display fonts (large, ornate) for UI labels, table data, or button text. Typography hierarchy serves function, not decoration.
- **Don't** use SaaS template aesthetics — card grids with icon + heading + text repeated endlessly, generic "powered by AI" badges, flat color icons on dark backgrounds.
- **Don't** use ambient motion or scroll-driven animations. Motion is state-confirming only. Users are doing work; they don't need choreography.
- **Don't** use more than 2 shadow levels on a single screen. Depth is meaningful; excessive layering destroys it.