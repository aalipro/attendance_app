import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function authenticateJWT(req, res, next) {
  const auth = req.headers.authorization || '';
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token manquant' } });
  }
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (_e) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token invalide' } });
  }
}

export function issueToken(user) {
  const payload = { sub: user.id, email: user.email };
  const opts = { expiresIn: process.env.TOKEN_TTL || '7d' };
  return jwt.sign(payload, JWT_SECRET, opts);
}
