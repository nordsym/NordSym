# Meta E2E preview evidence receipt

Historical verification from 2026-07-30. Superseded for creative and funnel copy
by `../meta-launch-ready-packet-2026-08-01.md`.

## Still valid

- The production-inert preview architecture remains valid.
- The approved portrait video and CTA open the local `/ai-i-drift/sa-fungerar-det/` bridge with sanitized campaign parameters.
- UTM preservation, qualification, booking and external-call blocking remain valid.
- The bridge CTA preserves `utm_source`, `utm_medium`, `utm_campaign`, `utm_id` and `utm_content`, then opens the focused `/ai-i-drift/kvalificering/` route.
- A complete qualified path reaches the current Swedish booking experience.
- All form completions can book. `qualification_signal` separates a form completion from a qualified-opportunity signal. Commercial interest remains a later NordSym Sales decision.
- The local preview server returns deterministic availability, keeps one slot visibly occupied and blocks booking submission.
- The preview server CSP blocks external scripts and connections. The walkthrough does not send PostHog, Meta, n8n or booking requests.
- The Meta account readback and launch-only gates below remain unchanged.

## Superseded evidence

The original screenshots, V2 ElevenLabs asset and animatic show the prior
demo-and-exception-led positioning. They are historical evidence only. The C02
source and exports were recalibrated on 2026-08-02 around recurring work,
bounded execution, human decisions and recorded results.

## NEEDS GUSTAV NOW

Reload and visually inspect the local E2E route at
`http://127.0.0.1:4173/output/meta-e2e-preview-2026-07-30/`. Confirm that the
separate 16:9 bridge video, captions, CTA, five questions and 20-minute booking
read as one coherent journey. This visual acceptance remains open.

## 2026-08-02 frontend closure

- The preview now contains a numbered navigator for all four surfaces.
- The selected first step is the 85.631-second portrait V2 launch derivative. The immutable 88.443-second source and static C02 alternate remain preserved.
- The ad preview poster is a neutral seated frame from source time 8.4 seconds, with closed mouth and no caption overlay.
- The bridge contains no transcript accordion or repeated explanation around the video.
- The bridge CTA opens the dedicated qualification route. The long-form `/ai-i-drift/` page remains intact for organic discovery.
- The five questions remain five categorical primary questions and collect company
  scale, current state, primary blocker, system scope and decision readiness.
- No conditional inputs were added because they would add friction without a proved
  routing benefit at current traffic volume.
- Reusable bridge and booking UI no longer depend on the founder's name.
- The booking page uses the five answers as preparation and confirms what happens during the meeting.
- Preview, bridge, qualification and booking routes all returned HTTP 200 after the
  copy and frontend update.
- Bridge, positioning, analytics, Meta, systems, booking and Meta measurement test
  suites all passed after the update.

## 2026-08-02 bridge candidate receipt

- Unchanged Tella source: `/Users/gustavhemmingsson/Desktop/Kom igång med era AI-agenter.mp4`
- Source SHA-256: `a4642aa73669976263511290d944d011a22553202f477154438103f3c64d80f1`
- Web derivative SHA-256: `23af2313a26cb8c41486278b8d53967bce0f62fa1829e788314ab81a87476ef1`
- Swedish VTT SHA-256: `80930d8326a534ca8046a570e2586f2c4e0015fcc5aea71cb6e92332534dbaf8`
- Media: 1920 x 1080, H.264/AAC, 30 fps, 48.669 seconds, fast-start
- Captions: timed locally from actual Swedish speech, maximum two lines and one
  preserved spoken `faktiskt`
- Path: Meta ad context -> separate bridge video -> five questions -> 20-minute booking
- HTTP readback: all four local route surfaces returned 200
- Automated browser navigation to localhost was blocked by the browser safety
  policy, so current visual acceptance is intentionally not claimed from tests alone

## 2026-08-02 Meta ad V2 receipt

- Immutable source: `/Users/gustavhemmingsson/Desktop/NordSym-AI-agenter-edit/NordSym-AI-agenter-FINAL.mp4`
- Source SHA-256: `ba68e0e1319531490eb6be1ce968aa66dae689ae6c5b001a73088328006e3cec`
- V2 derivative: `/Users/gustavhemmingsson/Desktop/NordSym-AI-agenter-edit/NordSym-AI-agenter-LAUNCH-V2.mp4`
- V2 SHA-256: `8e2e06008f997f4ba8e27815ecfdaafa566049649b7098de078da77b6db3d51e`
- Poster SHA-256: `8f94037f1f0f924452463c751b0e54d3702f01f31d022ba3bb13ce2bb735e26d`
- Removed source interval: `56.916667-59.733333`
- Removed sentence: `Och det är ofta här det faktiskt brister.`
- V2 media: 1080 x 1920, H.264/AAC, 60 fps, 85.631 seconds, fast-start
- A/V starts: `0.000/0.000`; stream-length difference: `0.014333` seconds
- Full video and audio decode completed without error

## LAUNCH-ONLY LATER

Launch-only gates:

1. Create or select the Meta dataset and install the approved Pixel ID and CAPI token.
2. Verify `PageView`, `Lead` and server-side `Schedule` in Meta Test Events.
3. Read back the intended NordSym Facebook Page and `@nordsymab` identity in Ads Manager.
4. Add and verify a payment method on manual ad account `1017896054501692`.
5. Reproduce the paused campaign, ad set and approved C02 ad from `campaign-draft.md`.
6. Approve the exact budget, ads and activation as a separate action.

## Historical Meta readback at 2026-07-30

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

## Historical visual evidence

- `01-meta-feed-mobile.png`
- `02-video-bridge-mobile.png`
- `03-video-playing-mobile.png`
- `04-qualification-mobile.png`
- `05-booking-mobile.png`
- `06-booking-availability-mobile.png`
- `07-booking-details-mobile.png`

No Meta entity, payment method, spend, external message or real booking was created
while preparing this package.
