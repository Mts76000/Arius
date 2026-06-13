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

## Drizzle

Drizzle est utilisé côté backend pour décrire le schéma MySQL en TypeScript et préparer les évolutions de base.

Fichiers importants :

- `backend/src/db/schema.ts` : schéma MySQL version TypeScript.
- `backend/drizzle.config.ts` : config Drizzle, lit les variables `MYSQL_*` du `.env`.
- `backend/src/db/drizzle.ts` : connexion Drizzle utilisée par les scripts.
- `backend/src/scripts/seed.ts` : fixtures avec Faker.

Commandes :

```bash
cd backend

# Génère des fichiers de migration dans backend/drizzle/
npm run db:generate

# Applique le schéma Drizzle sur la base configurée dans .env
npm run db:push

# Remplit la base avec des fausses données
npm run seed
```

En local avec Docker, la base MySQL est exposée sur `localhost:3307`. Le `.env` backend doit donc contenir :

```env
MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=arius
```

Note : au premier démarrage Docker, le schéma initial est encore chargé depuis `backend/src/db/schema.sql`. Drizzle sert ensuite à faire évoluer le schéma et à garder une version TypeScript lisible de la base.

## Emails Resend

Le mot de passe oublié utilise Resend côté backend.

Variables à configurer dans `backend/.env` :

```env
FRONTEND_URL=http://localhost:8081
RESEND_API_KEY=ta_cle_resend
RESEND_FROM_EMAIL=contact@example.com
```

Flux :

- L'utilisateur clique sur `Mot de passe oublié ?` depuis la page de connexion.
- L'API envoie un lien temporaire par email.
- Le lien ouvre `/reset-password?token=...`.
- L'utilisateur définit un nouveau mot de passe.

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

## Lancer sur simulateur iOS

Docker peut rester lancé pour le backend, MySQL et MongoDB :

```bash
docker compose up --build
```

L'app iOS doit être lancée depuis le projet frontend sur la machine, pas depuis le conteneur web :

```bash
cd frontend
pnpm install
pnpm ios
```

Prérequis :

- Xcode installé
- Un simulateur iOS disponible via Xcode

Sur simulateur iOS, l'API peut rester sur `http://localhost:3000`. Sur un vrai iPhone, il faudra remplacer `localhost` par l'adresse IP locale du Mac dans la configuration frontend.

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
