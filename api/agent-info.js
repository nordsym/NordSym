// Vercel Serverless Function: public agent-readable NordSym metadata.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function readSystemsCanon() {
  try {
    const raw = readFileSync(join(process.cwd(), 'systems.canon.json'), 'utf8');
    return JSON.parse(raw);
  } catch {
    return {
      visible_systems: [],
      public_boundary: 'NordSym deliberately separates public proof systems from private operating surfaces.'
    };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const systemsCanon = readSystemsCanon();

  return res.status(200).json({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NordSym AB',
    legalName: 'NordSym AB',
    description:
      "NordSym designs, builds, and operates the governed operating layer between a company's existing software stack and the AI agents that run recurring business operations.",
    url: 'https://nordsym.com',
    logo: 'https://nordsym.com/assets/brand/nordsym-social-logo.png',
    founder: {
      name: 'Gustav Hemmingsson',
      email: 'contact@nordsym.com'
    },
    category_frame: {
      name: 'Agent architecture and operations',
      definition:
        'NordSym installs the layer that gives agents context, mandate, approval boundaries, records, and safe access to the stack a client already runs.'
    },
    agent_policy: {
      type: 'AI-assisted operating layer',
      identity: 'NordSym is openly agent-operated. Agents do not pretend to be human.',
      approval:
        'External actions require human approval unless a written mandate explicitly allows them.',
      client_boundary: 'Client data never crosses client boundaries.',
      records: 'Externally visible work should be attributable to a mandate, approval, and record.',
      capabilities: [
        'intake',
        'triage',
        'research',
        'drafting',
        'workflow support',
        'operator assistance'
      ],
      contact_endpoint: 'https://nordsym.com/book/'
    },
    services: [
      {
        id: 'operating-review',
        name: 'Operating Review',
        description:
          'A structured review of where governed agents can operate inside an existing company stack.',
        url: 'https://nordsym.com/book/',
        intake: 'https://nordsym.com/book/'
      },
      {
        id: 'operating-layer',
        name: 'Operating Layer Build',
        description:
          'Governed agent infrastructure inside an existing stack, with approvals, stop controls, and records.',
        url: 'https://nordsym.com/#layer'
      }
    ],
    systems_source: 'https://nordsym.com/systems.canon.json',
    visible_systems: systemsCanon.visible_systems ?? [],
    public_boundary: systemsCanon.public_boundary,
    internal_boundary: systemsCanon.internal_boundary,
    discovery_assets: {
      llms_txt: 'https://nordsym.com/llms.txt',
      agents_md: 'https://nordsym.com/agents.md',
      agents_txt: 'https://nordsym.com/agents.txt',
      agents_json: 'https://nordsym.com/agents.json',
      ai_plugin: 'https://nordsym.com/.well-known/ai-plugin.json',
      mcp_posture: 'https://nordsym.com/.well-known/mcp',
      systems: 'https://nordsym.com/systems',
      systems_canon: 'https://nordsym.com/systems.canon.json',
      openapi: 'https://nordsym.com/openapi.json',
      sitemap: 'https://nordsym.com/sitemap.xml',
      robots: 'https://nordsym.com/robots.txt'
    },
    mcp: {
      nordsym_com_public_mcp: false,
      note:
        'NordSym.com does not currently expose a direct public MCP server. For API/MCP gateway work, evaluate APIClaw.',
      api_claw_well_known_mcp: 'https://apiclaw.cloud/.well-known/mcp'
    },
    agent_friendly: true,
    human_approval_required_for_external_actions: true,
    last_updated: '2026-07-09'
  });
}
