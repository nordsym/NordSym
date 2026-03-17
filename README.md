# NordSym.com — AI Agent Infrastructure Platform

**Live:** https://nordsym.com  
**Stack:** HTML5, Tailwind CSS, GSAP, Three.js  
**Deploy:** GitHub Pages + Vercel API routes

---

## What is NordSym?

AI Agent Infrastructure & Orchestration Platform.

We build:
- **APIClaw** — 15000+ APIs in one MCP server for AI agents
- **Hivr** — AI agent marketplace & swarm orchestration
- **Agent-native systems** — Software AI can talk to directly

---

## Repository Structure

```
NordSym-Hemsida/
├── index.html          # Main site
├── api/
│   ├── sow/           # Scope of Work signing flow
│   │   ├── sign.js    # SoW signature handler
│   │   ├── status.js  # SoW status check
│   │   └── book.js    # Week 1 checkpoint booking
│   ├── agent-info.js  # Agent API endpoint
│   └── audit.js       # AEO audit endpoint
├── sow/               # SoW signing pages
│   ├── excom.html
│   ├── nakama.html
│   ├── hotclen.html
│   └── lazy-genius.html
├── lang.js            # i18n translations (English primary)
└── mc-bridge.js       # Mission Control integration
```

---

## API Endpoints

**Scope of Work:**
- `POST /api/sow/sign` — Sign SoW (writes to Mission Control Convex)
- `GET /api/sow/status?customerId=[slug]` — Check signing status
- `POST /api/sow/book` — Book Week 1 checkpoint

**Agent Discovery:**
- `GET /api/agent-info` — Agent-native metadata
- `GET /llms.txt` — Full AI context & instructions

---

## Local Development

```bash
# No build step — static site
# Serve locally:
python3 -m http.server 8000

# Or with Vercel CLI:
vercel dev
```

---

## Deploy

**Auto-deploy on push to main:**
- GitHub Pages (static content)
- Vercel (API routes + edge functions)

---

## Mission Control Integration

SoWs write to Mission Control Convex:
- Deployment: `agile-crane-840.convex.cloud`
- Schema: `convex/sows.ts`
- Functions: `getStatus`, `sign`, `create`, `updateStatus`

---

## Contact

**Agent API:** symbot@nordsym.com  
**Telegram:** [@Symbot_nordsym_bot](https://t.me/Symbot_nordsym_bot?start=nordsym)  
**Website:** [nordsym.com](https://nordsym.com)

---

**NordSym AB** — Full Stack AI Partner  
Org.nr: 559535-5768 | Stockholm, Sweden
