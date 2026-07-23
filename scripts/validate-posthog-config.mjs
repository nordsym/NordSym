import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const paidLandingPage = 'fakturaklart/index.html';
const paidLandingScript = 'fakturaklart/script.js';
const trackedPages = ['index.html', 'book/index.html', paidLandingPage];
const qualificationValues = {
  company_size: ['1-4', '5-14', '15-49', '50+'],
  job_volume: ['1-9', '10-49', '50-199', '200+'],
  bottleneck: ['missing_info', 'agreement_check', 'system_entry', 'invoice_preparation', 'approval', 'customer_questions'],
  systems_count: ['1', '2', '3+'],
  timing: ['now', 'quarter', 'exploring']
};
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
  'job_volume',
  'bottleneck',
  'systems_count',
  'timing',
  'utm_id',
  'utm_source',
  'utm_medium',
  'utm_campaign'
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
  ['var SUPPORTED_ROUTE = { lang: "sv", offer: "fakturaklart" };', 'paid offer allowlist'],
  ['var paidVariant = params.get("lang") === SUPPORTED_ROUTE.lang && params.get("offer") === SUPPORTED_ROUTE.offer;', 'exact paid variant gate'],
  ['var ACQUISITION_ALLOWED = {', 'exact qualification value allowlist'],
  ['source: ["meta_paid"],', 'paid source allowlist'],
  ['if (paidVariant) {\n    Object.keys(ACQUISITION_ALLOWED)', 'paid-only qualification parsing'],
  ['if (ACQUISITION_ALLOWED[key].indexOf(value) !== -1) acquisition[key] = value;', 'qualification value enforcement'],
  ['raw.indexOf("@") !== -1 || raw.replace(/\\D/g, "").length >= 7', 'campaign PII rejection'],
  ['window.history.replaceState({}, "", window.location.pathname + "?lang=sv&offer=fakturaklart");', 'paid URL context removal'],
  ['var webhookSource = paidVariant ? "nordsym.com/fakturaklart" : "nordsym.com/book";', 'paid and default webhook source allowlist'],
  ['acquisition: Object.assign({}, acquisition', 'nested webhook acquisition payload'],
  ['window.__nordsymAnalyticsContext = analyticsContext;', 'privacy-safe analytics context'],
  ['Object.assign({ surface: "book" }, analyticsContext, properties || {})', 'allowlisted booking event properties'],
  ['form.checkValidity()', 'native booking form validation'],
  ['detailsForm.reportValidity()', 'visible booking validation feedback'],
  ['maxlength="1000"', 'booking note length limit'],
  ['href="/privacy.html"', 'booking privacy link']
]) {
  if (!booking.includes(text)) failures.push(`${bookingPath}: missing ${label}`);
}
for (const [key, values] of Object.entries(qualificationValues)) {
  const declaration = `${key}: [${values.map((value) => `"${value}"`).join(', ')}]`;
  if (!booking.includes(declaration)) {
    failures.push(`${bookingPath}: ${key} values differ from the paid-funnel contract`);
  }
}

const landing = readFileSync(resolve(root, paidLandingScript), 'utf8');
for (const [text, label] of [
  ['var SURFACE = "lp_fakturaklart";', 'paid landing surface'],
  ['var OFFER = "fakturaklart";', 'paid landing offer'],
  ['var destination = new URL("/book/", window.location.origin);', 'default booking destination'],
  ['destination.searchParams.set("offer", OFFER);', 'paid booking offer handoff'],
  ['destination.searchParams.set("source", "meta_paid");', 'paid source handoff'],
  ['raw.indexOf("@") !== -1 || raw.replace(/\\D/g, "").length >= 7', 'campaign PII rejection'],
  ['if (focusTarget) focusTarget.focus();', 'qualification focus restoration']
]) {
  if (!landing.includes(text)) failures.push(`${paidLandingScript}: missing ${label}`);
}
for (const [key, values] of Object.entries(qualificationValues)) {
  const declaration = `${key}: [${values.map((value) => `"${value}"`).join(', ')}]`;
  if (!landing.includes(declaration)) {
    failures.push(`${paidLandingScript}: ${key} values differ from the paid-funnel contract`);
  }
}

const landingMarkup = readFileSync(resolve(root, paidLandingPage), 'utf8');
for (const [text, label] of [
  ['Boka kostnadsfri flödesdiagnos', 'diagnostic CTA'],
  ['NordSym AB · 559535-5768', 'legal trust marker'],
  ['Diagnosgarantin:', 'diagnostic risk reversal'],
  ['Verifierat NordSym-produktionskvitto', 'bounded production proof'],
  ['84%', 'third-party manual-process evidence'],
  ['47%', 'third-party invoicing evidence'],
  ['href="/privacy.html"', 'qualification privacy link']
]) {
  if (!landingMarkup.includes(text)) failures.push(`${paidLandingPage}: missing ${label}`);
}
for (const [text, label] of [
  ['rätt fit', 'Swenglish fit language'],
  ['hjälpt X', 'placeholder social proof'],
  ['garanterad besparing', 'unsupported outcome guarantee']
]) {
  if (landingMarkup.includes(text)) failures.push(`${paidLandingPage}: contains forbidden ${label}`);
}
const qualificationInputs = [...landingMarkup.matchAll(/<input\b[^>]*>/g)].map((match) => match[0]);
for (const [key, expectedValues] of Object.entries(qualificationValues)) {
  const actualValues = qualificationInputs.flatMap((input) => {
    const name = input.match(/\bname="([^"]+)"/)?.[1];
    const value = input.match(/\bvalue="([^"]+)"/)?.[1];
    return name === key && value ? [value] : [];
  });
  if (JSON.stringify(actualValues) !== JSON.stringify(expectedValues)) {
    failures.push(`${paidLandingPage}: ${key} form values differ from the paid-funnel contract`);
  }
}

for (const stale of ['innehallsoperation', 'innehållsoperation', 'cadence']) {
  if (booking.includes(stale)) failures.push(`${bookingPath}: contains stale paid-funnel identifier ${stale}`);
  if (landing.includes(stale)) failures.push(`${paidLandingScript}: contains stale paid-funnel identifier ${stale}`);
  if (landingMarkup.includes(stale)) failures.push(`${paidLandingPage}: contains stale paid-funnel identifier ${stale}`);
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
const landingEventCalls = landing.match(/\bcapture\((["'])[^"']+\1[\s\S]*?\);/g) ?? [];
for (const call of landingEventCalls) {
  if (/\b(?:formData|answers)\.(?:name|email|company|notes)\b/.test(call)) {
    failures.push(`${paidLandingScript}: paid landing analytics event references PII state`);
  }
  if (/(?:^|[{,]\s*)(?:name|email|company|notes)\s*:/.test(call)) {
    failures.push(`${paidLandingScript}: paid landing analytics event declares a PII property`);
  }
}

const privacy = readFileSync(resolve(root, 'privacy.html'), 'utf8');
for (const phrase of ['privacy-preserving hash', 'rotates daily', 'company-size range', 'job-volume range', 'bottleneck category']) {
  if (!privacy.includes(phrase)) failures.push(`privacy.html: missing ${phrase}`);
}
if (privacy.includes('memory-only')) failures.push('privacy.html: contains stale memory-only language');

if (failures.length) {
  console.error(`PostHog configuration validation failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`posthog-config: ok (${trackedPages.length} public surfaces, daily server hash, no browser persistence)`);
