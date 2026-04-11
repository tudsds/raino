# UX Design Language

## Aesthetic

Raino uses a **hacker/cyberpunk** design language across both apps.

### Core Principles

1. **Dark-first** — Near-black backgrounds with high-contrast foreground
2. **Neon accents** — Cyan, purple, magenta glow effects
3. **Technical precision** — Monospace fonts for data, clean grid layouts
4. **Product-grade** — Not gimmicky, highly legible
5. **Responsive** — Works across all screen sizes

### Color Palette

| Token            | Value     | Usage                        |
| ---------------- | --------- | ---------------------------- |
| bg-primary       | #0a0a0f   | Main background              |
| bg-secondary     | #111118   | Card backgrounds             |
| bg-tertiary      | #1a1a24   | Elevated surfaces            |
| bg-elevated      | #22222e   | Hover/active states          |
| fg-primary       | #e4e4e7   | Primary text                 |
| fg-secondary     | #a1a1aa   | Secondary text               |
| fg-muted         | #71717a   | Muted/disabled text          |
| accent-cyan      | #00f0ff   | Primary accent, links, CTAs  |
| accent-purple    | #8b5cf6   | Secondary accent, selections |
| accent-magenta   | #ff00aa   | Highlight, special elements  |
| accent-green     | #00ff88   | Success, confirmed status    |
| accent-amber     | #ffaa00   | Warning, pending status      |
| accent-red       | #ff3366   | Error, destructive actions   |
| border-primary   | #27272a   | Default borders              |
| border-secondary | #3f3f46   | Subtle borders               |
| border-accent    | #00f0ff33 | Glow borders                 |

### Typography

| Role      | Font           | Weight  |
| --------- | -------------- | ------- |
| Headings  | Space Grotesk  | 600-700 |
| Body      | Inter          | 400-500 |
| Code/Data | JetBrains Mono | 400     |

### Effects

- **Neon glow**: `box-shadow: 0 0 10px rgba(0, 240, 255, 0.3)`
- **Gradient accents**: Linear gradients between accent colors
- **Circuit grid**: Subtle circuit-board pattern for backgrounds
- **Hover effects**: Glow intensification, border brightening

## Site (Marketing)

### Pages

1. **Hero** — Animated hero with tagline, architecture diagram, CTA
2. **Features** — Feature cards with icons and descriptions
3. **Architecture** — System diagram with explanation
4. **How It Works** — Step-by-step workflow visualization
5. **Open Source** — GitHub link, license, contribution info

### CTA Flow

Site → "Launch Studio" CTA → Studio app

## Studio (Product)

### Layout

- **Sidebar**: Project list, navigation
- **Main area**: Active panel (spec, BOM, preview, etc.)
- **Status bar**: Workflow progress, validation status

### Panels

1. **Intake** — Chat-like interface for natural language input
2. **Spec** — Structured specification display
3. **Architecture** — Architecture template visualization
4. **BOM** — Sortable table with sourcing data and risk indicators
5. **Schematic Preview** — SVG rendering of schematic
6. **PCB 2D Preview** — SVG rendering of PCB layout
7. **PCB 3D Preview** — 3D model viewer (GLB)
8. **Downloads** — File list with download buttons
9. **Quote** — Quote band display with confidence and assumptions
10. **Handoff** — "Request PCBA Quote from Raino" CTA

### Status Indicators

- Workflow progress bar with state markers
- Per-component risk badges (low/medium/high)
- Confidence indicators for estimates
- Schematic/PCB validation status (pass/fail/warning)

### Conversion Path

Project → Spec → BOM → Previews → Quote → "Request PCBA Quote"
