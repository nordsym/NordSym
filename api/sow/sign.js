// NordSym SoW Signing API
// Handles signature submission and email delivery

const CONVEX_URL = "https://laudable-ladybug-188.convex.cloud";
const N8N_WEBHOOK = "https://nordsym.app.n8n.cloud/webhook/symbot-smtp-v2";

// Partner email configuration
const partnerEmails = {
  nakama: "beidos@nakamaisland.io",
  excom: "peter@excom.ai",
  hotclean: "hasse@hotclean.se",
  upwork: "fredrik@[NEEDS_EMAIL]" // TODO: Add Fredrik's email
};

// ─── SoW fallback data — full mirror of sow-data.js so signing works before Convex is seeded ───
const SOW_FALLBACK_DATA = {
  excom: {
    customerName: "Excom", customerRep: "Peter Larnholt",
    vertical: "Go-to-Market for Handled",
    pricing: { fixed: 500, nectar: "Usage-based infrastructure costs (reviewed at Week 1 checkpoint based on actual usage)" },
    paymentLink: "https://buy.stripe.com/5kQdRbgIQ8uC5GI2GQcMM0r",
    sections: [
      { title: "1. Parties", content: ["<strong>NordSym AB</strong> (org.nr 559535-5768), represented by Gustav Hemmingsson, CEO", "<strong>Excom</strong>, represented by Peter Larnholt"] },
      { title: "2. Effective Date", content: ["This Scope of Work becomes effective on <strong>Monday, March 16th, 2026</strong> upon signing by both parties."] },
      { title: "3. Purpose & Scope", content: ["This Scope of Work establishes the framework for NordSym to provide AI agent execution services to Excom, specifically focused on:", "• Managed swarm orchestration for Handled GTM", "• Headless Telegram execution layer", "• Swarm oversight and real-time optimization", "• Infrastructure monitoring and performance optimization"] },
      { title: "4. Selected Service Scope", items: [{ label: "APIClaw Execution Infrastructure", value: "Enterprise-grade agent orchestration and deployment infrastructure" }, { label: "Managed Swarm Orchestration", value: "Handled-specific agents for onboarding, support, and engagement" }, { label: "Headless Telegram Execution Layer", value: "Zero-UI backend communication and task distribution" }, { label: "Swarm Oversight & Optimization", value: "Real-time monitoring, performance tuning, and infrastructure management" }] },
      { title: "5. Investment", content: ["• <strong>Monthly Fee:</strong> $500/month", "• All pricing in USD, billed monthly via Stripe", "• Infrastructure execution costs billed separately based on actual API usage"] },
      { title: "6. Week 1 Pilot Checkpoint", content: ["• <strong>Checkpoint Date:</strong> 7 days after project kickoff", "• <strong>Purpose:</strong> Evaluate pilot performance and alignment with objectives", "• <strong>Outcomes:</strong>", "  - <strong>Continue:</strong> Approve production tier and continue operations", "  - <strong>Revise:</strong> Adjust scope or approach and continue", "  - <strong>Terminate:</strong> End pilot and settle outstanding infrastructure costs"] },
      { title: "8. Additional Development", content: ["Services beyond SoW (custom integrations, new features, advanced customization) can be commissioned through:", "• <a href='https://nordsym.com/#system' target='_blank'>nordsym.com/#system</a>", "• Quoted separately based on scope and complexity"] },
      { title: "9. VAT & Tax", content: ["<strong>VAT Registration:</strong> NordSym AB is registered for VAT in Sweden (SE559535576801).", "• <strong>Swedish clients:</strong> Swedish VAT (25%) applies and will be added to invoices", "• <strong>EU business clients:</strong> Reverse charge mechanism applies - Client accounts for VAT in their jurisdiction. Client's valid VAT number must be provided.", "• <strong>Non-EU clients:</strong> Services are outside the scope of Swedish VAT", "• <strong>Stripe Checkout:</strong> VAT is collected automatically based on your billing country and business status at checkout", "• For VAT questions or to provide your VAT number, contact: <a href='mailto:gustav@nordsym.com'>gustav@nordsym.com</a>"] },
      { title: "10. Standard Terms of Execution", content: ["<strong>AI Disclaimer:</strong> NordSym provides AI agent orchestration infrastructure. Output accuracy and decision quality depend on agent configuration, training data, and execution context. Client is responsible for validating agent output before business-critical use.", "", "<strong>Data Sovereignty:</strong> All client data processed by agents remains client property. NordSym does not claim ownership of execution inputs, outputs, or results. Client data is not used for model training without explicit consent.", "", "<strong>Usage Limits:</strong> Infrastructure allocation is defined per pricing tier. NordSym reserves the right to throttle execution if usage significantly exceeds forecasted allocation without prior notice.", "", "<strong>Intellectual Property:</strong> Custom agent configurations, prompts, and orchestration logic developed specifically for Client remain Client IP. Platform infrastructure, core agent capabilities, and foundational protocols remain NordSym IP.", "", "<strong>Liability Limitation:</strong> NordSym's total liability under this agreement shall not exceed the total fees paid by Client in the 12 months preceding the claim. NordSym is not liable for indirect, consequential, or punitive damages arising from agent execution."] },
      { title: "11. Duration & Termination", content: ["• <strong>Binding Period:</strong> Month-to-month following Week 1 Checkpoint", "• <strong>Notice Period:</strong> 30 days written notice", "• Active agent deployments and access continue through notice period", "• Outstanding infrastructure charges settled upon termination"] },
      { title: "12. Confidentiality", content: ["Both parties agree to maintain confidentiality of:", "• Business strategies and roadmaps", "• Technical implementations and custom agent configurations", "• Customer data and usage patterns", "• Pricing and commercial terms"] }
    ]
  },
  nakama: {
    customerName: "Nakama", customerRep: "Beidos",
    vertical: "Nakama Interface for Reselling Services",
    pricing: { fixed: 500, nectar: "Usage-based infrastructure costs (reviewed at Week 1 checkpoint based on actual usage)" },
    paymentLink: "https://buy.stripe.com/5kQ6oJ9goeT01qsbdmcMM0w",
    sections: [
      { title: "1. Parties", content: ["<strong>NordSym AB</strong> (org.nr 559535-5768), represented by Gustav Hemmingsson, CEO", "<strong>Nakama</strong>, represented by Beidos"] },
      { title: "2. Effective Date", content: ["This Scope of Work becomes effective on <strong>Monday, March 16th, 2026</strong> upon signing by both parties."] },
      { title: "3. Purpose & Scope", content: ["This Scope of Work establishes the framework for NordSym to provide AI agent execution services to Nakama, specifically focused on:", "• Managed swarm orchestration for white-label reselling", "• Headless Telegram execution layer", "• Swarm oversight and real-time optimization", "• Revenue-sharing framework for infrastructure resale"] },
      { title: "4. Selected Service Scope", items: [{ label: "APIClaw Execution Infrastructure", value: "Enterprise-grade orchestration with Nakama white-label branding" }, { label: "Managed Swarm Orchestration", value: "Multi-tenant agent deployment for Nakama end customers" }, { label: "Headless Telegram Execution Layer", value: "Zero-UI backend communication under Nakama brand" }, { label: "Swarm Oversight & Optimization", value: "Real-time monitoring, partner enablement, and infrastructure management" }] },
      { title: "5. Investment", content: ["• <strong>Monthly Fee:</strong> $300/month", "• All pricing in USD, billed monthly via Stripe", "• Infrastructure execution costs billed separately based on actual API usage"] },
      { title: "6. Week 1 Pilot Checkpoint", content: ["• <strong>Checkpoint Date:</strong> 7 days after project kickoff", "• <strong>Purpose:</strong> Evaluate pilot performance and alignment with objectives", "• <strong>Outcomes:</strong>", "  - <strong>Continue:</strong> Approve production tier and continue operations", "  - <strong>Revise:</strong> Adjust scope or approach and continue", "  - <strong>Terminate:</strong> End pilot and settle outstanding infrastructure costs"] },
      { title: "7. Revenue Share", content: ["• Monthly reconciliation via Partner Revenue Agreement", "• Revenue share terms documented separately in partner agreement", "• Transparent reporting provided monthly"] },
      { title: "8. Additional Development", content: ["Services beyond SoW (custom integrations, new features, advanced customization) can be commissioned through:", "• <a href='https://nordsym.com/#system' target='_blank'>nordsym.com/#system</a>", "• Quoted separately based on scope and complexity"] },
      { title: "9. VAT & Tax", content: ["<strong>VAT Registration:</strong> NordSym AB is registered for VAT in Sweden (SE559535576801).", "• <strong>Swedish clients:</strong> Swedish VAT (25%) applies and will be added to invoices", "• <strong>EU business clients:</strong> Reverse charge mechanism applies - Client accounts for VAT in their jurisdiction. Client's valid VAT number must be provided.", "• <strong>Non-EU clients:</strong> Services are outside the scope of Swedish VAT", "• <strong>Stripe Checkout:</strong> VAT is collected automatically based on your billing country and business status at checkout", "• For VAT questions or to provide your VAT number, contact: <a href='mailto:gustav@nordsym.com'>gustav@nordsym.com</a>"] },
      { title: "10. Standard Terms of Execution", content: ["<strong>AI Disclaimer:</strong> NordSym provides AI agent orchestration infrastructure. Output accuracy and decision quality depend on agent configuration, training data, and execution context. Client is responsible for validating agent output before business-critical use.", "", "<strong>Data Sovereignty:</strong> All client data processed by agents remains client property. NordSym does not claim ownership of execution inputs, outputs, or results. Client data is not used for model training without explicit consent.", "", "<strong>Usage Limits:</strong> Infrastructure allocation is defined per pricing tier. NordSym reserves the right to throttle execution if usage significantly exceeds forecasted allocation without prior notice.", "", "<strong>Intellectual Property:</strong> Custom agent configurations, prompts, and orchestration logic developed specifically for Client remain Client IP. Platform infrastructure, core agent capabilities, and foundational protocols remain NordSym IP.", "", "<strong>Liability Limitation:</strong> NordSym's total liability under this agreement shall not exceed the total fees paid by Client in the 12 months preceding the claim. NordSym is not liable for indirect, consequential, or punitive damages arising from agent execution."] },
      { title: "11. Duration & Termination", content: ["• <strong>Binding Period:</strong> Month-to-month following Week 1 Checkpoint", "• <strong>Notice Period:</strong> 30 days written notice", "• Active agent deployments and access continue through notice period", "• Outstanding infrastructure charges settled upon termination"] },
      { title: "12. Confidentiality", content: ["Both parties agree to maintain confidentiality of:", "• Business strategies and roadmaps", "• Technical implementations and custom agent configurations", "• Customer data and usage patterns", "• Pricing and commercial terms"] }
    ]
  },
  hotclen: {
    customerName: "HotClen", customerRep: "Hasse Ali",
    vertical: "AI Marketing & Customer Engagement",
    pricing: { fixed: 100, nectar: "Usage-based infrastructure costs (reviewed at Week 1 checkpoint based on actual usage)" },
    paymentLink: "https://buy.stripe.com/00wfZj9go4emede3KUcMM0q",
    sections: [
      { title: "1. Parties", content: ["<strong>NordSym AB</strong> (org.nr 559535-5768), represented by Gustav Hemmingsson, CEO", "<strong>HotClen</strong>, represented by Hasse Ali"] },
      { title: "2. Effective Date", content: ["This Scope of Work becomes effective on <strong>Monday, March 16th, 2026</strong> upon signing by both parties."] },
      { title: "3. Purpose & Scope", content: ["This Scope of Work establishes the framework for NordSym to provide AI agent execution services to HotClen, specifically focused on:", "• AI-powered marketing automation", "• Customer outreach and lead generation agents", "• Multi-channel engagement (email, SMS, WhatsApp)", "• Customer support and booking automation"] },
      { title: "4. Selected Service Scope", items: [{ label: "Business Platform Access", value: "Full access to agent marketplace and execution infrastructure" }, { label: "Marketing Agents", value: "Custom agents for email campaigns, outreach, and customer engagement" }, { label: "Booking & Support Automation", value: "AI agents handling inquiries, booking management, and coordination" }, { label: "Campaign Optimization", value: "Performance monitoring and continuous agent tuning" }] },
      { title: "5. Investment", content: ["• <strong>Monthly Fee:</strong> $100/month", "• All pricing in USD, billed monthly via Stripe", "• Infrastructure execution costs billed separately based on actual API usage"] },
      { title: "6. Week 1 Pilot Checkpoint", content: ["• <strong>Checkpoint Date:</strong> 7 days after project kickoff", "• <strong>Purpose:</strong> Evaluate pilot performance and alignment with objectives", "• <strong>Outcomes:</strong>", "  - <strong>Continue:</strong> Approve production tier and continue operations", "  - <strong>Revise:</strong> Adjust scope or approach and continue", "  - <strong>Terminate:</strong> End pilot and settle outstanding infrastructure costs"] },
      { title: "8. Additional Development", content: ["Services beyond SoW (custom integrations, new features, advanced customization) can be commissioned through:", "• <a href='https://nordsym.com/#system' target='_blank'>nordsym.com/#system</a>", "• Quoted separately based on scope and complexity"] },
      { title: "9. VAT & Tax", content: ["<strong>VAT Registration:</strong> NordSym AB is registered for VAT in Sweden (SE559535576801).", "• <strong>Swedish clients:</strong> Swedish VAT (25%) applies and will be added to invoices", "• <strong>EU business clients:</strong> Reverse charge mechanism applies - Client accounts for VAT in their jurisdiction. Client's valid VAT number must be provided.", "• <strong>Non-EU clients:</strong> Services are outside the scope of Swedish VAT", "• <strong>Stripe Checkout:</strong> VAT is collected automatically based on your billing country and business status at checkout", "• For VAT questions or to provide your VAT number, contact: <a href='mailto:gustav@nordsym.com'>gustav@nordsym.com</a>"] },
      { title: "10. Standard Terms of Execution", content: ["<strong>AI Disclaimer:</strong> NordSym provides AI agent orchestration infrastructure. Output accuracy and decision quality depend on agent configuration, training data, and execution context. Client is responsible for validating agent output before business-critical use.", "", "<strong>Data Sovereignty:</strong> All client data processed by agents remains client property. NordSym does not claim ownership of execution inputs, outputs, or results. Client data is not used for model training without explicit consent.", "", "<strong>Usage Limits:</strong> Infrastructure allocation is defined per pricing tier. NordSym reserves the right to throttle execution if usage significantly exceeds forecasted allocation without prior notice.", "", "<strong>Intellectual Property:</strong> Custom agent configurations, prompts, and orchestration logic developed specifically for Client remain Client IP. Platform infrastructure, core agent capabilities, and foundational protocols remain NordSym IP.", "", "<strong>Liability Limitation:</strong> NordSym's total liability under this agreement shall not exceed the total fees paid by Client in the 12 months preceding the claim. NordSym is not liable for indirect, consequential, or punitive damages arising from agent execution."] },
      { title: "11. Duration & Termination", content: ["• <strong>Binding Period:</strong> Month-to-month following Week 1 Checkpoint", "• <strong>Notice Period:</strong> 30 days written notice", "• Active agent deployments and access continue through notice period", "• Outstanding infrastructure charges settled upon termination"] },
      { title: "12. Confidentiality", content: ["Both parties agree to maintain confidentiality of:", "• Business strategies and roadmaps", "• Technical implementations and custom agent configurations", "• Customer data and usage patterns", "• Pricing and commercial terms"] }
    ]
  },
  "lazy-genius": {
    customerName: "Lazy Genius", customerRep: "Fredrik",
    vertical: "Upwork Lead Generation & Platform Automation",
    pricing: { fixed: 100, nectar: "Usage-based infrastructure costs (reviewed at Week 1 checkpoint based on actual usage)" },
    paymentLink: "https://buy.stripe.com/6oU5kFcsA6mu0modlucMM0v",
    sections: [
      { title: "1. Parties", content: ["<strong>NordSym AB</strong> (org.nr 559535-5768), represented by Gustav Hemmingsson, CEO", "<strong>Lazy Genius</strong>, represented by Fredrik"] },
      { title: "2. Effective Date", content: ["This Scope of Work becomes effective on <strong>Monday, March 16th, 2026</strong> upon signing by both parties."] },
      { title: "3. Purpose & Scope", content: ["This Scope of Work establishes the framework for NordSym to provide AI agent execution services for Lazy Genius, specifically focused on:", "• Automated job discovery and proposal generation", "• Platform integration for workflow optimization", "• AI-powered client communication and project management", "• Multi-freelancer orchestration"] },
      { title: "4. Selected Service Scope", items: [{ label: "Business Platform Access", value: "Full access to agent marketplace and execution infrastructure" }, { label: "Automation Agents", value: "Custom agents for job scanning, proposal generation, and communication" }, { label: "Workflow Integration", value: "Agent orchestration for freelance workflow management" }, { label: "Agent Optimization", value: "Continuous proposal refinement and workflow iteration" }] },
      { title: "5. Investment", content: ["• <strong>Monthly Fee:</strong> $100/month", "• All pricing in USD, billed monthly via Stripe", "• Infrastructure execution costs billed separately based on actual API usage"] },
      { title: "6. Week 1 Pilot Checkpoint", content: ["• <strong>Checkpoint Date:</strong> 7 days after project kickoff", "• <strong>Purpose:</strong> Evaluate pilot performance and alignment with objectives", "• <strong>Outcomes:</strong>", "  - <strong>Continue:</strong> Approve production tier and continue operations", "  - <strong>Revise:</strong> Adjust scope or approach and continue", "  - <strong>Terminate:</strong> End pilot and settle outstanding infrastructure costs"] },
      { title: "7. Revenue Share", content: ["• Monthly reconciliation via Partner Revenue Agreement", "• Revenue share terms documented separately in partner agreement", "• Transparent reporting provided monthly"] },
      { title: "8. Additional Development", content: ["Services beyond SoW (custom integrations, new features, advanced customization) can be commissioned through:", "• <a href='https://nordsym.com/#system' target='_blank'>nordsym.com/#system</a>", "• Quoted separately based on scope and complexity"] },
      { title: "9. VAT & Tax", content: ["<strong>VAT Registration:</strong> NordSym AB is registered for VAT in Sweden (SE559535576801).", "• <strong>Swedish clients:</strong> Swedish VAT (25%) applies and will be added to invoices", "• <strong>EU business clients:</strong> Reverse charge mechanism applies - Client accounts for VAT in their jurisdiction. Client's valid VAT number must be provided.", "• <strong>Non-EU clients:</strong> Services are outside the scope of Swedish VAT", "• <strong>Stripe Checkout:</strong> VAT is collected automatically based on your billing country and business status at checkout", "• For VAT questions or to provide your VAT number, contact: <a href='mailto:gustav@nordsym.com'>gustav@nordsym.com</a>"] },
      { title: "10. Standard Terms of Execution", content: ["<strong>AI Disclaimer:</strong> NordSym provides AI agent orchestration infrastructure. Output accuracy and decision quality depend on agent configuration, training data, and execution context. Client is responsible for validating agent output before business-critical use.", "", "<strong>Data Sovereignty:</strong> All client data processed by agents remains client property. NordSym does not claim ownership of execution inputs, outputs, or results. Client data is not used for model training without explicit consent.", "", "<strong>Usage Limits:</strong> Infrastructure allocation is defined per pricing tier. NordSym reserves the right to throttle execution if usage significantly exceeds forecasted allocation without prior notice.", "", "<strong>Intellectual Property:</strong> Custom agent configurations, prompts, and orchestration logic developed specifically for Client remain Client IP. Platform infrastructure, core agent capabilities, and foundational protocols remain NordSym IP.", "", "<strong>Liability Limitation:</strong> NordSym's total liability under this agreement shall not exceed the total fees paid by Client in the 12 months preceding the claim. NordSym is not liable for indirect, consequential, or punitive damages arising from agent execution."] },
      { title: "11. Duration & Termination", content: ["• <strong>Binding Period:</strong> Month-to-month following Week 1 Checkpoint", "• <strong>Notice Period:</strong> 30 days written notice", "• Active agent deployments and access continue through notice period", "• Outstanding infrastructure charges settled upon termination"] },
      { title: "12. Confidentiality", content: ["Both parties agree to maintain confidentiality of:", "• Business strategies and roadmaps", "• Technical implementations and custom agent configurations", "• Customer data and usage patterns", "• Pricing and commercial terms"] },
      { title: "13. Partner Collaboration Terms", content: ["Both parties agree to keep client ownership, engagement, and growth efforts transparent:", "• Each party retains ownership of the clients they originate. Lazy Genius owns the relationships it brings to this collaboration and NordSym owns the relationships it sources.", "• Nothing in this agreement transfers ownership of a client relationship from one party to the other.", "• Neither party will bypass or directly solicit the other party's clients introduced during the collaboration without mutual written consent.", "• Lazy Genius may package or present solutions built on NordSym infrastructure under its own brand while optionally referencing NordSym as a technical partner.", "• Lazy Genius remains free to sell consulting services, automation solutions, work via freelance platforms (including Upwork), and advise independently; NordSym remains free to operate the platform with other partners and clients.", "• Lazy Genius leads client relationships, consulting, scoping, and communication while NordSym supplies infrastructure, agent orchestration, and technical delivery support.", "• Client-specific implementations stay tied to the respective engagement while NordSym retains ownership of its platform, infrastructure, and core technologies.", "• Both parties commit to collaborate in good faith to expand joint opportunities that combine Lazy Genius' business development with NordSym's technical infrastructure."] },
      { title: "14. Client Continuity", content: ["If this collaboration ends for any reason, the parties agree to cooperate in good faith to preserve continuity of service for any active Lazy Genius clients.", "Lazy Genius retains the right to maintain those client relationships and may transition work to alternate infrastructure when required, always respecting NordSym's intellectual property and proprietary technologies.", "NordSym will reasonably support transition efforts (knowledge transfer, ongoing agent context, infrastructure insights) while preserving its IP and platform controls."] }
    ]
  }
};

function generateSowHtml(sow, signatureDataUrl, signedDate) {
  // Render sections — same pattern as book.js welcome email
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

<!-- Header -->
<tr><td style="background:#0a0c0f;padding:28px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td><span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-.3px;">NordSym</span><span style="font-size:22px;font-weight:300;color:#00d4ff;"> × ${sow.customerName}</span></td>
<td align="right"><span style="display:inline-block;background:rgba(0,212,255,.12);color:#00d4ff;border:1px solid rgba(0,212,255,.3);border-radius:20px;padding:4px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;">SIGNED SOW</span></td>
</tr></table>
<p style="margin:10px 0 0;color:#94a3b8;font-size:14px;line-height:1.6;">Scope of Work — signed ${signedDate}</p>
</td></tr>

<!-- Signed by -->
<tr><td style="padding:24px 32px 0;">
<div style="background:#f0fdf4;border-left:4px solid #166534;border-radius:0 10px 10px 0;padding:14px 16px;">
<p style="margin:0;color:#166534;font-weight:700;font-size:14px;">✓ Scope of Work signed by ${sow.signedBy}</p>
</div>
</td></tr>

<!-- Investment -->
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

<!-- Signature block -->
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

<!-- Footer -->
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


async function sendEmailWithAttachment(to, subject, sow, signedDate, sowHtml, filename) {
  try {
    // Send full signed SoW as email body + base64-encoded HTML attachment
    const attachmentBase64 = Buffer.from(sowHtml).toString('base64');
    const response = await fetch(N8N_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        subject,
        message: sowHtml,
        attachment_base64: attachmentBase64,
        attachment_filename: filename,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to send email to ${to}`);
      return false;
    }
    
    console.log(`Email sent to ${to}`);
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

    const partnerEmail = partnerEmails[customerId];
    if (!partnerEmail || partnerEmail.includes('[NEEDS_EMAIL]')) {
      return res.status(400).json({ error: 'Partner email not configured' });
    }

    // Get client IP
    const forwardedFor = req.headers['x-forwarded-for'];
    const signerIp = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    // Get SoW from Convex
    const queryResponse = await fetch(`${CONVEX_URL}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'sows:getByCustomerId',
        args: { customerId },
      }),
    });

    const queryResult = await queryResponse.json();
    const convexSow = queryResult.value || null;
    const sow = convexSow || SOW_FALLBACK_DATA[customerId] || null;

    if (!sow) {
      return res.status(404).json({ error: 'SoW not found' });
    }

    // Sign the SoW in Convex (only if record exists there — skip if using fallback data)
    if (convexSow) {
      const signResponse = await fetch(`${CONVEX_URL}/api/mutation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: 'sows:sign',
          args: { customerId, signatureDataUrl, signerName, signerTitle, signerIp },
        }),
      });
      const signResult = await signResponse.json();
      if (signResult.status === 'error') {
        return res.status(500).json({ error: signResult.errorMessage || 'Failed to sign SoW' });
      }
    }

    // Generate signed SoW HTML
    const signedDate = new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    const sowHtml = generateSowHtml({ ...sow, signedBy: signerName, signerTitle }, signatureDataUrl, signedDate);
    
    const filename = `NordSym_SoW_${sow.customerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    const emailSubject = `Signed SoW: NordSym X ${sow.customerName}`;

    // Send emails to both parties
    await Promise.all([
      sendEmailWithAttachment('gustav@nordsym.com', emailSubject, { ...sow, signedBy: signerName, signerTitle }, signedDate, sowHtml, filename),
      sendEmailWithAttachment(partnerEmail, emailSubject, { ...sow, signedBy: signerName, signerTitle }, signedDate, sowHtml, filename),
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('SoW signing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
