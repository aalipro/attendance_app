import { ensureDatabase, db } from './lib/db.js';
import { ClassDAO } from './dao/classes.js';
import { StudentDAO } from './dao/students.js';
import { SessionDAO } from './dao/sessions.js';
import { AttendanceDAO } from './dao/attendance.js';

function reset() {
  db.exec(`
    DROP TABLE IF EXISTS Grade;
    DROP TABLE IF EXISTS StudentRemark;
    DROP TABLE IF EXISTS Attendance;
    DROP TABLE IF EXISTS Session;
    DROP TABLE IF EXISTS Student;
    DROP TABLE IF EXISTS Class;
    DROP TABLE IF EXISTS _migrations;
  `);
}

function addStudentsForClass(classId, baseNumber) {
  const firstNames = ['Alice','Benoît','Camille','David','Emma','Farid','Gaëlle','Hugo','Inès','Jules'];
  const lastNames = ['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Leroy','Moreau'];
  for (let i = 0; i < 10; i++) {
    StudentDAO.create({
      classId,
      firstName: firstNames[i],
      lastName: lastNames[i],
      email: '',
      studentNumber: `${baseNumber + i}`,
    });
  }
}

function seed() {
  ensureDatabase();
  const c1 = ClassDAO.create({ name: 'Terminale STMG A', level: 'Terminale', year: 2024 });
  const c2 = ClassDAO.create({ name: 'Terminale STMG B', level: 'Terminale', year: 2024 });

  addStudentsForClass(c1.id, 1001);
  addStudentsForClass(c2.id, 2001);

  const now = new Date();
  const iso = (d) => d.toISOString().slice(0, 16);
  const d1 = new Date(now.getTime() - 2 * 86400000);
  const d2 = new Date(now.getTime() - 1 * 86400000);
  const d3 = new Date(now.getTime());

  const s1 = SessionDAO.create({
    classId: c1.id,
    subject: 'EPS',
    room: 'Gymnase',
    startAt: iso(d1),
    endAt: iso(new Date(d1.getTime() + 60 * 60 * 1000)),
    gradingScaleMin: 0,
    gradingScaleMax: 20,
    sessionRemark: 'Échauffement général',
  });

  const s2 = SessionDAO.create({
    classId: c1.id,
    subject: 'EPS',
    room: 'Gymnase',
    startAt: iso(d2),
    endAt: iso(new Date(d2.getTime() + 60 * 60 * 1000)),
    gradingScaleMin: 0,
    gradingScaleMax: 20,
    sessionRemark: '',
  });

  const s3 = SessionDAO.create({
    classId: c2.id,
    subject: 'EPS',
    room: 'Terrain',
    startAt: iso(d3),
    endAt: iso(new Date(d3.getTime() + 60 * 60 * 1000)),
    gradingScaleMin: 0,
    gradingScaleMax: 20,
    sessionRemark: '',
  });

  // Marquer quelques présences/notes de démonstration
  const studentsC1 = StudentDAO.listByClass(c1.id);
  studentsC1.forEach((st, idx) => {
    AttendanceDAO.setStatus(s1.id, st.id, idx % 5 === 0 ? 'RETARD' : 'PRESENT');
    AttendanceDAO.setStatus(s2.id, st.id, idx % 4 === 0 ? 'ABSENT' : 'PRESENT');
    AttendanceDAO.setGrade(s1.id, st.id, 10 + (idx % 11));
  });
}

const args = process.argv.slice(2);
if (args.includes('--reset')) {
  console.log('Réinitialisation de la base...');
  reset();
}
console.log('Migration/Seed...');
seed();
console.log('OK');
