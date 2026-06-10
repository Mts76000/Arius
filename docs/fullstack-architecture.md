# Arius - Architecture Fullstack

**Projet**: Arius - CRM mobile-first pour commerciaux terrain  
**Version**: 2.0  
**Date**: 10 juin 2026  
**Statut**: Documentation alignee sur le code existant

---

## 1. Objectif

Ce document decrit l'architecture reelle du projet Arius afin de servir de reference au developpement, aux tests et au dossier CDA.

Decisions actees:

- Les noms techniques restent en anglais dans le code et les bases de donnees: `users`, `user_id`, `created_at`, `updated_at`, etc.
- Le projet n'est plus offline-first. Les notes sont creees via API quand le client est connecte.
- L'activity feed n'est pas dans le perimetre actuel. Aucune collection `activities` n'est requise pour le MVP courant.
- L'authentification est une implementation applicative basee sur `bcryptjs` et `jsonwebtoken`. La dependance `better-auth` est presente mais non utilisee dans le flux actuel.
- Le deploiement Coolify/Docker est reporte. Le code doit rester deployable, mais la procedure de production sera documentee dans une iteration dediee.

---

## 2. Structure du depot

Le depot actuel est un monorepo simple:

```text
Arius/
  backend/   API Express.js + acces MySQL/MongoDB
  frontend/  Application Expo React Native + React Native Web
  docs/      Documentation produit, architecture, backlog, CDA
```

Cette structure remplace l'ancienne cible `apps/*` et `packages/*`. Les types ne sont pas encore partages dans un package dedie; chaque partie garde ses interfaces TypeScript locales.

---

## 3. Stack technique

### Backend

- Node.js 20+
- Express.js 5
- TypeScript
- MySQL 8 via `mysql2`
- MongoDB 6 via Mongoose
- JWT via `jsonwebtoken`
- Hash mot de passe via `bcryptjs`
- Validation serveur via Zod
- Upload fichiers via Multer
- Securite HTTP via Helmet, CORS et `express-rate-limit`
- Logs HTTP via Pino / `pino-http`
- Export Excel via `xlsx`

### Frontend

- Expo React Native
- React Native Web
- Expo Router
- Zustand pour l'etat d'authentification
- TanStack Query pour le cache serveur
- Axios pour les appels API
- NativeWind / Tailwind CSS pour le style

### Tests

- Backend: Vitest, tests unitaires et tests de controllers avec mocks DB.
- Frontend: Vitest, tests de services API et utilitaires.
- Les tests de composants React Native pourront etre ajoutes avec React Native Testing Library dans une iteration suivante.

---

## 4. Architecture logique

```text
Frontend Expo
  screens / components / hooks / services
          |
          | HTTPS/JSON, Authorization Bearer JWT
          v
Backend Express
  routes -> controllers -> models/services
          |                |
          |                +-> MySQL 8: donnees relationnelles
          |                +-> MongoDB 6: documents
          |
          +-> middleware auth, validation, rate-limit, logs
```

Le backend expose une API REST JSON sous `/v1`. Les endpoints proteges passent par `requireAuth`, qui verifie le JWT et renseigne `req.userId`.

---

## 5. Authentification et securite

### Flux actuel

- `POST /v1/auth/register`: creation d'un utilisateur avec mot de passe hashe.
- `POST /v1/auth/login`: verification email/mot de passe, retour d'un JWT.
- `POST /v1/auth/google`: verification d'un Google ID token, creation ou association d'utilisateur.
- `GET /v1/auth/me`: lecture du profil courant.

### Implementation

- Les mots de passe sont hashes avec `bcryptjs`.
- Les tokens sont signes avec `jsonwebtoken`, algorithme HS256, expiration 7 jours.
- Le secret provient de `JWT_SECRET`.
- Les routes metier filtrent les donnees avec `user_id`.
- Les utilisateurs anonymises ne peuvent plus utiliser leur token.

### Points de vigilance

- En production, `JWT_SECRET` doit etre long, aleatoire et different de la valeur de developpement.
- La configuration CORS devra etre restreinte aux domaines de production.
- Les erreurs ne doivent pas exposer de details SQL/Mongo au client.
- Les uploads doivent rester limites en taille et en types MIME autorises.

---

## 6. Base relationnelle MySQL

MySQL contient les donnees fortement relationnelles et les aggregations de chiffre d'affaires.

Les tables actuelles sont:

### `users`

- `id` CHAR(36), cle primaire UUID
- `email` VARCHAR(255), unique, obligatoire
- `password` VARCHAR(255), nullable pour les comptes Google
- `google_sub` VARCHAR(255), unique, nullable
- `prenom` VARCHAR(100), nullable
- `nom` VARCHAR(100), nullable
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

### `entreprises`

- `id` VARCHAR(36), cle primaire UUID
- `user_id` VARCHAR(36), FK vers `users.id`
- `nom` VARCHAR(255), obligatoire
- `statut` ENUM: `client`, `prospect`, `fournisseur`, `a_reactiver`
- `rue`, `code_postal`, `ville`, `pays`
- `description` TEXT
- `logo` VARCHAR(500)
- `created_at`, `updated_at`

Index principal: `(user_id, statut, nom)`.

### `contacts`

- `id` CHAR(36), cle primaire UUID
- `user_id` CHAR(36), FK vers `users.id`
- `entreprise_id` CHAR(36), FK vers `entreprises.id`
- `prenom`, `nom`, `poste`, `email`
- `tel_direct`, `tel_mobile`
- `contact_principal` BOOLEAN
- `commentaire` TEXT
- `created_at`, `updated_at`

Regle metier: lorsqu'un contact devient principal, les autres contacts de la meme entreprise sont remis a `FALSE`.

### `objectifs_mensuels`

- `id` VARCHAR(36), cle primaire UUID
- `user_id` VARCHAR(36), FK vers `users.id`
- `annee` INT
- `mois` INT
- `objectif_ht` DECIMAL(10,2)
- `created_at`, `updated_at`

Contrainte unique: `(user_id, annee, mois)`.

### `ca_mensuel`

- `id` VARCHAR(36), cle primaire UUID
- `user_id` VARCHAR(36), FK vers `users.id`
- `entreprise_id` VARCHAR(36), FK vers `entreprises.id`
- `annee` INT
- `mois` INT
- `ca_ht` DECIMAL(10,2)
- `created_at`, `updated_at`

Contrainte unique: `(user_id, entreprise_id, annee, mois)`.

---

## 7. Collections MongoDB

MongoDB contient les documents metier moins relationnels.

### `notes`

- `_id` string UUID
- `user_id`
- `entreprise_id`
- `contenu`
- `type`: `appel`, `reunion`, `email`, `info`, `autre`
- `est_template`
- `nom_template`
- `createdAt`, `updatedAt`

### `rdvs`

- `_id` string UUID
- `user_id`
- `entreprise_id`
- `contact_id`, optionnel
- `titre`
- `description`
- `date_prevue`
- `duree_minutes`
- `statut`: `planifie`, `termine`, `annule`
- `createdAt`, `updatedAt`

### `devis`

- `_id` string UUID
- `user_id`
- `entreprise_id`
- `nom`
- `notes`
- `nom_fichier`
- `url_fichier`
- `type_mime`
- `taille_octets`
- `createdAt`, `updatedAt`

Les references vers MySQL sont stockees sous forme d'UUID string (`user_id`, `entreprise_id`, `contact_id`). Il n'y a pas de jointure cross-database; les enrichissements se font cote service ou controller.

---

## 8. API REST

Base URL: `/v1`

### Auth

- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/google`
- `GET /v1/auth/me`

### Entreprises

- `GET /v1/entreprises?recherche=&statut=&page=&limite=`
- `GET /v1/entreprises/:id`
- `POST /v1/entreprises`
- `PUT /v1/entreprises/:id`
- `DELETE /v1/entreprises/:id`

### Contacts

- `GET /v1/entreprises/:entreprise_id/contacts`
- `POST /v1/entreprises/:entreprise_id/contacts`
- `GET /v1/contacts/:id`
- `PUT /v1/contacts/:id`
- `DELETE /v1/contacts/:id`

### Notes

- `GET /v1/entreprises/:id/notes`
- `POST /v1/notes`
- `GET /v1/notes/:id`
- `PUT /v1/notes/:id`
- `DELETE /v1/notes/:id`
- `GET /v1/notes/search?q=`
- `GET /v1/templates/notes?type=`
- `GET /v1/dashboard/clients-suivi?jours_seuil=`

### RDV, devis, CA, objectifs, profil, export

Ces modules suivent le meme modele: routes Express, controller, model/service, filtrage par `user_id`.

---

## 9. Frontend

Le frontend est organise par responsabilite:

- `app/`: routes Expo Router et ecrans.
- `components/`: composants UI, cartes, modales, layout.
- `hooks/`: hooks TanStack Query par ressource.
- `services/`: appels API Axios.
- `store/`: store d'authentification Zustand.
- `utils/`: validation, stockage local, helpers.

Le token JWT est stocke via le store d'authentification et ajoute aux requetes via les services ou l'intercepteur Axios.

---

## 10. Tests et qualite

Commandes:

```bash
cd backend && npm run build && npm test
cd frontend && pnpm lint && pnpm test
```

Couverture actuelle:

- Helpers de securite utilisateur: hash, compare, JWT, anonymisation.
- Modeles MySQL: entreprises, contacts, requetes parametrees, isolation par `user_id`.
- Controllers: auth, contacts, notes, validations et erreurs.
- Frontend: validation de formulaires et services API.

Objectif suivant:

- Ajouter des tests de controllers pour RDV, devis, CA, objectifs, profil et export.
- Ajouter des tests de composants frontend avec React Native Testing Library.
- Ajouter un rapport de couverture avec seuil minimal.

---

## 11. CI/CD

Une GitHub Action execute les controles suivants:

- installation backend
- build backend
- tests backend
- installation frontend via pnpm
- lint frontend
- tests frontend

Le deploiement n'est pas automatise pour l'instant. La mise en production Coolify/Docker sera traitee dans une iteration separee.

---

## 12. Limites connues

- Pas de package shared entre backend et frontend; duplication de certains types.
- Pas d'ORM: les requetes MySQL sont ecrites a la main avec `mysql2`.
- Pas de migration versionnee avancee; le schema SQL est centralise dans `backend/src/db/schema.sql`.
- Pas de mode offline-first.
- Pas d'activity feed.
- Pas de tests end-to-end.
- Pas de procedure de deploiement finalisee.

---

## 13. Risques et mitigations

- **Derive schema/code**: garder `schema.sql` synchronise avec les models et ajouter des tests autour des requetes critiques.
- **Fuite de donnees entre utilisateurs**: tous les acces doivent inclure `user_id`; les tests doivent couvrir les cas hors proprietaire.
- **Secret JWT faible**: imposer une variable forte en production.
- **Uploads dangereux**: limiter taille, MIME, emplacement de stockage et acces public.
- **Multi-DB**: eviter les transactions cross-database; documenter les compensations si une action touche MySQL et MongoDB.
- **Absence de tests UI**: ajouter progressivement React Native Testing Library sur les composants critiques.
