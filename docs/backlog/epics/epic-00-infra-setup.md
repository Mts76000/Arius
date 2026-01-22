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

- [x] Init Node 20 + Express + TS
- [x] Install : express, helmet, cors, rate-limit, pino, dotenv, uuid, mysql2
- [x] Config tsconfig (ES modules, strict)
- [x] Structure : src/index.ts, middleware/, routes/, utils/
- [x] Config MySQL (pool mysql2)
- [x] Config Mongoose
- [x] Endpoint GET /health
- [x] Test npm run dev

## Tasks Frontend

- [x] Init Expo
- [x] Install : zustand, react-query, axios, nativewind
- [x] Config Tailwind + NativeWind
- [x] Structure : app/, components/, hooks/, services/, store/
- [x] Config EXPO_PUBLIC_API_URL
- [x] Test build

## Tasks DB

- [x] MySQL 8 local (installation native ou Homebrew)
- [x] MongoDB 6 local (installation native ou Homebrew)
- [x] .env avec DATABASE_URL + MONGO_URL
- [x] Test connexions

## Tasks DevOps

- [x] .gitignore
- [x] README.md
