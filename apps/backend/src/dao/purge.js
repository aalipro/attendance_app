import { db } from '../lib/db.js';

export const PurgeDAO = {
  purgeTeacher(teacherId) {
    const deleteAll = db.transaction((tid) => {
      // Delete Attendance, Grades, Remarks via dependent tables first for safety
      db.prepare(
        `DELETE FROM Attendance WHERE sessionId IN (
           SELECT id FROM Session WHERE classId IN (SELECT id FROM Class WHERE teacherId = ?)
         )`,
      ).run(tid);
      db.prepare(
        `DELETE FROM Grade WHERE sessionId IN (
           SELECT id FROM Session WHERE classId IN (SELECT id FROM Class WHERE teacherId = ?)
         )`,
      ).run(tid);
      db.prepare(
        `DELETE FROM StudentRemark WHERE sessionId IN (
           SELECT id FROM Session WHERE classId IN (SELECT id FROM Class WHERE teacherId = ?)
         )`,
      ).run(tid);

      // Delete Sessions and Students
      db.prepare(
        `DELETE FROM Session WHERE classId IN (SELECT id FROM Class WHERE teacherId = ?)`,
      ).run(tid);
      db.prepare(
        `DELETE FROM Student WHERE classId IN (SELECT id FROM Class WHERE teacherId = ?)`,
      ).run(tid);

      // Finally delete Classes
      db.prepare(`DELETE FROM Class WHERE teacherId = ?`).run(tid);
    });

    deleteAll(teacherId);
  },

  purgeSessionsOnly(teacherId) {
    const del = db.transaction((tid) => {
      db.prepare(
        `DELETE FROM Attendance WHERE sessionId IN (
           SELECT s.id FROM Session s JOIN Class c ON c.id = s.classId WHERE c.teacherId = ?
         )`,
      ).run(tid);
      db.prepare(
        `DELETE FROM Grade WHERE sessionId IN (
           SELECT s.id FROM Session s JOIN Class c ON c.id = s.classId WHERE c.teacherId = ?
         )`,
      ).run(tid);
      db.prepare(
        `DELETE FROM StudentRemark WHERE sessionId IN (
           SELECT s.id FROM Session s JOIN Class c ON c.id = s.classId WHERE c.teacherId = ?
         )`,
      ).run(tid);
      db.prepare(
        `DELETE FROM Session WHERE classId IN (SELECT id FROM Class WHERE teacherId = ?)`,
      ).run(tid);
    });
    del(teacherId);
  },
};
