import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const trackedPages = ['index.html', 'book/index.html'];
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

const privacy = readFileSync(resolve(root, 'privacy.html'), 'utf8');
for (const phrase of ['privacy-preserving hash', 'rotates daily']) {
  if (!privacy.includes(phrase)) failures.push(`privacy.html: missing ${phrase}`);
}
if (privacy.includes('memory-only')) failures.push('privacy.html: contains stale memory-only language');

if (failures.length) {
  console.error(`PostHog configuration validation failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('posthog-config: ok (2 public surfaces, daily server hash, no browser persistence)');
