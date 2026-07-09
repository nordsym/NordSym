import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const parse = (file) => JSON.parse(read(file));

const canon = parse('systems.canon.json');
const visible = canon.visible_systems ?? [];

const publicFiles = [
  'llms.txt',
  'agents.md',
  'agents.json',
  'agent-info.json',
  'api/agent-info.js',
  '.well-known/ai-plugin.json',
  'systems.html',
  'systems.canon.json',
  'privacy.html',
  'sitemap.xml',
  'robots.txt',
  'openapi.json'
];

const banned = [
  /Full Stack AI Partner/i,
  /\bMEO\b/i,
  /Machine Experience Optimization/i,
  /\bHivr\b/i,
  /Agent Readiness Audit/i,
  /\bKeystone\b/i,
  /Deal Room/i,
  /dealroom/i,
  /api\.nordsym\.com/i,
  /gustav@nordsym\.com/i
];

function fail(message) {
  console.error(`systems-boundary: ${message}`);
  process.exitCode = 1;
}

if (visible.length > 8) {
  fail(`visible systems count is ${visible.length}, expected max 8`);
}

for (const system of visible) {
  if ('status' in system) {
    fail(`${system.name} exposes a status field in systems.canon.json`);
  }
  if (system.id === 'agent-badge' && system.url) {
    fail('Agent Badge must not expose a public URL until a verification surface is deliberately public');
  }
}

for (const file of publicFiles) {
  const body = read(file);
  for (const pattern of banned) {
    if (pattern.test(body)) {
      fail(`${file} contains banned public-boundary term ${pattern}`);
    }
  }
}

for (const file of ['agents.json', 'agent-info.json', '.well-known/ai-plugin.json', 'openapi.json', 'systems.canon.json']) {
  parse(file);
}

console.log(`systems-boundary: ok (${visible.length} visible systems, ${publicFiles.length} public files checked)`);
