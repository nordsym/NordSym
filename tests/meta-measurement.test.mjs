import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMetaEvent,
  hasGrantedConsent,
  isMeasurementEnabled,
  validateConversionRequest
} from '../lib/meta-conversions.mjs';
import bookHandler from '../api/book.js';
import { validateBookingRequest } from '../lib/booking-request.mjs';

const validBody = {
  event_name: 'Schedule',
  event_id: '524b389b-4837-4a2f-806c-dbe8fcdd3eb1',
  marketing_consent: true,
  fbp: 'fb.1.1710000000000.1234567890',
  fbc: 'fb.1.1710000000000.AbCdEfGhIj'
};
const validBooking = {
  requestId: 'aa4b389b-4837-4a2f-806c-dbe8fcdd3eb1',
  source: 'nordsym.com/ai-i-drift',
  locale: 'sv-SE',
  offerKey: 'ai_i_drift',
  submittedAt: '2026-07-25T10:00:00.000Z',
  focus: 'Kartlägg vad AI-agenterna behöver',
  date: '2026-08-03',
  dateLabel: 'måndag 3 augusti',
  time: '14:00',
  name: 'Test Person',
  email: 'person@example.com',
  company: 'Example AB',
  notes: '',
  acquisition: {
    source: 'meta_paid',
    company_size: '20-49',
    operation_state: 'active_build',
    bottleneck: 'integration',
    systems_count: '3-5',
    mandate: 'sponsor_now',
    qualification_signal: 'qualified_opportunity',
    utm_content: 'c02_static',
    lang: 'sv',
    offer: 'ai_i_drift'
  }
};

test('measurement is enabled only when all server configuration exists', () => {
  const complete = {
    META_PIXEL_ID: '12345',
    META_CAPI_ACCESS_TOKEN: 'test-token'
  };
  assert.equal(isMeasurementEnabled(complete), true);
  assert.equal(isMeasurementEnabled({ ...complete, META_PIXEL_ID: '' }), false);
  assert.equal(isMeasurementEnabled({ ...complete, META_CAPI_ACCESS_TOKEN: '' }), false);
  assert.equal(isMeasurementEnabled({}), false);
});

test('consent parser requires the exact granted cookie', () => {
  assert.equal(hasGrantedConsent('foo=bar; nordsym_marketing_consent=granted'), true);
  assert.equal(hasGrantedConsent('nordsym_marketing_consent=denied'), false);
  assert.equal(hasGrantedConsent(''), false);
});

test('only authenticated booking outcomes fit the CAPI request contract', () => {
  assert.deepEqual(validateConversionRequest(validBody), { ok: true, value: validBody });
  assert.equal(validateConversionRequest({ ...validBody, event_name: 'Lead' }).ok, false);
  assert.equal(validateConversionRequest({ ...validBody, marketing_consent: false }).ok, false);
  assert.equal(validateConversionRequest({ ...validBody, event_id: 'evt_short' }).ok, false);
});

test('request validation rejects PII, junk identifiers and missing match data', () => {
  assert.equal(validateConversionRequest({ ...validBody, email: 'person@example.com' }).ok, false);
  assert.equal(validateConversionRequest({ ...validBody, fbp: 'person@example.com' }).ok, false);
  assert.equal(validateConversionRequest({ ...validBody, fbc: 'not-a-meta-click-id' }).ok, false);
  const { fbp, fbc, ...withoutMatch } = validBody;
  assert.equal(validateConversionRequest(withoutMatch).ok, false);
});

test('server event is fixed to the booked mapping and contains no direct PII', () => {
  const event = buildMetaEvent(validBody, {
    eventTime: 1710000000,
    clientUserAgent: 'Test Browser/1.0'
  });

  assert.deepEqual(event, {
    event_name: 'Schedule',
    event_time: 1710000000,
    event_id: '524b389b-4837-4a2f-806c-dbe8fcdd3eb1',
    action_source: 'website',
    event_source_url: 'https://nordsym.com/book/',
    user_data: {
      fbp: 'fb.1.1710000000000.1234567890',
      fbc: 'fb.1.1710000000000.AbCdEfGhIj',
      client_user_agent: 'Test Browser/1.0'
    },
    custom_data: {
      content_name: 'ai_i_drift_readiness_mapping',
      content_category: 'lead_generation'
    }
  });
  assert.equal('em' in event.user_data, false);
  assert.equal('ph' in event.user_data, false);
});

test('booking boundary rejects unknown, stale and incomplete paid requests', () => {
  const now = new Date('2026-07-25T10:05:00.000Z');
  assert.equal(validateBookingRequest(validBooking, now).ok, true);
  assert.equal(validateBookingRequest({ ...validBooking, time: '14:20' }, now).ok, true);
  assert.equal(validateBookingRequest({ ...validBooking, time: '14:15' }, now).ok, false);
  assert.equal(validateBookingRequest({ ...validBooking, admin: true }, now).ok, false);
  assert.equal(validateBookingRequest({ ...validBooking, submittedAt: '2026-07-24T01:00:00Z' }, now).ok, false);
  assert.equal(
    validateBookingRequest({
      ...validBooking,
      acquisition: { ...validBooking.acquisition, mandate: undefined }
    }, now).ok,
    false
  );
});

test('booking proxy emits one bounded Schedule only after a confirmed consented booking', async () => {
  const handlerBooking = {
    ...validBooking,
    submittedAt: new Date().toISOString(),
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    dateLabel: 'framtida vardag'
  };
  const previous = {
    pixel: process.env.META_PIXEL_ID,
    token: process.env.META_CAPI_ACCESS_TOKEN
  };
  process.env.META_PIXEL_ID = '12345';
  process.env.META_CAPI_ACCESS_TOKEN = 'test-token';

  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (String(url).includes('/webhook/aeo-booking')) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, message: 'Booking confirmed.' })
      };
    }
    return { ok: true, status: 200, text: async () => '{}' };
  };

  const response = () => ({
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  });

  try {
    const acceptedRes = response();
    await bookHandler(
      {
        method: 'POST',
        headers: {
          origin: 'https://nordsym.com',
          'user-agent': 'Test Browser/1.0',
          cookie: 'nordsym_marketing_consent=granted; _fbp=fb.1.1710000000000.1234567890'
        },
        body: handlerBooking
      },
      acceptedRes
    );
    assert.equal(acceptedRes.statusCode, 200);
    assert.deepEqual(acceptedRes.body, { success: true });
    assert.equal(calls.length, 2);

    const outbound = JSON.parse(calls[1].options.body);
    assert.equal(outbound.data[0].event_name, 'Schedule');
    assert.deepEqual(outbound.data[0].user_data, {
      fbp: validBody.fbp,
      client_user_agent: 'Test Browser/1.0'
    });
    assert.equal(JSON.stringify(outbound).includes('person@example.com'), false);
    assert.equal(calls[1].options.headers.Authorization, 'Bearer test-token');

    const duplicateRes = response();
    await bookHandler(
      {
        method: 'POST',
        headers: { origin: 'https://nordsym.com' },
        body: handlerBooking
      },
      duplicateRes
    );
    assert.equal(duplicateRes.statusCode, 409);
    assert.deepEqual(duplicateRes.body, {
      success: false,
      error: 'duplicate_booking_request'
    });
    assert.equal(calls.length, 2);

    calls.length = 0;
    const noConsentRes = response();
    await bookHandler(
      {
        method: 'POST',
        headers: { origin: 'https://nordsym.com' },
        body: {
          ...handlerBooking,
          requestId: 'bb4b389b-4837-4a2f-806c-dbe8fcdd3eb1'
        }
      },
      noConsentRes
    );
    assert.equal(noConsentRes.statusCode, 200);
    assert.equal(calls.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries({
      META_PIXEL_ID: previous.pixel,
      META_CAPI_ACCESS_TOKEN: previous.token
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
