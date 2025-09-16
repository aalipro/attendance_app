import { db } from '../lib/db.js';

function inRangeClause(from, to) {
  const where = [];
  const params = [];
  if (from) {
    where.push('startAt>=?');
    params.push(from);
  }
  if (to) {
    where.push('endAt<=?');
    params.push(to);
  }
  return { where: where.length ? ` AND ${where.join(' AND ')}` : '', params };
}

export const StatsDAO = {
  classStats(classId, { from, to }) {
    const { where, params } = inRangeClause(from, to);
    const sessions = db
      .prepare(
        `SELECT id FROM Session WHERE classId=? ${where} ORDER BY startAt DESC`,
      )
      .all(classId, ...params)
      .map((r) => r.id);

    if (sessions.length === 0)
      return { sessionsCount: 0, presenceRate: 0, avgGrade: null, absences: 0, late: 0 };

    const placeholders = sessions.map(() => '?').join(',');
    const attendance = db
      .prepare(
        `SELECT status, COUNT(*) as cnt FROM Attendance 
         WHERE sessionId IN (${placeholders})
         GROUP BY status`,
      )
      .all(...sessions);

    const by = Object.fromEntries(attendance.map((r) => [r.status, r.cnt]));
    const totalMarked = Object.values(by).reduce((a, b) => a + b, 0);
    const present = by.PRESENT || 0;
    const presenceRate = totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0;

    const gradeRow = db
      .prepare(
        `SELECT AVG(value) as avg FROM Grade WHERE sessionId IN (${placeholders})`,
      )
      .get(...sessions);

    return {
      sessionsCount: sessions.length,
      presenceRate,
      avgGrade: gradeRow.avg ?? null,
      absences: by.ABSENT || 0,
      late: by.RETARD || 0,
    };
  },

  studentStats(studentId, { from, to }) {
    const row = db
      .prepare(
        `SELECT s.id FROM Student s WHERE s.id=?`,
      )
      .get(studentId);
    if (!row) return null;

    const { where, params } = inRangeClause(from, to);

    const attendance = db
      .prepare(
        `SELECT a.status FROM Attendance a 
         JOIN Session sess ON sess.id=a.sessionId
         WHERE a.studentId=? ${where}`,
      )
      .all(studentId, ...params);

    const total = attendance.length;
    const counts = { PRESENT: 0, ABSENT: 0, RETARD: 0, DISPENSE: 0 };
    for (const a of attendance) counts[a.status]++;

    const grades = db
      .prepare(
        `SELECT g.value FROM Grade g 
         JOIN Session sess ON sess.id=g.sessionId
         WHERE g.studentId=? ${where}`,
      )
      .all(studentId, ...params)
      .map((r) => r.value);

    const avgGrade = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : null;

    return {
      totalSessionsMarked: total,
      counts,
      avgGrade,
      presenceRate: total ? Math.round((counts.PRESENT / total) * 100) : 0,
    };
  },
};
