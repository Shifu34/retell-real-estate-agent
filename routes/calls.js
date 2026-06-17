/**
 * routes/calls.js
 * REST endpoints for browsing call history stored in logs/calls.json
 */

import { Router } from 'express';
import { readCallLogs, getCallStats } from '../utils/callLogger.js';

const router = Router();

/**
 * GET /calls
 * Returns all call log entries, newest first.
 * Query params:
 *   ?limit=20     — max entries to return (default 50)
 *   ?event=call_ended — filter by event type
 */
router.get('/', async (req, res) => {
  try {
    let logs = await readCallLogs();

    // Filter by event type if requested
    if (req.query.event) {
      logs = logs.filter(l => l.event === req.query.event);
    }

    // Newest first
    logs = logs.reverse();

    // Limit results
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    logs = logs.slice(0, limit);

    res.json({ count: logs.length, calls: logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /calls/stats
 * Returns aggregate statistics for all completed calls.
 */
router.get('/stats', async (_req, res) => {
  try {
    const stats = await getCallStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /calls/:callId
 * Returns all log entries for a specific call ID.
 */
router.get('/:callId', async (req, res) => {
  try {
    const logs = await readCallLogs();
    const entries = logs.filter(l => l.call_id === req.params.callId);

    if (entries.length === 0) {
      return res.status(404).json({ error: 'Call not found' });
    }

    res.json({ call_id: req.params.callId, entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
