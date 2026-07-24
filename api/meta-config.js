import { isMeasurementEnabled } from '../lib/meta-conversions.mjs';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!isMeasurementEnabled(process.env)) {
    return res.status(200).json({ enabled: false });
  }

  return res.status(200).json({
    enabled: true,
    pixelId: process.env.META_PIXEL_ID
  });
}
