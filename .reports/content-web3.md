# Web3 leaf content — authoring report

Authored content for the 6 v1 Web3 leaves per `SERVICES_PLAN.md` § 6 word budget.
Each leaf is a `LeafContent` object in `lib/services/content/web3.ts` and registered
in `lib/services/content/index.ts`.

## Word counts per leaf

Floor is 600 (per § 6). Target is 750–1060. All 6 leaves clear the floor.

| Slug                                       | Total words | Hero | AEO | Notes                          |
|--------------------------------------------|------------:|-----:|----:|--------------------------------|
| smart-contract-development                 |         802 |  131 |  53 | —                              |
| defi-protocol-development                  |         774 |  123 |  50 | Hero sentence avg 15.4 (above 12–14 target — accepted given dense list constructions; body across page averages within range) |
| web3-tokenomics-design                     |         760 |  126 |  58 | —                              |
| nft-marketplace-development                |         796 |  135 |  59 | Two `relatedWork` cards used   |
| liquid-staking-vaults                      |         808 |  132 |  57 | Two `relatedWork` cards used; cites nsASTR ~$20M TVL + nrETH ~$1M TVL |
| decentralized-identity-did-integration     |         804 |  131 |  58 | Headline GovTech leaf; UIDAI named in hero; Aadhaar-scale fact in AEO; Sedax ZKP partner cited |

**Leaves below 600-word floor:** none.

## Block budget check

All blocks within their § 6 budgets:

- **Hero lede:** 120–180 words — all 6 between 123–135 ✓
- **AEO answer:** 40–60 words — all 6 between 50–59 ✓
- **Deliverables:** 4–6 bullets, ≤16 words each — longest label across all leaves is 13 words ✓
- **Phases:** 3–4 phases × 40–60 words — all leaves have 4 phases, each within range ✓
- **Tech stack:** 6–10 items — all leaves at 7–8 items ✓
- **Fit:** 3 + 3 bullets — all 6 leaves comply ✓
- **FAQ:** 3–4 Q&As, ~70 words each — all leaves have 4 Q&As within range ✓

## Voice and proof discipline

- Banned marketing terms scan: clean (no `revolutionary`, `cutting-edge`, `world-class`,
  `best-in-class`, `game-changing`, `seamless`).
- Founder-voice `we` throughout — no `our team`.
- No invented client names. Only verifiable proofs used: Neemo Finance + four Hacken
  audit rounds (smart-contracts, DeFi, tokenomics AEO, NFT AEO, DID context),
  nsASTR ~$20M TVL and nrETH ~$1M TVL (liquid-staking-vaults hero + AEO + phases),
  Sedax ZKP partnership (DID hero + phases + AEO + FAQ), 8 Clutch reviews at 4.9
  (Web3-wide AEOs).
- No security incidents, exploits, or vulnerabilities referenced as proof points.
- All Web3 leaves except DID stay globally positioned; DID is India-explicit by
  design — names UIDAI in hero, references Aadhaar's 1.3-billion-record system in
  AEO, frames the work as DID integration with national-ID (not building one from
  scratch).

## Files

- `lib/services/content/web3.ts` — 6 `LeafContent` exports + bundled `web3LeafContent` map.
- `lib/services/content/index.ts` — registry updated to include all 6 keys under
  `web3/<slug>`.

## Verification

- `tsc --noEmit` clean.
- Word counts measured by tokenising body text on whitespace via `tsx` against the
  imported `web3LeafContent` map (excludes deliverable `detail` since none authored,
  excludes related-work `descriptor` chips, excludes tech-stack labels — those are
  structural, not body copy).
