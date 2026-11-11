---
description: Prototype a UI component, screen, or flow as web + mobile Artifacts
---

# Prototype UI in Artifact

## When to use

Use when redesigning or mocking up part of AcmeShop or AcmeBooking's UI — a single
component, a full screen, or a multi-step flow — before writing production React code.
Produces two real, interactive Artifacts (web and mobile) the user can click through and
approve, instead of a static image or a from-scratch Figma file.

## Instructions

1. Identify the target from `$ARGUMENTS`: which product (AcmeShop or AcmeBooking), which
   repo (`acmeshop-frontend`, `acmeshop-backend`, or the AcmeBooking frontend), and what
   exactly to prototype (a component, a screen, or a named flow).

2. **Gather visual context before designing anything.** Search the target frontend repo for
   existing design tokens: Tailwind/CSS config, theme variables, a shared component library
   (Button, Card, Input, etc.), current color and spacing usage. Extract primary/secondary
   colors, font family, spacing scale, border-radius convention, and existing component
   patterns. Reusing what's already shipped beats aesthetic novelty — a prototype that doesn't
   match the real brand creates rework, not less of it.
   - If nothing reusable exists in the repo, don't invent a look untethered from the product.
     Ask the user for brand color/tone, or fall back to the `artifact-design` skill's neutral
     placeholder palette and say explicitly that it's a placeholder to swap later.

3. The Artifact tool auto-loads the `artifact-design` skill for layout, typography, and
   accessibility fundamentals — don't re-derive that guidance here. Just make sure the real
   tokens from step 2 override its generic placeholder palette.

4. **Always build two Artifacts per request: one web, one mobile.** They share the same tokens
   and design decisions but are separate, independently-shaped layouts — not one responsive
   page for both:
   - **Web** → desktop-width layout, top/side navigation as the product already uses.
   - **Mobile** → phone-width layout (~390px design width) with real mobile patterns (bottom
     tab bar or hamburger nav as fits the product, thumb-reachable primary actions, stacked
     content) — not just the web layout squeezed narrower.
   - **Component** → both variants isolated on a neutral background, showing 2-3 relevant
     states (default/hover/error, or empty/loading/populated). If the component is truly
     platform-agnostic (e.g. a badge or icon), the two variants may look nearly identical —
     that's fine, say so in the summary instead of skipping one.
   - **Screen** → both variants with realistic content (real copy where the product context
     makes it knowable, not lorem ipsum).
   - **Flow / journey** → **one** Artifact per platform, each containing every step of that
     platform's version of the flow, with client-side JS switching between views (a step
     indicator plus next/back controls) — never separate Artifacts per step. If a requested flow
     is too large for one response on either platform (e.g. 6+ screens), say so explicitly and
     propose splitting instead of silently shipping a partial stub.

5. If the request is vague ("mejora esta pantalla"), don't start designing blind. Read the
   actual current component/page in the repo first, or ask what's specifically wrong with it.

6. Build both Artifacts per the Artifact tool's requirements: self-contained HTML, inline
   CSS/JS, light/dark theme support (`prefers-color-scheme` plus `data-theme` override), a
   stable favicon emoji (same emoji for both, so the pair reads as one unit), and a one-sentence
   `description` noting which platform each one is.

7. Publish both with the Artifact tool (`action: publish`), using distinct file paths (e.g.
   `<slug>-web.html` and `<slug>-mobile.html`) so each gets its own URL.

8. **Record the pair directly under `agentic-memory/`** (flat — no subfolder) so it survives
   beyond this conversation. The sync hook's `if` filter only matches files one level deep
   under `agentic-memory/`, not nested subdirectories — a `prototypes/` subfolder silently
   never gets synced. Write one file at `agentic-memory/prototype-<product>-<slug>.md`
   (kebab-case, e.g. `agentic-memory/prototype-acmeshop-checkout-flow.md`) with this
   structure:

   ```markdown
   # <Title> — <Product>

   Fecha: <YYYY-MM-DD>
   Producto/repo: <product and repo path>

   - Web: <artifact URL>
   - Mobile: <artifact URL>

   ## Decisiones de diseño

   - <bullet>
   - <bullet>
   ```

   This directory is synced automatically into auto-memory by the existing PostToolUse hook —
   no extra action needed beyond writing the file.

9. Summarize the key design decisions in 3-5 bullets in the chat reply too — not a wall of
   text. Name what was reused from the real codebase and why any deviation was made, and note
   anything that differs meaningfully between the web and mobile version.

10. Close by **offering, not starting**, the handoff to production code: ask whether to convert
    the approved prototype (web, mobile, or both) into real components in the target repo. Only
    write production code in a follow-up if the user confirms.

## Steps

1. Parse `$ARGUMENTS` for target product/repo and what to prototype.
2. Read the target repo's design tokens and components for visual grounding.
3. Decide component vs. screen vs. flow shape.
4. Build two self-contained Artifacts — web and mobile — using the same tokens.
5. Publish both via the Artifact tool.
6. Write the pointer record to `agentic-memory/prototype-<product>-<slug>.md` (flat, no subfolder).
7. Summarize design decisions in 3-5 bullets, calling out web/mobile differences.
8. Offer — don't auto-start — the handoff to real code.

## Output format

Two published Artifact links, the saved record, and a short summary:

```
🎨 Prototipo publicado (<producto> — <qué>)
   Web:    <url>
   Mobile: <url>
   Registro: agentic-memory/prototype-<product>-<slug>.md

Decisiones:
- <bullet>
- <bullet>

¿Lo paso a componentes reales en <repo>?
```

## Examples

**`$ARGUMENTS`:** `acmeshop checkout flow`

Claude reads `acmeshop-frontend` for existing button/input styles and color tokens, builds
two Artifacts — a 3-step web checkout (cart review → shipping → confirmation) with a top-nav
layout, and a mobile version with a bottom-anchored primary action and stacked steps — each
using JS step-switching internally. Publishes both, writes
`agentic-memory/prototype-acmeshop-checkout-flow.md` with both URLs, and closes by asking
whether to convert it into real React components.

**`$ARGUMENTS`:** `acmebooking dashboard reservas`

Claude reads AcmeBooking's frontend design tokens (or asks for brand colors if none exist),
builds a web dashboard Artifact and a mobile Artifact (list-first, card-based) for the
reservations view, publishes both, records them under
`agentic-memory/prototype-acmebooking-dashboard-reservas.md`, and offers the handoff to code.
