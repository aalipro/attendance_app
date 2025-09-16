# Guide de lancement — Frontend (Vue 3 + Vite + Pinia + Tailwind)

Ce guide explique comment lancer, développer et builder l'application frontend.

## 1) Prérequis
- Node.js 18 ou supérieur

## 2) Installation des dépendances (à la racine du monorepo)
Exécutez dans le dossier "Projet Info":

```bash
npm install
```

La commande installera les dépendances du backend et du frontend.

## 3) Lancer uniquement le frontend en développement
Depuis la racine du projet ou directement dans `apps/frontend`:

- Via la racine (recommandé car proxy déjà configuré):
```bash
npm run dev --workspace apps/frontend
```

- Ou depuis le dossier `apps/frontend`:
```bash
npm run dev
```

Le frontend démarre sur:
- http://localhost:5173

Un proxy redirige automatiquement les appels `/api` vers le backend (http://localhost:5174) lorsque le backend tourne.

## 4) Lancer frontend + backend ensemble
Depuis la racine du projet:
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5174

## 5) Builder le frontend (production)
Depuis la racine ou `apps/frontend`:
```bash
npm run build --workspace apps/frontend
```

Le build sera généré dans `apps/frontend/dist`. En production, le backend est configuré pour servir ce dossier lorsqu'il est lancé avec `npm run start` à la racine.

## 6) Scripts utiles
- `npm run dev` (racine): lance front + back en parallèle
- `npm run dev --workspace apps/frontend`: lance uniquement le frontend
- `npm run build --workspace apps/frontend`: build de production du frontend

## 7) Dépannage
- Si le frontend ne s'ouvre pas, vérifiez que le port 5173 n'est pas occupé.
- Si les appels API échouent en dev, assurez-vous que le backend est démarré sur http://localhost:5174 (via `npm run dev` à la racine ou `npm run dev --workspace apps/backend`).
- Pour réinstaller proprement, vous pouvez supprimer le dossier `node_modules` à la racine puis relancer `npm install`.

## 8) PWA (optionnel)
Un manifest et un service worker simples sont inclus. En dev, le service worker est chargé; en production, il servira principalement à optimiser le chargement des assets.
