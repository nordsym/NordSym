# NordSym.com

**Live:** https://nordsym.com  
**Positioning:** The operating layer between your stack and the agents that run it.  
**Stack:** Static HTML, Vercel routes, machine-readable discovery files.

## What this repository is

NordSym.com is the public positioning, proof, and intake surface for NordSym AB.

NordSym designs, builds, and operates governed agent infrastructure inside existing business stacks. The site explains the operating-layer model, exposes the public systems boundary, and routes qualified conversations to `/book/`.

## Public boundary

The public systems boundary is maintained in:

- `systems.canon.json`
- `systems.html`

Public discovery surfaces must derive from that boundary:

- `llms.txt`
- `agents.md`
- `agents.json`
- `agent-info.json`
- `/api/agent-info`
- `openapi.json`
- `.well-known/ai-plugin.json`
- `.well-known/mcp`

Internal operating surfaces, client-specific systems, private agreement routes, internal agent rosters, and Mission Control URLs are not public NordSym.com content.

## Current deploy model

Production is deployed from Vercel. GitHub Pages is not the authority.

Before deployment:

```bash
npm run validate:systems
```

## Local development

```bash
python3 -m http.server 8000
```

or:

```bash
vercel dev
```

## Public discovery endpoints

- `/llms.txt`
- `/agents.md`
- `/agents.txt`
- `/agents.json`
- `/agent-info`
- `/agent-info.json`
- `/systems`
- `/systems.canon.json`
- `/openapi.json`
- `/.well-known/ai-plugin.json`
- `/.well-known/mcp`

## Contact

**Email:** contact@nordsym.com  
**Website:** https://nordsym.com  

NordSym AB, 559535-5768.
