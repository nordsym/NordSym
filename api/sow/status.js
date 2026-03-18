const DEFAULT_CONVEX_URL = 'https://agile-crane-840.convex.cloud';
const STATUS_QUERY_PATH = process.env.SOW_STATUS_QUERY_PATH || 'sows:getStatus';
const ALLOWED_CUSTOMERS = new Set(['excom', 'nakama', 'hotclen', 'lazy-genius', 'sandbox']);

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

async function convexQuery(path, args) {
  const base = process.env.MC_CONVEX_URL || process.env.CONVEX_URL || DEFAULT_CONVEX_URL;
  const response = await fetch(`${base}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args }),
  });
  if (!response.ok) throw new Error(`Convex query failed: ${response.status}`);
  return response.json();
}

export default async function handler(req, res) {
  setCors(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const customerId = String(req.query.customerId || '').trim();
    if (!customerId) return res.status(400).json({ error: 'customerId is required' });
    if (!ALLOWED_CUSTOMERS.has(customerId)) {
      return res.status(400).json({ error: 'Unknown customerId' });
    }

    const result = await convexQuery(STATUS_QUERY_PATH, { customerId });
    const value = result && Object.prototype.hasOwnProperty.call(result, 'value') ? result.value : null;

    return res.status(200).json(value || { exists: false, status: 'not_found' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to get SoW status' });
  }
}
