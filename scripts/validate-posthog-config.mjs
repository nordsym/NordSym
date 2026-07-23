import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const trackedPages = ['index.html', 'book/index.html'];
const paidLandingPage = 'lp/innehallsoperation/index.html';
if (existsSync(resolve(root, paidLandingPage))) trackedPages.push(paidLandingPage);
const failures = [];

for (const relativePath of trackedPages) {
  const source = readFileSync(resolve(root, relativePath), 'utf8');
  const requireText = (text, label = text) => {
    if (!source.includes(text)) failures.push(`${relativePath}: missing ${label}`);
  };
  const forbidText = (text, label = text) => {
    if (source.includes(text)) failures.push(`${relativePath}: contains forbidden ${label}`);
  };

  requireText("cookieless_mode: 'always'", 'cookieless server-hash mode');
  requireText("person_profiles: 'identified_only'", 'identified-only person profiles');
  requireText('autocapture: false', 'disabled autocapture');
  requireText('capture_pageview: false', 'disabled automatic pageviews');
  requireText('disable_session_recording: true', 'disabled session recording');
  requireText("privacy_mode: 'server_hash'", 'server-hash event marker');
  forbidText("persistence: 'memory'", 'memory-only persistence');
  forbidText('disable_persistence', 'disabled persistence override');
  forbidText('posthog.identify(', 'visitor identification');

  const manualPageviews = source.match(/posthog\.capture\('\$pageview'/g) ?? [];
  if (manualPageviews.length !== 1) {
    failures.push(`${relativePath}: expected exactly one manual pageview, found ${manualPageviews.length}`);
  }
}

const bookingPath = 'book/index.html';
const booking = readFileSync(resolve(root, bookingPath), 'utf8');
const requiredBookingParams = [
  'source',
  'company_size',
  'cadence',
  'bottleneck',
  'systems_count',
  'timing',
  'utm_id',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term'
];
const acquisitionList = booking.match(/var ACQUISITION_PARAM_KEYS = \[([\s\S]*?)\];/);
if (!acquisitionList) {
  failures.push(`${bookingPath}: missing acquisition parameter allowlist`);
} else {
  const declaredParams = [...acquisitionList[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  if (JSON.stringify(declaredParams) !== JSON.stringify(requiredBookingParams)) {
    failures.push(`${bookingPath}: acquisition parameter allowlist differs from the approved keys`);
  }
}
for (const [text, label] of [
  ['var SUPPORTED_ROUTE = { lang: "sv", offer: "innehallsoperation" };', 'paid offer allowlist'],
  ['var ACQUISITION_ALLOWED = {', 'exact qualification value allowlist'],
  ['if (ACQUISITION_ALLOWED[key].indexOf(value) !== -1) acquisition[key] = value;', 'qualification value enforcement'],
  ['var webhookSource = paidVariant ? "nordsym.com/lp/innehallsoperation" : "nordsym.com/book";', 'paid and default webhook source allowlist'],
  ['acquisition: Object.assign({}, acquisition', 'nested webhook acquisition payload'],
  ['window.__nordsymAnalyticsContext = analyticsContext;', 'privacy-safe analytics context'],
  ['Object.assign({ surface: "book" }, analyticsContext, properties || {})', 'allowlisted booking event properties']
]) {
  if (!booking.includes(text)) failures.push(`${bookingPath}: missing ${label}`);
}

const captureCalls = booking.match(/posthog\.capture\([\s\S]*?\);/g) ?? [];
for (const call of captureCalls) {
  if (/\bstate\.(?:name|email|company|notes)\b/.test(call)) {
    failures.push(`${bookingPath}: PostHog capture call references booking PII state`);
  }
  if (/(?:^|[{,]\s*)(?:name|email|company|notes)\s*:/.test(call)) {
    failures.push(`${bookingPath}: PostHog capture call declares a booking PII property`);
  }
}
const bookingEventCalls = booking
  .split('\n')
  .filter((line) => line.includes('captureBooking(') && !line.includes('function captureBooking'));
for (const call of bookingEventCalls) {
  if (/\bstate\.(?:name|email|company|notes)\b/.test(call)) {
    failures.push(`${bookingPath}: booking analytics event references booking PII state`);
  }
  if (/(?:^|[{,]\s*)(?:name|email|company|notes)\s*:/.test(call)) {
    failures.push(`${bookingPath}: booking analytics event declares a booking PII property`);
  }
}

const privacy = readFileSync(resolve(root, 'privacy.html'), 'utf8');
for (const phrase of ['privacy-preserving hash', 'rotates daily']) {
  if (!privacy.includes(phrase)) failures.push(`privacy.html: missing ${phrase}`);
}
if (privacy.includes('memory-only')) failures.push('privacy.html: contains stale memory-only language');

if (failures.length) {
  console.error(`PostHog configuration validation failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`posthog-config: ok (${trackedPages.length} public surfaces, daily server hash, no browser persistence)`);
