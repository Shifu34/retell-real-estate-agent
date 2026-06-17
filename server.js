/**
 * server.js — Express backend
 * Serves the frontend and provides:
 *   POST /create-web-call  — generates a Retell access token
 *   POST /webhook          — receives Retell call lifecycle events
 *   GET  /agent-info       — returns the configured agent metadata
 *   GET  /stats            — returns call history stats
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Retell from 'retell-sdk';
import webhookRouter from './routes/webhook.js';
import callsRouter from './routes/calls.js';
import { getCallStats } from './utils/callLogger.js';
import { AGENT_CONFIG } from './config/agent.js';
import { validateEnv } from './utils/validateEnv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ── Validate env ──────────────────────────────────────────────────────────────
validateEnv();

// ── Init Retell client ────────────────────────────────────────────────────────
const retell = new Retell({ apiKey: process.env.RETELL_API_KEY });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Simple request logger
app.use((req, _res, next) => {
  if (req.path !== '/favicon.ico') {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Serve static frontend files
app.use(express.static(__dirname));

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * POST /create-web-call
 * Generates a short-lived Retell access token for a browser call.
 * The token expires in 30 seconds — call must start immediately.
 */
app.post('/create-web-call', async (req, res) => {
  try {
    const agentId = req.body.agent_id || process.env.RETELL_AGENT_ID;

    const webCall = await retell.call.createWebCall({ agent_id: agentId });

    console.log(`     ✅ Web call token issued — call_id: ${webCall.call_id}`);
    res.json({ access_token: webCall.access_token });

  } catch (err) {
    const status = err?.status || 500;
    const message = err?.message || 'Failed to create web call';
    console.error(`     ❌ createWebCall error [${status}]:`, message);
    res.status(status).json({ error: message, status });
  }
});

/**
 * GET /agent-info
 * Returns agent metadata for the frontend display.
 */
app.get('/agent-info', (_req, res) => {
  res.json({
    agent_id: process.env.RETELL_AGENT_ID,
    name: AGENT_CONFIG.name,
    role: AGENT_CONFIG.role,
    voice_id: AGENT_CONFIG.voice_id,
    model: AGENT_CONFIG.model,
  });
});

/**
 * GET /stats
 * Quick stats shortcut (delegates to /calls/stats internally).
 */
app.get('/stats', async (_req, res) => {
  try {
    const stats = await getCallStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * /calls — full call history REST API
 */
app.use('/calls', callsRouter);

/**
 * POST /webhook
 * Receives Retell call lifecycle events.
 * Configure this URL in the Retell dashboard under your agent settings.
 */
app.use('/webhook', webhookRouter);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n' + '═'.repeat(50));
  console.log(`  🎙  Retell Real Estate Agent`);
  console.log('═'.repeat(50));
  console.log(`  Server:    http://localhost:${PORT}`);
  console.log(`  Agent:     ${AGENT_CONFIG.name} (${AGENT_CONFIG.role})`);
  console.log(`  Agent ID:  ${process.env.RETELL_AGENT_ID}`);
  console.log(`  Model:     ${AGENT_CONFIG.model}`);
  console.log(`  Voice:     ${AGENT_CONFIG.voice_id}`);
  console.log('═'.repeat(50) + '\n');
});
