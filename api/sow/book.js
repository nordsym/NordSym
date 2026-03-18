const BOOKING_WEBHOOK = process.env.SOW_BOOKING_WEBHOOK || 'https://nordsym.app.n8n.cloud/webhook/symbot-calendar-v2';
const EMAIL_WEBHOOK = process.env.SOW_EMAIL_WEBHOOK || 'https://nordsym.app.n8n.cloud/webhook/symbot-gmail';
const CONVEX_URL = "https://agile-crane-840.convex.cloud";

function setCors(req, res) {
  const reqOrigin = req.headers.origin;
  const allowedOrigins = (process.env.SOW_ALLOWED_ORIGINS || 'https://nordsym.com,https://www.nordsym.com,https://nordsym-hemsida.vercel.app')
    .split(',').map((v) => v.trim()).filter(Boolean);
  if (!reqOrigin || allowedOrigins.includes(reqOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin || allowedOrigins[0] || '*');
  }
  res.setHeader('Vary', 'Origin');
}

// ─── Generate signed SoW HTML (for attachment) ─────────────────────────────────
function generateSowHtml(sow, signatureDataUrl, signedDate) {
  const sectionsHtml = (sow.sections || []).map(section => {
    let rows = '';
    if (section.content) {
      const text = section.content.filter(Boolean).join('<br>');
      rows = `<tr><td style="padding:12px 16px;">
        <p style="margin:0;color:#475569;font-size:13px;line-height:1.7;">${text}</p>
      </td></tr>`;
    }
    if (section.items) {
      rows = section.items.map(it => `<tr>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;width:40%;">${it.label}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px;color:#0f172a;">${it.value}</td>
      </tr>`).join('');
    }
    return `
<tr><td style="padding:20px 32px 0;">
  <p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;">${section.title}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;overflow:hidden;">
    ${rows}
  </table>
</td></tr>
<tr><td style="padding:16px 32px 0;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>`;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NordSym X ${sow.customerName} — Signed SoW</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f172a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.07);">
<tr><td style="background:#0a0c0f;padding:28px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td><span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-.3px;">NordSym</span><span style="font-size:22px;font-weight:300;color:#00d4ff;"> × ${sow.customerName}</span></td>
<td align="right"><span style="display:inline-block;background:rgba(0,212,255,.12);color:#00d4ff;border:1px solid rgba(0,212,255,.3);border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;">SIGNED SOW</span></td>
</tr></table>
<p style="margin:10px 0 0;color:#94a3b8;font-size:14px;line-height:1.6;">Scope of Work — signed ${signedDate}</p>
</td></tr>
<tr><td style="padding:24px 32px 0;">
<div style="background:#f0fdf4;border-left:4px solid #166534;border-radius:0 10px 10px 0;padding:14px 16px;">
<p style="margin:0;color:#166534;font-weight:700;font-size:14px;">✓ Scope of Work signed by ${sow.signedBy}</p>
</div>
</td></tr>
<tr><td style="padding:20px 32px 0;">
<p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;">Investment</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;overflow:hidden;">
<tr>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Monthly fee</td>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;font-size:16px;color:#0f172a;">$${sow.pricing.fixed}</td>
</tr>
<tr>
<td style="padding:12px 16px;color:#64748b;font-size:13px;">Billing</td>
<td style="padding:12px 16px;text-align:right;font-weight:600;font-size:13px;">Monthly via Stripe</td>
</tr>
</table>
</td></tr>
<tr><td style="padding:16px 32px 0;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>
${sectionsHtml}
<tr><td style="padding:20px 32px 0;">
<p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;">Signatures</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;overflow:hidden;">
<tr>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">NordSym AB</td>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px;font-style:italic;">Gustav Hemmingsson</td>
</tr>
<tr>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">${sow.customerName}</td>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px;">${sow.signedBy}${sow.signerTitle ? ', ' + sow.signerTitle : ''}</td>
</tr>
<tr>
<td style="padding:12px 16px;color:#64748b;font-size:13px;">Date</td>
<td style="padding:12px 16px;font-weight:600;font-size:13px;">${signedDate}</td>
</tr>
</table>
</td></tr>
<tr><td style="padding:24px 32px;">
<div style="height:1px;background:#e2e8f0;margin-bottom:20px;"></div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="color:#94a3b8;font-size:12px;line-height:1.6;"><strong style="color:#64748b;">NordSym AB</strong> · org.nr 559535-5768<br><a href="https://nordsym.com" style="color:#00d4ff;text-decoration:none;">nordsym.com</a></td>
<td align="right" style="color:#94a3b8;font-size:11px;">Signed Scope of Work · ${new Date().getFullYear()}</td>
</tr></table>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

// ─── Customer onboarding welcome email (sent to customer) ─────────────────────
function onboardingEmail(data) {
  const tz = (data.timezone || 'Europe/Stockholm').split('/').pop().replace(/_/g, ' ');
  const safeAgenda = String(data.agenda || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

  // Dynamic service scope from SoW section 4 items
  const serviceScope = Array.isArray(data.serviceScope) ? data.serviceScope : [];
  const serviceScopeHtml = serviceScope.length > 0
    ? serviceScope.map(item => {
        const label = String(item.label || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const value = String(item.value || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;background:#f8fafc;border-radius:10px;">
<tr><td style="padding:14px 16px;">
<p style="margin:0 0 4px;font-weight:600;font-size:14px;color:#0f172a;">${label}</p>
<p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">${value}</p>
</td></tr>
</table>`;
      }).join('')
    : '';

  return `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome to NordSym</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f172a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.07);">

<!-- Header -->
<tr><td style="background:#0a0c0f;padding:28px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td><span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-.3px;">NordSym</span><span style="font-size:22px;font-weight:300;color:#00d4ff;"> × ${data.customerName}</span></td>
<td align="right"><span style="display:inline-block;background:rgba(0,212,255,.12);color:#00d4ff;border:1px solid rgba(0,212,255,.3);border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;">AI PILOT</span></td>
</tr>
</table>
<p style="margin:10px 0 0;color:#94a3b8;font-size:14px;line-height:1.6;">Your AI pilot is live — our team is already working on your agent infrastructure.</p>
</td></tr>

<!-- Greeting -->
<tr><td style="padding:28px 32px 0;">
<p style="margin:0 0 8px;font-size:16px;font-weight:600;">Hi ${data.signerName},</p>
<p style="margin:0;color:#475569;font-size:14px;line-height:1.7;">
Welcome to NordSym. Your AI pilot is now active and we're building your agent infrastructure as you read this. A Week 1 checkpoint has been scheduled to review early results and align on next steps — a Google Meet invite is on its way to your inbox.
</p>
</td></tr>

<!-- Divider -->
<tr><td style="padding:24px 32px 0;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

<!-- Week 1 Checkpoint -->
<tr><td style="padding:20px 32px 0;">
<p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;">Week 1 Checkpoint</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;overflow:hidden;">
<tr>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Date</td>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:13px;">${data.requestedDate}</td>
</tr>
<tr>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Time</td>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:13px;">${data.requestedTime} <span style="color:#94a3b8;font-weight:400;">(${tz})</span></td>
</tr>
<tr>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Format</td>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:13px;">Google Meet</td>
</tr>
<tr>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Purpose</td>
<td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:13px;">Review Week 1 progress and early results</td>
</tr>
<tr>
<td style="padding:12px 16px;color:#64748b;font-size:13px;">Your NordSym contact</td>
<td style="padding:12px 16px;text-align:right;font-weight:600;font-size:13px;">molle@nordsym.com</td>
</tr>
</table>
</td></tr>

<!-- Agenda -->
<tr><td style="padding:16px 32px 0;">
<p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;">Checkpoint Agenda</p>
<div style="background:#f8fafc;border-left:3px solid #00d4ff;border-radius:0 10px 10px 0;padding:14px 16px;">
<p style="margin:0;color:#334155;font-size:13px;line-height:1.7;">${safeAgenda}</p>
</div>
</td></tr>

<!-- Divider -->
<tr><td style="padding:24px 32px 0;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

<!-- Your Service Scope (dynamic from SoW) -->
${serviceScopeHtml ? `<tr><td style="padding:20px 32px 0;">
<p style="margin:0 0 14px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;">Your Service Scope</p>
${serviceScopeHtml}
</td></tr>
<!-- Divider -->
<tr><td style="padding:24px 32px 0;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>` : ''}

<!-- What Happens This Week -->
<tr><td style="padding:20px 32px 0;">
<p style="margin:0 0 14px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;">What Happens This Week</p>

<!-- Step 1 -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;background:#f8fafc;border-radius:10px;">
<tr><td style="padding:14px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td style="min-width:28px;width:28px;height:28px;background:#00d4ff;border-radius:4px;text-align:center;vertical-align:middle;font-weight:700;font-size:13px;color:#0a0c0f;">1</td>
<td style="padding-left:12px;">
<p style="margin:0;font-weight:600;font-size:14px;">We build your agent infrastructure</p>
<p style="margin:4px 0 0;color:#64748b;font-size:13px;">Our team is already configuring and deploying the agents defined in your service scope. No action needed from you — we'll reach out if we need anything.</p>
</td>
</tr>
</table>
</td></tr>
</table>

<!-- Step 2 -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;background:#f8fafc;border-radius:10px;">
<tr><td style="padding:14px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td style="min-width:28px;width:28px;height:28px;background:#e2e8f0;border-radius:4px;text-align:center;vertical-align:middle;font-weight:700;font-size:13px;color:#475569;">2</td>
<td style="padding-left:12px;">
<p style="margin:0;font-weight:600;font-size:14px;">Accept the Google Meet invite</p>
<p style="margin:4px 0 0;color:#64748b;font-size:13px;">A calendar invite will arrive at <strong>${data.signerEmail}</strong> shortly. Accept it to lock in your Week 1 checkpoint slot.</p>
</td>
</tr>
</table>
</td></tr>
</table>

<!-- Step 3 -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;background:#f8fafc;border-radius:10px;">
<tr><td style="padding:14px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td style="min-width:28px;width:28px;height:28px;background:#e2e8f0;border-radius:4px;text-align:center;vertical-align:middle;font-weight:700;font-size:13px;color:#475569;">3</td>
<td style="padding-left:12px;">
<p style="margin:0;font-weight:600;font-size:14px;">Think about your top priorities</p>
<p style="margin:4px 0 0;color:#64748b;font-size:13px;">What's the single most valuable thing AI agents can do for ${data.customerName} right now? Have an answer ready for the checkpoint — we'll use it to fine-tune the pilot.</p>
</td>
</tr>
</table>
</td></tr>
</table>

<!-- Step 4 -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;">
<tr><td style="padding:14px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0">
<tr>
<td style="min-width:28px;width:28px;height:28px;background:#e2e8f0;border-radius:4px;text-align:center;vertical-align:middle;font-weight:700;font-size:13px;color:#475569;">4</td>
<td style="padding-left:12px;">
<p style="margin:0;font-weight:600;font-size:14px;">Checkpoint: review results together</p>
<p style="margin:4px 0 0;color:#64748b;font-size:13px;">At the checkpoint we'll walk through what's been built, review early results, and decide together whether to continue, adjust scope, or expand. Come with feedback — it makes everything better.</p>
</td>
</tr>
</table>
</td></tr>
</table>
</td></tr>

<!-- Divider -->
<tr><td style="padding:24px 32px 0;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

<!-- Tips -->
<tr><td style="padding:20px 32px 0;">
<p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;">Tips for Best Results</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;">
<tr><td style="padding:16px;">
<p style="margin:0 0 8px;color:#334155;font-size:13px;line-height:1.7;">💡 <strong>Start focused.</strong> One well-defined agent task delivers more value than five half-baked ones. We'll nail the first, then expand.</p>
<p style="margin:0 0 8px;color:#334155;font-size:13px;line-height:1.7;">📊 <strong>Share real data.</strong> The more context agents have about your business, the better they perform. Don't worry about polish — raw is better than nothing.</p>
<p style="margin:0 0 8px;color:#334155;font-size:13px;line-height:1.7;">🔄 <strong>Feedback is fuel.</strong> Agents improve fast when you tell us what's working and what's not. Plan to check outputs in the first few days.</p>
<p style="margin:0;color:#334155;font-size:13px;line-height:1.7;">🎯 <strong>Think in workflows, not one-offs.</strong> The best ROI comes from recurring tasks — things you or your team do every week that agents can handle instead.</p>
</td></tr>
</table>
</td></tr>

<!-- CTA -->
<tr><td style="padding:24px 32px 0;text-align:center;">
<a href="mailto:molle@nordsym.com" style="display:inline-block;background:#00d4ff;color:#0a0c0f;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:.02em;">Questions? Reach out to Molle</a>
<p style="margin:10px 0 0;color:#94a3b8;font-size:12px;">We respond same day.</p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 32px;">
<div style="height:1px;background:#e2e8f0;margin-bottom:20px;"></div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="color:#94a3b8;font-size:12px;line-height:1.6;">
<strong style="color:#64748b;">NordSym AB</strong> · org.nr 559535-5768<br>
<a href="https://nordsym.com" style="color:#00d4ff;text-decoration:none;">nordsym.com</a>
</td>
<td align="right" style="color:#94a3b8;font-size:11px;">AI Pilot Onboarding · ${new Date().getFullYear()}</td>
</tr>
</table>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

// ─── Internal booking notification (sent to Molle + Gustav) ───────────────────
function internalNotificationEmail(data) {
  const tz = (data.timezone || 'Europe/Stockholm').split('/').pop().replace(/_/g, ' ');
  const safeAgenda = String(data.agenda || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  return `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New Booking</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f172a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.07);">
<tr><td style="background:#0a0c0f;padding:22px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td><span style="font-size:18px;font-weight:700;color:#ffffff;">NordSym</span><span style="font-size:18px;font-weight:300;color:#00d4ff;"> Internal</span></td>
<td align="right"><span style="display:inline-block;background:rgba(255,140,0,.15);color:#FF8C00;border:1px solid rgba(255,140,0,.3);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;letter-spacing:.06em;">NEW BOOKING</span></td>
</tr>
</table>
</td></tr>
<tr><td style="padding:22px 28px 0;">
<p style="margin:0 0 4px;font-size:15px;font-weight:600;">Week 1 Checkpoint booked 🎉</p>
<p style="margin:0;color:#64748b;font-size:13px;">A customer just completed the onboarding flow and booked their checkpoint meeting.</p>
</td></tr>
<tr><td style="padding:16px 28px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;overflow:hidden;">
<tr>
<td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Customer</td>
<td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:13px;">${data.customerName}</td>
</tr>
<tr>
<td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Contact</td>
<td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:13px;">${data.signerName} · ${data.signerTitle || '—'}</td>
</tr>
<tr>
<td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Email</td>
<td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:13px;"><a href="mailto:${data.signerEmail}" style="color:#00d4ff;text-decoration:none;">${data.signerEmail}</a></td>
</tr>
<tr>
<td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;">Date</td>
<td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;font-size:13px;">${data.requestedDate}</td>
</tr>
<tr>
<td style="padding:10px 14px;color:#64748b;font-size:13px;">Time</td>
<td style="padding:10px 14px;text-align:right;font-weight:600;font-size:13px;">${data.requestedTime} <span style="color:#94a3b8;font-weight:400;">(${tz})</span></td>
</tr>
</table>
</td></tr>
<tr><td style="padding:16px 28px 0;">
<p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;">Their Agenda</p>
<div style="background:#f8fafc;border-left:3px solid #00d4ff;border-radius:0 8px 8px 0;padding:12px 14px;">
<p style="margin:0;color:#334155;font-size:13px;line-height:1.7;">${safeAgenda}</p>
</div>
</td></tr>
<tr><td style="padding:20px 28px;">
<div style="height:1px;background:#e2e8f0;margin-bottom:16px;"></div>
<p style="margin:0;color:#94a3b8;font-size:11px;text-align:center;">NordSym AB · Automated booking notification · ${new Date().getFullYear()}</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

export default async function handler(req, res) {
  setCors(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const required = ['customerId', 'customerName', 'signerName', 'signerEmail', 'requestedDate', 'requestedTime', 'agenda'];
    for (const k of required) {
      if (!String(body[k] || '').trim()) return res.status(400).json({ error: `${k} is required` });
    }

    // Build start/end as RFC3339 with explicit timezone offset (no UTC conversion)
    // This is critical: new Date(...).toISOString() converts to UTC on Vercel server,
    // causing the calendar to show a different time than what the customer selected.
    const tz = body.timezone || 'Europe/Stockholm';
    const [hour, minute] = (body.requestedTime || '11:00').split(':').map(Number);
    const localDateStr = `${body.requestedDate}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00`;

    // Calculate the UTC offset for the given timezone at the given date/time
    // using Intl.DateTimeFormat — works in Node.js without any extra libs
    function getOffsetString(dateStr, timeZone) {
      const baseDate = new Date(dateStr + 'Z');
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
      const parts = Object.fromEntries(formatter.formatToParts(baseDate).map(p => [p.type, p.value]));
      const tzDate = new Date(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}Z`);
      // Offset = tzDate - baseDate: positive for UTC+ zones (e.g. Stockholm = +01:00)
      const offsetMs = tzDate.getTime() - baseDate.getTime();
      const offsetMins = Math.round(offsetMs / 60000);
      const sign = offsetMins >= 0 ? '+' : '-';
      const absMin = Math.abs(offsetMins);
      const oh = String(Math.floor(absMin / 60)).padStart(2, '0');
      const om = String(absMin % 60).padStart(2, '0');
      return `${sign}${oh}:${om}`;
    }

    const offsetStr = getOffsetString(localDateStr, tz);
    const startRFC = `${localDateStr}${offsetStr}`;
    const endHour = hour + 1;
    const endDateStr = endHour < 24
      ? `${body.requestedDate}T${String(endHour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00`
      : `${body.requestedDate}T23:59:00`;
    const endRFC = `${endDateStr}${offsetStr}`;

    const bookingPayload = {
      summary: `NordSym X ${body.customerName} — Week 1 Checkpoint`,
      start: startRFC,
      end: endRFC,
      attendees: `molle@nordsym.com,${body.signerEmail}`,
      description: `📋 WEEK 1 CHECKPOINT — NordSym × ${body.customerName}\n\n1️⃣ Review Week 1 progress & early results (15 min)\n2️⃣ Agent performance & infrastructure status (10 min)\n3️⃣ Feedback & priority adjustments (10 min)\n4️⃣ Decision: continue, revise, or expand (5 min)\n\n────────────────────\n👤 ${body.signerName}${body.signerTitle ? ' · ' + body.signerTitle : ''}\n🤝 Molle (NordSym)\n📍 Google Meet\n────────────────────\n\n${body.agenda ? '📝 Additional context from ' + body.signerName + ':\n' + body.agenda : ''}`,
      location: 'Google Meet',
    };

    const bookingRes = await fetch(BOOKING_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload),
    });
    if (!bookingRes.ok) return res.status(502).json({ error: 'Booking provider error' });

    // Query Convex for signed SoW to attach
    let signedSowAttachment = null;
    try {
      const sowQuery = await fetch(`${CONVEX_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: 'sows:getByCustomerId',
          args: { customerId: body.customerId },
        }),
      });
      const sowResult = await sowQuery.json();
      const sowData = sowResult.value;
      
      if (sowData && sowData.status === 'signed') {
        // Generate signed SoW HTML
        const signedDate = new Date(sowData.signedAt).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
        const signedSowHtml = generateSowHtml(sowData, sowData.signature, signedDate);
        const filename = `NordSym_SoW_${body.customerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
        signedSowAttachment = {
          data: Buffer.from(signedSowHtml).toString('base64'),
          filename
        };
      }
    } catch (err) {
      console.error('Failed to fetch signed SoW for attachment:', err);
      // Continue without attachment if query fails
    }

    // Email 1: Welcome email → customer (with signed SoW attachment)
    const customerHtml = onboardingEmail(body);
    const customerEmailPayload = {
      action: 'send',
      to: body.signerEmail,
      subject: `Welcome to NordSym — Your AI Pilot Starts Now`,
      message: customerHtml,
    };
    if (signedSowAttachment) {
      customerEmailPayload.attachments = [signedSowAttachment];
    }
    await fetch(EMAIL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerEmailPayload),
    });

    // Email 2a: Internal booking notification → Molle + Gustav
    const internalHtml = internalNotificationEmail(body);
    await fetch(EMAIL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        to: 'molle@nordsym.com,gustav@nordsym.com',
        subject: `[Booking] ${body.customerName} — ${body.requestedDate} ${body.requestedTime}`,
        message: internalHtml,
      }),
    });

    // Email 2b: Welcome email copy → Molle + Gustav (FYI copy with signed SoW attachment)
    const teamWelcomeHtml = onboardingEmail(body);
    const teamWelcomePayload = {
      action: 'send',
      to: 'molle@nordsym.com,gustav@nordsym.com',
      subject: `[Welcome Email] ${body.customerName} — ${body.signerName}`,
      message: teamWelcomeHtml,
    };
    if (signedSowAttachment) {
      teamWelcomePayload.attachments = [signedSowAttachment];
    }
    await fetch(EMAIL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamWelcomePayload),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
