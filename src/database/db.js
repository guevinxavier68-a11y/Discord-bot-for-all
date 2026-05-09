const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../data.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    script_name TEXT NOT NULL,
    script_content TEXT NOT NULL,
    redeemed INTEGER DEFAULT 0,
    redeemed_by TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT UNIQUE NOT NULL,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    welcome_channel_id TEXT,
    welcome_message TEXT DEFAULT 'Welcome {user} to {server}!',
    goodbye_channel_id TEXT,
    goodbye_message TEXT DEFAULT 'Goodbye {user}, we will miss you!',
    ticket_category_id TEXT,
    ticket_log_channel_id TEXT,
    auto_role_id TEXT,
    muted_role_id TEXT
  );
`);

module.exports = db;
