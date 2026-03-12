const DEFAULT_CONVEX_URL = 'https://agile-crane-840.convex.cloud';
const MAX_SIGNATURE_DATA_URL_LEN = 1_500_000;
const PATH_GET_BY_CUSTOMER = process.env.SOW_GET_QUERY_PATH || 'sow:getByCustomerId';
const PATH_CREATE = process.env.SOW_CREATE_MUTATION_PATH || 'sow:create';
const PATH_SIGN = process.env.SOW_SIGN_MUTATION_PATH || 'sow:sign';

const customerConfig = {
  excom: { name: 'Excom', email: '' },
  nakama: { name: 'Nakama', email: '' },
  hotclen: { name: 'HotClen', email: '' },
  'lazy-genius': { name: 'Lazy Genius', email: '' },
};

async function convexCall(kind, path, args) {
  const base = process.env.MC_CONVEX_URL || process.env.CONVEX_URL || DEFAULT_CONVEX_URL;
  const endpoint = kind === 'mutation' ? 'mutation' : 'query';
  const response = await fetch(`${base}/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args }),
  });
  if (!response.ok) throw new Error(`Convex ${endpoint} failed: ${response.status}`);
  return response.json();
}

function setCors(req, res) {
  const reqOrigin = req.headers.origin;
  const allowedOrigins = (process.env.SOW_ALLOWED_ORIGINS || 'https://nordsym.com,https://www.nordsym.com')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  if (!reqOrigin || allowedOrigins.includes(reqOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin || allowedOrigins[0] || '*');
  }
  res.setHeader('Vary', 'Origin');
}

export default async function handler(req, res) {
  setCors(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { customerId, signatureDataUrl } = req.body || {};
    const signerName = String(req.body?.signerName || '').trim();
    const signerTitle = String(req.body?.signerTitle || '').trim();

    if (!customerId || !signatureDataUrl || !signerName || !signerTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (signerName.length > 120 || signerTitle.length > 120) {
      return res.status(400).json({ error: 'Invalid signer fields' });
    }

    const customer = customerConfig[customerId];
    if (!customer) return res.status(400).json({ error: 'Unknown customerId' });
    if (typeof signatureDataUrl !== 'string' || !signatureDataUrl.startsWith('data:image/png;base64,')) {
      return res.status(400).json({ error: 'Invalid signature format' });
    }
    if (signatureDataUrl.length > MAX_SIGNATURE_DATA_URL_LEN) {
      return res.status(413).json({ error: 'Signature payload too large' });
    }

    const forwarded = req.headers['x-forwarded-for'];
    const signerIp = Array.isArray(forwarded)
      ? forwarded[0]
      : (forwarded || req.headers['x-real-ip'] || 'unknown').toString().split(',')[0].trim();

    const existingResponse = await convexCall('query', PATH_GET_BY_CUSTOMER, { customerId });
    const existing = existingResponse && Object.prototype.hasOwnProperty.call(existingResponse, 'value')
      ? existingResponse.value
      : null;

    if (!existing) {
      await convexCall('mutation', PATH_CREATE, {
        customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        documentHtml: '',
      });
    }
    if (existing && existing.status === 'signed') {
      return res.status(409).json({ error: 'SoW already signed' });
    }

    const signResponse = await convexCall('mutation', PATH_SIGN, {
      customerId,
      signatureDataUrl,
      signerName,
      signerTitle,
      signerIp,
    });

    if (signResponse && signResponse.status === 'error') {
      return res.status(500).json({ error: signResponse.errorMessage || 'Failed to sign SoW' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
