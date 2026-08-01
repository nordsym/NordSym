# Meta E2E preview evidence receipt

Historical verification from 2026-07-30. Superseded for creative and funnel copy
by `../meta-launch-ready-packet-2026-08-01.md`.

## Still valid

- The production-inert preview architecture remains valid.
- The image and CTA open the local `/ai-i-drift/sa-fungerar-det/` bridge with sanitized campaign parameters.
- UTM preservation, qualification, booking and external-call blocking remain valid.
- The bridge CTA preserves `utm_source`, `utm_medium`, `utm_campaign`, `utm_id` and `utm_content`, then opens the five-question qualification.
- A complete qualified path reaches the current Swedish booking experience.
- All form completions can book. `qualification_signal` separates a form completion from a qualified-opportunity signal. Commercial interest remains a later NordSym Sales decision.
- The local preview server returns deterministic availability, keeps one slot visibly occupied and blocks booking submission.
- The preview server CSP blocks external scripts and connections. The walkthrough does not send PostHog, Meta, n8n or booking requests.
- The Meta account readback and launch-only gates below remain unchanged.

## Superseded evidence

The screenshots, C02 copy, V2 ElevenLabs asset and animatic show the prior
demo-and-exception-led positioning. They are historical evidence only and must
not be used as launch approval for the coordinated positioning release.

## NEEDS GUSTAV NOW

Record the founder bridge video from
`../../assets/video/ai-i-drift-sa-fungerar-det-v3-script.sv.txt`, or explicitly
authorize a separate voiceover production. The final MP4, captions and HTML
transcript must match before the coordinated site release.

## LAUNCH-ONLY LATER

Founder recording specification:

- Script: `../../assets/video/ai-i-drift-sa-fungerar-det-v3-script.sv.txt`.
- Framing: vertical 9:16 master, chest-up, eye level, simple NordSym home-office background.
- Duration: 45 to 60 seconds.
- Delivery: calm, direct, one thought per sentence.
- Export: H.264 MP4, minimum 1080x1920, clean speech, no music required.
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
