// Deal Room config API — serves DEAL_DATA_JSON env var
// Customer data lives in Vercel env, NEVER in git

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const raw = process.env.DEAL_DATA_JSON;
  if (!raw) {
    return res.status(500).json({ error: "DEAL_DATA_JSON not configured in Vercel env" });
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return res.status(500).json({ error: "Invalid DEAL_DATA_JSON format" });
  }

  // Cache for 60s (Vercel edge), no browser cache (data may update)
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json(data);
}
