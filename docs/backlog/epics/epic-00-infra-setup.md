# Epic 0 : Infrastructure & Setup

**Estimation** : L (5-8j) | **Dépendances** : Aucune | **Slice** : 1

## Objectif

Mettre en place environnement de dev complet (Express + Expo + MySQL + MongoDB).

## Critères acceptation

- Backend Express tourne en local Node 20
- Frontend Expo démarre iOS/Android/Web
- MySQL 8 + MongoDB 6 accessibles
- Variables env configurées
- Git initialisé

## User Stories

- US 0.1 : Backend Express+TS configuré
- US 0.2 : Frontend Expo RN configuré
- US 0.3 : MySQL et MongoDB en local

## Tasks Backend

- [ ] Init Node 20 + Express + TS
- [ ] Install : express, helmet, cors, rate-limit, pino, dotenv, uuid, mysql2
- [ ] Config tsconfig (ES modules, strict)
- [ ] Structure : src/index.ts, middleware/, routes/, utils/
- [ ] Config MySQL (pool mysql2)
- [ ] Config Mongoose
- [ ] Endpoint GET /health
- [ ] Test npm run dev

## Tasks Frontend

- [ ] Init Expo
- [ ] Install : zustand, react-query, axios, nativewind
- [ ] Config Tailwind + NativeWind
- [ ] Structure : app/, components/, hooks/, services/, store/
- [ ] Config EXPO_PUBLIC_API_URL
- [ ] Test build

## Tasks DB

- [ ] MySQL 8 local (installation native ou Homebrew)
- [ ] MongoDB 6 local (installation native ou Homebrew)
- [ ] .env avec DATABASE_URL + MONGO_URL
- [ ] Test connexions

## Tasks DevOps

- [ ] .gitignore
- [ ] README.md
