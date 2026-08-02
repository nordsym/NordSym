# Meta E2E measurement map

This is the later event contract. The local preview does not send events to Meta.

| Step | Event | Owner | Trigger | Data boundary |
|---|---|---|---|---|
| Ad impression | Impression | Meta | Ad renders | Meta-native delivery data |
| Ad click | Link click | Meta | User clicks C02 or CTA | Destination and campaign identifiers |
| Video bridge | `$pageview` | PostHog | Bridge loads | Route plus sanitized campaign values |
| Video engagement | `nordsym_paid_bridge_video_started`, progress, completed | PostHog | Play, 25/50/75 percent, end | No form answers or identity |
| Bridge CTA | `nordsym_paid_bridge_cta_clicked` | PostHog | CTA to qualification | Placement plus sanitized campaign values |
| Qualification start | `nordsym_paid_qualification_started` | PostHog | First selected answer | Current implementation records no identity |
| Form completion | `nordsym_paid_qualification_completed` and consent-gated Meta `Lead` | PostHog and Meta measurement | All five questions complete | Meta receives no answers, names, email, company or free text |
| Prequalification signal | `qualification_signal=prequalified` | PostHog and Booking Engine | The described work spans more than one system and the company is beyond early exploration | A hypothesis for meeting preparation only. It is not a verified need, budget or buying intent |
| Booking progression | focus/time/submitted events | Booking Engine and PostHog | Booking steps | Meta receives none of the booking form |
| Confirmed booking | `nordsym_booking_succeeded` and later server-side Meta `Schedule` | Booking Engine, PostHog and consent-gated CAPI | Booking API confirms success | Meta receives no booking form values |
| Commercially interesting lead | Lifecycle decision | NordSym Sales | Gustav validates pain, authority, timing and credible contract value | Never inferred from the website form alone |
| Held meeting | Lifecycle state | Mission Control and NordSym Sales | Meeting actually held | Internal commercial state |
| Proposal | Lifecycle state | Mission Control and NordSym Sales | Proposal issued | Internal commercial state |
| Won engagement | Lifecycle state | Mission Control and NordSym Sales | Contracted work | Internal commercial state |
| Realized gross margin | Financial outcome | Mission Control, Sales and finance | Revenue and delivery cost realized | Never optimized from a booking alone |

The commercial chain is:

`impression -> click -> form completion -> qualified opportunity -> booking -> commercially interesting lead -> held meeting -> proposal -> won engagement -> realized gross margin`

`utm_content` is preserved from the ad URL through the bridge, qualification URL,
booking context and booking acquisition payload. Pixel, dataset and CAPI remain
launch gates. They are not required to inspect the inert local path.
