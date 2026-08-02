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
  'acquisition',
  'preCall'
]);
const ACQUISITION_KEYS = new Set([
  'source',
  'consequences',
  'information_locations',
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
  consequences: new Set(['time', 'delay', 'errors_rework', 'lost_revenue', 'weak_follow_up', 'other']),
  information_locations: new Set(['one_system', 'several_systems', 'documents_messages_email', 'individual_people', 'no_complete_overview']),
  systems_count: new Set(['1', '2', '3-5', '6+']),
  mandate: new Set(['sponsor_now', 'owner_in_place', 'hiring_owner', 'exploring']),
  qualification_signal: new Set(['form_complete', 'prequalified']),
  lang: new Set(['sv']),
  offer: new Set(['ai_i_drift'])
};
const ALLOWED_FOCUS = new Set([
  'Hitta rätt arbete för en AI-agent',
  'Kartlägg vad AI-agenterna behöver',
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
    if (key === 'consequences' || key === 'information_locations') {
      const items = typeof item === 'string' ? item.split(',').filter(Boolean) : [];
      if (!items.length || new Set(items).size !== items.length) return false;
      if (!items.every((entry) => ALLOWED_ACQUISITION[key].has(entry))) return false;
      continue;
    }
    if (!ALLOWED_ACQUISITION[key]?.has(item)) return false;
  }

  if (paid) {
    const expectedQualificationSignal =
      value.systems_count !== '1' && value.mandate !== 'exploring'
        ? 'prequalified'
        : 'form_complete';
    return value.source === 'meta_paid' &&
      typeof value.consequences === 'string' &&
      typeof value.information_locations === 'string' &&
      ALLOWED_ACQUISITION.systems_count.has(value.systems_count) &&
      ALLOWED_ACQUISITION.mandate.has(value.mandate) &&
      value.qualification_signal === expectedQualificationSignal &&
      value.lang === 'sv' &&
      value.offer === 'ai_i_drift';
  }
  return !('source' in value) &&
    !('consequences' in value) &&
    !('information_locations' in value) &&
    !('systems_count' in value) &&
    !('mandate' in value) &&
    !('qualification_signal' in value) &&
    !('lang' in value) &&
    !('offer' in value);
}

function validPreCall(value, paid) {
  if (!paid) return value === undefined;
  if (value === undefined) return false;
  if (!paid || !value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (!Object.keys(value).every((key) => ['work_description', 'consequence_other_detail'].includes(key))) return false;
  if (!boundedText(value.work_description, 1, 280)) return false;
  return value.consequence_other_detail === undefined || boundedText(value.consequence_other_detail, 0, 160);
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
  const isNordSymBooking = String(body.source || '').toLowerCase().includes('nordsym');
  const timePattern = paid || isNordSymBooking
    ? /^(?:0[9]|1[0-7]):(?:00|20|40)$/
    : /^(?:0[9]|1[0-8]):(?:00|15|30|45)$/;
  if (!timePattern.test(body.time || '')) {
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
  if (!validPreCall(body.preCall, paid)) {
    return { ok: false, error: 'invalid_pre_call_context' };
  }

  return { ok: true, value: body };
}
