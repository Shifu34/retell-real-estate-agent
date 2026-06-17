/**
 * routes/webhook.js
 * Handles Retell AI webhook events (call_started, call_ended, transcript updates).
 *
 * To enable webhooks:
 * 1. Go to dashboard.retellai.com → Agents → your agent → Webhook URL
 * 2. Set it to: https://your-server.com/webhook
 * 3. Retell will POST events here throughout each call
 */

import { Router } from 'express';
import { appendCallLog } from '../utils/callLogger.js';

const router = Router();

/**
 * POST /webhook
 * Retell sends events here: call_started, call_analyzed, call_ended
 */
router.post('/', async (req, res) => {
  const event = req.body;
  const eventType = event?.event;
  const callId = event?.data?.call_id || event?.call_id || 'unknown';

  // Acknowledge quickly — Retell expects a fast 200 response
  res.sendStatus(200);

  // Process asynchronously after responding
  try {
    switch (eventType) {

      case 'call_started':
        console.log(`[Webhook] 📞 Call started — ${callId}`);
        await appendCallLog({
          event: 'call_started',
          call_id: callId,
          timestamp: new Date().toISOString(),
        });
        break;

      case 'call_ended':
        console.log(`[Webhook] 📵 Call ended — ${callId}`);
        console.log(`          Duration: ${event?.data?.duration_ms ?? '?'}ms`);
        await appendCallLog({
          event: 'call_ended',
          call_id: callId,
          duration_ms: event?.data?.duration_ms,
          end_reason: event?.data?.end_reason,
          timestamp: new Date().toISOString(),
        });
        break;

      case 'call_analyzed':
        console.log(`[Webhook] 📊 Call analyzed — ${callId}`);
        const { transcript, sentiment } = event?.data ?? {};
        await appendCallLog({
          event: 'call_analyzed',
          call_id: callId,
          transcript: transcript ?? [],
          sentiment: sentiment ?? null,
          timestamp: new Date().toISOString(),
        });
        break;

      default:
        console.log(`[Webhook] ℹ️  Event: ${eventType} — ${callId}`);
    }
  } catch (err) {
    console.error('[Webhook] Error processing event:', err.message);
  }
});

export default router;
