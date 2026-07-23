export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return res.status(410).json({
    error: 'Endpoint retired',
    message: 'Use the current AI Search surface.',
    current_surface: 'https://aisearch.nordsym.com'
  });
}
