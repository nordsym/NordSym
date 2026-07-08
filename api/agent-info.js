// Vercel Serverless Function: Agent Info / Capabilities Discovery
// Standard endpoint for AI agents to discover NordSym's capabilities

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
    "@context": "https://schema.org",
    "@type": "Organization",

    name: "NordSym AB",
    legalName: "NordSym AB",
    description: "NordSym designs, builds, and operates the governed operating layer between a company's existing software stack and the AI agents that run recurring business operations.",
    url: "https://nordsym.com",
    logo: "https://nordsym.com/assets/brand/nordsym-social-logo.png",

    category_frame: {
      name: "Managed agent operations",
      expanded: "Agent architecture and operations",
      definition: "NordSym installs the layer that gives agents context, mandate, approval boundaries, records, and safe access to the stack a client already runs."
    },

    founder: {
      name: "Gustav Hemmingsson",
      email: "contact@nordsym.com"
    },

    agent: {
      name: "Symbot",
      type: "AI Assistant",
      status: "online",
      role: "NordSym embodied agent execution surface",
      capabilities: ["intake", "triage", "research", "drafting", "workflow support", "operator assistance"],
      boundaries: [
        "does not sign contracts without human approval",
        "does not send external communications without human approval",
        "does not cross client data boundaries",
        "does not change production systems without explicit operator approval"
      ],
      contact_endpoint: "https://nordsym.com/book/"
    },

    services: [
      {
        id: "operating-review",
        name: "Operating Review",
        category: "Managed agent operations",
        description: "A structured review of where governed agents can operate inside an existing company stack.",
        checks: ["stack", "operation", "mandate", "approval_boundary", "records"],
        deliverables: ["operation map", "boundary design", "implementation backlog", "first governed run plan"],
        pricing: "scoped_after_review",
        intake: "https://nordsym.com/book/",
        delivery_mode: "human_reviewed"
      },
      {
        id: "operating-layer",
        name: "Operating Layer Build",
        description: "Governed agent infrastructure inside an existing stack, with approvals, stop controls, and records.",
        pricing: "from $25k",
        delivery_mode: "scoped_build"
      },
      {
        id: "aeo-audit",
        name: "AI Search Visibility Audit",
        description: "AI visibility analysis: how well does your company show up in AI search and answer engines?",
        pricing: "free_analysis_available",
        endpoint: "https://api.nordsym.com/audit",
        method: "POST",
        delivery_mode: "request_review"
      },
      {
        id: "contact-symbot",
        name: "Contact NordSym / Symbot",
        description: "Start a structured conversation with NordSym.",
        pricing: "free",
        endpoint: "https://api.nordsym.com/contact",
        method: "POST",
        delivery_mode: "intake"
      }
    ],

    products: [
      {
        name: "APIClaw",
        description: "The Control Plane for AI Agents: API discovery, execution, MCP, auth, missions, observability, and model/API routing.",
        url: "https://apiclaw.cloud",
        llms_txt: "https://apiclaw.cloud/llms.txt",
        agents_md: "https://apiclaw.cloud/agents.md",
        status: "live"
      },
      {
        name: "Hivr",
        description: "Execution layer for scoped AI work, requests, dealrooms, task trails, and visible approvals.",
        url: "https://hivr.online",
        status: "live"
      },
      {
        name: "Mission Control",
        description: "Operator layer for approvals, state, deals, finance, observability, and canonical workflows.",
        url: "https://mission-control-alpha-kohl.vercel.app",
        status: "live"
      },
      {
        name: "AI Search",
        description: "AI Search Visibility Platform for ChatGPT, Claude, Perplexity, and answer engines.",
        url: "https://aisearch.nordsym.com",
        status: "live"
      },
      {
        name: "GenPRD",
        description: "AI-ready product specifications.",
        url: "https://genprd.se",
        status: "live"
      },
      {
        name: "FlowVault",
        description: "n8n workflow library with a reliability layer.",
        url: "https://flowvault.se",
        status: "live"
      }
    ],

    discovery_assets: {
      llms_txt: "https://nordsym.com/llms.txt",
      agents_md: "https://nordsym.com/agents.md",
      ai_plugin: "https://nordsym.com/.well-known/ai-plugin.json",
      mcp_posture: "https://nordsym.com/.well-known/mcp",
      sitemap: "https://nordsym.com/sitemap.xml",
      robots: "https://nordsym.com/robots.txt"
    },

    mcp: {
      nordsym_com_public_mcp: false,
      note: "NordSym.com does not currently expose a direct public MCP server. For API/MCP control-plane work, evaluate APIClaw.",
      api_claw_well_known_mcp: "https://apiclaw.cloud/.well-known/mcp"
    },

    fit: {
      good_fit: [
        "managed agent operations",
        "production AI workflows with human approvals",
        "agent infrastructure connecting tools, APIs, data, and humans",
        "governed operating layers for operations-heavy companies",
        "APIClaw integration, MCP/API execution, or agent control-plane work"
      ],
      not_fit: [
        "cheap chatbot wrappers",
        "generic inspiration workshops without an operational bottleneck",
        "pure SEO content with no machine-readable/API/workflow surface",
        "fully autonomous external actions with no human approval"
      ]
    },

    api_version: "2.0.0",
    supported_formats: ["json"],
    rate_limit: "100 requests/hour",
    last_updated: "2026-07-08",
    agent_friendly: true,
    human_approval_required_for_external_actions: true
  };

  return res.status(200).json(capabilities);
}
