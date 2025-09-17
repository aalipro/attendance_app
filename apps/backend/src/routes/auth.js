import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../lib/db.js';
import { issueToken, authenticateJWT } from '../middleware/auth.js';

export const authRouter = express.Router();

function getUserByEmail(email) {
  return db.prepare('SELECT * FROM User WHERE email = ?').get(email);
}

function createUser({ email, password, fullName }) {
  const passwordHash = bcrypt.hashSync(password, 12);
  const info = db
    .prepare('INSERT INTO User(email, passwordHash, fullName) VALUES (?, ?, ?)')
    .run(email, passwordHash, fullName);
  return db.prepare('SELECT id, email, fullName, createdAt FROM User WHERE id = ?').get(info.lastInsertRowid);
}

authRouter.post('/register', (req, res) => {
  const { email, password, fullName } = req.body || {};
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'email, password, fullName requis' } });
  }
  const exists = getUserByEmail(email);
  if (exists) return res.status(409).json({ error: { code: 'CONFLICT', message: 'Email déjà utilisé' } });
  const user = createUser({ email, password, fullName });
  const token = issueToken(user);
  res.status(201).json({ token, user });
});

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'email et password requis' } });
  }
  const user = getUserByEmail(email);
  if (!user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Identifiants invalides' } });
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Identifiants invalides' } });
  const token = issueToken(user);
  res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, createdAt: user.createdAt } });
});

authRouter.get('/me', authenticateJWT, (req, res) => {
  const row = db.prepare('SELECT id, email, fullName, createdAt FROM User WHERE id = ?').get(req.user.id);
  res.json(row);
});
