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
- Budget: Not selected. Separate exact approval required.

## Ad

- Name: `C02 | Vem räddar undantagen | Static | V1`
- Identity: NordSym Facebook Page and `@nordsymab`, pending final readback in Ads Manager
- Format: Single image
- Primary text:

  `Om en senior person måste upptäcka, tolka och rädda varje undantag finns det manuella arbetet fortfarande kvar. Ni har bara flyttat det.`

  `NordSym kartlägger kostnadsfritt ett verkligt flöde och visar vad som måste styras.`

- Headline: `Vem räddar undantagen?`
- Description: `Kartlägg ett verkligt flöde`
- CTA: `Läs mer`
- Destination:

  `https://nordsym.com/ai-i-drift/sa-fungerar-det/?utm_source=meta&utm_medium=paid_social&utm_campaign=ai_i_drift_v1&utm_content=c02_static`

- Feed asset: `c02-dolda-manuella-arbetet-1080x1350.png`
- Square fallback: `c02-dolda-manuella-arbetet-1080x1080.png`

## Construction hold

Do not create this campaign until the bridge route is live, the final video is accepted, the dataset and CAPI are verified in Test Events, the NordSym identity reads back in Ads Manager, a payment method is approved, and Gustav approves the exact budget and activation.
