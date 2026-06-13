# Arius

CRM mobile-first pour gérer entreprises, contacts, notes, rendez-vous, devis, objectifs et chiffre d'affaires.

## Stack

- Backend : Node 20, Express, TypeScript, MySQL, MongoDB, JWT
- Frontend : Expo React Native, React Native Web, Zustand, TanStack Query, Axios, NativeWind
- Dev local : Docker Compose

## Lancer le projet

Prérequis :

- Docker Desktop
- Node 20+ si tu veux lancer les services hors Docker

Commande recommandée :

```bash
docker compose up --build
```

URLs utiles :

- Frontend : `http://localhost:8081`
- API : `http://localhost:3000`
- Health API : `http://localhost:3000/health`
- Swagger UI, hors production seulement : `http://localhost:3000/docs`

Bases exposées sur la machine :

- MySQL : `localhost:3307`, user `root`, password `root`, base `arius`
- MongoDB : `localhost:27018`

Dans Docker, le backend utilise `mysql:3306` et `mongo:27017`.

## Réinitialiser les bases Docker

Le schéma MySQL est chargé depuis `backend/src/db/schema.sql` au premier démarrage du volume MySQL.

Pour repartir d'une base vide :

```bash
docker compose down -v
docker compose up --build
```

## Données de démo

Pour remplir MySQL et MongoDB avec des fixtures :

```bash
cd backend
npm run seed
```

Compte créé :

- Email : `demo@arius.local`
- Mot de passe : `password123`

## Lancer hors Docker

Backend :

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Frontend :

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm start
```

## Tests

Backend :

```bash
cd backend
npm test
npm run build
```

Frontend :

```bash
cd frontend
pnpm test
```

## Documentation

- Swagger dev : `http://localhost:3000/docs`
- Spec OpenAPI dev : `http://localhost:3000/docs.json`
- Dossier CDA : [docs/cda-dossier-plan.md](docs/cda-dossier-plan.md)
- Veille sécurité : [docs/veille-securite.md](docs/veille-securite.md)
