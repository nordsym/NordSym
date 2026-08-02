# NordSym AI i drift video assets

## Current status

- `ai-i-drift-sa-fungerar-det-v3.mp4`: web-ready 16:9 bridge derivative from Gustav's clean Tella export. H.264/AAC, 1920 x 1080, 48.669 seconds, 30 fps and fast-start enabled.
- `ai-i-drift-sa-fungerar-det-v3.sv.vtt`: Swedish sidecar timed from the actual spoken audio with local Whisper word timestamps.
- `render-ai-i-drift-v3.mjs`: deterministic local animatic renderer. It accepts an existing narration MP3 and never calls a provider.
- `ai-i-drift-sa-fungerar-det-v2.mp4`: retired after the 2026-08-01 positioning cutover. Do not launch.
- `ai-i-drift-sa-fungerar-det-v2.sv.vtt`: captions for the retired V2 asset only.
- `ai-i-drift-sa-fungerar-det.mp4`: historical placeholder. Do not launch.
- `ai-i-drift-sa-fungerar-det-v3-script.sv.txt`: exact spoken source represented by the 16:9 bridge recording.
- `meta-founder-ad-v1-script.sv.txt`: historical spoken source represented by the immutable original portrait ad.
- `meta-founder-ad-v2-script.sv.txt`: launch-derivative spoken source after the founder-authorized removal of one complete sentence.

Immutable Meta ad source receipt: `/Users/gustavhemmingsson/Desktop/NordSym-AI-agenter-edit/NordSym-AI-agenter-FINAL.mp4`, SHA-256 `ba68e0e1319531490eb6be1ce968aa66dae689ae6c5b001a73088328006e3cec`.
Current Meta launch derivative: `/Users/gustavhemmingsson/Desktop/NordSym-AI-agenter-edit/NordSym-AI-agenter-LAUNCH-V2.mp4`, SHA-256 `8e2e06008f997f4ba8e27815ecfdaafa566049649b7098de078da77b6db3d51e`. It removes source interval `56.916667-59.733333` and changes no other spoken content.
Meta ad poster: `assets/meta-founder-ad-poster.jpg`, extracted from source time `8.4` seconds, SHA-256 `8f94037f1f0f924452463c751b0e54d3702f01f31d022ba3bb13ce2bb735e26d`.
Bridge source receipt: `/Users/gustavhemmingsson/Desktop/Kom igång med era AI-agenter.mp4`, SHA-256 `a4642aa73669976263511290d944d011a22553202f477154438103f3c64d80f1`.
Bridge web MP4 SHA-256: `23af2313a26cb8c41486278b8d53967bce0f62fa1829e788314ab81a87476ef1`.
Bridge VTT SHA-256: `80930d8326a534ca8046a570e2586f2c4e0015fcc5aea71cb6e92332534dbaf8`.
Bridge poster SHA-256: `ade7bcf6dc961e0591aecd965d4d48f9d2a41ef564092531fd917ce841e4266a`.

The Meta ad uses the captioned V2 launch derivative. The original FINAL source remains unchanged as history.
The bridge uses the separate 16:9 Tella recording, its matching VTT, readable
transcript and authentic poster. The bridge continues the ad by explaining the
five questions and 20-minute booking instead of repeating the ad's argument.
Production deployment follows the NordSym.com release process and its current release authority.

Local render command:

```bash
node assets/video/render-ai-i-drift-v3.mjs /absolute/path/to/approved-narration.mp3
```
