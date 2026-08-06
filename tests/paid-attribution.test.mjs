import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('..', import.meta.url).pathname;
const helper = fs.readFileSync(`${root}/assets/paid-attribution.js`, 'utf8');

function runAttribution(url, stored = null) {
  const data = stored ? { nordsym_paid_entry_v1: JSON.stringify(stored) } : {};
  const context = {
    window: { location: { search: new URL(url).search, pathname: new URL(url).pathname } },
    URLSearchParams,
    sessionStorage: {
      getItem: (key) => data[key] || null,
      setItem: (key, value) => { data[key] = value; }
    },
    crypto: { randomUUID: () => 'entry-test-id' },
    Date,
    String,
    JSON,
    Object,
    URL,
    console
  };
  vm.createContext(context);
  vm.runInContext(helper, context);
  return context.window.__nordsymPaidAttribution;
}

test('first paid entry is immutable across reload and route changes', () => {
  const first = runAttribution('https://nordsym.com/ai-i-drift/sa-fungerar-det/?utm_source=meta&utm_campaign=ai_i_drift_v1&utm_content=founder_video_v2');
  const second = runAttribution('https://nordsym.com/ai-i-drift/kvalificering/?utm_source=meta&utm_campaign=other', first);
  assert.equal(first.entry_type, 'paid');
  assert.equal(second.entry_path, '/ai-i-drift/sa-fungerar-det/');
  assert.equal(second.utm_content, 'founder_video_v2');
  assert.equal(second.utm_campaign, 'ai_i_drift_v1');
});

test('native Meta identity parameters persist as technical fields', () => {
  const entry = runAttribution('https://nordsym.com/ai-i-drift/sa-fungerar-det/?utm_source=meta&ns_campaign_id=123456789&ns_adset_id=234567890&ns_ad_id=345678901&ns_creative_id=456789012&ns_placement=instagram_reels');
  assert.equal(entry.ns_campaign_id, '123456789');
  assert.equal(entry.ns_adset_id, '234567890');
  assert.equal(entry.ns_ad_id, '345678901');
  assert.equal(entry.ns_creative_id, '456789012');
  assert.equal(entry.ns_placement, 'instagram_reels');
});

test('direct and controlled test entries are classified explicitly', () => {
  assert.equal(runAttribution('https://nordsym.com/ai-i-drift/kvalificering/').entry_type, 'direct');
  assert.equal(runAttribution('https://nordsym.com/book/?utm_source=meta&utm_campaign=e2e_booking_test&utm_content=controlled_booking').entry_type, 'internal_test');
});

test('ordinary booking route does not inherit paid session context', () => {
  const paid = runAttribution('https://nordsym.com/ai-i-drift/sa-fungerar-det/?utm_source=meta&utm_campaign=ai_i_drift_v1');
  const ordinary = runAttribution('https://nordsym.com/book/', paid);
  assert.equal(ordinary.entry_type, 'direct');
  assert.equal(ordinary.entry_path, '/book/');
});

test('ordered step markers and booking request propagation are present', () => {
  const bridge = fs.readFileSync(`${root}/ai-i-drift/sa-fungerar-det/bridge.js`, 'utf8');
  const qualification = fs.readFileSync(`${root}/ai-i-drift/kvalificering/qualification.js`, 'utf8');
  const booking = fs.readFileSync(`${root}/book/index.html`, 'utf8');
  for (const marker of ['step_index: 1', 'step_index: 2', 'step_index: 3']) assert.match(bridge, new RegExp(marker.replace(': ', '\\s*:\\s*')));
  assert.match(qualification, /step_index:4/);
  assert.match(qualification, /step_index:5/);
  assert.match(booking, /bookingRequestId = window\.crypto\.randomUUID\(\)/);
  assert.match(booking, /request_id: bookingRequestId/);
});

test('new attribution fields are categorical and no form PII is added', () => {
  const booking = fs.readFileSync(`${root}/book/index.html`, 'utf8');
  assert.match(booking, /Object\.assign\(\{\s*booking_variant/);
  assert.doesNotMatch(booking.match(/var analyticsContext[\s\S]{0,500}/)?.[0] || '', /\b(name|email|company|notes)\s*:/);
});
