# Reproducible Meta campaign draft

This specification is inert. It does not authorize campaign creation, payment changes, publication or spend.

## Campaign

- Name: `NS | AI agents | Website leads | V1`
- Buying type: Auction
- Objective: Leads
- Conversion location: Website
- Status at construction: Paused
- Campaign budget: Off for the first controlled creative cell

## Ad set

- Name: `SE | Broad | AI agents | V1`
- Country: Sweden
- Age: 25+
- Language: Swedish
- Audience: Broad. Meta cannot natively encode which companies have expensive recurring work suitable for an AI agent. The creative and five-question qualification must self-select the buyer.
- Placements: Advantage+ placements, with the 4:5 feed asset and 1:1 fallback mapped explicitly. Do not publish cropped story or reel variants without review.
- Performance goal: Maximize number of conversions
- Dataset: Not selected
- Conversion event: `Lead`, only after dataset and Test Events verification
- Attribution: Verify the then-current Meta default before construction
- Daily budget proposal: `250 SEK`
- Learning-tranche ceiling: `7,500 SEK`
- Budget status: Not entered. Separate exact approval required.

## Lead ad

- Name: `V01 | Innan AI-agenter börjar arbeta | Founder video | V1`
- Identity: NordSym Facebook Page and `@nordsymab`, pending final readback in Ads Manager
- Format: Single video
- Primary text:

  `Ska AI-agenter börja arbeta hos er? Gör inte det här misstaget.`

  `AI-agenter kan utföra återkommande arbete i systemen ni redan använder. Men först behöver informationen vara samlad, aktuell och tydlig.`

  `Vill ni veta om ert företag är redo för AI-agenter? Klicka vidare, svara på fem frågor och boka en kartläggning.`

- Headline: `Innan AI-agenter börjar arbeta`
- Description: `Svara på fem frågor`
- CTA: `Läs mer`
- Destination:

  `https://nordsym.com/ai-i-drift/sa-fungerar-det/?utm_source=meta&utm_medium=paid_social&utm_campaign=ai_i_drift_v1&utm_content=founder_video_v1`

- Meta video asset: `/Users/gustavhemmingsson/Desktop/NordSym-AI-agenter-edit/NordSym-AI-agenter-FINAL.mp4`
- Source receipt: `NordSym-AI-agenter-FINAL.mp4`, SHA-256 `c5fd171b9fbcfd8b806a12b52b8a24c54f268702730ef68d700edd376a9213d0`
- Delivery: 1080 x 1920 H.264/AAC, 88.545 seconds, baked Swedish captions plus matching VTT
- Bridge media: clean web derivative `assets/video/ai-i-drift-sa-fungerar-det-v3.mp4` plus matching VTT
- Spoken source: `assets/video/ai-i-drift-sa-fungerar-det-v3-script.sv.txt`
- Static reserve: C02 remains held and is not launched simultaneously in the first low-volume cell.

## Construction hold

Do not create this campaign until the bridge media, captions and transcript pass final validation, the dataset and CAPI are verified in Test Events, the NordSym identity reads back in Ads Manager, a payment method is approved, and Gustav approves construction, budget and activation separately.

## Decision rules

- `3,000 SEK` is a technical and early creative smoke test. It can reveal broken
  delivery or obvious message rejection, but cannot validate commercial economics.
- `7,500 SEK` is the recommended first learning tranche. One broad Swedish ad set
  and C02 as the primary creative preserve enough concentration to evaluate whether
  the message produces qualified conversations.
- `15,000 SEK` is held until the first tranche produces a real qualified-opportunity
  and meeting-quality signal. It is not justified before tracking and payment are
  proven.

Stop delivery before the ceiling if the funnel or measurement fails, the ad-to-page
message breaks, or spend produces clicks without any completed qualification after
enough landing-page sessions to inspect behavior. Continue only when tracked
completions describe recurring work with a real owner, multiple-system context and
commercial value. A booking alone is not success.

## Zero-spend state

This file is a UI-ready manifest only. No Meta campaign, ad set, ad, budget or
payment action has been created from it.
