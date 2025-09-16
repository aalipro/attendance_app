export function notFoundMiddleware(_req, res, _next) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ressource introuvable' } });
}

export function errorMiddleware(err, _req, res, _next) {
  // Zod validation errors => 400 Bad Request
  if (err?.name === 'ZodError') {
    return res.status(400).json({
      error: {
        code: 'BAD_REQUEST',
        message: 'Requête invalide',
        details: err.issues?.map((i) => ({ path: i.path, message: i.message })) ?? [],
      },
    });
  }

  // Body parse errors
  if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'JSON invalide' } });
  }

  // SQLite constraint errors => 400 Bad Request
  if (err?.code && String(err.code).startsWith('SQLITE_CONSTRAINT')) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Contrainte de base de données non respectée' } });
  }

  console.error(err);
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Erreur interne';
  res.status(status).json({ error: { code, message } });
}

export function wrapAsync(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
