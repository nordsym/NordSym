// Vercel Serverless Function: Agent Info / Capabilities Discovery
// Standard endpoint for AI agents to discover NordSym's capabilities

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Agent-readable capabilities manifest
  const capabilities = {
    "@context": "https://schema.org",
    "@type": "Organization",
    
    // Identity
    name: "NordSym AB",
    description: "AI Agent Infrastructure & Orchestration Platform - We build APIClaw, Hivr, and agent-native systems for AI-first companies",
    url: "https://nordsym.com",
    logo: "https://nordsym.com/NordSym%20Logga%20utan%20text.png",
    
    // Contact
    founder: {
      name: "Gustav Hemmingsson",
      email: "gustav@nordsym.com"
    },
    
    // Agent: Symbot
    agent: {
      name: "Symbot",
      type: "AI Assistant",
      status: "online",
      capabilities: ["consultation", "research", "demo-building", "automation"],
      contact_endpoint: "https://api.nordsym.com/contact"
    },
    
    // Services available via API
    services: [
      {
        id: "aeo-audit",
        name: "AEO/GEO Audit",
        description: "AI visibility analysis - how well does your company show up for AI assistants?",
        pricing: "free",
        endpoint: "https://api.nordsym.com/audit",
        method: "POST",
        turnaround: "24h"
      },
      {
        id: "demo-factory",
        name: "Demo Factory",
        description: "Symbot analyzes your company and builds a custom demo",
        pricing: "free",
        endpoint: "https://api.nordsym.com/demo-lead",
        method: "POST",
        turnaround: "24-48h"
      },
      {
        id: "consultation",
        name: "Strategy Consultation",
        description: "60 min session on AI strategy and automation",
        pricing: "paid",
        booking_url: "https://nordsym.github.io/NordSym-Scheduler/",
        turnaround: "book_available_slot"
      },
      {
        id: "contact-symbot",
        name: "Talk to Symbot",
        description: "Start a conversation with NordSym's AI agent",
        pricing: "free",
        endpoint: "https://api.nordsym.com/contact",
        method: "POST",
        turnaround: "instant"
      }
    ],
    
    // Products / Micro-Apps
    products: [
      {
        name: "Hivr",
        description: "AI Agent Marketplace - Hire AI agents for specific tasks",
        url: "https://hivr.online",
        status: "beta"
      },
      {
        name: "GenPRD",
        description: "AI-driven PRD Generator",
        url: "https://genprd.se",
        status: "live"
      },
      {
        name: "FlowVault",
        description: "n8n Workflow Marketplace",
        url: "https://flowvault.se",
        status: "live"
      },
      {
        name: "AI Search",
        description: "AEO/GEO Audit Platform",
        url: "https://aisearch.nordsym.com",
        status: "live"
      }
    ],
    
    // Technical info for agents
    api_version: "1.0.0",
    supported_formats: ["json"],
    rate_limit: "100 requests/hour",
    
    // Meta
    last_updated: new Date().toISOString(),
    agent_friendly: true
  };

  return res.status(200).json(capabilities);
}
