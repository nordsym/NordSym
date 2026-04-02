// Deal Room status API — checks signing status for any deal type

const CONVEX_URL = "https://agile-crane-840.convex.cloud";

async function mcQuery(fnName, args) {
  const url = `${CONVEX_URL}/api/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: fnName, args }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.value ?? null;
}

export default async function handler(req, res) {
  const { customerId, dealType = "sow" } = req.query;
  if (!customerId) return res.status(400).json({ error: "Missing customerId" });

  try {
    const record = await mcQuery("sows:getByCustomerId", {
      customerId: `nordsym-${customerId}-${dealType}`,
    });
    return res.status(200).json({
      exists: !!record,
      status: record?.status || "pending",
      signedAt: record?.signedAt || null,
    });
  } catch {
    return res.status(200).json({ exists: false, status: "pending", signedAt: null });
  }
}
