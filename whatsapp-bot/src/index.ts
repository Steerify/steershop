import 'dotenv/config';
import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  type WASocket,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { startScheduler } from './scheduler.js';

const AUTH_FOLDER = './auth_session';

async function connectToWhatsApp(): Promise<WASocket> {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  const logger = pino({ level: 'silent' }); // set to 'debug' for verbose logs

  const sock = makeWASocket({
    version,
    logger,
    auth: state,
    printQRInTerminal: false, // we handle QR ourselves for clarity
    browser: ['SteerSolo Bot', 'Chrome', '120.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n──────────────────────────────────────────');
      console.log('  📱 SCAN THIS QR CODE IN WHATSAPP:');
      console.log('  Settings → Linked Devices → Link a Device');
      console.log('──────────────────────────────────────────\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(
        `[bot] Connection closed (status: ${statusCode}). Reconnecting: ${shouldReconnect}`,
      );
      if (shouldReconnect) {
        // Wait 5 seconds before reconnecting
        await new Promise((r) => setTimeout(r, 5000));
        await connectToWhatsApp();
      } else {
        console.error('[bot] Logged out. Delete ./auth_session and restart to re-scan QR.');
        process.exit(1);
      }
    }

    if (connection === 'open') {
      console.log('\n✅ WhatsApp connected successfully!');
      console.log(`[bot] Posting to group: ${process.env.WHATSAPP_GROUP_JID}`);

      // ── Group JID Discovery ─────────────────────────────────────────────
      // List all groups the account is in so the user can find their group JID
      const groups = await sock.groupFetchAllParticipating();
      const groupEntries = Object.entries(groups);
      if (groupEntries.length > 0) {
        console.log('\n📋 Groups this account is in:');
        groupEntries.forEach(([jid, meta]) => {
          console.log(`  → ${meta.subject.padEnd(40)} | JID: ${jid}`);
        });
        console.log('\n👆 Copy the JID for your target group and paste it in .env as WHATSAPP_GROUP_JID\n');
      } else {
        console.log('[bot] ⚠️  No groups found. Join the target WhatsApp group first, then restart.');
      }
      // ───────────────────────────────────────────────────────────────────

      startScheduler(sock);
    }
  });

  return sock;
}

// ─── Entry point ─────────────────────────────────────────────────────────────

console.log('');
console.log('╔═══════════════════════════════════════╗');
console.log('║   🚀  SteerSolo WhatsApp Scout Bot    ║');
console.log('║   Automated store & product promoter  ║');
console.log('╚═══════════════════════════════════════╝');
console.log('');

connectToWhatsApp().catch((err) => {
  console.error('[bot] Fatal error:', err);
  process.exit(1);
});
