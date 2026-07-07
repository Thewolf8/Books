export const CREATE_TABLES_SQL = `
-- Books table: stores both physical and digital books
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_image_path TEXT,
  type TEXT NOT NULL CHECK(type IN ('physical', 'digital')),
  file_path TEXT,
  total_pages INTEGER DEFAULT 0,
  current_page INTEGER DEFAULT 0,
  summary TEXT DEFAULT '',
  review TEXT DEFAULT '',
  rating INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_read_at INTEGER
);

-- Tags table: reusable tags across books
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6366f1',
  category TEXT NOT NULL DEFAULT 'custom' CHECK(category IN ('liked', 'disliked', 'no-comment', 'custom')),
  created_at INTEGER NOT NULL
);

-- Book-Tag junction table
CREATE TABLE IF NOT EXISTS book_tags (
  book_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (book_id, tag_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Highlights table: stores highlighted text with annotations
CREATE TABLE IF NOT EXISTS highlights (
  id TEXT PRIMARY KEY NOT NULL,
  book_id TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  selected_text TEXT NOT NULL,
  comment TEXT DEFAULT '',
  color TEXT NOT NULL DEFAULT '#fbbf24',
  x1 REAL DEFAULT 0,
  y1 REAL DEFAULT 0,
  x2 REAL DEFAULT 0,
  y2 REAL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Settings table: key-value store for app preferences
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

-- Full-text search index for highlights
CREATE VIRTUAL TABLE IF NOT EXISTS highlights_fts USING fts5(
  selected_text,
  comment,
  content='highlights',
  content_rowid='rowid'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_type ON books(type);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_highlights_book ON highlights(book_id);
CREATE INDEX IF NOT EXISTS idx_highlights_page ON highlights(page_number);
CREATE INDEX IF NOT EXISTS idx_highlights_created ON highlights(created_at);
`;

export const DROP_TABLES_SQL = `
DROP TABLE IF EXISTS book_tags;
DROP TABLE IF EXISTS highlights;
DROP TABLE IF EXISTS highlights_fts;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS settings;
`;

// Seed default tags
export const SEED_TAGS_SQL = `
INSERT OR IGNORE INTO tags (id, name, color, category, created_at) VALUES 
  ('tag_liked', 'Liked', '#22c55e', 'liked', ${Date.now()}),
  ('tag_disliked', 'Disliked', '#ef4444', 'disliked', ${Date.now()}),
  ('tag_nocomment', 'No Comment', '#9ca3af', 'no-comment', ${Date.now()});
`;
