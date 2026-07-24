import { randomUUID } from 'node:crypto';
import {
  buildMetaEvent,
  hasGrantedConsent,
  isMeasurementEnabled,
  validateConversionRequest
} from '../lib/meta-conversions.mjs';
import { validateBookingRequest } from '../lib/booking-request.mjs';

const BOOKING_ENDPOINT = 'https://nordsym.app.n8n.cloud/webhook/aeo-booking';
const DEFAULT_GRAPH_API_VERSION = 'v25.0';
const MAX_BOOKING_BYTES = 16_384;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 8;
const IDEMPOTENCY_WINDOW_MS = 60 * 60 * 1000;
const rateBuckets = new Map();
const requestIds = new Map();

function readCookie(cookieHeader, name) {
  const prefix = `${name}=`;
  const value = String(cookieHeader || '')
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return value ? decodeURIComponent(value.slice(prefix.length)) : '';
}

function isAllowedOrigin(req) {
  const origin = String(req.headers.origin || '');
  if (origin === 'https://nordsym.com') return true;
  return process.env.VERCEL_ENV !== 'production' &&
    /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin);
}

function isPaidMapping(body) {
  return body?.source === 'nordsym.com/ai-i-drift' &&
    body?.locale === 'sv-SE' &&
    body?.offerKey === 'ai_i_drift';
}

function requestIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .split(',')[0]
    .trim()
    .slice(0, 64);
}

function pruneMap(map, cutoff) {
  for (const [key, value] of map) {
    const timestamp = typeof value === 'number' ? value : value.startedAt;
    if (timestamp < cutoff) map.delete(key);
  }
}

function rateAllowed(ip, now) {
  pruneMap(rateBuckets, now - RATE_WINDOW_MS);
  const current = rateBuckets.get(ip);
  if (!current) {
    rateBuckets.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= RATE_LIMIT) return false;
  current.count += 1;
  return true;
}

function claimRequestId(id, now) {
  pruneMap(requestIds, now - IDEMPOTENCY_WINDOW_MS);
  if (requestIds.has(id)) return false;
  requestIds.set(id, now);
  return true;
}

async function deliverSchedule(cookieHeader) {
  try {
    if (!isMeasurementEnabled(process.env) || !hasGrantedConsent(cookieHeader)) return;

    const conversion = {
      event_name: 'Schedule',
      event_id: randomUUID(),
      marketing_consent: true,
      fbp: readCookie(cookieHeader, '_fbp') || undefined,
      fbc: readCookie(cookieHeader, '_fbc') || undefined
    };
    const validation = validateConversionRequest(conversion);
    if (!validation.ok) return;

    const version = /^v\d{1,2}\.\d$/.test(process.env.META_GRAPH_API_VERSION || '')
      ? process.env.META_GRAPH_API_VERSION
      : DEFAULT_GRAPH_API_VERSION;
    const graphUrl = `https://graph.facebook.com/${version}/${process.env.META_PIXEL_ID}/events`;
    const payload = { data: [buildMetaEvent(validation.value)] };

    if (
      typeof process.env.META_TEST_EVENT_CODE === 'string' &&
      process.env.META_TEST_EVENT_CODE.trim()
    ) {
      payload.test_event_code = process.env.META_TEST_EVENT_CODE.trim();
    }

    await fetch(graphUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.META_CAPI_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000)
    });
  } catch {
    // Measurement must never change the confirmed booking response.
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: 'origin_not_allowed' });
  }

  const serializedBody = JSON.stringify(req.body);
  if (
    typeof serializedBody !== 'string' ||
    Buffer.byteLength(serializedBody, 'utf8') > MAX_BOOKING_BYTES
  ) {
    return res.status(413).json({ error: 'booking_request_too_large' });
  }

  const now = new Date();
  const validation = validateBookingRequest(req.body, now);
  if (!validation.ok) {
    return res.status(400).json({ success: false, error: validation.error });
  }

  const ip = requestIp(req);
  if (!rateAllowed(ip, now.getTime())) {
    return res.status(429).json({ success: false, error: 'booking_rate_limited' });
  }
  if (!claimRequestId(validation.value.requestId, now.getTime())) {
    return res.status(409).json({ success: false, error: 'duplicate_booking_request' });
  }

  try {
    const bookingResponse = await fetch(BOOKING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: serializedBody,
      redirect: 'error',
      signal: AbortSignal.timeout(12_000)
    });
    const responseText = await bookingResponse.text();
    let responseBody;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = { success: false };
    }

    const booked = bookingResponse.ok && responseBody?.success === true;
    if (booked && isPaidMapping(validation.value)) {
      await deliverSchedule(req.headers.cookie || '');
    }

    if (booked) {
      return res.status(200).json({ success: true });
    }
    requestIds.delete(validation.value.requestId);
    const publicStatus = bookingResponse.status >= 400 && bookingResponse.status < 500
      ? bookingResponse.status
      : 502;
    return res.status(publicStatus).json({
      success: false,
      error: publicStatus === 409 ? 'slot_unavailable' : 'booking_rejected'
    });
  } catch {
    requestIds.delete(validation.value.requestId);
    return res.status(502).json({
      success: false,
      error: 'booking_service_unavailable'
    });
  }
}
