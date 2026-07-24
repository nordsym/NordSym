import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const failures = [];

const requiredFiles = [
  'lib/meta-conversions.mjs',
  'lib/booking-request.mjs',
  'api/meta-config.js',
  'api/book.js',
  'assets/meta-measurement.js',
  'assets/meta-measurement.css'
];
for (const file of requiredFiles) {
  try {
    read(file);
  } catch {
    failures.push(`missing ${file}`);
  }
}

const client = read('assets/meta-measurement.js');
const server = read('api/book.js');
const config = read('api/meta-config.js');
const landing = read('ai-i-drift/index.html');
const landingScript = read('ai-i-drift/script.js');
const booking = read('book/index.html');
const privacy = read('privacy.html');

for (const [source, text, label] of [
  [landing, '/assets/meta-measurement.js', 'landing measurement client'],
  [landingScript, 'window.nordsymMeta?.track("Lead")', 'qualified Lead event'],
  [client, "window.fbq('track', eventName, data, { eventID: id })", 'browser deduplication identifier'],
  [client, "window.fbq('set', 'autoConfig', false, config.pixelId)", 'automatic event collection disabled'],
  [booking, 'var endpoint = "/api/book";', 'same-origin booking proxy'],
  [booking, 'requestId: window.crypto.randomUUID()', 'booking idempotency key'],
  [booking, 'var booked = res.ok && responseBody && responseBody.success === true;', 'browser confirmed booking gate'],
  [server, "const BOOKING_ENDPOINT = 'https://nordsym.app.n8n.cloud/webhook/aeo-booking';", 'fixed booking backend'],
  [server, 'validateBookingRequest(req.body, now)', 'server booking schema validation'],
  [server, "redirect: 'error'", 'upstream redirect blocking'],
  [server, 'duplicate_booking_request', 'booking replay rejection'],
  [server, 'booking_rate_limited', 'booking rate limiting'],
  [server, "responseBody?.success === true", 'confirmed booking gate'],
  [server, "hasGrantedConsent(cookieHeader)", 'server-side consent gate'],
  [server, "readCookie(cookieHeader, '_fbp')", 'server-side Meta cookie read'],
  [server, 'Authorization: `Bearer ${process.env.META_CAPI_ACCESS_TOKEN}`', 'header token transport'],
  [config, 'isMeasurementEnabled(process.env)', 'disabled-until-configured gate'],
  [privacy, 'id="meta-measurement"', 'Meta privacy disclosure'],
  [privacy, 'Withdraw or change advertising consent', 'consent withdrawal control']
]) {
  if (!source.includes(text)) failures.push(`missing ${label}`);
}

for (const [source, pattern, label] of [
  [client, /\b(?:email|company|notes|qualification_answers)\s*:/, 'client Meta PII field'],
  [server, /console\.(?:log|error|warn)/, 'server logging'],
  [landingScript, /nordsymMeta\?\.track\([^)]*answers/, 'qualification answers in Meta call'],
  [booking, /nordsymMeta\?\.track\([^)]*state\./, 'booking PII state in Meta call'],
  [booking, /meta-measurement\.js/, 'Pixel loader on booking form'],
  [client, /fetch\(['"]\/api\/meta-(?:conversion|event)/, 'public browser CAPI relay'],
  [landing + booking + client + server, /EA[A-Za-z0-9]{40,}/, 'hardcoded Meta token']
]) {
  if (pattern.test(source)) failures.push(`contains forbidden ${label}`);
}

if (failures.length) {
  console.error('Meta measurement validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Meta measurement validation passed.');
