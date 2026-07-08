// Vercel Serverless Function: public agent-readable NordSym metadata.

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

  const capabilities = {
    '@context': 'https://schema.org',
    '@type': 'Organization',

    name: 'NordSym AB',
    legalName: 'NordSym AB',
    description: "NordSym designs, builds, and operates the governed operating layer between a company's existing software stack and the AI agents that run recurring business operations.",
    url: 'https://nordsym.com',
    logo: 'https://nordsym.com/assets/brand/nordsym-social-logo.png',

    category_frame: {
      name: 'Agent architecture and operations',
      definition: 'NordSym installs the layer that gives agents context, mandate, approval boundaries, records, and safe access to the stack a client already runs.'
    },

    founder: {
      name: 'Gustav Hemmingsson',
      email: 'contact@nordsym.com'
    },

    agent: {
      name: 'Symbot',
      type: 'AI Assistant',
      status: 'online',
      role: 'NordSym embodied agent execution surface',
      capabilities: ['intake', 'triage', 'research', 'drafting', 'workflow support', 'operator assistance'],
      boundaries: [
        'does not sign contracts without human approval',
        'does not send external communications without human approval',
        'does not cross client data boundaries',
        'does not change production systems without explicit operator approval'
      ],
      contact_endpoint: 'https://nordsym.com/book/'
    },

    services: [
      {
        id: 'operating-review',
        name: 'Operating Review',
        category: 'Agent architecture and operations',
        description: 'A structured review of where governed agents can operate inside an existing company stack.',
        checks: ['stack', 'operation', 'mandate', 'approval_boundary', 'records'],
        deliverables: ['operation map', 'boundary design', 'implementation backlog', 'first governed run plan'],
        pricing: 'scoped_after_review',
        intake: 'https://nordsym.com/book/',
        delivery_mode: 'human_reviewed'
      },
      {
        id: 'operating-layer',
        name: 'Operating Layer Build',
        description: 'Governed agent infrastructure inside an existing stack, with approvals, stop controls, and records.',
        delivery_mode: 'scoped_build'
      }
    ],

    systems: [
      {
        id: 'apiclaw',
        name: 'APIClaw',
        tier: 'T1',
        status: 'Operating',
        url: 'https://apiclaw.cloud',
        description: 'API and provider gateway for agents.'
      },
      {
        id: 'agent-badge',
        name: 'Agent Badge',
        tier: 'T2',
        status: 'In production',
        url: null,
        description: 'Identity and receipts for agent work. The current operator surface lives inside Mission Control.'
      },
      {
        id: 'skillsync',
        name: 'skillsync',
        tier: 'T2',
        status: 'Available',
        url: 'https://github.com/nordsym/skillsync',
        description: 'Open-source skill distribution across runtimes.'
      },
      {
        id: 'ai-search',
        name: 'AI Search',
        tier: 'T1',
        status: 'Available',
        url: 'https://aisearch.nordsym.com',
        description: 'Checks how AI systems find, read, and cite a company.'
      },
      {
        id: 'genprd',
        name: 'GenPRD',
        tier: 'T1',
        status: 'Available',
        url: 'https://genprd.se',
        description: 'Turns a product idea into a build-ready product requirements document.'
      },
      {
        id: 'flowvault',
        name: 'FlowVault',
        tier: 'T1',
        status: 'Available',
        url: 'https://flowvault.se',
        description: 'Workflow library and reliability layer for n8n operations.'
      },
      {
        id: 'cleanbuddy',
        name: 'CleanBuddy',
        tier: 'T3',
        status: 'In production',
        url: 'https://cleanbuddy.ai',
        description: 'Operations surface for cleaning companies, built and operated by NordSym for a venture company.'
      }
    ],

    internal_systems: [
      {
        name: 'Mission Control',
        treatment: 'internal',
        description: 'NordSym internal operating surface for approvals, records, and agent state.'
      },
      {
        name: 'Agent Atlas',
        treatment: 'internal',
        description: 'NordSym internal canon for agents, runtimes, schedules, and stop controls.'
      }
    ],

    discovery_assets: {
      llms_txt: 'https://nordsym.com/llms.txt',
      agents_md: 'https://nordsym.com/agents.md',
      agents_json: 'https://nordsym.com/agents.json',
      ai_plugin: 'https://nordsym.com/.well-known/ai-plugin.json',
      mcp_posture: 'https://nordsym.com/.well-known/mcp',
      systems: 'https://nordsym.com/systems',
      openapi: 'https://nordsym.com/openapi.json',
      sitemap: 'https://nordsym.com/sitemap.xml',
      robots: 'https://nordsym.com/robots.txt'
    },

    mcp: {
      nordsym_com_public_mcp: false,
      note: 'NordSym.com does not currently expose a direct public MCP server. For API/MCP gateway work, evaluate APIClaw.',
      api_claw_well_known_mcp: 'https://apiclaw.cloud/.well-known/mcp'
    },

    fit: {
      good_fit: [
        'managed agent operations',
        'production AI workflows with human approvals',
        'agent infrastructure connecting tools, APIs, data, and humans',
        'governed operating layers for operations-heavy companies',
        'APIClaw integration, MCP/API execution, or provider gateway work'
      ],
      not_fit: [
        'cheap chatbot wrappers',
        'generic inspiration workshops without an operational bottleneck',
        'pure SEO content with no machine-readable/API/workflow surface',
        'fully autonomous external actions with no human approval'
      ]
    },

    api_version: '3.0.0',
    supported_formats: ['json'],
    rate_limit: '100 requests/hour',
    last_updated: '2026-07-08',
    agent_friendly: true,
    human_approval_required_for_external_actions: true
  };

  return res.status(200).json(capabilities);
}
