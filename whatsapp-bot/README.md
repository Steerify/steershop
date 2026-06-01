# 🤖 SteerSolo WhatsApp Scout Bot

Automated WhatsApp group promoter for the SteerSolo marketplace. Posts product spotlights, featured stores, and top-5 roundups to your WhatsApp group every 2 hours — fully autonomous, no human needed.

---

## ✨ Features

| Hook Type | Description |
|---|---|
| 🔥 **Featured Store of the Day** | 1 product from a random store |
| 🛍️ **Top 5 Products** | Text + 5 individual product images |
| ✨ **New Arrival Alert** | Recently added product spotlight |
| 💎 **Hidden Gem** | Lesser-known store discovery |
| ⚡ **Flash Deal** | Urgency-driven promo hook |

- Rotates hook types automatically based on the time of day
- Prevents re-posting the same product within 24 hours
- Sends images with captions when available, falls back to text-only
- Persists WhatsApp session — no QR re-scan needed after first setup

---

## 🚀 Setup (One-time)

### 1. Run the database migration
Open your **Supabase SQL Editor** and run the contents of `migration.sql`.

### 2. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — your service role key (NOT the anon key)
- `WHATSAPP_GROUP_JID` — see step 4 below

### 3. Install dependencies
```bash
cd whatsapp-bot
npm install
```

### 4. Find your WhatsApp Group JID
Run the bot once with a temporary listener to discover your group JID:
```bash
npm run dev
```
Scan the QR code, then send **any message** to the target WhatsApp group. The bot will log all incoming messages with their JIDs. Copy the one ending in `@g.us` for your group and paste it into `.env` as `WHATSAPP_GROUP_JID`.

### 5. Start the bot
```bash
npm run dev          # development
npm run build && npm start  # production
```

The bot fires immediately on startup, then every 2 hours.

---

## 🖥️ Production Deployment (Recommended: Railway)

1. Create a new **Railway** project and connect your repo
2. Set the root directory to `whatsapp-bot/`
3. Add all environment variables from `.env`
4. Set the start command to `npm start`
5. On first deploy, check Railway logs for the QR code, scan it once

> ⚠️ **Auth session persistence**: Make sure your deployment platform supports persistent volumes. Railway has this built in. The `auth_session/` folder must survive restarts.

---

## ⚠️ WhatsApp ToS Notice

This bot uses the **Baileys** library, which is an unofficial WhatsApp client. Using it may violate WhatsApp's Terms of Service. Use a dedicated phone number / WhatsApp Business account for the bot — not your personal number. You've been informed.

---

## 📁 File Structure

```
whatsapp-bot/
├── src/
│   ├── index.ts       # Bot entry point & QR auth
│   ├── scheduler.ts   # Cron job (every 2 hrs)
│   ├── poster.ts      # Message composition & sending
│   ├── hooks.ts       # Caption templates (all hook types)
│   ├── scout.ts       # Supabase data fetching
│   └── images.ts      # Image downloader
├── migration.sql      # Supabase table for post deduplication
├── .env.example
├── package.json
└── tsconfig.json
```
