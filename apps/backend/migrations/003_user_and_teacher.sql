PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS User (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  fullName TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Add teacherId to Class (temporary default to 1 for migration convenience)
ALTER TABLE Class ADD COLUMN teacherId INTEGER REFERENCES User(id) ON DELETE CASCADE;
-- Note: teacherId will be set by seed if needed.
CREATE INDEX IF NOT EXISTS idx_class_teacherId ON Class(teacherId);
