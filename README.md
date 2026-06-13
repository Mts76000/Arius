# Arius - CRM Mobile

Application CRM mobile-first pour gérer entreprises, contacts, notes, RDVs et devis.

## Stack Technique

**Backend**

- Node 20 + Express + TypeScript
- MySQL 8 (utilisateurs, entreprises, contacts, objectifs, CA)
- MongoDB 6 (notes, RDVs, devis, activités)
- Authentification JWT

**Frontend**

- Expo React Native + React Native Web
- Zustand (state), TanStack Query (cache), Axios (HTTP)
- NativeWind/Tailwind CSS

## Installation

### Prérequis

- Node 20+
- MySQL 8 (local ou Homebrew)
- MongoDB 6 (local ou Homebrew)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos credentials MySQL/Mongo
npm run dev
```

### Docker

Pour lancer tout le projet sans MAMP et sans ouvrir un terminal par service :

```bash
docker compose up --build
```

Services disponibles :

- Frontend Expo Web : `http://localhost:8081`
- Backend API : `http://localhost:3000`
- MySQL : `localhost:3306` (`root` / `root`, base `arius`)
- MongoDB : `localhost:27017`

Le schema MySQL `backend/src/db/schema.sql` est charge automatiquement au premier demarrage du volume MySQL. Pour repartir d'une base vide :

```bash
docker compose down -v
docker compose up --build
```

#### Health check

Quand l'API est lancée, deux routes permettent de vérifier son état :

- `GET /` - Status complet lisible dans le navigateur
- `GET /health` - Même status complet, nom standard pour les outils de monitoring

Ces routes vérifient que l'API répond, que MySQL est disponible et que MongoDB est disponible. Si un service est indisponible, la réponse HTTP passe en `503`.

Exemple de réponse :

```json
{
  "status": "ok",
  "service": "arius-api",
  "timestamp": "2026-06-13T12:00:00.000Z",
  "uptimeSeconds": 42,
  "lines": [
    "api: ok (running, 0ms)",
    "mysql: ok (connected, 4ms)",
    "mongo: ok (connected, 6ms)"
  ],
  "checks": [
    { "name": "api", "status": "ok", "message": "running", "latencyMs": 0 },
    {
      "name": "mysql",
      "status": "ok",
      "message": "connected",
      "latencyMs": 4
    },
    {
      "name": "mongo",
      "status": "ok",
      "message": "connected",
      "latencyMs": 6
    }
  ]
}
```

#### Documentation API

Swagger UI est disponible quand le backend est lancé :

- `http://localhost:3000/docs` - Interface Swagger
- `http://localhost:3000/docs.json` - Specification OpenAPI JSON

Ces routes de documentation sont exposees uniquement hors production (`NODE_ENV !== "production"`).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## Structure

```
backend/
  src/
    config/     # Configuration env
    db/         # MySQL + Mongo connections
    middleware/ # Auth, validation
    routes/     # API endpoints
    utils/      # Helpers
  .env          # Variables d'environnement

frontend/
  app/          # Expo Router screens
  components/   # UI components
  services/     # API calls
  store/        # Zustand stores
  hooks/        # Custom hooks

docs/
  cda-dossier-plan.md # Plan du dossier projet CDA
  veille-securite.md  # Veille securite du projet
```

## Commandes

**Backend**

- `npm run dev` - Dev avec hot reload (tsx)
- `npm run build` - Build TypeScript
- `npm start` - Production (node dist/server.js)
- `npm test` - Lance tous les tests backend
- `npm run test:watch` - Lance les tests backend en mode watch
- `npm run test:coverage` - Lance les tests backend avec couverture
- `docker compose up --build` - Lance MySQL, MongoDB, backend et frontend

**Frontend**

- `npm start` - Dev server
- `npm run ios` - iOS simulator
- `npm run android` - Android emulator
- `npm run web` - Navigateur

## Documentation

Voir [docs/cda-dossier-plan.md](docs/cda-dossier-plan.md) pour le plan du dossier CDA et [docs/veille-securite.md](docs/veille-securite.md) pour la veille securite.
