# Meta E2E preview evidence receipt

Verified 2026-07-30 against current repository state and live read-only Meta Ads connector state.

## READY WITHOUT GUSTAV

- C02 is rendered in a mobile Meta-feed-style preview with exact primary text, headline, description and `Läs mer` CTA.
- The image and CTA open the local `/ai-i-drift/sa-fungerar-det/` bridge with sanitized campaign parameters.
- The bridge loads the final 47-second, 1600x900 H.264 ElevenLabs V2 asset with the correct NordSym logo, Swedish captions and no preview label.
- The bridge CTA preserves `utm_source`, `utm_medium`, `utm_campaign`, `utm_id` and `utm_content`, then opens the five-question qualification.
- A complete qualified path reaches the current Swedish booking experience.
- All form completions can book. `qualification_signal` separates a form completion from a qualified-opportunity signal. Commercial interest remains a later NordSym Sales decision.
- The local preview server returns deterministic availability, keeps one slot visibly occupied and blocks booking submission.
- The preview server CSP blocks external scripts and connections. The walkthrough does not send PostHog, Meta, n8n or booking requests.
- Mobile screenshots cover the ad, bridge, playing animatic, qualification, availability and final booking form.

## NEEDS GUSTAV NOW

None for the website release. Meta dataset/token, payment and activation remain
separate human-authorized gates.

## LAUNCH-ONLY LATER

Optional founder recording specification:

- Script: the three-paragraph transcript present on the bridge page.
- Framing: horizontal 16:9, chest-up, eye level, simple NordSym home-office background.
- Duration: 45 to 60 seconds.
- Delivery: calm, direct, one thought per sentence. No presenter voice.
- Export: H.264 MP4, 1920x1080, clean speech, no music required.
- Acceptance check: natural Swedish, intelligible on a phone, transcript and spoken promise match, no unsupported outcome or security claim.

Launch-only gates:

1. Create or select the Meta dataset and install the approved Pixel ID and CAPI token.
2. Verify `PageView`, `Lead` and server-side `Schedule` in Meta Test Events.
3. Read back the intended NordSym Facebook Page and `@nordsymab` identity in Ads Manager.
4. Add and verify a payment method on manual ad account `1017896054501692`.
5. Reproduce the paused campaign, ad set and C02 ad from `campaign-draft.md`.
6. Approve the exact budget, ads and activation as a separate action.

## Current Meta readback

- Manual portfolio: `1194013423798700`
- Manual ad account: `1017896054501692`
- Account name: `NordSym AB - Meta Ads`
- State: `ACTIVE`
- Ads MCP: enabled
- Queryable: yes
- Currency: SEK
- Payment method: none
- Datasets: 0
- Campaigns: 0
- Page readback: NordSym Ab `666511603221872`
- Instagram readback: unavailable through the connector rollout
- Legacy account `243113670`: separate, `UNSETTLED`, not queryable and untouched

## Verification evidence

- `01-meta-feed-mobile.png`
- `02-video-bridge-mobile.png`
- `03-video-playing-mobile.png`
- `04-qualification-mobile.png`
- `05-booking-mobile.png`
- `06-booking-availability-mobile.png`
- `07-booking-details-mobile.png`

No Meta entity, payment method, spend, external message or real booking was created
while preparing this package.
