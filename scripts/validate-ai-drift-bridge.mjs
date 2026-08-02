import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const failures = [];
const immutableMetaAd = '/Users/gustavhemmingsson/Desktop/NordSym-AI-agenter-edit/NordSym-AI-agenter-FINAL.mp4';
const launchMetaAdV2 = '/Users/gustavhemmingsson/Desktop/NordSym-AI-agenter-edit/NordSym-AI-agenter-LAUNCH-V2.mp4';

function read(relativePath) {
  const fullPath = resolve(root, relativePath);
  if (!existsSync(fullPath)) {
    failures.push(`missing ${relativePath}`);
    return '';
  }
  return readFileSync(fullPath, 'utf8');
}

function sha256(filePath) {
  if (!existsSync(filePath)) {
    failures.push(`missing ${filePath}`);
    return '';
  }
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

const markup = read('ai-i-drift/sa-fungerar-det/index.html');
const styles = read('ai-i-drift/sa-fungerar-det/bridge.css');
const script = read('ai-i-drift/sa-fungerar-det/bridge.js');
const qualification = read('ai-i-drift/kvalificering/index.html');
const preview = read('output/meta-e2e-preview-2026-07-30/index.html');
const previewServer = read('scripts/serve-meta-e2e-preview.mjs');
const metaAdV2SpokenSource = read('assets/video/meta-founder-ad-v2-script.sv.txt');
const spokenSource = read('assets/video/ai-i-drift-sa-fungerar-det-v3-script.sv.txt');
const captions = read('assets/video/ai-i-drift-sa-fungerar-det-v3.sv.vtt');
read('assets/ai-i-drift-video-poster.jpg');
read('assets/video/ai-i-drift-sa-fungerar-det-v3.mp4');

const expectedHashes = new Map([
  [immutableMetaAd, 'ba68e0e1319531490eb6be1ce968aa66dae689ae6c5b001a73088328006e3cec'],
  [launchMetaAdV2, '8e2e06008f997f4ba8e27815ecfdaafa566049649b7098de078da77b6db3d51e'],
  [resolve(root, 'assets/meta-founder-ad-poster.jpg'), '8f94037f1f0f924452463c751b0e54d3702f01f31d022ba3bb13ce2bb735e26d']
]);
for (const [filePath, expectedHash] of expectedHashes) {
  const actualHash = sha256(filePath);
  if (actualHash && actualHash !== expectedHash) failures.push(`hash mismatch for ${filePath}`);
}

if (existsSync(launchMetaAdV2)) {
  const probe = spawnSync('ffprobe', [
    '-v', 'error', '-show_entries',
    'format=duration:stream=index,codec_type,width,height,r_frame_rate,start_time,duration',
    '-of', 'json', launchMetaAdV2
  ], { encoding: 'utf8' });
  if (probe.status !== 0) {
    failures.push('V2 Meta ad ffprobe failed');
  } else {
    const media = JSON.parse(probe.stdout);
    const video = media.streams.find((stream) => stream.codec_type === 'video');
    const audio = media.streams.find((stream) => stream.codec_type === 'audio');
    if (video?.width !== 1080 || video?.height !== 1920 || video?.r_frame_rate !== '60/1') {
      failures.push('V2 Meta ad video contract mismatch');
    }
    if (video?.start_time !== '0.000000' || audio?.start_time !== '0.000000') {
      failures.push('V2 Meta ad A/V does not start at zero');
    }
    if (Math.abs(Number(media.format.duration) - 85.631) > 0.001) {
      failures.push(`V2 Meta ad duration mismatch: ${media.format.duration}`);
    }
    if (Math.abs(Number(audio?.duration) - Number(video?.duration)) > 0.015) {
      failures.push('V2 Meta ad A/V stream-length difference exceeds 15 ms');
    }
  }
}

for (const [source, expected, label] of [
  [markup, 'lang="sv"', 'Swedish language'],
  [markup, 'id="bridge-video"', 'video element'],
  [markup, 'data-media-status="local-review-candidate"', 'truthful local review status'],
  [markup, 'poster="/assets/ai-i-drift-video-poster.jpg"', 'authentic video poster'],
  [markup, 'src="/assets/video/ai-i-drift-sa-fungerar-det-v3.mp4"', '16:9 bridge video path'],
  [markup, 'src="/assets/video/ai-i-drift-sa-fungerar-det-v3.sv.vtt"', 'Swedish captions'],
  [markup, 'href="/ai-i-drift/kvalificering/"', 'focused qualification destination'],
  [markup, '/assets/meta-measurement.js', 'Meta measurement client'],
  [markup, "surface: 'lp_ai_i_drift_bridge'", 'PostHog bridge surface'],
  [markup, 'Är ni redo att låta AI-agenter börja arbeta?', 'bridge buyer headline'],
  [markup, 'Starta kartläggningen', 'bridge CTA'],
  [markup, 'Därefter väljer ni en tid för ett 20-minutersmöte.', 'concise bridge expectation'],
  [qualification, 'class="qualification-page"', 'dedicated qualification state'],
  [qualification, 'Steg 1 av 5', 'five-question progress'],
  [qualification, 'Vilket återkommande arbete vill ni helst att en agent ska kunna ta över?', 'first question'],
  [qualification, 'Vad blir konsekvensen idag när arbetet fastnar eller inte blir gjort?', 'consequence question'],
  [qualification, 'Var finns informationen som behövs för arbetet?', 'information question'],
  [qualification, '../script.js', 'shared qualification logic'],
  [preview, '/__review/meta-founder-ad.mp4', 'approved ad video in E2E preview'],
  [preview, '/assets/meta-founder-ad-poster.jpg', 'intentional ad poster'],
  [preview, '/ai-i-drift/kvalificering/', 'focused qualification in E2E navigator'],
  [previewServer, 'NordSym-AI-agenter-LAUNCH-V2.mp4', 'approved V2 launch derivative'],
  [metaAdV2SpokenSource, 'Excel-filer som ligger och samlar damm.', 'surviving pre-cut sentence'],
  [metaAdV2SpokenSource, 'Först behöver ni samla all information.', 'surviving post-cut sentence'],
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
  [markup, /Läs videons text|bridge-transcript/, 'bridge transcript surface'],
  [markup, /Gustav/, 'founder-name coupling'],
  [markup, /bridge-video-meta|48 sekunder/, 'redundant bridge metadata strip'],
  [markup, /Gör inte det här misstaget/, 'repeated ad argument'],
  [markup, /\b(?:email|company|notes|qualification_answers)\s*:/, 'PII field'],
  [script, /\b(?:email|company|notes|qualification_answers)\s*:/, 'PII field in tracking'],
  [script, /utm_term/, 'unused campaign term']
]) {
  if (pattern.test(source)) failures.push(`contains forbidden ${label}`);
}
if (/Inför mötet/.test(qualification)) {
  failures.push('focused qualification contains removed meeting label');
}
if ((qualification.match(/class="form-step/g) || []).length !== 5) {
  failures.push('focused qualification must contain exactly five primary questions');
}

if (/Och det är ofta här det faktiskt brister\./i.test(metaAdV2SpokenSource)) {
  failures.push('V2 spoken source still contains the founder-authorized cut sentence');
}

if (preview.includes('c02-forsta-agenten-1080x1350.png')) {
  failures.push('E2E preview still selects the retired static creative');
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
