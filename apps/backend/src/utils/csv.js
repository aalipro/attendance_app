export function toCsv(headers, rows) {
  const sep = ';';
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes('"') || s.includes(sep) || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [];
  lines.push(headers.join(sep));
  for (const r of rows) lines.push(headers.map((h) => esc(r[h])).join(sep));
  const bom = '\ufeff';
  return bom + lines.join('\n');
}

export function parseCsvStudents(text) {
  // Attendu en-têtes FR: prenom;nom;email;numero (UTF-8 avec BOM possible)
  const raw = text.replace(/\r/g, '');
  const noBom = raw.replace(/^\uFEFF/, '');
  const lines = noBom
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length);
  if (!lines.length) return [];
  const sep = ';';
  const header = lines[0]
    .split(sep)
    .map((h) => h.replace(/^\uFEFF/, '').trim().toLowerCase());
  const idx = {
    prenom: header.indexOf('prenom'),
    nom: header.indexOf('nom'),
    email: header.indexOf('email'),
    numero: header.indexOf('numero'),
  };
  // Si entêtes manquantes, on essaie de deviner par position minimale (prenom;nom;email;numero)
  if (idx.prenom === -1 && header.length > 0) idx.prenom = 0;
  if (idx.nom === -1 && header.length > 1) idx.nom = 1;
  if (idx.email === -1 && header.length > 2) idx.email = 2;
  if (idx.numero === -1 && header.length > 3) idx.numero = 3;
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep);
    out.push({
      firstName: cols[idx.prenom]?.trim() || '',
      lastName: cols[idx.nom]?.trim() || '',
      email: cols[idx.email]?.trim() || '',
      studentNumber: cols[idx.numero]?.trim() || '',
    });
  }
  return out.filter((r) => r.firstName && r.lastName);
}
