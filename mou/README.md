# MoU System Documentation

**Built:** 2026-03-20
**Pattern:** Exact mirror of SoW signing system
**Purpose:** Non-binding Memorandum of Understanding for partnership exploration

---

## 📁 File Structure

```
mou/
├── mou-data.js       # MoU data (customer info, sections, countdown timer)
├── mou.js            # Renderer (signature canvas, countdown, theme toggle)
├── fadi.html         # Entry point for Fadi @ Kontra Law Firm
├── success.html      # Post-signature confirmation page
├── success.js        # Success page renderer
└── README.md         # This file

api/mou/
└── sign.js           # Backend API for signature submission & email delivery
```

---

## 🎯 Features

### Frontend (`mou.js`)
- ✅ Light/dark theme toggle (copied from `sow.js`)
- ✅ **72-hour countdown timer** (hours:minutes:seconds, visual)
- ✅ Signature canvas (exact copy of SoW signature logic)
- ✅ Form validation (name + title required)
- ✅ POST to `/api/mou/sign` on submission
- ✅ Redirects to `/mou/success` after signing

### Backend (`api/mou/sign.js`)
- ✅ Signature submission to Convex (`mous:sign` mutation)
- ✅ Email delivery to both parties (HTML formatted)
- ✅ Notification to Gustav + Molle
- ✅ Client IP tracking
- ✅ No payment flow (MoU is non-binding)

### Success Page (`success.js`)
- ✅ Confirmation message
- ✅ "What Happens Next" timeline (Discovery → Audit → SoW)
- ✅ Contact info (Gustav's email + phone)
- ✅ Signature summary (both parties)

---

## 🔗 URLs

- **MoU Page:** `nordsym.com/mou/fadi.html`
- **Success Page:** `nordsym.com/mou/success?customerId=fadi&signerName=...`
- **API Endpoint:** `POST /api/mou/sign`

---

## 📧 Email Flow

1. **Signature submitted** → POST `/api/mou/sign`
2. **Convex save:** `mous:sign` mutation stores signature
3. **Email sent to:**
   - Gustav: `gustav@nordsym.com`
   - Partner: `fadi@kontralaw.se` (placeholder - update in `api/mou/sign.js`)
   - Notification: Gustav + Molle (simple alert)
4. **Success page:** Redirect to `/mou/success`

---

## 🧪 Testing

**Local testing:**
```bash
# Start local server (if using Vercel dev)
vercel dev

# Or any static server
npx serve ~/Projects/NordSym-Hemsida
```

**Test URL:**
```
http://localhost:3000/mou/fadi.html
```

**Expected flow:**
1. Page loads with countdown timer (72h from `createdAt` in `mou-data.js`)
2. Draw signature + fill name/title
3. Click "Sign MoU"
4. Emails sent (check spam folder)
5. Redirect to success page

---

## 🔧 Configuration

### Add New MoU Customer

1. **Update `mou/mou-data.js`:**
```javascript
window.NORDSYM_MOU_DATA = {
  fadi: { ... },
  newCustomer: {
    customerName: "Company Name",
    customerRep: "Contact Name",
    vertical: "Partnership Type",
    validHours: 72,
    createdAt: "2026-XX-XXT00:00:00Z", // ISO timestamp
    sections: [ ... ]
  }
};
```

2. **Update `api/mou/sign.js`:**
```javascript
const partnerEmails = {
  fadi: "fadi@kontralaw.se",
  newCustomer: "contact@company.com"
};

const MOU_FALLBACK_DATA = {
  fadi: { ... },
  newCustomer: { ... }
};
```

3. **Create HTML shell:**
```bash
cp mou/fadi.html mou/newCustomer.html
# Edit data-customer-id="newCustomer"
```

---

## 🎨 Styling

Uses existing `sow/sow.css` — no custom MoU styles needed.

**Countdown timer styles** are inline in `fadi.html` (purple gradient, monospace font).

---

## ⚡ Differences from SoW

| Feature | SoW | MoU |
|---------|-----|-----|
| **Payment** | Yes (Stripe redirect) | No (non-binding) |
| **Countdown** | No | Yes (72h visual timer) |
| **Onboarding flow** | Yes (booking meeting) | No (simple confirmation) |
| **Email attachment** | Full SoW HTML | Simple confirmation email |
| **Data saved** | `sows:sign` | `mous:sign` |

---

## 📝 Next Steps

### Backend Setup (if not already done)

1. **Convex schema:** Add `mous` table with mutation:
```javascript
// convex/schema.ts
mous: defineTable({
  customerId: v.string(),
  customerName: v.string(),
  vertical: v.string(),
  signatureDataUrl: v.string(),
  signerName: v.string(),
  signerTitle: v.string(),
  signerIp: v.string(),
  validHours: v.number(),
  signedAt: v.number()
}).index("by_customer", ["customerId"]),
```

2. **Convex mutation:** `convex/mous.ts`
```javascript
export const sign = mutation({
  args: {
    customerId: v.string(),
    customerName: v.string(),
    vertical: v.string(),
    signatureDataUrl: v.string(),
    signerName: v.string(),
    signerTitle: v.string(),
    signerIp: v.string(),
    validHours: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mous", {
      ...args,
      signedAt: Date.now()
    });
  }
});
```

3. **Deploy Convex:**
```bash
cd ~/Projects/mission-control  # Or wherever Convex project is
npx convex deploy
```

---

## ✅ Success Criteria

- ✅ `nordsym.com/mou/fadi` loads and shows countdown
- ✅ Signature canvas works (draw + clear)
- ✅ Form validation requires name + title
- ✅ Countdown updates every second
- ✅ Sign button posts to `/api/mou/sign`
- ✅ Success page shows after signing
- ✅ Emails sent to Gustav + partner

---

## 🐛 Troubleshooting

**Countdown shows "Expired":**
- Update `createdAt` in `mou-data.js` to a recent timestamp

**API returns 500:**
- Check Convex deployment URL in `api/mou/sign.js`
- Verify `mous:sign` mutation exists in Convex

**Emails not sending:**
- Check n8n webhook URL: `https://nordsym.app.n8n.cloud/webhook/symbot-gmail`
- Verify partner email in `partnerEmails` config

**Signature canvas not drawing:**
- Check browser console for errors
- Verify `sow.css` is loading

---

**Built by:** Symbot (Subagent: mou-page-build)
**Pattern source:** `sow/` directory (exact mirror)
**Deploy:** Push to Vercel, countdown starts from `createdAt` timestamp
