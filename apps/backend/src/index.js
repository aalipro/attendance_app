import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { notFoundMiddleware, errorMiddleware } from './middleware/error.js';
import { router as apiRouter } from './routes/api.js';
import { authRouter } from './routes/auth.js';
import { authenticateJWT } from './middleware/auth.js';
import { ensureDatabase, db } from './lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure DB and migrations are applied before serving API
ensureDatabase();

const app = express();

// CORS for dev
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Auth routes (publiques)
app.use('/api/auth', authRouter);

// API protégée par JWT
app.use('/api', authenticateJWT, apiRouter);

// Serve frontend in production, if present
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (_req, res, next) => {
  if (_req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) next();
  });
});

// 404 + error handler
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5174; // 5174 to avoid clashing with Vite dev
app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  try {
    db.close();
  } catch {}
  process.exit(0);
});
