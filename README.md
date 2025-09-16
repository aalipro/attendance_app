# Application Suivi Présence/Absence – EPS (Vue 3 + Node + SQLite)

Monorepo complet avec backend (Express + SQLite + better-sqlite3) et frontend (Vue 3 + Vite + Pinia + Tailwind).

## Prérequis
- Node.js 18+

## Installation
```bash
npm install
```

## Réinitialiser la base + données de démo
```bash
npm run db:reset
```
La base SQLite est stockée dans `data/app.sqlite`.

## Lancer en développement
```bash
npm run dev
```
- Backend: http://localhost:5174
- Frontend: http://localhost:5173 (proxie l'API `/api` vers le backend)

Pour lancer seulement le backend:
```bash
npm run dev:back
```

## Build/Prod
```bash
npm run build
npm run start
```
Le backend servira le frontend compilé depuis `apps/frontend/dist`.

## API (exemples cURL)

Créer une classe
```bash
curl -X POST http://localhost:5174/api/classes \
  -H "Content-Type: application/json" \
  -d '{"name":"Terminale STMG C","level":"Terminale","year":2024}'
```

Lister classes
```bash
curl http://localhost:5174/api/classes
```

Import élèves (CSV UTF-8 BOM, entêtes: `prenom;nom;email;numero`)
```bash
curl -X POST "http://localhost:5174/api/students/import?classId=1" \
  -H "Content-Type: application/json" \
  -d @- << 'EOF'
{"csv":"\ufeffprenom;nom;email;numero\nAlice;Martin;alice@example.com;100\nBob;Durand;;101\n"}
EOF
```

Créer séance
```bash
curl -X POST http://localhost:5174/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"classId":1,"subject":"EPS","room":"Gymnase","startAt":"2025-09-14T08:00","endAt":"2025-09-14T09:00"}'
```

Marquer présence
```bash
curl -X PUT http://localhost:5174/api/sessions/1/attendance/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"PRESENT"}'
```

Remarque séance
```bash
curl -X PUT http://localhost:5174/api/sessions/1/remark \
  -H "Content-Type: application/json" \
  -d '{"text":"Très bon engagement"}'
```

Note élève
```bash
curl -X PUT http://localhost:5174/api/sessions/1/grade/1 \
  -H "Content-Type: application/json" \
  -d '{"value":16}'
```

Export CSV séance
```bash
curl -L http://localhost:5174/api/sessions/1/export/csv -o seance_1.csv
```

Export PDF séance (feuille d’appel)
```bash
curl -L http://localhost:5174/api/sessions/1/export/pdf -o seance_1.pdf
```

Stats classe
```bash
curl http://localhost:5174/api/stats/class/1
```

## Qualité
- ESLint + Prettier configurés.
- Tests de base DAO/services: `npm test` (dans apps/backend)

## Sécurité & validation
- CORS activé en dev
- Validation Zod côté API
- Erreurs normalisées: `{ error: { code, message } }`

## Frontend
- Pages: Classes, Détail Classe, Séances, Détail Séance (Appel/Remarques/Notes), Stats, Paramètres
- Composants: AttendanceTable, StatusToggle, GradeInput, RemarkEditor, StatsCards, Toast
- Accessibilité: navigation clavier (StatusToggle), labels, aria-*, contrastes
- Responsive: sidebar cachée sur mobile, header compact
- PWA légère: manifest + service worker simple (assets)

## Modèle CSV élèves (exemple)
```
prenom;nom;email;numero
Alice;Martin;alice@example.com;1001
Benoit;Durand;;1002
```
