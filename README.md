# Arius

CRM mobile-first pour gérer entreprises, contacts, notes, rendez-vous, devis, objectifs et chiffre d'affaires.

## Stack

- Backend : Node 20, Express, TypeScript, MySQL, MongoDB, JWT
- Frontend : Expo React Native, React Native Web, Zustand, TanStack Query, NativeWind
- Dev local : Docker Compose, Drizzle, Faker, Zod, Vitest

## Lancer en dev

```bash
docker compose up --build
```

URLs utiles :

- Frontend web : `http://localhost:8081`
- API : `http://localhost:3000`
- Health API : `http://localhost:3000/health`
- Swagger dev : `http://localhost:3000/docs`

## Voir les bases

MySQL :

- UI Adminer : `http://localhost:8082`
- Serveur : `mysql`
- User : `root`
- Mot de passe : `root`
- Base : `arius`
- Depuis le Mac : `localhost:3307`

MongoDB :

- UI mongo-express : `http://localhost:8083`
- Depuis le Mac : `localhost:27018`
- Dans Docker : `mongo:27017`

## Données de démo

Remplir MySQL et MongoDB avec des fixtures Faker :

```bash
cd backend
npm run db:seed
```

Compte créé :

- Email : `demo@arius.local`
- Mot de passe : `password123`

## Réinitialiser les bases Docker

```bash
docker compose down -v
docker compose up --build
```

Le schéma MySQL initial est chargé depuis `backend/src/db/schema.sql`.

## Backend hors Docker

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Avec MySQL Docker depuis le Mac :

```env
MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=arius
MONGO_URL=mongodb://localhost:27018/arius
```

Commandes utiles :

```bash
npm run lint
npm run build
npm test
npm run db:push
npm run db:seed
```

## Frontend web

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm web
```

## Simulateur iOS

Garde Docker lancé pour l'API, MySQL et MongoDB :

```bash
docker compose up --build
```

Puis lance l'app depuis le projet frontend :

```bash
cd frontend
pnpm install
pnpm ios
```

Prérequis : Xcode installé avec au moins un simulateur iOS.

Sur simulateur iOS, l'API peut rester sur `http://localhost:3000`. Sur un vrai iPhone, remplace `localhost` par l'adresse IP locale du Mac dans la config frontend.

## Tests

Backend :

```bash
cd backend
npm run lint
npm run build
npm test
```

Frontend :

```bash
cd frontend
pnpm lint
pnpm test
```

## Variables Resend

Le mot de passe oublié utilise Resend côté backend :

```env
FRONTEND_URL=http://localhost:8081
RESEND_API_KEY=ta_cle_resend
RESEND_FROM_EMAIL=contact@example.com
```
