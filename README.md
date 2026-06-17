# 🏠 Real Estate AI Voice Agent — Powered by Retell AI

A fully functional AI voice agent for real estate, built with **Retell AI**, **GPT-4o**, and **Node.js**. Users can have a live, two-way voice conversation directly from the browser — no phone number required.

![CI](https://github.com/Shifu34/retell-real-estate-agent/actions/workflows/ci.yml/badge.svg)
![Node](https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Retell AI](https://img.shields.io/badge/Retell_AI-Integrated-C9A84C?style=flat-square)
![GPT-4o](https://img.shields.io/badge/LLM-GPT--4o-412991?style=flat-square)

---

## 🎯 What This Does

- **Browser-based voice call** — click a button (or press Space) and talk to the AI agent instantly via WebRTC
- **Real estate–trained AI** — the agent ("Aria") answers property questions, qualifies buyers, discusses pricing, and books tours
- **Live real-time transcript** — conversation is transcribed word-by-word as you speak
- **Call history & stats** — every call is logged; view totals, average duration, and per-call transcripts
- **Webhook integration** — Retell posts call lifecycle events (started, ended, analyzed) to your server
- **Secure token flow** — API keys stay on the server; the frontend only ever gets a short-lived 30-second token
- **One-command setup** — `npm run setup` hits the Retell API and creates the LLM + agent automatically

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| AI Voice Platform | [Retell AI](https://retellai.com) |
| Language Model | GPT-4o (via Retell) |
| Voice Synthesis | ElevenLabs (via Retell) |
| Backend | Node.js 20 + Express |
| Frontend | Vanilla HTML / CSS / JS (no framework) |
| Server SDK | `retell-sdk` |
| Browser SDK | `retell-client-js-sdk` (loaded from CDN) |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
retell-real-estate-agent/
├── server.js              # Express server — entry point
├── setup-agent.js         # One-time Retell agent creation script
├── index.html             # Frontend — call button, visualizer, transcript
│
├── config/
│   └── agent.js           # Agent name, voice, model, system prompt
│
├── routes/
│   ├── webhook.js         # POST /webhook — Retell call lifecycle events
│   └── calls.js           # GET /calls — call history REST API
│
├── utils/
│   ├── callLogger.js      # Read/write logs/calls.json
│   └── validateEnv.js     # Startup env var validation
│
├── .github/
│   └── workflows/
│       └── ci.yml         # GitHub Actions CI pipeline
│
├── .env.example           # Environment variable template
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Shifu34/retell-real-estate-agent.git
cd retell-real-estate-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
RETELL_API_KEY=key_xxxxxxxxxxxxxxxxxxxx   # from dashboard.retellai.com → Settings → API Keys
RETELL_AGENT_ID=                          # leave blank for now
PORT=3000
```

### 4. Create the agent (run once)

```bash
npm run setup
```

This calls the Retell API to create:
- A **Retell LLM** configured with the real estate system prompt from `config/agent.js`
- An **Agent** ("Aria") with ElevenLabs voice and GPT-4o

Copy the printed `RETELL_AGENT_ID` into your `.env`.

### 5. Start the server

```bash
npm run dev
```

Open **http://localhost:3000** — click **Start Call** or press **Space** 🎙

---

## 🔐 Architecture — How the Web Call Works

```
Browser (index.html)              Server (Express)              Retell AI
        │                               │                           │
        │─── POST /create-web-call ────>│                           │
        │                               │── createWebCall(agentId) >│
        │                               │<── { access_token }  ─────│
        │<── { access_token } ──────────│                           │
        │                               │                           │
        │── retellClient.startCall(token) ─────────────────────────>│
        │<════════════ Live Audio (WebRTC) ════════════════════════>│
        │<──── update events (transcript, turntaking) ─────────────│
        │                               │                           │
        │                               │<─ POST /webhook (events) ─│
        │                               │   (call_started,          │
        │                               │    call_ended,            │
        │                               │    call_analyzed)         │
```

> The `access_token` expires in **30 seconds**. A new one is fetched on every call start.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/create-web-call` | Generate a Retell access token for a browser call |
| `GET` | `/agent-info` | Returns agent name, role, model, voice, and ID |
| `GET` | `/stats` | Quick call stats (total, avg duration, last call) |
| `GET` | `/calls` | All call log entries (supports `?limit` and `?event` filters) |
| `GET` | `/calls/stats` | Detailed call statistics |
| `GET` | `/calls/:callId` | All log entries for a specific call |
| `POST` | `/webhook` | Retell webhook receiver (configure in dashboard) |

---

## 🤖 Customising the Agent

All agent settings live in [`config/agent.js`](./config/agent.js):

```js
export const AGENT_CONFIG = {
  name: 'Aria',
  voice_id: '11labs-Adrian',   // change voice here
  model: 'gpt-4o',             // change LLM here
  system_prompt: `...`,        // edit the full personality & instructions here
};
```

After changing the config, re-run `npm run setup` to create a new agent with the updated settings.

---

## 📊 Useful npm Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start server with hot-reload |
| `npm run setup` | Create Retell LLM + Agent via API |
| `npm run logs` | Print call history JSON |
| `npm run logs:clear` | Reset call log file |
| `npm run validate` | Check env vars without starting server |

---

## 📝 License

MIT — free to use, modify, and deploy.

---

*Built with [Retell AI](https://retellai.com) · [github.com/Shifu34/retell-real-estate-agent](https://github.com/Shifu34/retell-real-estate-agent)*
