# Session Templates

Copy the relevant block at the start of a session. Tick items as you go.

Five contexts:
- **A1** — new homepage section, from scratch
- **A2** — polish iteration on a shipped section (the Session 12 nav flow)
- **A3** — copy-only change on a shipped section (the copy chain — fix or create)
- **B** — net-new page (service hub or child service page)
- **C** — site-wide / one-off (SEO audit, schema, llms.txt, internal linking, perf)

Skill names are slash-commands. Skip a step only when explicitly noted.

> If a step doesn't match what you actually need, run `/find-skills` — don't freelance. It surfaces the right skill for misc tasks (one-off perf fixes, copy tweaks, animation work) that don't fit a canonical step.

---

## Skill cheat sheet

| Skill | Role | Frequency |
|---|---|---|
| `brainstorming` | Explore intent, reject directions | Step 1 of any creative session |
| `frontend-design` | Distinctive section/component code in existing stack | Default implementation skill |
| `landing-page-generator` | Greenfield Next.js+Tailwind page scaffold | Skip — we have a shell already |
| `design-shotgun` | Multiple visual variants in parallel | When direction is uncertain |
| `impeccable critique` | a11y, focus management, role/aria, tap targets, correctness | Post-impl, **always** |
| `impeccable layout` | Spacing rhythm, alignment, visual hierarchy | Post-impl, only if needed. Cross-ref `web-design-guidelines` |
| `impeccable polish` | Visual sharpness — 2–3 ASCII variants, user picks | Post-impl, only on signature sections |
| `web-design-guidelines` | Vercel-style rules (touch-action, animate transform/opacity, etc.) | Reference inside `impeccable layout` |
| `plan-design-review` | Designer's-eye review of a markdown spec | Before implementation |
| `design-review` | Designer's-eye QA of live site | After implementation |
| `writing-plans` | Implementation playbook | After spec is locked |
| `executing-plans` / `test-driven-development` | Run the plan | Implementation |
| `dispatching-parallel-agents` | Fan out independent steps as parallel subagents | For `[PARALLEL]` blocks below |
| `find-skills` | Locate the right skill for off-template tasks | Whenever the chain doesn't fit |
| `verification-before-completion` | Typecheck/build/QA before claiming done | Before review |
| `simplify` | Tighten the diff | Before review |
| `requesting-code-review` | Final review gate | Pre-merge (skip for small section work covered by impeccable + design-review) |
| `seo-fundamentals` / `geo-fundamentals` | Reference primers | Skim once, never again |
| `seo` | Site-wide SEO orchestrator | Once now, once pre-launch, then quarterly |
| `seo-aeo-keyword-research` | Keywords + AEO questions per page | Once per net-new page |
| `seo-aeo-content-cluster` | Pillar + cluster topical map | Once per pillar |
| `seo-aeo-landing-page-writer` | Page or section copy generation | Per page; can scope to section |
| `seo-content-auditor` | Scored audit + fix list | After content lock; A3 steps 1 + 4 |
| `copywriting` | Claim discipline · benefit/outcome · one-idea-per-section — copy gate | A3 step 6; any copy rewrite |
| `writing-guardrails.md` (doc, not a skill) | Anti-AI-slop vet — banned words, significance inflation, -ing tails | A3 step 7; ALL copy, every context |
| `seo-content` | E-E-A-T + AI citation deep diagnostic | Pre-launch / quarterly |
| `seo-geo` | AI-citation readiness, llms.txt, AI crawler access | Site-scope once; per-page check |
| `seo-authority-builder` | E-E-A-T audit | Trust-heavy pages (Founders, hubs) |
| `seo-aeo-meta-description-generator` | Title/meta/OG variants | Per page polish |
| `seo-aeo-schema-generator` | JSON-LD | Per page |
| `seo-aeo-internal-linking` | Anchor + placement map | After 3+ pages exist; rerun on new pages |
| `seo-image-gen` | OG cards, hero imagery | Per page when missing |

---

## Context A1 — New homepage section (from scratch)

For greenfield sections where copy doesn't exist and visual direction is open.

```
[ ] 1. brainstorming                       — intent, rejected directions
[ ] 2. seo-aeo-landing-page-writer (scoped)— lock copy + AEO block + word counts
                                              → docs/content/sections/<name>.md
[ ] 3. [PARALLEL] seo-content-auditor + seo-geo
                                              via dispatching-parallel-agents
                                              — score copy + AI-citation readiness
                                                in one wall-clock window
[ ] 4. Write section spec                  → docs/superpowers/specs/<date>-section-<name>.md
[ ] 5. plan-design-review                  — spec gate (markdown artifact)
[ ] 6. design-shotgun (optional)           — only if visual direction unclear
[ ] 7. writing-plans                       → docs/superpowers/plans/<date>-section-<name>.md
[ ] 8. frontend-design + executing-plans   — implement
       (or test-driven-development)
[ ] 9. impeccable critique <file>          — ALWAYS. a11y, focus, correctness.
[ ] 10. impeccable layout + polish         — only if needed (signature section
                                              or critique surfaced visual issues).
                                              Cross-ref web-design-guidelines
                                              inside the layout step.
[ ] 11. verification-before-completion     — typecheck, build, manual QA
[ ] 12. design-review                      — live-site designer's-eye QA
[ ] 13. simplify                           — tighten diff
[ ] 14. requesting-code-review (optional)  — final review gate; skip for
                                              small section work already covered
                                              by impeccable + design-review
[ ] 15. Graduate                           — DESIGN.md grammar + CHANGELOG.md
                                              decision log; spec/plan stay in
                                              place as historical record
```

**Skip steps 2–3** if the section is purely visual (e.g., logo strip).

---

## Context A2 — Polish iteration on a shipped section

The Session 12 nav.tsx flow, codified. Use when copy is locked, spec exists, component is already in production.

```
Preconditions: copy locked · spec exists · component shipped

[ ] 1. impeccable critique <file>          — ALWAYS. a11y, focus, correctness.
                                              P0/P1 ordering by severity.
[ ] 2. impeccable layout <file>            — only if visual rhythm/spacing off.
                                              Cross-ref web-design-guidelines.
[ ] 3. impeccable polish <file>            — only if visual sharpness is the goal.
                                              Ask for 2–3 ASCII variants, user picks.
                                              This locks the spec for step 4.
[ ] 4. frontend-design <file>              — surgical execution against locked spec.
                                              No exploration. No brainstorming.
[ ] 5. verification-before-completion      — typecheck, build, manual QA
[ ] 6. design-review                       — live-site QA on the diff
[ ] 7. simplify                            — tighten diff
[ ] 8. requesting-code-review (optional)   — skip for ≤20-line fixes
[ ] 9. Graduate                            — update spec deviation log if pattern
                                              shifted + CHANGELOG.md entry
```

**Gating**: Steps 2 and 3 are conditional. If critique is clean and the ask is a pure behavior fix, jump 1 → 4. Don't run polish theatre on an already-clean component.

---

## Context A3 — Copy-only change on a shipped section (the copy chain)

Words only — no visual, layout, or motion work. Covers a **fix** (audit a shipped section, then tighten) and a **create** (write copy for a section that has none). This is the canonical chain referenced anywhere by "Copy change → SEO chain".

```
Preconditions: component shipped · visual locked · change is copy-only

[ ] 1. seo-content-auditor + copywriting   — AUDIT FIRST. Scored findings +
       (audit pass)                           fix list → docs/superpowers/
                                              specs/<date>-<scope>-copy-audit.md.
                                              Skip ONLY for pure create
                                              (no copy exists yet).
[ ] 2. docs/content/homepage.md FIRST      — edit the source of truth before
                                              JSX. Reconcile any doc↔JSX
                                              drift in this section first.
[ ] 3. seo-aeo-landing-page-writer (scoped)— rewrite/generate the section
                                              copy against locked keywords,
                                              AEO block, word counts.
[ ] 4. seo-content-auditor                 — re-score the rewrite (E-E-A-T,
                                              AEO, readability). Must beat
                                              the step-1 baseline.
[ ] 5. seo-authority-builder               — ONLY trust-heavy sections
       (conditional)                         (Founders, Why-Us, hubs).
                                              Skip for Hero / CTA / utility.
[ ] 6. copywriting                         — GATE. Claim discipline,
                                              benefit/outcome, one-idea-
                                              per-section. Blocks on
                                              unverifiable claims.
[ ] 7. writing-guardrails.md               — anti-AI vet. ALL copy must
       (doc gate, not a skill)               pass: banned words, significance
                                              inflation, -ing tails, padded
                                              tricolons.
[ ] 8. Sync homepage.md → components/sections/*.tsx
                                            — doc and JSX must match
                                              verbatim after this step.
[ ] 9. verification-before-completion      — pnpm dev (NOT a clean build),
                                              confirm copy renders in static
                                              markup (crawlable).
[ ] 10. Graduate                            — CHANGELOG.md decision-log entry
                                              + update the copy-audit
                                              scorecard row for the section.
```

**Gating**:
- **Fix vs create** — a *fix* starts at step 1. A *create* (no copy yet) skips step 1, starts at step 2.
- **Step 5 conditional** — `seo-authority-builder` only earns its place on E-E-A-T-bearing sections. Running it on Hero/CTA copy is theatre.
- **No spec/plan ceremony** — copy-only changes get no section spec and no `writing-plans` (that's A1/A2/B overhead). The audit doc + `homepage.md` are the only artifacts.
- **Escalate** — if the change starts needing layout/motion, it is *not* A3. Switch to A2.

---

## Context B — Net-new page

Run **once per pillar** before any of its pages:

```
[ ] seo-aeo-content-cluster                — which child services to prioritize
                                              + internal link map for the pillar
```

Then per page:

```
[ ] 1. seo-aeo-keyword-research            — primary + secondary + AEO questions
[ ] 2. brainstorming                       — page intent, slot in hub-and-spoke
[ ] 3. seo-aeo-landing-page-writer         — full page copy
                                              → docs/content/services/<pillar>/<slug>.md
[ ] 4. [PARALLEL] seo-content-auditor + seo-authority-builder + seo-geo
                                              via dispatching-parallel-agents
                                              — score + E-E-A-T + AI-citation readiness
                                                in one wall-clock window
[ ] 5. Section spec + plan-design-review   — design intent
[ ] 6. design-shotgun                      — visual direction
[ ] 7. writing-plans
[ ] 8. frontend-design + executing-plans   — implementation in existing shell
[ ] 9. impeccable critique                 — ALWAYS; layout+polish only if needed
[ ] 10. [PARALLEL] seo-aeo-schema-generator + seo-aeo-meta-description-generator + seo-image-gen
                                              via dispatching-parallel-agents
                                              — Service/BreadcrumbList/FAQPage JSON-LD,
                                                title/meta/OG, OG card image
[ ] 11. verification + design-review + requesting-code-review (optional)
[ ] 12. seo-aeo-internal-linking           — rerun once 3+ new pages exist
[ ] 13. Remove noindex stub
[ ] 14. Graduate                           — DESIGN.md + CHANGELOG.md
```

---

## Context C — Site-wide / one-off

Standalone sessions, not bundled with section work.

### C1. SEO baseline (run now)
```
[ ] seo                                    — full site audit
[ ] seo-geo (site scope)                   — llms.txt, robots AI crawler allows,
                                              sitemap, schema gaps
[ ] Fix findings directly in code          — no spec/plan ceremony required
```

### C2. Internal linking refresh (when 3+ new pages exist)
```
[ ] seo-aeo-internal-linking
[ ] Apply anchor + placement updates
```

### C3. Pre-launch sweep
```
[ ] seo                                    — re-audit
[ ] seo-content (per shipped page)         — deep E-E-A-T diagnostic
[ ] seo-authority-builder (Founders, hubs)
[ ] [PARALLEL] impeccable critique <every shipped section>
                                              via dispatching-parallel-agents
                                              — one subagent per section, one window
[ ] qa                                     — full QA pass
[ ] benchmark                              — Core Web Vitals baseline
```

### C4. Post-launch recurring
```
[ ] canary                                 — post-deploy monitoring
[ ] qa-only / qa                           — periodic
[ ] benchmark                              — perf trend
[ ] seo-content                            — quarterly
[ ] retro                                  — weekly
```

---

## Recommended order of next sessions

1. **C1 — SEO baseline** (cheap wins, unblocks everything)
2. **A1 — Why Us** (next homepage section per CHANGELOG)
3. **A2 — Hero re-polish** (clean up deviation flags from Session 12)
4. **A1 — Work Preview** (blocked on case study content from clients; can do shell)
5. **A1 — Testimonials, Founders, Comparison, FAQ, Contact CTA**
6. **A2 passes** on any shipped section that flags issues post-launch
7. **B — Pillar content cluster** for one pillar (start with Web3 — most child pages)
8. **B — Web3 hub page** then top child pages by keyword priority
9. Repeat **B** for AI Agents, then Product Studio
10. **C2 — Internal linking refresh**
11. **C3 — Pre-launch sweep**

---

## Authority of artifacts

Hard rule to prevent the contradicting-plans mess from coming back:

| Artifact | Authority |
|---|---|
| `DESIGN.md` | Canonical UI grammar — only authoritative UI doc |
| `CHANGELOG.md` | Canonical decision log — only authoritative session log |
| `docs/content/` | Canonical copy — what ships in components |
| `docs/superpowers/specs/<file>` | Locked intent for one section, in-flight |
| `docs/superpowers/plans/<file>` | Implementation playbook for one section, in-flight |
| `docs/superpowers/archive/**` | Historical reference only — never authoritative |
| `~/.claude/plans/<file>` | Plan-mode scratch — not authoritative once executed |

If a spec contradicts `DESIGN.md`, fix the spec or update `DESIGN.md` — never let both versions live. One section = one spec + one plan. Direction change = archive old, write new with `Supersedes:` frontmatter.
