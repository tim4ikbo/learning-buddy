-- Drop existing tables
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS verificationToken;
DROP TABLE IF EXISTS pool_member;
DROP TABLE IF EXISTS canvas;
DROP TABLE IF EXISTS file;
DROP TABLE IF EXISTS pool;
DROP TABLE IF EXISTS user;

-- Create tables
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER,
  image TEXT
);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  sessionToken TEXT NOT NULL UNIQUE,
  expires INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS verificationToken (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires INTEGER NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS pool (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  creator_id TEXT REFERENCES user(id),
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS pool_member (
  id TEXT PRIMARY KEY,
  pool_id TEXT REFERENCES pool(id),
  user_id TEXT REFERENCES user(id),
  role TEXT,
  joined_at INTEGER
);

CREATE TABLE IF NOT EXISTS canvas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pool_id TEXT REFERENCES pool(id),
  creator_id TEXT REFERENCES user(id),
  content TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS file (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  pool_id TEXT REFERENCES pool(id),
  uploader_id TEXT REFERENCES user(id),
  uploaded_at INTEGER
); 