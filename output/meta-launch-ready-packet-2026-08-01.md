# NordSym Meta launch packet

Status: Meta ad creative approved. Separate 16:9 bridge media is locally bound and awaiting Gustav's visual E2E acceptance. No Meta upload, activation or spend.
Updated: 2026-08-02

## Commercial direction

NordSym builds and operates AI agents inside the client's tech stack to take
over recurring work that costs time and money.

The commercial promise is capacity, not governance. The mechanism is that each
agent works with the context and access required for a bounded assignment,
hands real decisions to a person, records its result and stops safely when the
work leaves its mandate. NordSym stays responsible for building and operating
that working path as the business changes.

The Meta campaign must make one buyer ask:

> Vad måste finnas på plats innan AI-agenter kan börja arbeta hos oss?

The first funnel is not sold as Agent Badge, an agent directory, generic
automation, an AI-readiness doctrine or a list of controls. Context, mandate,
access, approvals, records and stop controls explain why the agent can take over
real work. They are supporting credibility after the buyer recognizes the work
they want removed.

## Intended path

`Meta creative -> video bridge -> five questions -> booking`

The intended launch route is:

`https://nordsym.com/ai-i-drift/sa-fungerar-det/`

The bridge CTA continues to `/ai-i-drift/#kvalificering` while preserving the
approved UTM fields.

## Lead creative: founder video V01

### Primary text

Ska AI-agenter börja arbeta hos er? Gör inte det här misstaget.

AI-agenter kan utföra återkommande arbete i systemen ni redan använder. Men
först behöver informationen vara samlad, aktuell och tydlig.

Vill ni veta om ert företag är redo för AI-agenter? Klicka vidare, svara på fem
frågor och boka en kartläggning.

### Headline

`Innan AI-agenter börjar arbeta`

### Description

`Svara på fem frågor`

### CTA

`Läs mer`

### Destination

`https://nordsym.com/ai-i-drift/sa-fungerar-det/?utm_source=meta&utm_medium=paid_social&utm_campaign=ai_i_drift_v1&utm_content=founder_video_v1`

## Reserve statics

- C01 keeps the same promise and tests recognition of recurring cost:
  `Vilket arbete borde teamet slippa?`
- C03 keeps the same promise and tests mechanism:
  `Agenten arbetar där jobbet redan händer.` Its map shows context, system
  action, human decision, recorded result and continued operation.

Do not launch the video and statics together in the first low-volume cell. V01
leads. C02 remains the first replacement only after a specific hold or kill
decision.

## Meta ad video

### Spoken Swedish script, 85.6 seconds

The single working source is
`assets/video/meta-founder-ad-v2-script.sv.txt`. No alternate script
is approved for the first cell.

### Approved asset

- Format: vertical 9:16 master, 1080 x 1920.
- Duration: 85.631 seconds. Gustav intentionally enters frame before the first spoken sentence.
- Framing: medium close-up, eye-level camera, uncluttered home-office background.
- Delivery: direct and conversational. Do not read section labels or say
  `Operating Layer`, `AI operation`, `readiness` or `governance`.
- Captions: baked Swedish captions, sentence case, maximum two lines at a time.

### Verified condition

The recording is approved as the Meta ad creative only. It must not be reused as
the first bridge video because that would repeat the ad after click.

## Bridge page contract

### Headline

`Fem frågor. Sedan tar vi nästa steg.`

### Supporting copy

`Gustav förklarar vad frågorna handlar om och hur det efterföljande 20-minutersmötet går till.`

### CTA

`Svara på fem frågor`

### Expectation line

`Fem frågor före ett 20-minutersmöte`

The bridge candidate carries Gustav's separate 16:9 Tella recording, matching
Swedish captions timed from the actual audio and a readable exact transcript.
It continues from the ad, explains the five questions and 20-minute booking, and
does not repeat the ad's argument. The existing funnel structure remains. The
public production route remains unchanged until visual acceptance and a separate
release decision.

## Qualification contract

The qualification page must lead with:

`Vilket återkommande arbete vill ni få bort från teamet?`

The existing five categorical questions remain because they establish company
size, current state, blocker, system count and mandate without collecting names
or free text. The CTA remains `Välj en tid` after completion.

A completed form is not automatically a qualified commercial opportunity. The
commercially interesting state requires recurring work with meaningful cost, a
real owner or sponsor, a credible system path and room for a continuing
build-and-operate relationship.

## Campaign manifest

- Campaign: `NS | Recurring work | Website leads | V1`
- Objective: Leads
- Conversion location: Website
- Ad set: `SE | Broad | Recurring work | V1`
- Country: Sweden
- Age: 25+
- Language: Swedish
- Audience: Broad. Creative and qualification perform the commercial filtering.
- Lead creative: V01 founder video
- Destination UTM content: `founder_video_v1`
- Conversion event: `Lead`, after final Test Events verification
- Status if later constructed: Paused
- Proposed learning ceiling: 7,500 SEK, not approved

## Asset decision

### Retain

- NordSym visual system and deterministic HTML/CSS render pipeline
- C02 dark ledger composition
- C03 tech-stack map composition
- 4:5 and 1:1 export formats
- Existing 16:9 video bridge frame, consent and UTM architecture
- Five-question qualification and booking path

### Rewrite

- C01-C03 supporting labels and Meta copy so control language explains the work
  instead of becoming the offer
- Founder-ad script and campaign manifest

### Retire

- `Demo är inte drift` as the campaign thesis
- `Vem räddar undantagen?` as the primary sales promise
- `Agenten är inte hela operationen` as the trust headline
- Current V2 ElevenLabs bridge MP4
- Historical silent animatic
- `AI-readiness` and `build-or-decline` language in buyer-facing creative
- Any Agent Badge, agent-directory or capability-list framing

## Verified technical state

- Dataset and Pixel: `NordSym Website`, `1283815170364428`
- Direct CAPI token: stored only in protected Vercel Production and Preview
  environment storage
- Protected preview deployment:
  `https://nordsym-site-b93l1zrwn-gustavs-projects-0c9f35af.vercel.app`
- Preview `/api/meta-config`: enabled with Pixel `1283815170364428`
- Browser path: consented PageView activity and completed five-question Lead
  path reached booking with `utm_content=founder_video_v1` preserved
- Schedule: contract tests pass, but no live event was manufactured because no
  genuine booking was submitted
- Facebook Page `666511603221872` and `@nordsymab`: present in Business
  Portfolio `1194013423798700`, but ad account `1017896054501692` currently
  shows no connected resources
- Billing: 0.00 SEK and no payment method on the canonical manual account
- Campaigns: none
- Founder media: launch derivative `NordSym-AI-agenter-LAUNCH-V2.mp4`, SHA-256
  `8e2e06008f997f4ba8e27815ecfdaafa566049649b7098de078da77b6db3d51e`.
  The immutable source remains `NordSym-AI-agenter-FINAL.mp4`, SHA-256
  `ba68e0e1319531490eb6be1ce968aa66dae689ae6c5b001a73088328006e3cec`.
- Bridge media: clean Tella source `Kom igång med era AI-agenter.mp4`, SHA-256
  `a4642aa73669976263511290d944d011a22553202f477154438103f3c64d80f1`.
  Its fast-start 1920 x 1080 H.264/AAC web derivative has SHA-256
  `23af2313a26cb8c41486278b8d53967bce0f62fa1829e788314ab81a87476ef1`.

## Launch gates

- Gustav explicitly approves assigning Page `666511603221872` and
  `@nordsymab` as connected resources to ad account `1017896054501692`.
- Gustav visually accepts the complete local journey from ad context through the
  16:9 bridge, CTA, five questions and 20-minute booking.
- The measurement candidate is production-deployed with the final media, then
  PageView and Lead are confirmed individually in Test Events. Schedule is
  confirmed after the first genuine consented booking.
- Gustav personally adds the payment method to the canonical manual account.
- Exact campaign construction, 7,500 SEK learning ceiling and activation each
  receive separate approval.

Nothing in this packet authorizes Meta mutation, publication, delivery or spend.
