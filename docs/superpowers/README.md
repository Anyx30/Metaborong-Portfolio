# docs/superpowers/

Workspace for superpowers-driven section work.

- `archive/specs/` — historical locked specs (pre-2026-05-06). Read-only reference.
- `archive/plans/` — historical implementation plans. Read-only reference.

**Canonical UI source of truth is `/DESIGN.md` at the repo root.** Specs/plans are scratch
input that flow into `DESIGN.md` (UI grammar) and `CHANGELOG.md` (decision log) once a
section ships. Do not treat anything under `archive/` as authoritative.

New section work should write a fresh spec + plan under `specs/` and `plans/` (recreate
those folders as needed), and graduate decisions into `DESIGN.md` / `CHANGELOG.md` on ship.
