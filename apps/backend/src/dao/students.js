import { db } from '../lib/db.js';

export const StudentDAO = {
  listByClass(classId) {
    return db
      .prepare(
        `SELECT * FROM Student WHERE classId=? ORDER BY lastName ASC, firstName ASC`,
      )
      .all(classId);
  },
  create(input) {
    const stmt = db.prepare(
      `INSERT INTO Student(classId, firstName, lastName, email, studentNumber, generalRemark) 
       VALUES (@classId, @firstName, @lastName, @email, @studentNumber, @generalRemark)`,
    );
    const info = stmt.run({
      classId: input.classId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email ?? null,
      studentNumber: input.studentNumber ?? null,
      generalRemark: input.generalRemark ?? '',
    });
    return this.get(info.lastInsertRowid);
  },
  get(id) {
    return db.prepare(`SELECT * FROM Student WHERE id=?`).get(id);
  },
  update(id, patch) {
    const existing = this.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    db.prepare(
      `UPDATE Student SET classId=@classId, firstName=@firstName, lastName=@lastName, email=@email, studentNumber=@studentNumber, generalRemark=@generalRemark WHERE id=@id`,
    ).run({
      id,
      classId: updated.classId,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email ?? null,
      studentNumber: updated.studentNumber ?? null,
      generalRemark: updated.generalRemark ?? '',
    });
    return this.get(id);
  },
  delete(id) {
    db.prepare(`DELETE FROM Student WHERE id=?`).run(id);
  },
  bulkInsert(classId, rows) {
    const insert = db.prepare(
      `INSERT INTO Student(classId, firstName, lastName, email, studentNumber, generalRemark) VALUES (?, ?, ?, ?, ?, '')`,
    );
    const trx = db.transaction((list) => {
      for (const r of list) {
        insert.run(classId, r.firstName, r.lastName, r.email || null, r.studentNumber || null);
      }
    });
    trx(rows);
  },
};
