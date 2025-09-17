import { db } from '../lib/db.js';

export const ClassDAO = {
  list() {
    return db.prepare(`SELECT * FROM Class ORDER BY name ASC`).all();
  },
  listByTeacher(teacherId) {
    return db
      .prepare(`SELECT * FROM Class WHERE teacherId = ? ORDER BY name ASC`)
      .all(teacherId);
  },
  get(id) {
    return db.prepare(`SELECT * FROM Class WHERE id = ?`).get(id);
  },
  getOwned(id, teacherId) {
    return db.prepare(`SELECT * FROM Class WHERE id = ? AND teacherId = ?`).get(id, teacherId);
  },
  create(input) {
    const stmt = db.prepare(
      `INSERT INTO Class(name, level, year, teacherId) VALUES (@name, @level, @year, @teacherId)`,
    );
    const info = stmt.run({
      name: input.name,
      level: input.level,
      year: input.year,
      teacherId: input.teacherId,
    });
    return this.get(info.lastInsertRowid);
  },
  update(id, patch, teacherId) {
    const existing = this.getOwned(id, teacherId);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    db.prepare(`UPDATE Class SET name=@name, level=@level, year=@year WHERE id=@id`).run({
      ...updated,
      id,
    });
    return this.get(id);
  },
  delete(id) {
    db.prepare(`DELETE FROM Class WHERE id=?`).run(id);
  },
};
