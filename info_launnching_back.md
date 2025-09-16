# Guide de lancement — Backend (Node.js + Express + SQLite)

Ce guide explique comment lancer le serveur backend, réinitialiser la base, exécuter les tests et démarrer en production.

## 1) Prérequis
- Node.js 18 ou supérieur

## 2) Installation des dépendances (à la racine du monorepo)
Depuis le dossier "Projet Info":
```bash
npm install
```

## 3) Réinitialiser la base (migrations + seed)
Cette commande (depuis la racine) applique les migrations et charge des données d'exemple (2 classes, élèves, 3 séances):
```bash
npm run db:reset
```
La base SQLite est stockée ici: `data/app.sqlite`.

## 4) Lancer uniquement le backend en développement
- Via la racine (workspace):
```bash
npm run dev --workspace apps/backend
```
- Ou depuis le dossier `apps/backend`:
```bash
npm run dev
```
Le backend démarre sur:
- http://localhost:5174

CORS est activé en développement. Les routes de l'API sont préfixées par `/api`.

## 5) Lancer frontend + backend ensemble
Depuis la racine du projet:
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5174

## 6) Tester le backend (DAO/services)
Depuis la racine ou depuis `apps/backend`:
```bash
npm run test --workspace apps/backend
```

## 7) Build et démarrage en production
Générer le build du frontend puis démarrer le backend qui servira le dossier `apps/frontend/dist`:
```bash
npm run build
npm run start
```
Le serveur HTTP écoute sur `5174` par défaut (variable d'environnement `PORT` possible).

## 8) Points de terminaison principaux (exemples)
- GET /api/classes
- POST /api/classes
- PUT /api/classes/:id
- DELETE /api/classes/:id

- GET /api/students?classId=1
- POST /api/students
- PUT /api/students/:id
- DELETE /api/students/:id
- POST /api/students/import (body { csv })
- GET /api/students/export?classId=1

- GET /api/sessions?classId=1&from=...&to=...
- POST /api/sessions
- PUT /api/sessions/:id
- DELETE /api/sessions/:id
- POST /api/sessions/:id/duplicate

- GET /api/sessions/:id/attendance
- PUT /api/sessions/:id/attendance/:studentId  (body { status: PRESENT|ABSENT|RETARD|DISPENSE })
- PUT /api/sessions/:id/attendance            (body { updates: [{studentId, status}, ...] })

- PUT /api/sessions/:id/remark                (body { text })
- PUT /api/sessions/:id/remark/:studentId     (body { text })
- PUT /api/sessions/:id/grade/:studentId      (body { value })

- GET /api/sessions/:id/export/csv
- GET /api/sessions/:id/export/pdf

- GET /api/stats/class/:classId?from=...&to=...
- GET /api/stats/student/:studentId?from=...&to=...

Réponses d'erreur normalisées:
```json
{ "error": { "code": "...", "message": "..." } }
```

## 9) Dépannage
- Si le port 5174 est occupé, changez le port via la variable d'environnement `PORT` avant `npm run dev` ou `npm run start`.
- Si la base est corrompue ou incohérente, supprimez `data/app.sqlite` (sauvegardez si nécessaire) puis relancez `npm run db:reset`.
- Vérifiez que le fichier `data/app.sqlite` est accessible en écriture (droits système).
- Les logs HTTP (morgan) sont activés en dev pour aider au diagnostic.
