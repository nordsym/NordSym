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
const spokenSource = read('assets/video/ai-i-drift-sa-fungerar-det-v3-script.sv.txt');
const captions = read('assets/video/ai-i-drift-sa-fungerar-det-v3.sv.vtt');
read('assets/ai-i-drift-video-poster.jpg');
read('assets/video/ai-i-drift-sa-fungerar-det-v3.mp4');

for (const [source, expected, label] of [
  [markup, 'lang="sv"', 'Swedish language'],
  [markup, 'id="bridge-video"', 'video element'],
  [markup, 'data-media-status="local-review-candidate"', 'truthful local review status'],
  [markup, 'poster="/assets/ai-i-drift-video-poster.jpg"', 'authentic video poster'],
  [markup, 'src="/assets/video/ai-i-drift-sa-fungerar-det-v3.mp4"', '16:9 bridge video path'],
  [markup, 'src="/assets/video/ai-i-drift-sa-fungerar-det-v3.sv.vtt"', 'Swedish captions'],
  [markup, 'href="/ai-i-drift/#kvalificering"', 'qualification destination'],
  [markup, '/assets/meta-measurement.js', 'Meta measurement client'],
  [markup, "surface: 'lp_ai_i_drift_bridge'", 'PostHog bridge surface'],
  [markup, 'Läs videons text', 'accessible transcript'],
  [markup, 'Fem frågor. Sedan tar vi nästa steg.', 'bridge continuity headline'],
  [markup, '20 minuters möte med mig', 'truthful spoken booking transcript'],
  [spokenSource, 'vart man faktiskt ska börja.', 'approved single spoken faktiskt'],
  [spokenSource, '20 minuters möte med mig', 'approved spoken booking path'],
  [captions, 'vart man faktiskt ska börja.', 'captioned single faktiskt'],
  [captions, '20 minuters möte med mig', 'captioned booking duration'],
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
  [markup, /temporary-local-placeholder/, 'temporary bridge placeholder'],
  [markup, /Gör inte det här misstaget/, 'repeated ad argument'],
  [markup, /\b(?:email|company|notes|qualification_answers)\s*:/, 'PII field'],
  [script, /\b(?:email|company|notes|qualification_answers)\s*:/, 'PII field in tracking'],
  [script, /utm_term/, 'unused campaign term']
]) {
  if (pattern.test(source)) failures.push(`contains forbidden ${label}`);
}

for (const [source, label] of [
  [spokenSource, 'spoken transcript'],
  [captions, 'captions']
]) {
  const count = (source.match(/\bfaktiskt\b/gi) || []).length;
  if (count !== 1) failures.push(`${label} must contain exactly one faktiskt, found ${count}`);
}

const captionBlocks = captions.trim().split(/\n\s*\n/).slice(1);
for (const [index, block] of captionBlocks.entries()) {
  const lines = block.split('\n').slice(1).filter(Boolean);
  if (lines.length > 2) failures.push(`caption ${index + 1} exceeds two lines`);
  if (lines.some((line) => line.length > 42)) failures.push(`caption ${index + 1} exceeds 42 characters`);
}

if (failures.length) {
  console.error('AI i drift bridge validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AI i drift bridge validation passed.');
