# NordSym Meta Static Creatives

Local review package. Nothing in this directory is deployed or uploaded to Meta.

## Concepts

1. `C01` tests recognition of recurring work that should already be off the team.
2. `C02` asks which paid recurring work the first AI agent should take over.
3. `C03` explains the mechanism: NordSym builds and operates the agent inside the client's tech stack.

All three are intended to lead to the sparse video bridge route:

`https://nordsym.com/ai-i-drift/sa-fungerar-det/`

The route continues to the existing qualification flow and booking. Its current
portrait video is a temporary local placeholder only. Launch requires the separate
16:9 Tella bridge recording to be received, accepted and bound first.

## Editable sources

- `artboards.html` contains all six artboards.
- `styles.css` owns the deterministic visual system.
- `copy.md` contains exact Meta primary text, headline, description and CTA.
- `contact-sheet.html` renders the compact review sheet.
- `render.mjs` exports the PNG files.

## Exports

- Three `1080x1350` primary feed assets.
- Three `1080x1080` mechanically adapted assets.
- One contact sheet.

All important text stays inside a 72 px safe margin. The files reuse the exact
NordSym fonts, production logo assets and AI i drift colors.

The formats and hierarchy follow Meta's current image guidance: mobile-first `4:5`
and `1:1`, one primary focal point, high contrast, restrained on-image copy and
concise primary text. Copy is checked against Meta's recommended visible lengths
in `copy.md`; longer primary text deliberately front-loads the recognition hook.

## Render

Use the bundled Codex Node runtime and Playwright:

```bash
NODE_PATH="/Users/gustavhemmingsson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules" \
"/Users/gustavhemmingsson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" \
render.mjs
```

No slideshow or carousel is included in this first-round package.

## Positioning cutover

Gustav authorized this bounded rewrite on 2026-08-01 so the Meta material matches
NordSym's outcome-first public positioning. `C02` is the recommended lead. `C01`
and `C03` are reserve cells under the same commercial promise, not separate
funnels. Do not upload or activate them without separate exact approval.
