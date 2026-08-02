# NordSym AI i drift video assets

## Current status

- `ai-i-drift-sa-fungerar-det-v3.mp4`: temporary local bridge placeholder derived from the corrected portrait Meta ad master. It is not approved for launch or production deployment.
- `ai-i-drift-sa-fungerar-det-v3.sv.vtt`: Swedish sidecar for the temporary local placeholder only.
- `render-ai-i-drift-v3.mjs`: deterministic local animatic renderer. It accepts an existing narration MP3 and never calls a provider.
- `ai-i-drift-sa-fungerar-det-v2.mp4`: retired after the 2026-08-01 positioning cutover. Do not launch.
- `ai-i-drift-sa-fungerar-det-v2.sv.vtt`: captions for the retired V2 asset only.
- `ai-i-drift-sa-fungerar-det.mp4`: historical placeholder. Do not launch.
- `ai-i-drift-sa-fungerar-det-v3-script.sv.txt`: exact spoken source represented by the approved founder edit.

Source receipt: `/Users/gustavhemmingsson/Desktop/NordSym-AI-agenter-edit/NordSym-AI-agenter-FINAL.mp4`, SHA-256 `ba68e0e1319531490eb6be1ce968aa66dae689ae6c5b001a73088328006e3cec`.
Clean source receipt: `/Users/gustavhemmingsson/Desktop/NordSym-AI-agenter-edit/NordSym-AI-agenter-clean.mp4`, SHA-256 `7e734aa67403eb9db7e85355dcd1ff954fe8012b7cf39e901b6be30b2843bcab`.
Web MP4 SHA-256: `d20de4f026bff3bad34d52557b5bc72b5b45fb53030b73cd7bf9457c7e3e5b25`.
VTT SHA-256: `e1a68fd982269e77ae645deea36dd9222813ce9ae7e53c65c2d545ad2a702523`.

The Meta ad uses the captioned FINAL source and is approved as campaign creative.
The bridge currently uses the clean portrait derivative, VTT and transcript only
as a local placeholder. It must not launch with the Meta ad repeated after click.

The existing bridge frame is already 16:9 and needs no funnel redesign. When
Gustav supplies the separate landscape Tella recording, the local acceptance pass
must verify the received file, bind its actual source without inventing a filename,
replace the matching caption and transcript sources, and remove
`data-media-status="temporary-local-placeholder"` only after those checks pass.
Production deployment follows the NordSym.com release process and its current release authority.

Local render command:

```bash
node assets/video/render-ai-i-drift-v3.mjs /absolute/path/to/approved-narration.mp3
```
