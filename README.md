# Arius

CRM mobile-first pour gérer entreprises, contacts, notes, rendez-vous, devis, objectifs et chiffre d'affaires.

## Stack

- Backend : Node 22, Express, TypeScript, MySQL, MongoDB, JWT
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

Sur une base neuve, Docker applique les migrations Drizzle avant de lancer l'API.

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
npm run db:generate
npm run db:migrate
npm run db:seed
npm run openapi:export
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
docker compose up --build mysql mongo adminer mongo-express backend
```

Puis lance l'app depuis le projet frontend :

```bash
cd frontend
pnpm install
pnpm ios
```

Le script iOS utilise `localhost` et le port Expo `8084` pour éviter le conflit avec le frontend Docker exposé sur `8081`.

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
pnpm test:e2e
```

## OpenAPI et types

```bash
cd backend
npm run openapi:export
cd ../frontend
pnpm types:api
```

Le fichier `shared/openapi.json` sert de contrat API versionné. Les types frontend générés sont dans `frontend/shared/openapiTypes.ts`.

## Variables Resend

Le mot de passe oublié utilise Resend côté backend :

```env
FRONTEND_URL=http://localhost:8081
RESEND_API_KEY=ta_cle_resend
RESEND_FROM_EMAIL=contact@example.com
```

## Monitoring optionnel

En production, les logs HTTP sortent en JSON structuré avec redaction des headers sensibles. Pour capturer les erreurs serveur dans Sentry :

```env
SENTRY_DSN=https://...
SENTRY_TRACES_SAMPLE_RATE=0
```

## Mise en ligne

La procédure détaillée est dans `docs/deploiement-coolify.md`.

L'app mobile ne se déploie pas comme un site web : elle se lance en simulateur ou se distribue ensuite via EAS/TestFlight/App Store.

Pour le référentiel, on peut mettre en ligne :

- l'API backend ;
- la version web exportée du frontend.

Avec Coolify, l'idée est de connecter le repo GitHub, configurer les variables d'environnement de production, brancher MySQL/MongoDB, puis déployer automatiquement après push.

Points importants en production :

- `NODE_ENV=production`
- vrai `JWT_SECRET`
- `FRONTEND_URL` vers le domaine web
- `EXPO_PUBLIC_API_URL` vers le domaine API
- `RESEND_API_KEY` si le reset password doit envoyer de vrais emails
- `SENTRY_DSN` si le monitoring est activé
- ne pas exposer Adminer ou mongo-express publiquement sans protection
- ajouter un volume persistant Coolify sur `/app/uploads` pour conserver les logos
