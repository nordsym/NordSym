import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const root = process.cwd();
const read = (file) => readFileSync(join(root, file), 'utf8');
const parse = (file) => JSON.parse(read(file));
const sha256 = (file) => createHash('sha256').update(readFileSync(join(root, file))).digest('hex');

const canon = parse('systems.canon.json');
const visible = canon.visible_systems ?? [];

const publicFiles = [
  'index.html',
  'book/index.html',
  'llms.txt',
  'agents.md',
  'agents.json',
  'agent-info.json',
  'api/agent-info.js',
  'api/audit.js',
  'api/contact.js',
  '.well-known/ai-plugin.json',
  '.well-known/mcp',
  'systems.html',
  'systems.canon.json',
  'privacy.html',
  'sitemap.xml',
  'robots.txt',
  'openapi.json',
  'site.webmanifest'
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
  /gustav@nordsym\.com/i,
  /Agent Readiness/i,
  /Full[- ]Stack/i,
  /linkedin\.com\/company\/nordsym\//i
];

const publicStatusLabels = [
  /"status"\s*:/i,
  /status:\s*['"]/i,
  /\bIn production\b/i
];

const internalProductTerms = [
  /Mission Control/i,
  /Agent Atlas/i,
  /Symbot/i
];

const primaryDiscoveryFiles = [
  'llms.txt',
  'agents.md',
  'agents.json',
  'agent-info.json',
  '.well-known/ai-plugin.json'
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
  if (['agents.json', 'agent-info.json', 'api/agent-info.js'].includes(file)) {
    for (const pattern of publicStatusLabels) {
      if (pattern.test(body)) {
        fail(`${file} contains public status/lifecycle signal ${pattern}`);
      }
    }
  }
}

for (const file of primaryDiscoveryFiles) {
  const body = read(file);
  for (const pattern of internalProductTerms) {
    if (pattern.test(body)) {
      fail(`${file} exposes internal product term ${pattern}`);
    }
  }
}

for (const file of [
  'agents.json',
  'agent-info.json',
  '.well-known/ai-plugin.json',
  '.well-known/mcp',
  'openapi.json',
  'site.webmanifest',
  'systems.canon.json',
  'vercel.json'
]) {
  parse(file);
}

for (const file of ['index.html', 'book/index.html', 'systems.html']) {
  const body = read(file);
  const scripts = [...body.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (scripts.length === 0) {
    fail(`${file} has no JSON-LD`);
    continue;
  }
  for (const [, source] of scripts) {
    try {
      JSON.parse(source);
    } catch (error) {
      fail(`${file} has invalid JSON-LD: ${error.message}`);
    }
  }
}

const currentDiscoveryDate = canon.last_updated;
for (const file of ['agents.json', 'agent-info.json', '.well-known/mcp']) {
  if (parse(file).last_updated !== currentDiscoveryDate) {
    fail(`${file} last_updated does not match systems.canon.json`);
  }
}

if (parse('openapi.json').info?.version !== currentDiscoveryDate) {
  fail('openapi.json version does not match systems.canon.json');
}

if (!read('api/agent-info.js').includes(`last_updated: '${currentDiscoveryDate}'`)) {
  fail('api/agent-info.js last_updated does not match systems.canon.json');
}

const versionedLogo = 'https://nordsym.com/assets/brand/nordsym-social-logo-20260723.png';
for (const file of ['index.html', 'agent-info.json', 'api/agent-info.js', '.well-known/ai-plugin.json']) {
  if (!read(file).includes(versionedLogo)) {
    fail(`${file} does not use the current cache-busted logo URL`);
  }
}

const vercel = parse('vercel.json');
const redirects = JSON.stringify(vercel.redirects ?? []);
const rewrites = JSON.stringify(vercel.rewrites ?? []);
if (!redirects.includes('www.nordsym.com') || !redirects.includes('api.nordsym.com')) {
  fail('vercel.json does not canonicalize both www and api hosts');
}
for (const path of [
  '/apple-touch-icon.png',
  '/logo.png',
  '/logo.svg',
  '/nordsym-logo-transparent.png',
  '/NordSym Logga utan text.png',
  '/assets/brand/nordsym-social-logo-20260723.png',
  '/assets/og/nordsym-og-20260723.png',
  '/manifest.json'
]) {
  if (!rewrites.includes(path)) {
    fail(`vercel.json is missing identity fallback ${path}`);
  }
}

const vercelIgnore = read('.vercelignore');
for (const path of [
  'output/',
  'assets/brand/archive/',
  'assets/brand/nordsym-logo-manifest.md',
  'img/',
  'README.md',
  'book.html',
  'mc-bridge.js',
  'schematic.js',
  'scripts/',
  'styles.css'
]) {
  if (!vercelIgnore.includes(path)) {
    fail(`.vercelignore does not exclude ${path}`);
  }
}

for (const file of ['api/contact.js', 'api/audit.js']) {
  const body = read(file);
  if (!body.includes('status(410)') || body.includes('fetch(') || body.includes('process.env')) {
    fail(`${file} is not a non-operational retired endpoint`);
  }
}

if (sha256('NordSym Logga utan text.png') !== sha256('assets/brand/nordsym-social-logo.png')) {
  fail('historical root logo filename does not resolve to the current social logo bytes');
}

const systemNames = visible.map((system) => system.name).sort().join('|');
const agentInfo = parse('agent-info.json');
if (agentInfo.systems && JSON.stringify(agentInfo.systems) !== JSON.stringify(visible)) {
  fail('agent-info.json has its own systems list instead of systems_source');
}

const apiAgentInfo = read('api/agent-info.js');
for (const system of visible) {
  if (!apiAgentInfo.includes(system.name) && !apiAgentInfo.includes('systemsCanon.visible_systems')) {
    fail(`api/agent-info.js does not derive ${system.name} from systems.canon.json`);
  }
}

if (!systemNames.includes('APIClaw') || !systemNames.includes('CleanBuddy')) {
  fail('systems.canon.json is missing expected visible systems');
}

console.log(`systems-boundary: ok (${visible.length} visible systems, ${publicFiles.length} public files checked)`);
