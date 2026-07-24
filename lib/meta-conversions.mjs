const FBP_PATTERN = /^fb\.1\.\d{13}\.\d{1,30}$/;
const FBC_PATTERN = /^fb\.1\.\d{13}\.[A-Za-z0-9_-]{1,100}$/;
const EVENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_TOP_LEVEL_KEYS = new Set([
  'event_name',
  'event_id',
  'marketing_consent',
  'fbp',
  'fbc'
]);

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export function isMeasurementEnabled(env = {}) {
  return /^\d{5,30}$/.test(env.META_PIXEL_ID || '') &&
    typeof env.META_CAPI_ACCESS_TOKEN === 'string' &&
    env.META_CAPI_ACCESS_TOKEN.trim().length >= 8;
}

export function hasGrantedConsent(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .some((part) => part === 'nordsym_marketing_consent=granted');
}

export function validateConversionRequest(body) {
  if (
    !isPlainObject(body) ||
    !Object.keys(body).every((key) => ALLOWED_TOP_LEVEL_KEYS.has(key))
  ) {
    return { ok: false, error: 'invalid_request' };
  }

  if (body.event_name !== 'Schedule') {
    return { ok: false, error: 'invalid_event_name' };
  }

  if (
    typeof body.event_id !== 'string' ||
    !EVENT_ID_PATTERN.test(body.event_id)
  ) {
    return { ok: false, error: 'invalid_event_id' };
  }

  if (body.marketing_consent !== true) {
    return { ok: false, error: 'marketing_consent_required' };
  }

  if (body.fbp !== undefined && !FBP_PATTERN.test(body.fbp)) {
    return { ok: false, error: 'invalid_fbp' };
  }
  if (body.fbc !== undefined && !FBC_PATTERN.test(body.fbc)) {
    return { ok: false, error: 'invalid_fbc' };
  }
  if (!body.fbp && !body.fbc) {
    return { ok: false, error: 'matching_identifier_required' };
  }

  return { ok: true, value: body };
}

export function buildMetaEvent(body, context = {}) {
  const userData = {};
  if (body.fbp) userData.fbp = body.fbp;
  if (body.fbc) userData.fbc = body.fbc;

  return {
    event_name: 'Schedule',
    event_time: Number.isInteger(context.eventTime)
      ? context.eventTime
      : Math.floor(Date.now() / 1000),
    event_id: body.event_id,
    action_source: 'website',
    event_source_url: 'https://nordsym.com/book/',
    user_data: userData,
    custom_data: {
      content_name: 'ai_i_drift_operations_mapping',
      content_category: 'lead_generation'
    }
  };
}
