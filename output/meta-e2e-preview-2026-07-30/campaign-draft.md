# Reproducible Meta campaign draft

This specification is inert. It does not authorize campaign creation, payment changes, publication or spend.

## Campaign

- Name: `NS | AI i drift | Website leads | V1`
- Buying type: Auction
- Objective: Leads
- Conversion location: Website
- Status at construction: Paused
- Campaign budget: Off for the first controlled creative cell

## Ad set

- Name: `SE | Broad | AI drift | V1`
- Country: Sweden
- Age: 25+
- Language: Swedish
- Audience: Broad. Meta cannot natively encode "AI initiative requires babysitting" or verified operational mandate. The creative and five-question qualification must self-select the buyer.
- Placements: Advantage+ placements, with the 4:5 feed asset and 1:1 fallback mapped explicitly. Do not publish cropped story or reel variants without review.
- Performance goal: Maximize number of conversions
- Dataset: Not selected
- Conversion event: `Lead`, only after dataset and Test Events verification
- Attribution: Verify the then-current Meta default before construction
- Daily budget proposal: `250 SEK`
- Learning-tranche ceiling: `7,500 SEK`
- Budget status: Not entered. Separate exact approval required.

## Ad

- Name: `C02 | Vem tar över när agenten fastnar | Static | V1`
- Identity: NordSym Facebook Page and `@nordsymab`, pending final readback in Ads Manager
- Format: Single image
- Primary text:

  `Om en senior medarbetare måste upptäcka och lösa varje avvikelse är arbetet fortfarande manuellt. Ni har bara flyttat det till personen som måste ta över.`

  `NordSym kartlägger hur arbetet, systemen och besluten hänger ihop och visar vad som krävs för att agenten ska fungera i vardagen.`

- Headline: `Vem tar över när agenten fastnar?`
- Description: `Se vad som saknas`
- CTA: `Läs mer`
- Destination:

  `https://nordsym.com/ai-i-drift/sa-fungerar-det/?utm_source=meta&utm_medium=paid_social&utm_campaign=ai_i_drift_v1&utm_content=c02_static`

- Feed asset: `c02-dolda-manuella-arbetet-1080x1350.png`
- Square fallback: `c02-dolda-manuella-arbetet-1080x1080.png`

## Construction hold

Do not create this campaign until the bridge route is live, the final video is accepted, the dataset and CAPI are verified in Test Events, the NordSym identity reads back in Ads Manager, a payment method is approved, and Gustav approves the exact budget and activation.

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
completions include at least one qualified-opportunity signal and the resulting
conversation is commercially plausible. A booking alone is not success.

## Zero-spend state

This file is a UI-ready manifest only. No Meta campaign, ad set, ad, budget or
payment action has been created from it.
