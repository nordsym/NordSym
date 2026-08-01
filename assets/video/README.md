# NordSym AI i drift video assets

## Current status

- `ai-i-drift-sa-fungerar-det-v3.mp4`: current local release candidate generated from the approved V3 script.
- `ai-i-drift-sa-fungerar-det-v3.sv.vtt`: exact Swedish captions for the V3 asset.
- `render-ai-i-drift-v3.mjs`: deterministic local animatic renderer. It accepts an existing narration MP3 and never calls a provider.
- `ai-i-drift-sa-fungerar-det-v2.mp4`: retired after the 2026-08-01 positioning cutover. Do not launch.
- `ai-i-drift-sa-fungerar-det-v2.sv.vtt`: captions for the retired V2 asset only.
- `ai-i-drift-sa-fungerar-det.mp4`: historical placeholder. Do not launch.
- `ai-i-drift-sa-fungerar-det-v3-script.sv.txt`: approved replacement recording script.

The V3 MP4, captions and bridge transcript use the same approved Swedish text.
Production deployment follows the NordSym.com release process and its current release authority.

Local render command:

```bash
node assets/video/render-ai-i-drift-v3.mjs /absolute/path/to/approved-narration.mp3
```
