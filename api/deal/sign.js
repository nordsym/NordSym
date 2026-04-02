// Deal Room sign API — handles signing for all deal types (sow, mou, etc.)
// Reads customer data from DEAL_DATA_JSON env var (never hardcoded)

const CONVEX_URL = "https://agile-crane-840.convex.cloud";
const N8N_WEBHOOK = "https://nordsym.app.n8n.cloud/webhook/symbot-gmail";

function getDealData() {
  const raw = process.env.DEAL_DATA_JSON;
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function generateSignedHtml(deal, dealType, signerName, signerTitle, signatureDataUrl, signedDate) {
  const docLabel = { sow: "Statement of Work", mou: "Memorandum of Understanding", demo: "Demo Agreement" }[dealType] || "Agreement";
  return `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><title>NordSym × ${deal.customerName} — Signed ${docLabel}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.07);">
<tr><td style="background:#0a0c0f;padding:28px 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td><span style="font-size:22px;font-weight:700;color:#fff;">NordSym</span><span style="font-size:22px;font-weight:300;color:#00d4ff;"> × ${deal.customerName}</span></td>
    <td align="right"><span style="display:inline-block;background:rgba(0,212,255,.12);color:#00d4ff;border:1px solid rgba(0,212,255,.3);border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;">SIGNED ${docLabel.toUpperCase()}</span></td>
  </tr></table>
  <p style="margin:10px 0 0;color:#94a3b8;font-size:14px;">Signed ${signedDate}</p>
</td></tr>
<tr><td style="padding:32px;">
  <h2 style="color:#0a0c0f;margin:0 0 16px;">Signed by</h2>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="width:50%;padding-right:16px;vertical-align:top;">
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px;">NordSym AB</p>
        <p style="font-family:'Brush Script MT',cursive;font-size:28px;margin:0 0 4px;color:#0a0c0f;">Gustav Hemmingsson</p>
        <p style="margin:0;font-size:14px;"><strong>Gustav Hemmingsson</strong><br>CEO, NordSym AB<br>${signedDate}</p>
      </td>
      <td style="width:50%;padding-left:16px;vertical-align:top;border-left:1px solid #e2e8f0;">
        <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;margin:0 0 4px;">${deal.customerName}</p>
        <img src="${signatureDataUrl}" style="max-width:180px;max-height:70px;display:block;margin-bottom:4px;" alt="Signature"/>
        <p style="margin:0;font-size:14px;"><strong>${signerName}</strong><br>${signerTitle}<br>${signedDate}</p>
      </td>
    </tr>
  </table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

async function mcMutation(fnName, args) {
  const url = `${CONVEX_URL}/api/mutation`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: fnName, args }),
  });
  if (!res.ok) throw new Error(`Convex mutation failed: ${res.status}`);
  return res.json();
}

async function sendEmail(to, subject, htmlBody) {
  await fetch(N8N_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "send", to, subject, message: htmlBody }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { customerId, dealType = "sow", signatureDataUrl, signerName, signerTitle } = req.body || {};
  if (!customerId || !signatureDataUrl || !signerName || !signerTitle) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const dealData = getDealData();
  const deal = dealData[customerId];
  if (!deal) return res.status(404).json({ error: "Unknown customer" });

  const signedDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const htmlDoc = generateSignedHtml(deal, dealType, signerName, signerTitle, signatureDataUrl, signedDate);

  try {
    // Store in Mission Control
    await mcMutation("sows:sign", {
      customerId: `nordsym-${customerId}-${dealType}`,
      customerName: deal.customerName,
      signerName,
      signerTitle,
      signedAt: Date.now(),
      dealType,
      status: "signed",
    });

    // Send email
    const partnerEmail = deal.partnerEmail;
    const toList = partnerEmail
      ? [partnerEmail, "molle@nordsym.com"]
      : ["molle@nordsym.com"];

    const docLabel = { sow: "Statement of Work", mou: "Memorandum of Understanding", demo: "Demo Agreement" }[dealType] || "Agreement";
    await sendEmail(
      toList.join(","),
      `NordSym × ${deal.customerName} — Signed ${docLabel}`,
      htmlDoc
    );

    return res.status(200).json({ ok: true, message: "Signed successfully" });
  } catch (err) {
    console.error("Deal sign error:", err);
    return res.status(500).json({ error: "Signing failed", detail: err.message });
  }
}
