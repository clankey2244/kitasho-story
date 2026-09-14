CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  appearance TEXT NOT NULL,
  salt TEXT NOT NULL,
  pass_hash TEXT NOT NULL,
  state_json TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 0,
  development INTEGER NOT NULL DEFAULT 0,
  unlocked_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_login INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_players_account ON players(account_id);
CREATE INDEX IF NOT EXISTS idx_players_last_login ON players(last_login DESC);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_player ON sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry ON admin_sessions(expires_at);

CREATE TABLE IF NOT EXISTS admin_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  player_id TEXT,
  detail TEXT,
  created_at INTEGER NOT NULL
);
