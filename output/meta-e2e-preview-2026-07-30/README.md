# NordSym Meta E2E preview

Production-inert review path:

`local Meta feed -> local video bridge -> current qualification -> current booking`

## Open

From the repository root:

```bash
NODE_PATH=/Users/gustavhemmingsson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules \
/Users/gustavhemmingsson/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
scripts/serve-meta-e2e-preview.mjs
```

Then open:

`http://127.0.0.1:4173/output/meta-e2e-preview-2026-07-30/`

## Contents

- `index.html`: placement-faithful C02 feed preview and click-through.
- `animatic.html`: editable five-frame local animatic source.
- `animatic-frames/`: rendered 1600x900 frame images.
- `ai-i-drift-sa-fungerar-det-animatic.mp4`: 65-second silent review animatic.
- `measurement-map.md`: event ownership and data boundary.
- `campaign-draft.md`: inert Ads Manager reproduction spec.
- `evidence-receipt.md`: verified state and blocker classification.
- `evidence/`: mobile screenshots of the review path.

The animatic is explicitly not final media. It exists so the whole path can be reviewed before Gustav records anything or approves a voice provider.
