import { db } from '../lib/db.js';

export const AttendanceDAO = {
  getForSession(sessionId) {
    const rows = db
      .prepare(
        `SELECT s.id as studentId, s.firstName, s.lastName, s.email, s.studentNumber,
                a.status, g.value as grade, r.text as remark
         FROM Student s
         JOIN Session sess ON sess.classId = s.classId
         LEFT JOIN Attendance a ON a.sessionId=sess.id AND a.studentId=s.id
         LEFT JOIN Grade g ON g.sessionId=sess.id AND g.studentId=s.id
         LEFT JOIN StudentRemark r ON r.sessionId=sess.id AND r.studentId=s.id
         WHERE sess.id=? 
         ORDER BY s.lastName ASC, s.firstName ASC`,
      )
      .all(sessionId);
    return rows.map((r) => ({
      studentId: r.studentId,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      studentNumber: r.studentNumber,
      status: r.status || 'ABSENT',
      grade: r.grade ?? 10,
      remark: r.remark ?? '',
    }));
  },
  setStatus(sessionId, studentId, status) {
    const up = db.prepare(
      `INSERT INTO Attendance(sessionId, studentId, status) VALUES (?, ?, ?)
       ON CONFLICT(sessionId, studentId) DO UPDATE SET status=excluded.status`,
    );
    up.run(sessionId, studentId, status);
  },
  bulkSet(sessionId, updates) {
    const up = db.prepare(
      `INSERT INTO Attendance(sessionId, studentId, status) VALUES (?, ?, ?)
       ON CONFLICT(sessionId, studentId) DO UPDATE SET status=excluded.status`,
    );
    const trx = db.transaction((list) => {
      for (const u of list) up.run(sessionId, u.studentId, u.status);
    });
    trx(updates);
  },
  setSessionRemark(sessionId, text) {
    db.prepare(`UPDATE Session SET sessionRemark=? WHERE id=?`).run(text, sessionId);
  },
  setStudentRemark(sessionId, studentId, text) {
    const up = db.prepare(
      `INSERT INTO StudentRemark(sessionId, studentId, text) VALUES (?, ?, ?)
       ON CONFLICT(sessionId, studentId) DO UPDATE SET text=excluded.text`,
    );
    up.run(sessionId, studentId, text);
  },
  setGrade(sessionId, studentId, value) {
    const up = db.prepare(
      `INSERT INTO Grade(sessionId, studentId, value) VALUES (?, ?, ?)
       ON CONFLICT(sessionId, studentId) DO UPDATE SET value=excluded.value`,
    );
    up.run(sessionId, studentId, value);
  },
};
