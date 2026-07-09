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
  '.well-known/mcp',
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
  /gustav@nordsym\.com/i,
  /Agent Readiness/i,
  /Full[- ]Stack/i
];

const publicStatusLabels = [
  /"status"\s*:/i,
  /status:\s*['"]/i,
  /\bIn production\b/i
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

for (const file of ['agents.json', 'agent-info.json', '.well-known/ai-plugin.json', 'openapi.json', 'systems.canon.json']) {
  parse(file);
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
