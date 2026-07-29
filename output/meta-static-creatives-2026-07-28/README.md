# NordSym Meta Static Creatives

Local review package. Nothing in this directory is deployed or uploaded to Meta.

## Concepts

1. `C01` tests production-readiness classification.
2. `C02` tests recognition of hidden senior intervention.
3. `C03` tests whether the operating-layer map makes NordSym's responsibility concrete.

All three lead to the approved sparse video bridge:

`https://nordsym.com/ai-i-drift/sa-fungerar-det/`

At review time on 2026-07-28 this intended route returns `404`. Do not use it as
an ad destination until NordSym.com has implemented it and a live readback returns
`200`. The current `/ai-i-drift/` route returns `200`.

Once implemented, the bridge continues to the existing qualification flow and booking.

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
concise primary text. Headlines are 18, 22 and 32 characters. Descriptions are
17, 27 and 16 characters.

## Render

Use the bundled Codex Node runtime and Playwright:

```bash
NODE_PATH="/Users/gustavhemmingsson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules" \
"/Users/gustavhemmingsson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" \
render.mjs
```

No slideshow or carousel is included in this first-round package.

## Freeze

The static pack is frozen after Gustav's 2026-07-28 review. Treat the three
concepts as separate ads for later performance testing. Do not expand or revise
them without new evidence or explicit operator direction.
