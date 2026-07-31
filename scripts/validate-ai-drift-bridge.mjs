import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const failures = [];

function read(relativePath) {
  const fullPath = resolve(root, relativePath);
  if (!existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return '';
  }
  return readFileSync(fullPath, 'utf8');
}

const markup = read('ai-i-drift/sa-fungerar-det/index.html');
const styles = read('ai-i-drift/sa-fungerar-det/bridge.css');
const script = read('ai-i-drift/sa-fungerar-det/bridge.js');
read('assets/ai-i-drift-video-poster.svg');
read('assets/video/ai-i-drift-sa-fungerar-det-v2.mp4');
read('assets/video/ai-i-drift-sa-fungerar-det-v2.sv.vtt');

for (const [source, expected, label] of [
  [markup, 'lang="sv"', 'Swedish language'],
  [markup, 'id="bridge-video"', 'video element'],
  [markup, 'poster="/assets/ai-i-drift-video-poster.svg"', 'video poster'],
  [markup, 'src="/assets/video/ai-i-drift-sa-fungerar-det-v2.mp4"', 'release video path'],
  [markup, 'src="/assets/video/ai-i-drift-sa-fungerar-det-v2.sv.vtt"', 'Swedish captions'],
  [markup, 'href="/ai-i-drift/#kvalificering"', 'qualification destination'],
  [markup, '/assets/meta-measurement.js', 'Meta measurement client'],
  [markup, "surface: 'lp_ai_i_drift_bridge'", 'PostHog bridge surface'],
  [markup, 'Läs videons text', 'accessible transcript'],
  [styles, '@media (max-width: 760px)', 'mobile layout'],
  [script, 'nordsym_paid_bridge_video_started', 'video start event'],
  [script, 'nordsym_paid_bridge_video_completed', 'video completion event'],
  [script, 'nordsym_paid_bridge_cta_clicked', 'bridge CTA event'],
  [script, '"utm_content"', 'creative attribution'],
  [script, 'destination.searchParams.set(key, value)', 'campaign preservation']
]) {
  if (!source.includes(expected)) failures.push(`missing ${label}`);
}

for (const [source, pattern, label] of [
  [markup, /autoplay/i, 'autoplay'],
  [markup, /LOKAL ANIMATIK|EJ SLUTMEDIA/i, 'preview-only media label'],
  [markup, /\b(?:email|company|notes|qualification_answers)\s*:/, 'PII field'],
  [script, /\b(?:email|company|notes|qualification_answers)\s*:/, 'PII field in tracking'],
  [script, /utm_term/, 'unused campaign term']
]) {
  if (pattern.test(source)) failures.push(`contains forbidden ${label}`);
}

if (failures.length) {
  console.error('AI i drift bridge validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AI i drift bridge validation passed.');
