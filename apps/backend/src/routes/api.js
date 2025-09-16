import express from 'express';
import { wrapAsync } from '../middleware/error.js';
import { sendWithETag } from '../lib/etag.js';
import {
  idParam,
  classCreateSchema,
  classUpdateSchema,
  studentCreateSchema,
  studentUpdateSchema,
  sessionCreateSchema,
  sessionUpdateSchema,
  setAttendanceSchema,
  bulkAttendanceSchema,
  sessionRemarkSchema,
  studentRemarkSchema,
  setGradeSchema,
} from '../lib/validation.js';

import { ClassDAO } from '../dao/classes.js';
import { StudentDAO } from '../dao/students.js';
import { SessionDAO } from '../dao/sessions.js';
import { AttendanceDAO } from '../dao/attendance.js';
import { StatsDAO } from '../dao/stats.js';
import { toCsv, parseCsvStudents } from '../utils/csv.js';
import { buildSessionPdf } from '../utils/pdf.js';

export const router = express.Router();

// Helpers
function parseQueryInt(q) {
  const n = Number(q);
  return Number.isFinite(n) ? n : undefined;
}

// Classes
router.get(
  '/classes',
  wrapAsync(async (req, res) => {
    const list = ClassDAO.list();
    if (!sendWithETag(res, list, req)) return;
  }),
);

router.post(
  '/classes',
  wrapAsync(async (req, res) => {
    const input = classCreateSchema.parse(req.body);
    const created = ClassDAO.create(input);
    res.status(201).json(created);
  }),
);

router.put(
  '/classes/:id',
  wrapAsync(async (req, res) => {
    const id = idParam.parse(req.params.id);
    const patch = classUpdateSchema.parse(req.body);
    const updated = ClassDAO.update(id, patch);
    if (!updated) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Classe inconnue' } });
    res.json(updated);
  }),
);

router.delete(
  '/classes/:id',
  wrapAsync(async (req, res) => {
    const id = idParam.parse(req.params.id);
    ClassDAO.delete(id);
    res.status(204).end();
  }),
);

// Students
router.get(
  '/students',
  wrapAsync(async (req, res) => {
    const classId = parseQueryInt(req.query.classId);
    if (!classId) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'classId requis' } });
    const list = StudentDAO.listByClass(classId);
    if (!sendWithETag(res, list, req)) return;
  }),
);

router.post(
  '/students',
  wrapAsync(async (req, res) => {
    const input = studentCreateSchema.parse(req.body);
    // Vérifier que la classe existe
    const klass = ClassDAO.get(input.classId);
    if (!klass) {
      return res
        .status(400)
        .json({ error: { code: 'BAD_REQUEST', message: 'Classe inconnue pour classId' } });
    }
    const created = StudentDAO.create(input);
    res.status(201).json(created);
  }),
);

router.put(
  '/students/:id',
  wrapAsync(async (req, res) => {
    const id = idParam.parse(req.params.id);
    const patch = studentUpdateSchema.parse(req.body);
    if (patch.classId !== undefined) {
      const klass = ClassDAO.get(patch.classId);
      if (!klass) {
        return res
          .status(400)
          .json({ error: { code: 'BAD_REQUEST', message: 'Classe inconnue pour classId' } });
      }
    }
    const updated = StudentDAO.update(id, patch);
    if (!updated) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Élève inconnu' } });
    res.json(updated);
  }),
);

router.delete(
  '/students/:id',
  wrapAsync(async (req, res) => {
    const id = idParam.parse(req.params.id);
    StudentDAO.delete(id);
    res.status(204).end();
  }),
);

// CSV Import/Export
router.post(
  '/students/import',
  wrapAsync(async (req, res) => {
    const classId = parseQueryInt(req.query.classId || req.body.classId);
    if (!classId) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'classId requis' } });
    const { csv } = req.body;
    if (!csv) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'csv requis' } });
    const rows = parseCsvStudents(csv);
    StudentDAO.bulkInsert(classId, rows);
    res.status(201).json({ inserted: rows.length });
  }),
);

router.get(
  '/students/export',
  wrapAsync(async (req, res) => {
    const classId = parseQueryInt(req.query.classId);
    if (!classId) return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'classId requis' } });
    const students = StudentDAO.listByClass(classId);
    const headers = ['prenom', 'nom', 'email', 'numero'];
    const rows = students.map((s) => ({
      prenom: s.firstName,
      nom: s.lastName,
      email: s.email || '',
      numero: s.studentNumber || '',
    }));
    const csv = toCsv(headers, rows);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="eleves_classe_${classId}.csv"`);
    res.send(csv);
  }),
);

// Sessions
router.get(
  '/sessions',
  wrapAsync(async (req, res) => {
    const classId = parseQueryInt(req.query.classId);
    const from = req.query.from;
    const to = req.query.to;
    const list = SessionDAO.list({ classId, from, to });
    if (!sendWithETag(res, list, req)) return;
  }),
);

router.post(
  '/sessions',
  wrapAsync(async (req, res) => {
    const input = sessionCreateSchema.parse(req.body);
    // Vérifier que la classe existe pour éviter une contrainte FK
    const klass = ClassDAO.get(input.classId);
    if (!klass) {
      return res
        .status(400)
        .json({ error: { code: 'BAD_REQUEST', message: 'Classe inconnue pour classId' } });
    }
    const created = SessionDAO.create(input);
    res.status(201).json(created);
  }),
);

router.put(
  '/sessions/:id',
  wrapAsync(async (req, res) => {
    const id = idParam.parse(req.params.id);
    const patch = sessionUpdateSchema.parse(req.body);
    if (patch.classId !== undefined) {
      const klass = ClassDAO.get(patch.classId);
      if (!klass) {
        return res
          .status(400)
          .json({ error: { code: 'BAD_REQUEST', message: 'Classe inconnue pour classId' } });
      }
    }
    const updated = SessionDAO.update(id, patch);
    if (!updated) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Séance inconnue' } });
    res.json(updated);
  }),
);

router.delete(
  '/sessions/:id',
  wrapAsync(async (req, res) => {
    const id = idParam.parse(req.params.id);
    SessionDAO.delete(id);
    res.status(204).end();
  }),
);

router.post(
  '/sessions/:id/duplicate',
  wrapAsync(async (req, res) => {
    const id = idParam.parse(req.params.id);
    const dup = SessionDAO.duplicate(id);
    if (!dup) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Séance inconnue' } });
    res.status(201).json(dup);
  }),
);

// Attendance
router.get(
  '/sessions/:id/attendance',
  wrapAsync(async (req, res) => {
    const id = idParam.parse(req.params.id);
    const list = AttendanceDAO.getForSession(id);
    res.json(list);
  }),
);

router.put(
  '/sessions/:id/attendance/:studentId',
  wrapAsync(async (req, res) => {
    const sessionId = idParam.parse(req.params.id);
    const studentId = idParam.parse(req.params.studentId);
    const { status } = setAttendanceSchema.parse(req.body);
    AttendanceDAO.setStatus(sessionId, studentId, status);
    res.json({ ok: true });
  }),
);

router.put(
  '/sessions/:id/attendance',
  wrapAsync(async (req, res) => {
    const sessionId = idParam.parse(req.params.id);
    const { updates } = bulkAttendanceSchema.parse(req.body);
    AttendanceDAO.bulkSet(sessionId, updates);
    res.json({ ok: true, updated: updates.length });
  }),
);

// Remarks & Grades
router.put(
  '/sessions/:id/remark',
  wrapAsync(async (req, res) => {
    const sessionId = idParam.parse(req.params.id);
    const { text } = sessionRemarkSchema.parse(req.body);
    AttendanceDAO.setSessionRemark(sessionId, text);
    res.json({ ok: true });
  }),
);

router.put(
  '/sessions/:id/remark/:studentId',
  wrapAsync(async (req, res) => {
    const sessionId = idParam.parse(req.params.id);
    const studentId = idParam.parse(req.params.studentId);
    const { text } = studentRemarkSchema.parse(req.body);
    AttendanceDAO.setStudentRemark(sessionId, studentId, text);
    res.json({ ok: true });
  }),
);

router.put(
  '/sessions/:id/grade/:studentId',
  wrapAsync(async (req, res) => {
    const sessionId = idParam.parse(req.params.id);
    const studentId = idParam.parse(req.params.studentId);
    const { value } = setGradeSchema.parse(req.body);
    AttendanceDAO.setGrade(sessionId, studentId, value);
    res.json({ ok: true });
  }),
);

// Exports
router.get(
  '/sessions/:id/export/csv',
  wrapAsync(async (req, res) => {
    const sessionId = idParam.parse(req.params.id);
    const rows = AttendanceDAO.getForSession(sessionId);
    const headers = ['prenom', 'nom', 'statut', 'note', 'remarque'];
    const data = rows.map((r) => ({
      prenom: r.firstName,
      nom: r.lastName,
      statut: r.status,
      note: r.grade ?? '',
      remarque: r.remark ?? '',
    }));
    const csv = toCsv(headers, data);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="seance_${sessionId}.csv"`);
    res.send(csv);
  }),
);

router.get(
  '/sessions/:id/export/pdf',
  wrapAsync(async (req, res) => {
    const sessionId = idParam.parse(req.params.id);
    const s = SessionDAO.get(sessionId);
    if (!s) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Séance inconnue' } });
    const students = AttendanceDAO.getForSession(sessionId).map((r) => ({
      firstName: r.firstName,
      lastName: r.lastName,
    }));
    const stream = buildSessionPdf({
      classe: `#${s.classId}`,
      date: s.startAt,
      subject: s.subject,
      room: s.room,
      students,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="appel_seance_${sessionId}.pdf"`);
    stream.pipe(res);
  }),
);

// Stats
router.get(
  '/stats/class/:classId',
  wrapAsync(async (req, res) => {
    const classId = idParam.parse(req.params.classId);
    const { from, to } = req.query;
    const stats = StatsDAO.classStats(classId, { from, to });
    res.json(stats);
  }),
);

router.get(
  '/stats/student/:studentId',
  wrapAsync(async (req, res) => {
    const studentId = idParam.parse(req.params.studentId);
    const { from, to } = req.query;
    const stats = StatsDAO.studentStats(studentId, { from, to });
    if (!stats) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Élève inconnu' } });
    res.json(stats);
  }),
);
