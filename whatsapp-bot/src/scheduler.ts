import cron from 'node-cron';
import type { WASocket } from '@whiskeysockets/baileys';
import { runPostCycle } from './poster.js';

const POST_INTERVAL_HOURS = Number(process.env.POST_INTERVAL_HOURS ?? 2);

/**
 * Starts the cron scheduler. Posts run at the top of every N-th hour.
 * Default: every 2 hours → 00:00, 02:00, 04:00, 06:00, etc.
 */
export function startScheduler(sock: WASocket): void {
  const cronExpression = `0 */${POST_INTERVAL_HOURS} * * *`;
  console.log(
    `[scheduler] Scheduling posts every ${POST_INTERVAL_HOURS} hour(s) | cron: "${cronExpression}"`,
  );

  cron.schedule(cronExpression, async () => {
    console.log(`[scheduler] ⏰ Cron triggered at ${new Date().toISOString()}`);
    await runPostCycle(sock);
  });

  // Fire once immediately on startup so we don't wait for the first scheduled run
  console.log('[scheduler] Firing initial post on startup…');
  setImmediate(() => runPostCycle(sock));
}
