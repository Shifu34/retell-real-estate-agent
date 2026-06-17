/**
 * server.js — Express backend
 * Serves the frontend and provides the /create-web-call endpoint
 * that generates a short-lived access token for Retell web calls.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Retell from 'retell-sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ── Validate env ─────────────────────────────────────────────────────────────
if (!process.env.RETELL_API_KEY || process.env.RETELL_API_KEY === 'your_retell_api_key_here') {
  console.error('\n❌  RETELL_API_KEY missing. Copy .env.example → .env and fill it in.\n');
  process.exit(1);
}
if (!process.env.RETELL_AGENT_ID || process.env.RETELL_AGENT_ID === 'your_agent_id_here') {
  console.error('\n❌  RETELL_AGENT_ID missing. Run `npm run setup` first to create your agent.\n');
  process.exit(1);
}

// ── Init Retell client ────────────────────────────────────────────────────────
const retell = new Retell({ apiKey: process.env.RETELL_API_KEY });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));   // Serves index.html, etc.

// ── POST /create-web-call ─────────────────────────────────────────────────────
// Frontend hits this to get a 30-second access token, then starts the call.
app.post('/create-web-call', async (req, res) => {
  try {
    const agentId = req.body.agent_id || process.env.RETELL_AGENT_ID;

    const webCall = await retell.call.createWebCall({ agent_id: agentId });

    console.log(`[${new Date().toLocaleTimeString()}] 📞 Web call created — call_id: ${webCall.call_id}`);
    res.json({ access_token: webCall.access_token });

  } catch (err) {
    console.error('Error creating web call:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Failed to create web call' });
  }
});

// ── GET /agent-info ───────────────────────────────────────────────────────────
// Returns the current agent_id so the frontend can display it.
app.get('/agent-info', (req, res) => {
  res.json({ agent_id: process.env.RETELL_AGENT_ID });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n' + '═'.repeat(48));
  console.log(`  🎙  Retell Real Estate Agent`);
  console.log('═'.repeat(48));
  console.log(`  Server:    http://localhost:${PORT}`);
  console.log(`  Agent ID:  ${process.env.RETELL_AGENT_ID}`);
  console.log('═'.repeat(48) + '\n');
});
