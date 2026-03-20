// NordSym MoU Signing API
// Handles MoU signature submission and email delivery

const CONVEX_URL = "https://agile-crane-840.convex.cloud";
const N8N_WEBHOOK = "https://nordsym.app.n8n.cloud/webhook/symbot-gmail";

// Partner email configuration
const partnerEmails = {
  fadi: "fadi@kontralaw.se", // Placeholder - update with actual email
};

// MoU fallback data
const MOU_FALLBACK_DATA = {
  fadi: {
    customerName: "Kontra Law Firm",
    customerRep: "Fadi Al-Aieshy",
    vertical: "AEO/GEO Revenue-Share Partnership",
    validHours: 72,
    createdAt: "2026-03-20T16:22:00Z"
  }
};

function generateMouHtml(mou, signatureDataUrl, signedDate) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NordSym X ${mou.customerName} — Signed MoU</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f172a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.07);">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:28px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td><span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-.3px;">NordSym</span><span style="font-size:22px;font-weight:300;color:#e0e7ff;"> × ${mou.customerName}</span></td>
<td align="right"><span style="display:inline-block;background:rgba(255,255,255,.2);color:#ffffff;border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;">SIGNED MoU</span></td>
</tr></table>
<p style="margin:10px 0 0;color:#e0e7ff;font-size:14px;line-height:1.6;">Memorandum of Understanding — signed ${signedDate}</p>
</td></tr>

<!-- Signed confirmation -->
<tr><td style="padding:24px 32px 0;">
<div style="background:#f0fdf4;border-left:4px solid #166534;border-radius:0 10px 10px 0;padding:14px 16px;">
<p style="margin:0;color:#166534;font-weight:700;font-size:14px;">✓ MoU signed by ${mou.signedBy}</p>
<p style="margin:6px 0 0;color:#166534;font-size:12px;opacity:0.8;">This is a non-binding expression of interest to explore partnership opportunities.</p>
</div>
</td></tr>

<!-- Partnership Overview -->
<tr><td style="padding:20px 32px 0;">
<p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;">Partnership Focus</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;overflow:hidden;">
<tr>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Vertical</td>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px;color:#0f172a;">${mou.vertical}</td>
</tr>
<tr>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">MoU Validity</td>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px;color:#0f172a;">${mou.validHours} hours from signing</td>
</tr>
<tr>
<td style="padding:12px 16px;color:#64748b;font-size:13px;">Next Step</td>
<td style="padding:12px 16px;font-weight:600;font-size:13px;color:#0f172a;">Discovery call & AEO/GEO audit</td>
</tr>
</table>
</td></tr>

<tr><td style="padding:16px 32px 0;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

<!-- What Happens Next -->
<tr><td style="padding:20px 32px 0;">
<p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;">What Happens Next?</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;overflow:hidden;">
<tr><td style="padding:12px 16px;">
<div style="display:flex;align-items:start;gap:12px;margin-bottom:12px;">
<div style="width:32px;height:32px;background:#667eea;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
<span style="color:white;font-weight:600;font-size:14px;">1</span>
</div>
<div>
<strong style="font-size:13px;color:#0f172a;">Discovery Call</strong>
<p style="margin:4px 0 0;color:#64748b;font-size:12px;line-height:1.5;">Gustav will reach out within 24 hours to schedule an initial discussion and preliminary AEO/GEO audit.</p>
</div>
</div>
<div style="display:flex;align-items:start;gap:12px;margin-bottom:12px;">
<div style="width:32px;height:32px;background:#764ba2;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
<span style="color:white;font-weight:600;font-size:14px;">2</span>
</div>
<div>
<strong style="font-size:13px;color:#0f172a;">Audit & Strategy</strong>
<p style="margin:4px 0 0;color:#64748b;font-size:12px;line-height:1.5;">We'll analyze your current AI search visibility and present optimization opportunities.</p>
</div>
</div>
<div style="display:flex;align-items:start;gap:12px;">
<div style="width:32px;height:32px;background:#667eea;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
<span style="color:white;font-weight:600;font-size:14px;">3</span>
</div>
<div>
<strong style="font-size:13px;color:#0f172a;">Formal SoW (If Aligned)</strong>
<p style="margin:4px 0 0;color:#64748b;font-size:12px;line-height:1.5;">If both parties see mutual value, we'll draft a binding Scope of Work with specific terms and revenue-share structure.</p>
</div>
</div>
</td></tr>
</table>
</td></tr>

<tr><td style="padding:16px 32px 0;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

<!-- Signature block -->
<tr><td style="padding:20px 32px 0;">
<p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;">Signatures</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;overflow:hidden;">
<tr>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">NordSym AB</td>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px;font-style:italic;">Gustav Hemmingsson, CEO</td>
</tr>
<tr>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">${mou.customerName}</td>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px;">${mou.signedBy}${mou.signerTitle ? ', ' + mou.signerTitle : ''}</td>
</tr>
<tr>
<td style="padding:12px 16px;color:#64748b;font-size:13px;">Date</td>
<td style="padding:12px 16px;font-weight:600;font-size:13px;">${signedDate}</td>
</tr>
</table>
</td></tr>

<!-- Contact -->
<tr><td style="padding:20px 32px;">
<div style="background:#f8fafc;border-radius:10px;padding:16px;">
<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0f172a;">Questions?</p>
<p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
📧 <a href="mailto:gustav@nordsym.com" style="color:#667eea;text-decoration:none;">gustav@nordsym.com</a><br>
📞 <a href="tel:+46705292583" style="color:#667eea;text-decoration:none;">+46 70 529 25 83</a>
</p>
</div>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 32px;">
<div style="height:1px;background:#e2e8f0;margin-bottom:20px;"></div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="color:#94a3b8;font-size:12px;line-height:1.6;"><strong style="color:#64748b;">NordSym AB</strong> · org.nr 559535-5768<br><a href="https://nordsym.com" style="color:#667eea;text-decoration:none;">nordsym.com</a></td>
<td align="right" style="color:#94a3b8;font-size:11px;">Signed MoU · ${new Date().getFullYear()}</td>
</tr></table>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

async function sendEmail(to, subject, mouHtml) {
  try {
    const response = await fetch(N8N_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "send",
        to,
        subject,
        message: mouHtml,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to send email to ${to}`);
      return false;
    }
    
    console.log(`MoU email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId, signatureDataUrl, signerName, signerTitle } = req.body;

    if (!customerId || !signatureDataUrl || !signerName || !signerTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`[MoU Sign] ${customerId} | Signer: ${signerName}`);

    const partnerEmail = partnerEmails[customerId];
    if (!partnerEmail) {
      return res.status(400).json({ error: 'Partner email not configured' });
    }

    // Get client IP
    const forwardedFor = req.headers['x-forwarded-for'];
    const signerIp = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    // Get MoU data
    const mou = MOU_FALLBACK_DATA[customerId];
    if (!mou) {
      return res.status(404).json({ error: 'MoU not found' });
    }

    // Save signature to Convex
    try {
      await fetch(`${CONVEX_URL}/api/mutation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: 'mous:sign',
          args: { 
            customerId, 
            customerName: mou.customerName,
            vertical: mou.vertical,
            signatureDataUrl, 
            signerName, 
            signerTitle, 
            signerIp,
            validHours: mou.validHours
          },
        }),
      });
    } catch (convexError) {
      console.error('Convex save failed (non-critical):', convexError);
      // Continue anyway - email is more important than DB save
    }

    // Generate signed MoU HTML
    const signedDate = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    const mouHtml = generateMouHtml({ 
      ...mou, 
      signedBy: signerName, 
      signerTitle 
    }, signatureDataUrl, signedDate);
    
    const emailSubject = `Signed MoU: NordSym X ${mou.customerName}`;

    // Send emails to both parties
    await Promise.all([
      sendEmail('gustav@nordsym.com', emailSubject, mouHtml),
      sendEmail(partnerEmail, emailSubject, mouHtml),
    ]);

    // Send notification to Gustav + Molle
    const notificationHtml = `<!doctype html>
<html><body style="font-family:sans-serif;padding:20px;background:#f1f5f9;">
<div style="max-width:500px;margin:0 auto;background:#fff;padding:24px;border-radius:12px;border-left:4px solid #667eea;">
<h2 style="margin:0 0 12px;color:#0a0c0f;font-size:18px;">🤝 New MoU Signed</h2>
<p style="margin:0 0 8px;color:#475569;font-size:14px;"><strong>${mou.customerName}</strong> signed by <strong>${signerName}</strong> (${signerTitle})</p>
<p style="margin:0 0 12px;color:#64748b;font-size:13px;">Vertical: ${mou.vertical}</p>
<p style="margin:0;color:#64748b;font-size:13px;">Signed: ${signedDate} | IP: ${signerIp}</p>
<p style="margin:16px 0 0;color:#64748b;font-size:13px;">Valid for ${mou.validHours} hours. Next: Discovery call & AEO audit.</p>
</div>
</body></html>`;

    await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        to: 'gustav@nordsym.com,molle@nordsym.com',
        subject: `[New MoU] ${mou.customerName} — ${signerName}`,
        message: notificationHtml,
      }),
    });

    return res.status(200).json({ 
      success: true,
      message: 'MoU signed successfully'
    });
  } catch (error) {
    console.error('MoU signing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
