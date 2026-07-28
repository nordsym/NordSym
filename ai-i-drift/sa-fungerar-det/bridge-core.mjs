export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_id"];
export const VIDEO_MILESTONES = [25, 50, 75];

export function campaignValue(value) {
  const raw = String(value || "").trim();
  if (!raw || raw.includes("@") || raw.replace(/\D/g, "").length >= 7) return "";
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9._~-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

export function sanitizedCampaign(search) {
  const source = new URLSearchParams(search);
  return Object.fromEntries(
    UTM_KEYS
      .map((key) => [key, campaignValue(source.get(key))])
      .filter(([, value]) => value)
  );
}

export function qualificationHref(campaign, origin = "https://nordsym.com") {
  const destination = new URL("/ai-i-drift/", origin);
  for (const key of UTM_KEYS) {
    if (campaign[key]) destination.searchParams.set(key, campaign[key]);
  }
  destination.hash = "kvalificering";
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export function approvedMedia(manifest) {
  if (
    !manifest ||
    manifest.schema_version !== 1 ||
    manifest.status !== "approved" ||
    manifest.language !== "sv" ||
    typeof manifest.approved_by !== "string" ||
    !manifest.approved_by.trim() ||
    typeof manifest.approved_at !== "string" ||
    !Number.isFinite(Date.parse(manifest.approved_at))
  ) {
    return null;
  }

  for (const key of ["video", "poster", "captions"]) {
    const value = manifest[key];
    if (
      typeof value !== "string" ||
      !value.startsWith("/ai-i-drift/sa-fungerar-det/media/") ||
      value.includes("..")
    ) {
      return null;
    }
  }

  if (!/\.(mp4|mov)$/i.test(manifest.video)) return null;
  if (!/\.(webp|jpg|jpeg|png)$/i.test(manifest.poster)) return null;
  if (!/\.sv\.vtt$/i.test(manifest.captions)) return null;
  return manifest;
}

export function pendingMilestones(percent, reached) {
  if (!Number.isFinite(percent) || percent < 0 || !(reached instanceof Set)) return [];
  return VIDEO_MILESTONES.filter((milestone) => percent >= milestone && !reached.has(milestone));
}
