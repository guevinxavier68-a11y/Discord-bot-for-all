# Discord Bot — Setup & Deployment Guide

## Features

| Command | Description | Permission |
|---|---|---|
| `/ticket-panel` | Sends a ticket panel with a button to open tickets | Manage Guild |
| `/create-ticket` | Opens a new support ticket channel | Everyone |
| `/close-ticket` | Closes and deletes the current ticket | Staff / Ticket Owner |
| `/script-panel` | Shows all available scripts | Manage Guild |
| `/redeem-key <key>` | Redeems a key to unlock a script | Everyone |
| `/view-script <name>` | Previews a script (first 500 chars) | Everyone |
| `/create-key` | Creates a new script + key | **Owner only** |
| `/delete-key <key>` | Deletes a key | **Owner only** |
| `/auto-role set-join-role` | Sets the role given to all new members | Manage Guild |
| `/auto-role set-muted-role` | Sets the role used for muting | Manage Guild |
| `/auto-role set-welcome` | Sets welcome channel + message | Manage Guild |
| `/auto-role set-goodbye` | Sets goodbye channel + message | Manage Guild |
| `/mute <user>` | Mutes a member using the muted role | Moderate Members |
| `/unmute <user>` | Removes the muted role | Moderate Members |
| `/ban <user>` | Bans a member | Ban Members |
| `/unban <user-id>` | Unbans a user by ID | Ban Members |
| `/spam <message>` | Sends a message 5 times | Manage Messages |
| `/clone <server-id>` | Clones roles + channels from another server | Administrator |
| `/help` | Shows all commands | Everyone |

---

## Step 1 — Create Your Discord Bot

1. Go to [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** → give it a name
3. Go to the **Bot** tab → click **Add Bot**
4. Under **Token**, click **Reset Token** and copy it — this is your `DISCORD_TOKEN`
5. Enable these **Privileged Gateway Intents**:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Administrator` (or select individual permissions)
   - Copy the URL and open it to invite the bot to your server

---

## Step 2 — Get Your IDs

- **CLIENT_ID**: Found on the **General Information** tab of your application
- **OWNER_ID**: In Discord, go to Settings → Advanced → Enable Developer Mode, then right-click your name → Copy ID
- **GUILD_ID** (optional, for faster command registration during testing): Right-click your server → Copy Server ID

---

## Step 3 — Local Setup (optional)

```bash
cd discord-bot
npm install

# Copy and fill in your .env file
cp .env.example .env
# Edit .env with your values

# Register slash commands
node deploy-commands.js

# Start the bot
npm start
```

---

## Step 4 — Deploy to Render

1. Push this project to a **GitHub repository**
2. Go to [https://render.com](https://render.com) and sign in
3. Click **New → Blueprint** and connect your GitHub repo
   - Render will auto-detect `render.yaml` and create the service
4. Set your **Environment Variables** in the Render dashboard:
   - `DISCORD_TOKEN` — your bot token
   - `CLIENT_ID` — your application/client ID
   - `OWNER_ID` — your Discord user ID
   - `GUILD_ID` — (optional) your server ID
5. Click **Deploy**
6. Once deployed, run `node deploy-commands.js` once locally OR add it as a one-off job in Render to register slash commands

> **Note:** The Render service type is `worker` (background worker, not a web server) since Discord bots connect via WebSocket, not HTTP.

---

## Welcome / Goodbye Message Variables

Use these placeholders in your messages:

| Variable | Replaced with |
|---|---|
| `{user}` | @mention of the user |
| `{username}` | Username without the @mention |
| `{server}` | Server name |
| `{count}` | Current member count |

**Example:** `Welcome {user} to {server}! You're member #{count} 🎉`

---

## File Structure

```
discord-bot/
├── index.js                  # Bot entry point
├── deploy-commands.js        # Register slash commands
├── package.json
├── render.yaml               # Render deployment config
├── .env.example              # Example environment variables
├── src/
│   ├── database/
│   │   └── db.js             # SQLite database setup
│   ├── events/
│   │   ├── ready.js
│   │   ├── interactionCreate.js
│   │   ├── guildMemberAdd.js
│   │   └── guildMemberRemove.js
│   └── commands/
│       ├── tickets/          # ticket-panel, create-ticket, close-ticket
│       ├── scripts/          # script-panel, redeem-key, view-script, create-key, delete-key
│       ├── moderation/       # ban, unban, mute, unmute
│       └── utility/          # auto-role, spam, clone, help
└── data.db                   # SQLite database (auto-created on first run)
```
