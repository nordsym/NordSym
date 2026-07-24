const PUBLIC_PROOF = Object.freeze({
  proof_id: 'editorial-distribution-01',
  proof_type: 'verified-production-record',
  status: 'verified',
  systems_count: 4,
  control_boundaries: 4,
  recorded_outputs: 4,
  last_reviewed: '2026-07-24',
  boundary:
    'Public, anonymized proof of one production operation. No client data, live client volume, or private runtime details are exposed.'
});

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    ...PUBLIC_PROOF,
    checked_at: new Date().toISOString()
  });
}
