# AI i drift video asset contract

The bridge route stays unavailable in production until this contract is complete.

## Required package

- `ai-i-drift/sa-fungerar-det/media/barnvakten.mp4`
  - Approved founder footage only. No avatar or generated face.
  - Delivery format: MP4 with H.264 video and AAC audio.
  - Source may be MP4 or MOV, but MOV must be transcoded to the delivery format.
  - 16:9 landscape, minimum 1920 by 1080 pixels.
  - Web-optimized with metadata at the start of the file and no embedded tracking.
- `ai-i-drift/sa-fungerar-det/media/barnvakten-poster.webp`
  - A truthful frame or approved designed poster
  - No generated face or avatar
  - 16:9 landscape, minimum 1920 by 1080 pixels
  - Keep critical content inside the central 80 percent safe area
- `ai-i-drift/sa-fungerar-det/media/barnvakten.sv.vtt`
  - Swedish WebVTT captions matching the approved recording
  - UTF-8 with `WEBVTT` as the first line
  - Every spoken line represented, with no unsupported styling or metadata

## Activation

After Gustav approves all three assets, update `media-manifest.json`:

```json
{
  "schema_version": 1,
  "status": "approved",
  "video": "/ai-i-drift/sa-fungerar-det/media/barnvakten.mp4",
  "poster": "/ai-i-drift/sa-fungerar-det/media/barnvakten-poster.webp",
  "captions": "/ai-i-drift/sa-fungerar-det/media/barnvakten.sv.vtt",
  "language": "sv",
  "approved_by": "Gustav Hemmingsson",
  "approved_at": "ISO-8601 timestamp"
}
```

Then remove all three `/ai-i-drift/sa-fungerar-det` redirects from `vercel.json`,
including the `:path*` subtree block.
`npm run validate:video-bridge` must pass before review. The validator fails if an
approved manifest references missing assets or if an unapproved manifest can be
reached in production.

The route must not be merged or deployed from the current awaiting state. Activation
requires Gustav's explicit approval of the complete package, the approved manifest,
removal of all three redirects, a passing validator and a fresh visual review.
