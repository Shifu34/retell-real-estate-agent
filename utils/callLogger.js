/**
 * utils/callLogger.js
 * Appends call events to a local JSON log file (logs/calls.json).
 * In production you'd swap this out for a database write.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, '..', 'logs', 'calls.json');

/**
 * Ensures the logs directory + file exist.
 */
async function ensureLogFile() {
  const dir = path.dirname(LOG_FILE);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(LOG_FILE);
  } catch {
    await fs.writeFile(LOG_FILE, '[]', 'utf8');
  }
}

/**
 * Appends a single call event entry to the log file.
 * @param {object} entry - The event data to log
 */
export async function appendCallLog(entry) {
  try {
    await ensureLogFile();
    const raw = await fs.readFile(LOG_FILE, 'utf8');
    const logs = JSON.parse(raw);
    logs.push(entry);
    await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch (err) {
    console.error('[callLogger] Failed to write log:', err.message);
  }
}

/**
 * Reads and returns all call logs.
 * @returns {Promise<object[]>}
 */
export async function readCallLogs() {
  try {
    await ensureLogFile();
    const raw = await fs.readFile(LOG_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Returns a summary: total calls, average duration, last call time.
 * @returns {Promise<object>}
 */
export async function getCallStats() {
  const logs = await readCallLogs();

  const ended = logs.filter(l => l.event === 'call_ended');
  const totalCalls = ended.length;
  const totalDurationMs = ended.reduce((sum, l) => sum + (l.duration_ms ?? 0), 0);
  const avgDurationSec = totalCalls > 0
    ? Math.round(totalDurationMs / totalCalls / 1000)
    : 0;
  const lastCall = ended[ended.length - 1]?.timestamp ?? null;

  return { totalCalls, avgDurationSec, lastCall };
}
