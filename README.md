# 🏠 Real Estate AI Voice Agent — Powered by Retell AI

A fully functional AI voice agent for real estate, built with **Retell AI**, **GPT-4o**, and **Node.js**. Users can have a live, two-way voice conversation directly from the browser — no phone number required.

![Agent UI](https://img.shields.io/badge/Status-Live-22C55E?style=flat-square) ![Retell AI](https://img.shields.io/badge/Retell_AI-Integrated-C9A84C?style=flat-square) ![GPT-4o](https://img.shields.io/badge/LLM-GPT--4o-412991?style=flat-square) ![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=flat-square)

---

## 🎯 What This Does

- **Browser-based voice call** — click a button and talk to the AI agent instantly
- **Real estate–trained AI** — the agent (named "Aria") answers property questions, qualifies buyers, discusses pricing, and books tours
- **Live transcript** — the conversation is transcribed word-by-word in real time
- **Secure token flow** — API keys stay on the server; the frontend never sees them
- **One-command agent creation** — runs a setup script that calls the Retell API and creates the LLM + agent automatically

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| AI Voice Platform | [Retell AI](https://retellai.com) |
| Language Model | GPT-4o (via Retell) |
| Voice Synthesis | ElevenLabs (via Retell) |
| Backend | Node.js + Express |
| Frontend | Vanilla HTML/CSS/JS |
| SDK | `retell-sdk` (server) + `retell-client-js-sdk` (browser) |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/retell-real-estate-agent.git
cd retell-real-estate-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and add your Retell API key:

```env
RETELL_API_KEY=key_xxxxxxxxxxxxxxxxxxxx
RETELL_AGENT_ID=          # leave blank for now
PORT=3000
```

> Get your API key from [dashboard.retellai.com](https://dashboard.retellai.com) → Settings → API Keys

### 4. Create the agent (run once)

```bash
npm run setup
```

This automatically:
- Creates a Retell LLM configured with a real estate system prompt
- Creates an agent ("Aria") with a natural-sounding voice
- Prints the `agent_id` — paste it into your `.env`

### 5. Start the server

```bash
npm run dev
```

Open **http://localhost:3000** and click **Start Call** 🎙

---

## 📁 Project Structure

```
├── server.js          # Express backend — serves frontend & creates call tokens
├── setup-agent.js     # One-time script to create the Retell LLM + Agent via API
├── index.html         # Frontend UI — call button, visualizer, live transcript
├── .env.example       # Environment variable template
└── package.json
```

---

## 🔐 How the Web Call Works

```
Browser                    Server (Express)           Retell AI
  │                              │                        │
  │── POST /create-web-call ────>│                        │
  │                              │── createWebCall() ────>│
  │                              │<── { access_token } ───│
  │<── { access_token } ─────────│                        │
  │                              │                        │
  │── retellClient.startCall(access_token) ──────────────>│
  │<══════════ Live Audio Stream (WebRTC) ════════════════>│
```

The access token expires in **30 seconds** — it is fetched fresh every time a call starts.

---

## 🤖 Agent Personality & Capabilities

The agent is prompted as **Aria**, a professional real estate AI assistant that can:

- Answer questions about listings, pricing, and neighborhoods
- Explain the buying/selling process
- Discuss mortgage basics and affordability
- Qualify leads (budget, timeline, preferences)
- Schedule property tours
- Provide market insights

The prompt is fully editable in [`setup-agent.js`](./setup-agent.js).

---

## 📝 License

MIT — free to use, modify, and deploy.

---

*Built with [Retell AI](https://retellai.com)*
