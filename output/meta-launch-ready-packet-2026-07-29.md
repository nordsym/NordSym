# NordSym Meta launch packet

Prepared 2026-07-29. Internal review state only. No Meta entity, payment method,
tracking configuration, campaign, publication or spend was changed.

## Launch verdict

NordSym is creative-ready but not account-ready.

The first paid hypothesis should remain one commercial problem:

> A prioritized AI or automation flow works in the normal case but still requires
> senior people to detect, interpret and rescue exceptions.

The first coherent path is:

`Meta creative -> video bridge -> qualification -> booking`

Do not split the first low-volume tranche between the bridge and direct
qualification. Establish one baseline first.

## Live Meta evidence

### Canonical manual control plane

- Business Portfolio: `1194013423798700`, NordSym AB
- Ad account: `1017896054501692`, NordSym AB - Meta Ads
- Status: `ACTIVE`
- Ads MCP enabled: yes
- Queryable through Ads MCP: yes
- Currency: SEK
- Payment method: no
- Datasets returned for the ad account: 0
- Datasets returned for the portfolio: 0
- Campaigns returned: 0
- Account-level delivery fields: no spend, impression, landing-page-view or lead
  values surfaced

### Identity readback

- Business Suite resolved the manual portfolio with Facebook Page
  `666511603221872` selected.
- Business Suite resolved the manual portfolio route for Instagram asset
  `777374748797891`.
- Connector-level Page readback failed with Meta OAuth error 190.
- Connector-level Instagram readback failed with an invalid-argument error.
- Result: the asset routes are mapped in Business Suite, but full Page and
  Instagram permission detail is not independently readable through the
  connector today. This is a final pre-launch readback gate, not evidence that
  the assets are missing.

### Separate legacy account

- Ad account `243113670` remains visible separately.
- Status: `UNSETTLED`
- Queryable: no
- It is not the launch account and must not be used or changed.

### Website measurement

- `https://nordsym.com/api/meta-config` returns `{"enabled":false}`.
- The consent-gated Pixel and CAPI code exists.
- No dataset means no Pixel event stream exists yet.
- `Lead` is designed to fire only after completed qualification.
- Server-side `Schedule` is designed to fire only after confirmed booking.
- No names, email addresses, company details, notes or qualification answers are
  intended for Meta.

## Frozen static creative matrix

The accepted static package remains frozen at:

`output/meta-static-creatives-2026-07-28/`

| Cell | Recognition moment | Role in test | Destination |
| --- | --- | --- | --- |
| C02, Vem räddar undantagen? | A senior person still rescues every exception | Lead cell | Video bridge |
| C01, Demo är inte drift | The normal path works but production does not | Reserve challenger | Video bridge |
| C03, Agenten är inte hela operationen | The buyer needs to see the operating layer | Trust challenger | Video bridge |

All three have editable sources and 1080 x 1350 plus 1080 x 1080 exports. No
carousel is required for the first tranche.

## Short video matrix

### V01. Founder-recorded

**Buyer recognition:** hidden senior intervention.

**Hook:** Om en senior person måste rädda varje undantag har ni inte
automatiserat jobbet.

**Script, 35 to 45 seconds:**

Om en senior person måste upptäcka och rädda varje undantag har ni inte
automatiserat jobbet. Ni har byggt en ny manuell process runt agenten.

Det är därför så många AI-initiativ fungerar i demon men stannar före stabil
drift. NordSym börjar inte med ännu ett verktyg. Vi följer ett prioriterat flöde
genom systemen ni redan använder och sätter gränser, stopp, beslut och mätning
runt det.

Vill du se hur det fungerar? Se den korta genomgången och kartlägg sedan ett
verkligt flöde kostnadsfritt.

**Shot direction:**

- Gustav, medium close-up, camera at eye level.
- Start speaking in the first frame. No logo animation.
- One clean take plus one tighter alternate take.
- Burned-in Swedish subtitles.
- Optional cutaway after the first paragraph to the C02 exception diagram.

**On-screen text:** `Vem räddar undantagen?`

**CTA:** `Se hur en styrd operation fungerar`

### V02. ElevenLabs-assisted voiceover

**Buyer recognition:** a successful demo is being mistaken for production.

**Hook:** Demo är inte drift.

**Script, 30 to 40 seconds:**

Demo är inte drift.

En agent kan klara normalfallet och ändå vara oanvändbar i vardagen. Drift
börjar när fel data, saknad åtkomst och oklara beslut inte leder till att någon
måste hoppa in och rädda varje körning.

NordSym bygger den styrda operationen runt agenten: startsignal, systemåtkomst,
undantag, stopp och mätning.

Se genomgången på drygt en minut. Om ni har ett prioriterat flöde kan ni sedan
få det kartlagt kostnadsfritt.

**Visual direction:**

- Animate the C01 contrast rather than generating new AI imagery.
- Left side: demo and normal path.
- Right side: exception, stop and handoff.
- Use the real NordSym type, paper, ink and oxide system.
- A synthetic voice is acceptable only if the Swedish delivery sounds natural
  and does not imply it is Gustav.

**On-screen text:** `Demo är inte drift`

**CTA:** `Se vad som saknas`

### V03. Static-motion operations map

**Buyer recognition:** the agent has been treated as the whole solution.

**Hook:** Agenten är bara en del av operationen.

**Script, 25 to 35 seconds:**

Agenten är bara en del av operationen.

För att arbetet ska fungera i verkligheten måste startsignalen vara tydlig.
Åtkomsten till systemen måste vara styrd. Osäkra beslut måste stoppas eller
lämnas över. Undantag måste hanteras. Resultatet måste gå att mäta.

Det är den operation NordSym bygger och driver.

Se hur upplägget fungerar och börja med en kostnadsfri kartläggning av ett
prioriterat flöde.

**Visual direction:**

- Reveal one existing C03 operations-map node at a time.
- Startsignal, systemarbete, beslut, undantag, mätbar drift.
- No portrait, avatar, stock image or generated robot.
- Use a restrained cursor or line movement only where it explains sequence.

**On-screen text:** `Agenten är inte hela operationen`

**CTA:** `Kartlägg ett verkligt flöde`

## First-tranche creative structure

Keep the commercial hypothesis and destination constant. Change only the
creative expression.

Recommended first cells:

1. C02 static
2. V01 founder-recorded
3. V02 ElevenLabs-assisted voiceover

C01, C03 and V03 remain ready reserves. Introduce one reserve only after a
specific cell has earned a hold or kill decision. Do not launch six cells into a
small budget and pretend the result can distinguish them.

## Video bridge

Local implementation:

- Route: `/ai-i-drift/sa-fungerar-det/`
- Source: `ai-i-drift/sa-fungerar-det/index.html`
- Styles: `ai-i-drift/sa-fungerar-det/bridge.css`
- Tracking: `ai-i-drift/sa-fungerar-det/bridge.js`
- Poster: `assets/ai-i-drift-video-poster.svg`
- Intended video asset:
  `assets/video/ai-i-drift-sa-fungerar-det.mp4`

The page is intentionally sparse:

1. NordSym identity
2. One recognition headline
3. One supporting sentence
4. Explicit-play video
5. One CTA
6. A short expectation line
7. Accessible transcript

It has no autoplay and preserves accepted UTM parameters into
`/ai-i-drift/#kvalificering`.

### Bridge video script, about 60 seconds

Om en agent fungerar i demon men någon måste kontrollera varje körning, rätta
fel data och rädda undantagen, då har ni inte tagit bort arbetet. Ni har flyttat
det.

Det händer när man börjar med modellen eller verktyget och lämnar själva
operationen åt sidan. NordSym börjar i ett verkligt, återkommande flöde. Vi
sätter gränsen för vad agenten får göra, kopplar den till systemen ni redan
använder, bygger stopp och mänskliga beslut där osäkerheten börjar och mäter vad
som faktiskt händer i drift.

Första steget är en kostnadsfri kartläggning. Vi följer ett prioriterat flöde och
avgör om det finns en säker, mätbar väg till produktion. Om svaret är nej säger
vi det. Om svaret är ja kan NordSym lämna ett separat förslag på att bygga och
driva operationen.

### Bridge measurement

- `$pageview` on bridge load in PostHog
- `nordsym_paid_bridge_video_started`
- `nordsym_paid_bridge_video_progress` at 25, 50 and 75 percent
- `nordsym_paid_bridge_video_completed`
- `nordsym_paid_bridge_cta_clicked`
- Existing qualification-start and qualification-complete events downstream
- Meta PageView only after consent and dataset activation
- Meta Lead only after completed qualification
- Meta Schedule only after confirmed booking

## Budget decision slate

These are approval options, not committed spend.

### Low: 3,000 SEK

**Purpose:** technical smoke test only.

Can answer:

- Does delivery start?
- Does paid traffic reach the bridge?
- Do PageView, video, Lead and Schedule events reconcile technically?
- Does C02 create any qualified attention?

Cannot answer:

- Whether Meta is a viable commercial acquisition lane.
- Which of several creatives is best.
- A credible CAC or gross-margin relationship.

Stop if delivery or event reconciliation is still broken after the initial
controlled checks. Continue only if the path is technically clean and at least
some visitors reach qualification with plausible company situations.

### Base: 7,500 SEK

**Purpose:** creative and message validation.

Recommended starting point.

Run C02, V01 and V02 against the same buyer problem and bridge destination. This
is the smallest tranche that can compare static, authentic founder and
voiceover-led expression without pretending to prove full economics.

Hold a cell when it receives delivery but produces no bridge engagement or
qualification movement. Continue a cell when it produces qualified completions
whose answers fit the commercial hypothesis. Do not scale because of cheap
clicks alone.

### Learning: 15,000 SEK

**Purpose:** first commercial validation.

Use only after the base tranche produces qualified completions and the
lead-response workflow is operating. It can begin testing whether qualified
attention becomes held meetings and credible sales opportunities.

It still cannot establish durable CAC or profit from one small cohort. Scale
requires held meetings, proposals and won work with recorded gross-margin
evidence, not only Meta lead counts.

## Mechanical launch checklist

### Website and creative

- [x] Three static concepts frozen with editable sources and exports
- [x] Three short-video concepts and scripts prepared
- [x] Video bridge implemented locally
- [x] Bridge poster, transcript, UTM handoff and PostHog events implemented
- [x] Existing qualification and booking path preserved
- [ ] Final bridge MP4 approved and added at the expected path
- [ ] Bridge deployed and live route returns 200
- [ ] Live mobile and desktop readback completed

### Meta control plane

- [x] Manual ad account active, MCP-enabled and queryable
- [x] No existing campaigns on the manual account
- [ ] Page and Instagram access read back successfully at campaign-build time
- [ ] Dataset and Pixel created with Gustav's exact approval
- [ ] CAPI token generated and installed with Gustav's exact approval
- [ ] Meta config enabled only after dataset and token installation
- [ ] PageView verified in Test Events after consent
- [ ] Lead verified only after completed qualification
- [ ] Schedule verified only after confirmed booking
- [ ] Browser and server events deduplicate correctly
- [ ] Payment method added with Gustav's exact approval

### Campaign and commercial operation

- [ ] Campaign, ad set and ads constructed but kept inactive
- [ ] Final copy, crops, destination and identity preview approved
- [ ] Lead owner and response path confirmed
- [ ] Held meeting, proposal, won engagement, realized revenue and gross margin
      captured in their existing owners
- [ ] Exact budget approved
- [ ] Exact activation approved

## Exact decisions still held

1. Approve the bridge video production mode and final MP4.
2. Approve production deployment of the bridge route.
3. Separately approve dataset/Pixel creation, CAPI token installation and Test
   Events work.
4. Separately approve adding the payment method.
5. Separately approve campaign construction.
6. Separately approve budget and activation.

Nothing follows automatically from this packet.
