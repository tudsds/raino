# apps/site — Raino Marketing Website

## Purpose

Public-facing marketing site. Explains Raino, shows architecture, screenshots, and CTA to studio.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS v4
- @raino/ui design system

## Design Language

- Hacker / cyberpunk aesthetic
- Dark-first theme
- Highly legible
- Product-grade, not gimmicky
- Responsive

## Pages

- `/` — Hero + overview
- `/features` — Feature breakdown
- `/architecture` — System architecture diagram + explanation
- `/how-it-works` — Step-by-step workflow
- `/docs` — Link to documentation
- `/github` — Link to repository

## Commands

```bash
pnpm dev --filter @raino/site
pnpm build --filter @raino/site
```
