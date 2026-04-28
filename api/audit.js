// Vercel Serverless Function: Request AI Search Visibility Audit
// Allows agents/humans to request an AI-visibility audit

const TELEGRAM_CHAT_ID = '7107586654';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      hint: 'Use POST to request an AI search visibility audit',
      example: {
        url: "https://example.com",
        email: "results@example.com",
        company: "Company name (optional)",
        notes: "Any specific focus areas (optional)"
      }
    });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { url, email, company, notes, callback_url, requested_by } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required',
        example: {
          url: "https://example.com",
          email: "results@example.com"
        }
      });
    }

    // Basic URL validation
    let validatedUrl;
    try {
      validatedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required for delivering results',
        hint: 'Provide email where audit results should be sent'
      });
    }

    // Format timestamp
    const timestamp = new Date().toLocaleString('sv-SE', {
      timeZone: 'Europe/Stockholm',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Detect if request is from an agent
    const isAgent = requested_by?.toLowerCase().includes('agent') || 
                    requested_by?.toLowerCase().includes('bot') ||
                    callback_url;

    // Build Telegram notification
    let telegramMessage = `🔍 AI SEARCH VISIBILITY AUDIT REQUEST\n\n`;
    telegramMessage += `URL: ${validatedUrl.href}\n`;
    telegramMessage += `Email: ${email}\n`;
    if (company) telegramMessage += `Company: ${company}\n`;
    if (requested_by) telegramMessage += `Requested by: ${requested_by}\n`;
    if (callback_url) telegramMessage += `Callback: ${callback_url}\n`;
    if (notes) telegramMessage += `\n📝 Notes:\n${notes}\n`;
    telegramMessage += `\n⏰ ${timestamp}`;
    
    if (isAgent) {
      telegramMessage += `\n\n🤖 Agent request - prioritize callback if available`;
    }

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: 'HTML'
      })
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResult.ok) {
      console.error('Telegram API error:', telegramResult);
      return res.status(500).json({ error: 'Failed to submit audit request' });
    }

    // Generate audit ID
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return res.status(200).json({ 
      success: true,
      message: 'AI search visibility audit request received',
      audit_id: auditId,
      url_analyzed: validatedUrl.href,
      results_delivery: {
        method: 'email',
        address: email,
        expected_time: '24-48h'
      },
      callback: callback_url ? {
        url: callback_url,
        note: 'Results will also be POSTed to this URL when ready'
      } : null,
      what_we_analyze: [
        'AI search visibility (ChatGPT, Perplexity, Claude)',
        'Schema.org markup quality',
        'Content structure for AI consumption',
        'Knowledge graph presence',
        'Competitor AI visibility comparison'
      ]
    });

  } catch (error) {
    console.error('Error processing audit request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
