# Arius - Architecture Fullstack

**Projet**: Arius - CRM mobile-first pour commerciaux terrain  
**Version**: 1.1  
**Date**: 21 janvier 2026  
**Auteur**: Winston - Architecte  
**Statut**: Prêt pour développement  
**Mode**: Documentation uniquement (pas de code)

---

## 1. Introduction

- Objectif: document d’architecture complet et normé FR servant de référence pour le développement de l’itération MVP d’Arius.
- Périmètre: mobile-first, offline-first (création de notes hors-ligne + sync idempotente), backend Express.js (Node 20), MySQL 8 (relationnel) + MongoDB 6 (documents), Auth Better Auth + JWT, déploiement sur VPS via Coolify, monorepo standardisé.
- Standardisation FR: tous les noms (tables/collections/champs/endpoints) sont en français. Uniquement le terme « entreprises » — suppression de toute occurrence de « companies ».
- Utilisateurs cibles: commerciaux individuels; données isolées par utilisateur (pas de partage d’équipe en MVP).

### Journal des modifications
- 2026-01-21 — v1.1 — Réécriture complète FR + MySQL/Mongo + endpoints FR + schémas détaillés.
- 2026-01-15 — v1.0 — Version initiale (brouillon, désormais obsolète).

---

## 2. Architecture d’ensemble

- Style: client-serveur, API REST JSON stateless, authentification JWT, monorepo avec types partagés.
- Clients: React Native (Expo) pour iOS/Android + React Native Web; même périmètre fonctionnel, mise en page mobile-first.
- Backend: Express.js (Node 20 LTS), Prisma (MySQL), Mongoose (MongoDB), Better Auth + JWT, journaux structurés (Pino-like).
- Stockage: MySQL pour relationnel (utilisateurs, entreprises, contacts, objectifs_mensuels, ca_mensuel); MongoDB pour documents (notes, rdvs, devis, activites). Fichiers devis sur disque/S3-compatible, métadonnées en Mongo.
- Déploiement: VPS avec Coolify (containers api, web, mysql, mongo) derrière Traefik + Let’s Encrypt.
- Observabilité: journaux structurés, endpoint santé, (option) Sentry client, (option) Loki/Grafana via Coolify.

---

## 3. Plateforme & Infrastructure

- Hébergement: VPS (UE recommandé pour RGPD) — ex: 2 vCPU, 4 Go RAM, 80 Go SSD, Ubuntu 22.04 LTS.
- Orchestration: Coolify gère les services Docker, variables d’environnement, SSL via Traefik, déploiements Git.
- Réseau: HTTPS strict; Traefik route api.arius.exemple.com → API, app.arius.exemple.com → Web; MySQL et Mongo non exposés publiquement.
- Stockage fichiers: volume local pour MVP; chemin servi par l’API; prêt pour S3-compatible.
- Sauvegardes: `mysqldump` + `mongodump` quotidiens; rétention 7 quotidiens / 4 hebdo / 3 mensuels; sauvegarde des fichiers devis.
- Supervision: uptime (Betterstack/UptimeRobot), métriques Coolify; alertes indisponibilité et disque DB > 80%.

---

## 4. Monorepo & Structure

- Gestionnaire: npm/yarn workspaces; Turborepo optionnel.
- apps/mobile — App mobile Expo (cible principale).
- apps/web — App web (RN Web, parité fonctionnelle).
- apps/api — Service Express.js.
- packages/shared — Types TS, constantes, schémas de validation (Zod) partagés.
- packages/db-sql — Schéma Prisma, migrations, client MySQL.
- packages/db-mongo — Modèles Mongoose et configuration MongoDB.
- docs — prd.md, front-end-spec.md, fullstack-architecture.md.

---

## 5. Architecture Backend (Express.js)

- Runtime: Node 20 LTS; modules ES.
- Chaîne middleware: Helmet (sécurité), CORS (liste blanche origines mobile/web), body-parser JSON (10 Mo), URL-encoded, journalisation structurée, garde d’authentification (Better Auth + JWT), rate-limit (~100 req/min/IP), routage, gestion d’erreurs centralisée.
- API: REST JSON sur `/v1`, pagination et filtrage cohérents.
- Validation: Zod aux frontières; messages d’erreur normalisés (code, message, détails).
- AuthN/AuthZ: JWT; isolation stricte par `utilisateur_id` sur toutes les requêtes.
- Téléversements: Multer (limite 10 Mo, mime autorisés: pdf, docx, xlsx, image/*); métadonnées en Mongo (collection `devis`).
- Journalisation: corrélation par id de requête; masquage des secrets.

---

## 6. Modèle de données MySQL (relationnel)

- Moteur: MySQL 8+.
- Conventions: identifiants UUID v4 (`CHAR(36)`), timestamps `cree_le` / `modifie_le`; clé étrangère `utilisateur_id` partout pour l’isolation.

Tables (MVP):

1) `utilisateurs`
  - id CHAR(36) PK
  - email VARCHAR(255) UNIQUE NOT NULL
  - mot_de_passe_hache VARCHAR(255) NOT NULL
  - prenom VARCHAR(100) NULL
  - nom VARCHAR(100) NULL
  - cree_le DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
  - modifie_le DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)

2) `entreprises`
  - id CHAR(36) PK
  - utilisateur_id CHAR(36) NOT NULL FK -> utilisateurs(id)
  - nom VARCHAR(255) NOT NULL
  - statut ENUM('client','prospect','a_reactiver','fournisseur') NOT NULL
  - adresse_ligne VARCHAR(255) NULL
  - ville VARCHAR(100) NULL
  - code_postal VARCHAR(20) NULL
  - pays VARCHAR(100) NULL
  - description TEXT NULL
  - logo_url VARCHAR(512) NULL
  - cree_le DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
  - modifie_le DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)

3) `contacts`
  - id CHAR(36) PK
  - utilisateur_id CHAR(36) NOT NULL FK -> utilisateurs(id)
  - entreprise_id CHAR(36) NOT NULL FK -> entreprises(id)
  - prenom VARCHAR(100) NOT NULL
  - nom VARCHAR(100) NOT NULL
  - poste VARCHAR(100) NULL
  - email VARCHAR(255) NULL
  - telephone_direct VARCHAR(30) NULL
  - telephone_mobile VARCHAR(30) NULL
  - contact_principal TINYINT(1) DEFAULT 0
  - commentaire TEXT NULL
  - cree_le DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)

4) `objectifs_mensuels`
  - id CHAR(36) PK
  - utilisateur_id CHAR(36) NOT NULL FK -> utilisateurs(id)
  - annee INT NOT NULL
  - mois TINYINT NOT NULL CHECK (mois BETWEEN 1 AND 12)
  - montant_cible DECIMAL(12,2) NOT NULL
  - cree_le DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
  - UNIQUE KEY (utilisateur_id, annee, mois)

5) `ca_mensuel`
  - id CHAR(36) PK
  - utilisateur_id CHAR(36) NOT NULL FK -> utilisateurs(id)
  - entreprise_id CHAR(36) NOT NULL FK -> entreprises(id)
  - annee INT NOT NULL
  - mois TINYINT NOT NULL CHECK (mois BETWEEN 1 AND 12)
  - montant DECIMAL(12,2) NOT NULL
  - cree_le DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
  - UNIQUE KEY (utilisateur_id, entreprise_id, annee, mois)

Relations:
- utilisateur 1..N entreprises, contacts, objectifs_mensuels, ca_mensuel
- entreprise 1..N contacts, ca_mensuel

Indexation:
- utilisateurs(email)
- entreprises(utilisateur_id, statut, nom)
- contacts(utilisateur_id, entreprise_id, contact_principal)
- objectifs_mensuels(utilisateur_id, annee, mois)
- ca_mensuel(utilisateur_id, entreprise_id, annee, mois)

Intégrité:
- FKs avec `ON DELETE CASCADE` pour utilisateur → dépendants; entreprise → contacts/ca_mensuel si pertinent.
- ENUM validant `statut`; CHECK sur `mois` (1..12).

Migrations:
- Prisma Migrate (provider=mysql); migrations versionnées; `prisma migrate deploy` au déploiement.

Export/Suppression de données:
- Export par utilisateur (entreprises, contacts, objectifs_mensuels, ca_mensuel). Suppression cascade selon FKs (soumis aux sauvegardes).

---

## 7. Modèle de données MongoDB (documents)

- Moteur: MongoDB 6+.
- Conventions: UUID v4 stocké dans `id` (string) en plus de `_id:ObjectId`; `utilisateur_id`/`entreprise_id`/`contact_id` stockés en UUID string pour référencer le SQL.

Collections (MVP):

1) `notes`
- _id: ObjectId
- id: string (UUID v4, identifiant commun)
- utilisateur_id: string (UUID)
- entreprise_id: string (UUID)
- contact_id: string (UUID) optionnel
- contenu: string
- est_modele: boolean (défaut false)
- nom_modele: string optionnel
- cree_le: ISODate
- cree_cote_client_le: ISODate (offline)
- statut_sync: string ('en_attente'|'synchronise'|'echec')

2) `rdvs`
- _id: ObjectId
- id: string (UUID v4)
- utilisateur_id: string (UUID)
- entreprise_id: string (UUID)
- titre: string
- description: string optionnel
- date_prevue: ISODate
- duree_minutes: number
- statut: string ('planifie'|'termine'|'annule')
- cree_le: ISODate

3) `devis`
- _id: ObjectId
- id: string (UUID v4)
- utilisateur_id: string (UUID)
- entreprise_id: string (UUID)
- nom_fichier: string
- url_fichier: string
- type_mime: string
- taille_octets: number
- cree_le: ISODate

4) `activites`
- _id: ObjectId
- id: string (UUID v4)
- utilisateur_id: string (UUID)
- acteur_id: string (UUID)
- type_source: string ('entreprise'|'contact'|'note'|'rdv'|'devis'|'ca_mensuel'|'objectifs_mensuels')
- source_id: string (UUID de l’entité)
- verbe: string ('cree'|'modifie'|'supprime'|'termine'|'televerse')
- metadonnees: object (diffs, noms de fichiers, montants, etc.)
- cree_le: ISODate

Indexation:
- notes: (utilisateur_id, entreprise_id, cree_le desc)
- rdvs: (utilisateur_id, entreprise_id, date_prevue), (utilisateur_id, statut)
- devis: (utilisateur_id, entreprise_id, cree_le)
- activites: (utilisateur_id, cree_le desc), (utilisateur_id, type_source)

Règles offline (upsert):
- Le client génère `id` et `cree_cote_client_le`; le serveur fait un upsert par `id` (idempotent) et met `statut_sync` à `synchronise`.

---

## 8. Stratégie des identifiants (UUID v4)

- Génération: `crypto.randomUUID()` côté serveur; clients génèrent pour les contenus offline (notes, rdvs, devis) afin de permettre l’upsert idempotent.
- MySQL: `id` en `CHAR(36)`; toutes les FKs utilisent le même format UUID.
- MongoDB: conserver `_id:ObjectId` natif pour l’indexation, et un champ `id` (UUID string) pour l’unification cross-DB; toutes les références utilisent des UUID string.
- Correlation: `source_id` dans `activites` pointe vers l’`id` (UUID) de l’entité SQL/Mongo concernée.

---

## 9. Activity Feed (collection `activites`)

- Émission: l’API enregistre une activité après chaque action significative:
  - SQL (entreprise/contact/ca/objectifs): émission après commit réussi.
  - Mongo (note/rdv/devis): émission après création/mise à jour.
- Idempotence: insertion idempotente par `id` (UUID) généré côté serveur pour éviter doublons; retry autorisé.
- Lecture: pagination par `page`/`limite`, tri `cree_le desc`; filtres `type_source`.

---

## 10. API REST (FR)

- Base: `/v1` — Auth par en-tête `Authorization: Bearer <token>`; toutes les routes scoping par `utilisateur_id`.

Auth:
- POST /v1/auth/inscription
- POST /v1/auth/connexion
- POST /v1/auth/rafraichir (optionnel)
- GET /v1/auth/moi

Entreprises (SQL):
- GET /v1/entreprises?recherche=&statut=&page=&limite=
- GET /v1/entreprises/:id
- POST /v1/entreprises
- PUT /v1/entreprises/:id
- DELETE /v1/entreprises/:id

Contacts (SQL):
- GET /v1/entreprises/:entreprise_id/contacts
- GET /v1/contacts/:id
- POST /v1/entreprises/:entreprise_id/contacts
- PUT /v1/contacts/:id
- DELETE /v1/contacts/:id

Objectifs mensuels (SQL):
- GET /v1/objectifs?annee=
- GET /v1/objectifs/:id
- POST /v1/objectifs
- PUT /v1/objectifs/:id
- DELETE /v1/objectifs/:id

CA mensuel (SQL):
- GET /v1/entreprises/:entreprise_id/ca?annee=
- POST /v1/entreprises/:entreprise_id/ca
- PUT /v1/ca/:id
- DELETE /v1/ca/:id

Notes (Mongo):
- GET /v1/entreprises/:entreprise_id/notes?page=&limite=
- GET /v1/notes/:id
- POST /v1/notes (accepte `id`, `cree_cote_client_le` pour l’offline)
- PUT /v1/notes/:id
- DELETE /v1/notes/:id
- POST /v1/notes/synchroniser (upsert batch par `id`)

RDVs (Mongo):
- GET /v1/rdvs?statut=&de=&a=&page=&limite=
- GET /v1/rdvs/:id
- POST /v1/rdvs
- PUT /v1/rdvs/:id
- DELETE /v1/rdvs/:id

Devis (Mongo):
- GET /v1/entreprises/:entreprise_id/devis?page=&limite=
- GET /v1/devis/:id
- POST /v1/devis (multipart upload)
- DELETE /v1/devis/:id

Activités (Mongo):
- GET /v1/activites?page=&limite=&type_source=

Tableau de bord (agrégé):
- GET /v1/tableau-de-bord (aggrège objectifs + CA depuis MySQL, RDVs à venir et dernières notes/devis/activités depuis Mongo)

---

## 11. Authentification & Sécurité

- Auth: Better Auth + JWT; access token ~1h; refresh ~7j (optionnel).
- Mots de passe: bcrypt (coût ~12); jamais en clair.
- Autorisation: toutes les requêtes filtrées par `utilisateur_id`.
- Transport: HTTPS obligatoire; HSTS via Traefik.
- CORS: liste blanche stricte; pas de credentials sauf nécessité.
- Rate-limit: ~100 req/min/IP; ajustable.
- Validation: Zod pour toutes les charges utiles; listes MIME/tailles sur upload.
- Journalisation: masquer tokens/mots de passe; id de requête pour corrélation.
- RGPD: export/suppression des données par utilisateur; sauvegardes selon politique.

---

## 12. Stratégie Offline-First

- Lecture: cache d’abord (TanStack Query), rafraîchissement en arrière-plan.
- Création offline: le client crée `notes` (et éventuellement rdvs/devis brouillons) avec `id` UUID et `cree_cote_client_le`.
- Sync: endpoint `/v1/notes/synchroniser` (batch) qui upsert par `id`; état `statut_sync` passe de `en_attente` → `synchronise` (ou `echec`).
- Idempotence: upsert par `id` empêche les doublons; serveur renvoie les enregistrements consolidés.

---

## 13. Déploiement & Livraison

- Environnements: développement (local), production (VPS Coolify). Pré-production optionnelle.
- Artefacts: images Docker (api, web); builds Expo pour stores (ultérieurement si besoin).
- CI/CD: déploiements Git via Coolify; étapes: install, tests/lint (option), build images, migrations Prisma, déploiement, vérif santé.
- Variables d’environnement (exemples): `NODE_ENV`, `PORT`, `MYSQL_URL`, `MONGO_URL`, `JWT_SECRET`, `ORIGINES_AUTORISEES`, `CHEMIN_FICHIERS`, `EXPO_PUBLIC_API_URL`.
- SSL: Traefik + Let’s Encrypt.
- Santé: `/health` pour l’API; webpack build ok pour le web.
- Sauvegardes/restaure: automatisées MySQL/Mongo; procédure de restauration documentée.

---

## 14. Limites multi-DB

- Pas de jointures cross-DB: on ne peut pas JOINDRE MySQL et Mongo — l’API fait des requêtes séparées puis assemble.
- Pas de transactions distribuées: pas de 2PC entre MySQL et Mongo; utiliser opérations idempotentes et l’ordre d’écriture.
- Cohérence éventuelle: le feed `activites` est eventual consistent; tolérer un léger décalage.
- Patterns anti-bugs: outbox (émission d’`activites` après commit SQL), retries avec idempotence (upsert par `id`), horodatages serveur (`cree_le`).
- Reporting: calculs mensuels (CA, objectifs) en MySQL; activités/notes/rdvs/devis en Mongo; agrégation côté application.

---

## 15. Risques & Mitigations (multi-DB)

- Perte d’événements d’activité: mitigation par outbox/idempotence et retries.
- Duplicats en offline: upsert par `id` et contraintes d’unicité logiques.
- Divergence MySQL/Mongo: jobs de réconciliation périodiques (vérif `entreprise_id` orphelins), logs d’alerte.
- Volumétrie des fichiers devis: limites de taille/MIME; bascule S3-compatible si croissance.
- Performance mobile: listes virtualisées, lazy load, payloads compacts, pagination stricte.
- Sécurité: dépendances à jour, scans, HTTPS-only, rotation des secrets.

---

## 16. Choix techniques (libs & justification)

- Prisma (MySQL): migrations + type-safety + productivité; provider mysql.
- Mongoose (Mongo): schémas/validation/hooks stables pour documents.
- Zod: validation partagée dans `packages/shared` alignée avec les contraintes SQL/Mongo.
- Multer: téléversement multi-part pour `devis` (limites taille/MIME).
- Pino (ou pino-like): journaux structurés performants.
- Helmet: en-têtes de sécurité HTTP.
- express-rate-limit: limitation basique anti-abus.
- CORS: liste blanche stricte des origines.
- Better Auth + JWT: auth moderne; rafraîchissement optionnel.

---

## 17. Feuille de route d’implémentation

- Monorepo: workspaces + scripts; config `packages/db-sql` (Prisma) et `packages/db-mongo` (Mongoose).
- SQL: définir schéma Prisma pour 5 tables; créer index; migrations initiales.
- Mongo: définir modèles Mongoose pour 4 collections; index; upsert par `id`.
- API: routes FR `/v1/*`; middleware sécurité; validation Zod; erreurs normalisées.
- Offline: hooks côté client + endpoint `/v1/notes/synchroniser`.
- Déploiement: Coolify (services api/web/mysql/mongo); variables; sauvegardes; healthchecks.

---

**FIN DU DOCUMENT**
