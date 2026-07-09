# NordSym Logo System - Direction 01 "Reduced North Star"

Production asset manifest. Colors: oxide `#A6432A` (star), ink `#1B1917` (wordmark + center dot), warm paper `#EAE4D8`.
Geometry is a solid four-point compass star with a fixed center dot - no gradients, shadows, or thin strokes. All PNGs are transparent unless noted.

## Symbol only
| File | Use |
|---|---|
| `nordsym-mark.svg` | Master vector symbol (polygon + dot). Scales to any size. |
| `nordsym-mark-1024.png` | Large raster symbol / print. |
| `nordsym-mark-512.png` | General app / store listings. |
| `nordsym-mark-256.png` | Medium UI. |
| `nordsym-mark-64.png` | Small UI / list rows. |
| `nordsym-mark-32.png` | Toolbar / favicon-size raster. |

## Horizontal lockup
| File | Use |
|---|---|
| `nordsym-lockup.svg` | Master horizontal lockup (star + wordmark). |
| `nordsym-lockup-2400.png` | Hero / large web + print. |
| `nordsym-lockup-1200.png` | Standard web headers, decks. |
| `nordsym-lockup-600.png` | Compact web / documents. |

## Favicon package
| File | Use |
|---|---|
| `favicon.svg` | Modern browsers (scalable tab icon). |
| `favicon.ico` | Legacy fallback (16/32/48 px). |
| `apple-touch-icon.png` | iOS home screen (180×180, paper ground). |
| `web-app-icon-192.png` | PWA / Android (192×192, padded). |
| `web-app-icon-512.png` | PWA splash / install (512×512, padded). |

## Email signature
| File | Use |
|---|---|
| `nordsym-signature-light.png` | Signature lockup for light mail backgrounds (ink wordmark). Display at 28px height. |
| `nordsym-signature-dark.png` | Signature lockup for dark backgrounds (paper wordmark). |
| `nordsym-signature-symbol-56.png` | Symbol-only signature mark, 56px. |
| `nordsym-signature-symbol-112.png` | Symbol-only signature mark, 112px (retina of 56). |
| `signature.html` | Copy-paste HTML signature using hosted-image URLs (not base64). |

## Website
| File | Use |
|---|---|
| `nordsym-header-lockup.svg` | Site header (ink wordmark, for light headers). |
| `nordsym-footer-lockup.svg` | Site footer (paper wordmark, for dark footers). |
| `nordsym-social-logo.png` | Square social/profile logo (1024, paper ground). |
| `nordsym-og-image.png` | Open Graph share image draft (1200×630, paper ground). |

## Notes
- The `*.svg` **symbol** files are pure vector polygons/circles - no embedded raster, no font dependency.
- The lockup SVGs set the wordmark in **IBM Plex Sans** via `@import`; for a fully self-contained file, convert the text to outlines in your vector tool (one step) - say the word and I can also ship pre-outlined lockup SVGs.
- All raster type was rendered from IBM Plex Sans (Nord = 600, Sym = 400, −0.02em tracking).
