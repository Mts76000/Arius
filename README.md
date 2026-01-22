# Arius - CRM Mobile

Application CRM mobile-first pour gérer entreprises, contacts, notes, RDVs et devis.

## Stack Technique

**Backend**

- Node 20 + Express + TypeScript
- MySQL 8 (utilisateurs, entreprises, contacts, objectifs, CA)
- MongoDB 6 (notes, RDVs, devis, activités)
- Authentification JWT (+ Google Sign-In)

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
  backlog/      # Epics et user stories
  fullstack-architecture.md
```

## Commandes

**Backend**

- `npm run dev` - Dev avec hot reload (tsx)
- `npm run build` - Build TypeScript
- `npm start` - Production (node dist/server.js)

**Frontend**

- `npm start` - Dev server
- `npm run ios` - iOS simulator
- `npm run android` - Android emulator
- `npm run web` - Navigateur

## Documentation

Voir [docs/backlog/backlog-mvp.md](docs/backlog/backlog-mvp.md) pour les epics et user stories.
