# Epic 7 : Objectifs & Chiffre d'affaires (CA)

**Estimation** : M (3-5j) | **Dépendances** : Epic 2 | **Slice** : 5

## Objectif

Créer un nouvel onglet "CA" permettant de définir des objectifs mensuels de chiffre d'affaires et de saisir le CA réalisé par entreprise pour visualiser la progression (% d'atteinte), le CA par entreprise et l'historique annuel.

## Architecture fonctionnelle

### Page principale "CA"

- Sélecteur mois/année avec navigation (← Janvier 2026 →)
- KPIs du mois : CA total, Objectif, Progression (%)
- Bouton "Ajouter" : Ajouter du CA à une entreprise
- Bouton "Objectif" : Définir/modifier les objectifs mensuels
- Section "CA par entreprise" : Liste avec recherche, tri par CA décroissant
- Section "Vue annuelle" : Liste des 12 mois avec CA global

### Détail Entreprise - Onglet "Chiffres"

- Bouton "Ajouter du CA"
- Sélecteur année
- KPIs : CA total année, Moyenne mensuelle
- Liste CA mensuel avec actions (Modifier/Supprimer)

## Critères acceptation

- CRUD objectifs mensuels (mois/année) par utilisateur (global, non par entreprise).
- CRUD CA mensuel par entreprise (user_id + entreprise_id + mois/année).
- Calcul progression du mois courant (% CA total / objectif).
- Affichage CA par entreprise avec recherche et tri.
- Vue annuelle avec tous les mois et CA total.
- Indicateurs visuels : 🔴 <50%, 🟡 50-90%, 🟢 >90%, ⭐ >100%.
- Sécurité : isolement par `user_id`.

## User Stories

### Page principale CA

- US 7.1 : Naviguer entre les mois/années pour voir les KPIs.
- US 7.2 : Définir/modifier les objectifs mensuels (modal avec vue 12 mois).
- US 7.3 : Ajouter du CA à une entreprise (modal : entreprise, mois, année, montant).
- US 7.4 : Voir la progression du mois (% CA/objectif avec indicateur coloré).
- US 7.5 : Consulter la liste des entreprises avec leur CA du mois (recherche + tri).
- US 7.6 : Consulter la vue annuelle (12 mois avec CA global par mois).

### Schéma MySQL

- [x] Créer table `objectifs_mensuels`:
  ```sql
  CREATE TABLE objectifs_mensuels (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    annee INT NOT NULL,
    mois INT NOT NULL,
    objectif_ht DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY idx_user_mois_annee (user_id, annee, mois),
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
  );
  ```
- [x] Créer table `ca_mensuel`:
  ```sql
  CREATE TABLE ca_mensuel (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    entreprise_id VARCHAR(36) NOT NULL,
    annee INT NOT NULL,
    mois INT NOT NULL,
    ca_ht DECIMAL(10,2) NOT NULL,
  ```

### Services API

- [x] Service `objectifsService.ts` (getObjectifs, createObjectif, updateObjectif, deleteObjectif)
- [x] Service `caService.ts` (getCA, createCA, updateCA, deleteCA, getStats, getEntrepriseCA)
- [x] Types TypeScript : Objectif, CAMensuel, CAStats

### Nouvel onglet "CA" dans la navigation

- [x] Ajouter route `/ca` dans navigation principale
- [x] Icône 📊 dans TabBar

### Page CA principale (`app/(tabs)/ca.tsx`)

- [x] Header avec sélecteur mois/année (← Janvier 2026 →)
- [x] Section KPIs :
  - [x] CA du mois (bleu)
  - [x] Objectif (vert)
  - [x] Barre de progression avec indicateur coloré
  - [x] Pourcentage d'atteinte
- [x] Boutons actions :
  - [x] "Ajouter" → Modal ajout CA
  - [x] "Objectif" → Modal gestion objectifs
- [x] Section "CA par entreprise" :
  - [x] Barre de recherche
  - [x] Liste/Cards entreprises avec CA du mois
  - [x] Tri par CA décroissant
  - [x] Badge "🏆" sur meilleure entreprise
- [x] Section "Vue annuelle" :
  - [x] Card toggle "Masquer/Afficher"
  - [x] Liste 12 mois avec CA global
  - [x] Total année

### Modals

- [x] `ObjectifModal.tsx` :
  - [x] Vue 12 mois (grille)
  - [x] Input montant par mois
  - [x] Bouton "Appliquer à tous les mois"
  - [x] Validation (montant > 0)
- [x] `CAModal.tsx` :
  - [x] Select entreprise
  - [x] Select mois/année
  - [x] Input montant (€)
  - [x] Note optionnelle
  - [x] Validation (alerte si mois futur)

### Détail Entreprise - Onglet "Chiffres"

- [x] Nouvel onglet dans `app/entreprise/[id].tsx`
- [x] Bouton "Ajouter du CA"
- [x] Select année
- [x] KPIs :
  - [x] CA total année
  - [x] Moyenne mensuelle
- [x] Section "CA mensuel" :
  - [x] Liste mois avec CA
  - [x] Actions Modifier/Supprimer par ligne
  - [x] Total année en bas

### Hooks & State

- [x] `useObjectifs.ts` (TanStack Query)
- [x] `useCA.ts` (TanStack Query)
- [x] `useCAStats.ts` (pour KPIs)
- [x] Invalidations après mutations

### Validation & UX

- [x] Validation montants > 0
- [x] Validation mois 1-12
- [x] Toast success/error
- [x] Loading states
- [x] Empty states (pas de CA ce mois)
- [x] Schémas Zod: CreateObjectif, UpdateObjectif, CreateCA, UpdateCA
- [x] Route GET /v1/objectifs?annee= (liste des objectifs de l'année)
- [x] Route POST /v1/objectifs (créer/mettre à jour objectif)
- [x] Route PUT /v1/objectifs/:id (modifier objectif)
- [x] Route DELETE /v1/objectifs/:id (supprimer objectif)
- [x] Route GET /v1/ca?annee=&mois=&entreprise_id= (filtres optionnels)
- [x] Route POST /v1/ca (créer/mettre à jour CA)
- [x] Route PUT /v1/ca/:id (modifier CA)
- [x] Route DELETE /v1/ca/:id (supprimer CA)
- [x] Route GET /v1/ca/stats?annee=&mois= (KPIs: CA total, objectif, progression, CA par entreprise)
- [x] Route GET /v1/ca/entreprise/:entreprise_id?annee= (CA de l'entreprise par mois)

### Logique métier

- [x] Calcul CA total du mois (somme de tous les CA entreprises)
- [x] Calcul progression (% CA/objectif)
- [x] Validation : mois entre 1-12, montants > 0
- [x] Gestion UNIQUE constraint (UPDATE si déjà existant)
- [ ] Tests Postman (flux complet)
- [x] Schémas Zod: Create/Update Objectif, Create/Update CA.
- [ ] Route GET /v1/objectifs-mensuels?annee=&page=&limite=
- [ ] Route POST /v1/objectifs-mensuels
- [ ] Route PUT /v1/objectifs-mensuels/:id
- [ ] Route DELETE /v1/objectifs-mensuels/:id
- [ ] Route GET /v1/ca-mensuel?annee=
- [ ] Route POST /v1/ca-mensuel
- [ ] KPIs: GET /v1/kpis/ca?annee=&mois= (progression, somme CA, objectif, tendance 3 mois)
- [ ] Tests Postman (flux objectif + CA + KPIs)

## Tasks Frontend

- [x] Services `objectifsService`, `caService`.
- [x] Écran "Objectifs & CA":
  - [x] Formulaire objectif mois (montant, mois, année)
  - [x] Saisie CA du mois
  - [x] Jauge progression (%) et delta vs. objectif
  - [ ] Tendance (mini-graph/sparkline) des 3 derniers mois
- [ ] Widgets KPIs sur Dashboard (objectif, CA, progression).
- [x] Cache TanStack Query + invalidations cohérentes.
- [x] Validation côté client (montants positifs, mois 1-12).
