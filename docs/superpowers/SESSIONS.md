# Session Templates

Copy the relevant block at the start of a session. Tick items as you go.

Three contexts:
- **A** — existing homepage section getting a signature/redesign pass
- **B** — net-new page (service hub or child service page)
- **C** — site-wide / one-off (SEO audit, schema, llms.txt, internal linking, perf)

Skill names are slash-commands. Skip a step only when explicitly noted.

---

## Skill cheat sheet

| Skill | Role | Frequency |
|---|---|---|
| `brainstorming` | Explore intent, reject directions | Step 1 of any creative session |
| `frontend-design` | Distinctive section/component code in existing stack | Default implementation skill |
| `landing-page-generator` | Greenfield Next.js+Tailwind page scaffold | Skip — we have a shell already |
| `design-shotgun` | Multiple visual variants in parallel | When direction is uncertain |
| `plan-design-review` | Designer's-eye review of a spec | Before implementation |
| `design-review` | Designer's-eye QA of live site | After implementation |
| `writing-plans` | Implementation playbook | After spec is locked |
| `executing-plans` / `test-driven-development` | Run the plan | Implementation |
| `verification-before-completion` | Typecheck/build/QA before claiming done | Before review |
| `simplify` | Tighten the diff | Before review |
| `codex` / `requesting-code-review` | Final review gate | Pre-merge |
| `seo-fundamentals` / `geo-fundamentals` | Reference primers | Skim once, never again |
| `seo` | Site-wide SEO orchestrator | Once now, once pre-launch, then quarterly |
| `seo-aeo-keyword-research` | Keywords + AEO questions per page | Once per net-new page |
| `seo-aeo-content-cluster` | Pillar + cluster topical map | Once per pillar |
| `seo-aeo-landing-page-writer` | Page or section copy generation | Per page; can scope to section |
| `seo-content-auditor` | Scored audit + fix list | After content lock |
| `seo-content` | E-E-A-T + AI citation deep diagnostic | Pre-launch / quarterly |
| `seo-geo` | AI-citation readiness, llms.txt, AI crawler access | Site-scope once; per-page check |
| `seo-authority-builder` | E-E-A-T audit | Trust-heavy pages (Founders, hubs) |
| `seo-aeo-meta-description-generator` | Title/meta/OG variants | Per page polish |
| `seo-aeo-schema-generator` | JSON-LD | Per page |
| `seo-aeo-internal-linking` | Anchor + placement map | After 3+ pages exist; rerun on new pages |
| `seo-image-gen` | OG cards, hero imagery | Per page when missing |

---

## Context A — Existing homepage section

For each section's signature/redesign pass.

```
[ ] 1. brainstorming                       — intent, rejected directions
[ ] 2. seo-aeo-landing-page-writer (scoped)— lock copy + AEO block + word counts
                                              → docs/content/sections/<name>.md
[ ] 3. seo-content-auditor                 — score + fixes on locked copy
[ ] 4. seo-geo                             — citation-readiness check
[ ] 5. Write section spec                  — visual grammar + locked copy +
                                              SEO/AEO targets
                                              → docs/superpowers/specs/<date>-section-<name>.md
[ ] 6. plan-design-review                  — review the spec
[ ] 7. design-shotgun (optional)           — only if visual direction unclear
[ ] 8. writing-plans                       → docs/superpowers/plans/<date>-section-<name>.md
[ ] 9. frontend-design + executing-plans   — implement
       (or test-driven-development)
[ ] 10. verification-before-completion     — typecheck, build, manual QA
[ ] 11. design-review                      — live-site designer's-eye QA
[ ] 12. simplify                           — tighten diff
[ ] 13. codex / requesting-code-review     — final review gate
[ ] 14. Graduate                           — DESIGN.md grammar + CHANGELOG.md
                                              decision log; spec/plan stay in
                                              place as historical record
```

**Skip steps 2–4** if the section is purely visual (e.g., logo strip).

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
[ ] 4. seo-content-auditor                 — score + fixes
[ ] 5. seo-authority-builder               — E-E-A-T pass (especially hubs)
[ ] 6. seo-geo                             — AI-citation readiness
[ ] 7. Section spec + plan-design-review   — design intent
[ ] 8. design-shotgun                      — visual direction
[ ] 9. writing-plans
[ ] 10. frontend-design + executing-plans  — implementation in existing shell
[ ] 11. seo-aeo-schema-generator           — Service, BreadcrumbList, FAQPage
[ ] 12. seo-aeo-meta-description-generator — title + meta + OG variants
[ ] 13. seo-image-gen                      — OG card if missing
[ ] 14. verification + design-review + codex
[ ] 15. seo-aeo-internal-linking           — rerun once 3+ new pages exist
[ ] 16. Remove noindex stub
[ ] 17. Graduate                           — DESIGN.md + CHANGELOG.md
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
2. **A — Why Us** (next homepage section per CHANGELOG)
3. **A — Work Preview** (blocked on case study content from clients; can do shell)
4. **A — Testimonials, Founders, Comparison, FAQ, Contact CTA**
5. **B — Pillar content cluster** for one pillar (start with Web3 — most child pages)
6. **B — Web3 hub page** then top child pages by keyword priority
7. Repeat **B** for AI Agents, then Product Studio
8. **C2 — Internal linking refresh**
9. **C3 — Pre-launch sweep**

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

If a spec contradicts `DESIGN.md`, fix the spec or update `DESIGN.md` — never let both versions live. One section = one spec + one plan. Direction change = archive old, write new with `Supersedes:` frontmatter.
