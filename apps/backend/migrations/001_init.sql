PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Class (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  year INTEGER NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_class_year ON Class(year);

CREATE TABLE IF NOT EXISTS Student (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  classId INTEGER NOT NULL REFERENCES Class(id) ON DELETE CASCADE,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT,
  studentNumber TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_student_classId ON Student(classId);

CREATE TABLE IF NOT EXISTS Session (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  classId INTEGER NOT NULL REFERENCES Class(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  room TEXT,
  startAt TEXT NOT NULL,
  endAt TEXT NOT NULL,
  gradingScaleMin INTEGER NOT NULL DEFAULT 0,
  gradingScaleMax INTEGER NOT NULL DEFAULT 20,
  sessionRemark TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_session_classId ON Session(classId);
CREATE INDEX IF NOT EXISTS idx_session_startAt ON Session(startAt);

CREATE TABLE IF NOT EXISTS Attendance (
  sessionId INTEGER NOT NULL REFERENCES Session(id) ON DELETE CASCADE,
  studentId INTEGER NOT NULL REFERENCES Student(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'RETARD', 'DISPENSE')),
  PRIMARY KEY (sessionId, studentId)
);

CREATE INDEX IF NOT EXISTS idx_attendance_sessionId ON Attendance(sessionId);
CREATE INDEX IF NOT EXISTS idx_attendance_studentId ON Attendance(studentId);

CREATE TABLE IF NOT EXISTS StudentRemark (
  sessionId INTEGER NOT NULL REFERENCES Session(id) ON DELETE CASCADE,
  studentId INTEGER NOT NULL REFERENCES Student(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  PRIMARY KEY (sessionId, studentId)
);

CREATE INDEX IF NOT EXISTS idx_studentremark_sessionId ON StudentRemark(sessionId);

CREATE TABLE IF NOT EXISTS Grade (
  sessionId INTEGER NOT NULL REFERENCES Session(id) ON DELETE CASCADE,
  studentId INTEGER NOT NULL REFERENCES Student(id) ON DELETE CASCADE,
  value REAL NOT NULL,
  PRIMARY KEY (sessionId, studentId)
);

CREATE INDEX IF NOT EXISTS idx_grade_sessionId ON Grade(sessionId);
