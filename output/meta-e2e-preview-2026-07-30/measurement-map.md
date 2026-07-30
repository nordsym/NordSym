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
| Qualified completion | `nordsym_paid_qualification_completed` and later Meta `Lead` | PostHog and consent-gated Meta measurement | All five questions complete | Meta receives no answers, names, email, company or free text |
| Booking progression | focus/time/submitted events | Booking Engine and PostHog | Booking steps | Meta receives none of the booking form |
| Confirmed booking | `nordsym_booking_succeeded` and later server-side Meta `Schedule` | Booking Engine, PostHog and consent-gated CAPI | Booking API confirms success | Meta receives no booking form values |
| Held meeting | Lifecycle state | Mission Control and NordSym Sales | Meeting actually held | Internal commercial state |
| Proposal | Lifecycle state | Mission Control and NordSym Sales | Proposal issued | Internal commercial state |
| Won engagement | Lifecycle state | Mission Control and NordSym Sales | Contracted work | Internal commercial state |
| Realized gross margin | Financial outcome | Mission Control, Sales and finance | Revenue and delivery cost realized | Never optimized from a booking alone |

The commercial chain is:

`impression -> click -> qualified completion -> booking -> held meeting -> proposal -> won engagement -> realized gross margin`

Pixel, dataset and CAPI are launch-only requirements. They are not required to inspect this local path.
