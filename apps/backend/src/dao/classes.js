import { db } from '../lib/db.js';

export const ClassDAO = {
  list() {
    return db.prepare(`SELECT * FROM Class ORDER BY name ASC`).all();
  },
  create(input) {
    const stmt = db.prepare(
      `INSERT INTO Class(name, level, year) VALUES (@name, @level, @year)`,
    );
    const info = stmt.run(input);
    return this.get(info.lastInsertRowid);
  },
  get(id) {
    return db.prepare(`SELECT * FROM Class WHERE id = ?`).get(id);
  },
  update(id, patch) {
    const existing = this.get(id);
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
