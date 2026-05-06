# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Marketing site for Metaborong (metaborong.com). Next.js 16 App Router, React 19, TypeScript,
Tailwind v4. Single page (`app/page.tsx`) composing sections from `components/sections/`,
plus 17 noindex stub service pages under `app/services/`.

## Design System

**Always read `DESIGN.md` before making any visual or UI decision.** All font choices, colors,
spacing, motion grammar, primitive variants, and section-level patterns are defined there. Do
not deviate without explicit user approval. In QA / review mode, flag any code that does not
match `DESIGN.md`.

When a section needs a deviation from the master grammar, log it under
`docs/superpowers/specs/<date>-section-<name>.md` per the per-section override rule in
`DESIGN.md`.

## Context Documents

- `docs/superpowers/specs/` — locked section specs and deviation logs.
- `docs/superpowers/plans/` — implementation plans (e.g., 11-task services build).
- `docs/metaborong-seo-strategy.pdf` — SEO strategy plan.
- `docs/SEO AUDIT.pdf` — SEO audit findings.

## Local Run

- Dev: `npm run dev` (default port 3000).
- Production-like local: `npm run build && PORT=3001 npm run start`.
