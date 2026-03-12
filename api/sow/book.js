const BOOKING_WEBHOOK = process.env.SOW_BOOKING_WEBHOOK || 'https://nordsym.app.n8n.cloud/webhook/aeo-booking';
const EMAIL_WEBHOOK = process.env.SOW_EMAIL_WEBHOOK || 'https://nordsym.app.n8n.cloud/webhook/symbot-gmail';

function setCors(req, res) {
  const reqOrigin = req.headers.origin;
  const allowedOrigins = (process.env.SOW_ALLOWED_ORIGINS || 'https://nordsym.com,https://www.nordsym.com,https://nordsym-hemsida.vercel.app')
    .split(',').map((v) => v.trim()).filter(Boolean);
  if (!reqOrigin || allowedOrigins.includes(reqOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin || allowedOrigins[0] || '*');
  }
  res.setHeader('Vary', 'Origin');
}

function emailTemplate(data) {
  const safeAgenda = String(data.agenda || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dbe6f4;border-radius:14px;overflow:hidden;">
    <tr><td style="padding:20px 24px;background:#f0f4f8;border-bottom:1px solid #dbe6f4;"><strong style="font-size:20px;">NordSym X ${data.customerName}</strong><br><span style="color:#475569;">Google Meet booking request received</span></td></tr>
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 10px;">Hi ${data.signerName},</p>
      <p style="margin:0 0 14px;color:#334155;">We received your checkpoint meeting request. A Google Meet invite will be sent after confirmation.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#64748b;">Requested date</td><td style="padding:8px 0;text-align:right;font-weight:600;">${data.requestedDate}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Requested time</td><td style="padding:8px 0;text-align:right;font-weight:600;">${data.requestedTime} (${data.timezone})</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Contact</td><td style="padding:8px 0;text-align:right;font-weight:600;">${data.signerEmail}</td></tr>
      </table>
      <div style="margin-top:16px;padding:12px;border:1px solid #dbe6f4;border-radius:10px;background:#f8fbff;">
        <p style="margin:0 0 8px;font-weight:600;">Agenda</p>
        <p style="margin:0;color:#334155;line-height:1.45;">${safeAgenda}</p>
      </div>
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

    const bookingPayload = {
      name: body.signerName,
      email: body.signerEmail,
      date: body.requestedDate,
      time: body.requestedTime,
      meetingType: 'sow_checkpoint',
      meetingTitle: `NordSym X ${body.customerName} - Checkpoint`,
      source: 'nordsym_sow_flow',
      timezone: body.timezone || 'Europe/Stockholm',
      customerId: body.customerId,
      company: body.company || body.customerName,
      title: body.signerTitle || '',
      agenda: body.agenda,
      meetingPlatform: 'google_meet',
      createGoogleMeet: true,
      timestamp: new Date().toISOString(),
      demo: !!body.demo,
    };

    const bookingRes = await fetch(BOOKING_WEBHOOK, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bookingPayload),
    });
    if (!bookingRes.ok) return res.status(502).json({ error: 'Booking provider error' });

    const html = emailTemplate(body);
    await fetch(EMAIL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        to: body.signerEmail,
        subject: `Meeting Request Received: NordSym X ${body.customerName}`,
        message: html,
      }),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
