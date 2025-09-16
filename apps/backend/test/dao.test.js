import { describe, it, expect, beforeAll } from 'vitest';
import { db as mainDb } from '../src/lib/db.js';
import { ClassDAO } from '../src/dao/classes.js';
import { StudentDAO } from '../src/dao/students.js';
import { SessionDAO } from '../src/dao/sessions.js';
import { AttendanceDAO } from '../src/dao/attendance.js';
import { StatsDAO } from '../src/dao/stats.js';

describe('DAO basic flows', () => {
  beforeAll(async () => {
    expect(mainDb.open).toBeTruthy();
  });

  it('create class, students, session and mark attendance/grade', () => {
    const c = ClassDAO.create({ name: 'TestClasse', level: 'Terminale', year: 2025 });
    expect(c.id).toBeGreaterThan(0);

    const s1 = StudentDAO.create({
      classId: c.id,
      firstName: 'Paul',
      lastName: 'Durand',
      email: '',
      studentNumber: 'T300',
    });
    const s2 = StudentDAO.create({
      classId: c.id,
      firstName: 'Zoé',
      lastName: 'Martin',
      email: '',
      studentNumber: 'T301',
    });

    const session = SessionDAO.create({
      classId: c.id,
      subject: 'EPS',
      room: 'Gymnase',
      startAt: '2025-09-14T08:00',
      endAt: '2025-09-14T09:00',
      gradingScaleMin: 0,
      gradingScaleMax: 20,
      sessionRemark: '',
    });

    AttendanceDAO.setStatus(session.id, s1.id, 'PRESENT');
    AttendanceDAO.setStatus(session.id, s2.id, 'RETARD');

    let attendance = AttendanceDAO.getForSession(session.id);
    expect(attendance.length).toBeGreaterThanOrEqual(2);
    expect(attendance.find((a) => a.studentId === s1.id)?.status).toBe('PRESENT');
    expect(attendance.find((a) => a.studentId === s2.id)?.status).toBe('RETARD');

    AttendanceDAO.setGrade(session.id, s1.id, 18);
    AttendanceDAO.setGrade(session.id, s2.id, 12);

    attendance = AttendanceDAO.getForSession(session.id);
    expect(attendance.find((a) => a.studentId === s1.id)?.grade).toBe(18);
    expect(attendance.find((a) => a.studentId === s2.id)?.grade).toBe(12);

    const classStats = StatsDAO.classStats(c.id, {});
    expect(classStats.sessionsCount).toBeGreaterThan(0);

    const studentStats = StatsDAO.studentStats(s1.id, {});
    expect(studentStats).not.toBeNull();
    expect(typeof studentStats.presenceRate).toBe('number');
  });
});
