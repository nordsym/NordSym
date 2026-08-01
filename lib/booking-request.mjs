const TOP_LEVEL_KEYS = new Set([
  'requestId',
  'source',
  'locale',
  'offerKey',
  'submittedAt',
  'focus',
  'date',
  'dateLabel',
  'time',
  'name',
  'email',
  'company',
  'notes',
  'acquisition'
]);
const ACQUISITION_KEYS = new Set([
  'source',
  'company_size',
  'operation_state',
  'bottleneck',
  'systems_count',
  'mandate',
  'utm_id',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'qualification_signal',
  'lang',
  'offer'
]);
const ALLOWED_ACQUISITION = {
  source: new Set(['meta_paid']),
  company_size: new Set(['1-19', '20-49', '50-199', '200+']),
  operation_state: new Set(['named_priority', 'active_build', 'prototype_only', 'multiple_backlog']),
  bottleneck: new Set(['process_clarity', 'integration', 'production_reliability', 'delivery_capacity', 'governance', 'measurement']),
  systems_count: new Set(['1', '2', '3-5', '6+']),
  mandate: new Set(['sponsor_now', 'owner_in_place', 'hiring_owner', 'exploring']),
  qualification_signal: new Set(['form_complete', 'qualified_opportunity']),
  lang: new Set(['sv']),
  offer: new Set(['ai_i_drift'])
};
const ALLOWED_FOCUS = new Set([
  'Hitta rätt arbete för en AI-agent',
  'Löpande ansvar för befintlig agent',
  'Utöka vad agenterna hanterar',
  'Build the first agent',
  'Take over an existing agent',
  'Expand what agents handle',
  'Still exploring'
]);
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UTM_VALUE = /^[a-z0-9._~-]{1,120}$/;

function boundedText(value, minimum, maximum) {
  return typeof value === 'string' &&
    value.length >= minimum &&
    value.length <= maximum &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);
}

function validAcquisition(value, paid) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (!Object.keys(value).every((key) => ACQUISITION_KEYS.has(key))) return false;

  for (const [key, item] of Object.entries(value)) {
    if (key.startsWith('utm_')) {
      if (!UTM_VALUE.test(item)) return false;
      continue;
    }
    if (!ALLOWED_ACQUISITION[key]?.has(item)) return false;
  }

  if (paid) {
    return value.source === 'meta_paid' &&
      ALLOWED_ACQUISITION.company_size.has(value.company_size) &&
      ALLOWED_ACQUISITION.operation_state.has(value.operation_state) &&
      ALLOWED_ACQUISITION.bottleneck.has(value.bottleneck) &&
      ALLOWED_ACQUISITION.systems_count.has(value.systems_count) &&
      ALLOWED_ACQUISITION.mandate.has(value.mandate) &&
      ALLOWED_ACQUISITION.qualification_signal.has(value.qualification_signal) &&
      value.lang === 'sv' &&
      value.offer === 'ai_i_drift';
  }
  return !('source' in value) &&
    !('company_size' in value) &&
    !('operation_state' in value) &&
    !('bottleneck' in value) &&
    !('systems_count' in value) &&
    !('mandate' in value) &&
    !('qualification_signal' in value) &&
    !('lang' in value) &&
    !('offer' in value);
}

export function validateBookingRequest(body, now = new Date()) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'invalid_booking_request' };
  }
  if (!Object.keys(body).every((key) => TOP_LEVEL_KEYS.has(key))) {
    return { ok: false, error: 'unknown_booking_field' };
  }

  const paid = body.source === 'nordsym.com/ai-i-drift';
  if (
    (paid && (body.locale !== 'sv-SE' || body.offerKey !== 'ai_i_drift')) ||
    (!paid && (
      body.source !== 'nordsym.com/book' ||
      body.locale !== 'en-GB' ||
      body.offerKey !== 'default'
    ))
  ) {
    return { ok: false, error: 'invalid_booking_route' };
  }

  if (!UUID_V4.test(body.requestId || '')) {
    return { ok: false, error: 'invalid_request_id' };
  }
  if (!ALLOWED_FOCUS.has(body.focus)) {
    return { ok: false, error: 'invalid_focus' };
  }
  if (
    !boundedText(body.name, 2, 120) ||
    !(body.name.length >= 4 || body.name.includes(' '))
  ) {
    return { ok: false, error: 'invalid_name' };
  }
  if (
    !boundedText(body.email, 3, 254) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
  ) {
    return { ok: false, error: 'invalid_email' };
  }
  if (!boundedText(body.company, 0, 160) || !boundedText(body.notes, 0, 1000)) {
    return { ok: false, error: 'invalid_optional_text' };
  }
  if (!boundedText(body.dateLabel, 1, 120) || !/^\d{4}-\d{2}-\d{2}$/.test(body.date || '')) {
    return { ok: false, error: 'invalid_date' };
  }
  if (!/^(?:0[9]|1[0-8]):(?:00|15|30|45)$/.test(body.time || '')) {
    return { ok: false, error: 'invalid_time' };
  }

  const bookingDate = new Date(`${body.date}T12:00:00Z`);
  const today = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0
  ));
  const latest = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000);
  if (
    Number.isNaN(bookingDate.getTime()) ||
    bookingDate < today ||
    bookingDate > latest
  ) {
    return { ok: false, error: 'invalid_date' };
  }

  const submittedAt = new Date(body.submittedAt);
  if (
    Number.isNaN(submittedAt.getTime()) ||
    Math.abs(now.getTime() - submittedAt.getTime()) > 60 * 60 * 1000
  ) {
    return { ok: false, error: 'invalid_submission_time' };
  }
  if (!validAcquisition(body.acquisition, paid)) {
    return { ok: false, error: 'invalid_acquisition' };
  }

  return { ok: true, value: body };
}
