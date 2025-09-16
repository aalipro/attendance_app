import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureDatabase, db } from './lib/db.js';
import { router as apiRouter } from './routes/api.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Init DB (migrations)
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

// API routes
app.use('/api', apiRouter);

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
