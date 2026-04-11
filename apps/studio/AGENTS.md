# apps/studio — Raino Product Application

## Purpose

The actual product website where users interact with Raino's PCB/PCBA workflow.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS v4
- @raino/ui design system
- @raino/core schemas
- @raino/agents contracts

## Features

- Create project
- Natural language intake (chat or guided form)
- File upload support
- Clarification workflow
- Dashboard with project list
- Structured spec panel
- Architecture panel
- BOM panel with sourcing rationale
- Schematic preview (SVG/PDF)
- PCB 2D preview (SVG)
- PCB 3D preview (GLB)
- Downloads panel (BOM, Gerbers, manufacturing bundle)
- Rough quote panel (low/mid/high band)
- "Request PCBA Quote from Raino" CTA

## API Routes

```
POST   /api/projects
POST   /api/projects/:id/intake
POST   /api/projects/:id/clarify
POST   /api/projects/:id/spec/compile
POST   /api/projects/:id/architecture/plan
POST   /api/projects/:id/ingest/candidates
POST   /api/projects/:id/ingest/run
GET    /api/projects/:id/ingest/status
POST   /api/projects/:id/ingest/promote
POST   /api/projects/:id/bom/generate
POST   /api/projects/:id/design/generate
POST   /api/projects/:id/validate
GET    /api/projects/:id/previews/schematic
GET    /api/projects/:id/previews/pcb2d
GET    /api/projects/:id/previews/pcb3d
GET    /api/projects/:id/downloads
GET    /api/projects/:id/audit
POST   /api/projects/:id/quote/rough
POST   /api/projects/:id/order-intent
POST   /api/projects/:id/handoff/pcba
```

## Design Language

- Hacker / cyberpunk
- Dark-first
- Highly legible
- Clear conversion path to Raino quote handoff

## Commands

```bash
pnpm dev --filter @raino/studio
pnpm build --filter @raino/studio
```
