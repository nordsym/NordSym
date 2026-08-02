# NordSym AI i drift video assets

## Current status

- `ai-i-drift-sa-fungerar-det-v3.mp4`: web delivery derivative of Gustav's approved clean founder master. H.264/AAC, 1080 x 1920, 88.545 seconds, fast-start enabled. The bridge pairs it with the VTT to avoid duplicate captions.
- `ai-i-drift-sa-fungerar-det-v3.sv.vtt`: Swedish sidecar generated from the approved edit's `captions.ass` timing.
- `render-ai-i-drift-v3.mjs`: deterministic local animatic renderer. It accepts an existing narration MP3 and never calls a provider.
- `ai-i-drift-sa-fungerar-det-v2.mp4`: retired after the 2026-08-01 positioning cutover. Do not launch.
- `ai-i-drift-sa-fungerar-det-v2.sv.vtt`: captions for the retired V2 asset only.
- `ai-i-drift-sa-fungerar-det.mp4`: historical placeholder. Do not launch.
- `ai-i-drift-sa-fungerar-det-v3-script.sv.txt`: exact spoken source represented by the approved founder edit.

Source receipt: `/Users/gustavhemmingsson/Desktop/NordSym-AI-agenter-edit/NordSym-AI-agenter-FINAL.mp4`, SHA-256 `c5fd171b9fbcfd8b806a12b52b8a24c54f268702730ef68d700edd376a9213d0`.
Clean source receipt: `/Users/gustavhemmingsson/Desktop/NordSym-AI-agenter-edit/NordSym-AI-agenter-clean.mp4`, SHA-256 `e85d5f47ebba21a143b289102743c96c1b572bd57eea9907addc2ae81c5ad680`.
Web MP4 SHA-256: `b211f14dedc37be70a6d366723ba63035b061b1bf14f4ea622ee3660d0d67f73`.
VTT SHA-256: `6a805ce88711578b510cdab4359a4d2ffb808bbe33c65d823e921724fce8df9a`.

The Meta ad uses the captioned FINAL source. The bridge uses the clean V3 MP4,
the VTT and the same readable transcript from the approved edit.
Production deployment follows the NordSym.com release process and its current release authority.

Local render command:

```bash
node assets/video/render-ai-i-drift-v3.mjs /absolute/path/to/approved-narration.mp3
```
