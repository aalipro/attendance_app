import { db } from '../lib/db.js';

export const SessionDAO = {
  list({ classId, from, to }) {
    let sql = `SELECT * FROM Session WHERE 1=1`;
    const params = [];
    if (classId) {
      sql += ` AND classId=?`;
      params.push(classId);
    }
    if (from) {
      sql += ` AND startAt>=?`;
      params.push(from);
    }
    if (to) {
      sql += ` AND endAt<=?`;
      params.push(to);
    }
    sql += ` ORDER BY startAt DESC`;
    return db.prepare(sql).all(...params);
  },
  create(input) {
    const stmt = db.prepare(
      `INSERT INTO Session(classId, subject, room, startAt, endAt, gradingScaleMin, gradingScaleMax, sessionRemark)
       VALUES (@classId, @subject, @room, @startAt, @endAt, @gradingScaleMin, @gradingScaleMax, @sessionRemark)`,
    );
    const params = {
      classId: input.classId,
      subject: input.subject,
      room: input.room ?? null,
      startAt: input.startAt,
      endAt: input.endAt,
      gradingScaleMin: input.gradingScaleMin ?? 0,
      gradingScaleMax: input.gradingScaleMax ?? 20,
      sessionRemark: input.sessionRemark ?? '',
    };
    const info = stmt.run(params);
    return this.get(info.lastInsertRowid);
  },
  get(id) {
    return db.prepare(`SELECT * FROM Session WHERE id=?`).get(id);
  },
  update(id, patch) {
    const existing = this.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    if (updated.room === undefined) updated.room = null;
    if (updated.sessionRemark === undefined) updated.sessionRemark = existing.sessionRemark ?? '';
    db.prepare(
      `UPDATE Session SET classId=@classId, subject=@subject, room=@room, startAt=@startAt, endAt=@endAt, gradingScaleMin=@gradingScaleMin, gradingScaleMax=@gradingScaleMax, sessionRemark=@sessionRemark WHERE id=@id`,
    ).run({ ...updated, id });
    return this.get(id);
  },
  delete(id) {
    db.prepare(`DELETE FROM Session WHERE id=?`).run(id);
  },
  duplicate(id) {
    const s = this.get(id);
    if (!s) return null;
    const copy = { ...s };
    delete copy.id;
    return this.create(copy);
  },
};
