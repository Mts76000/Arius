# Epic 2 : Entreprises CRUD

**Estimation** : M (4-6j) | **Dépendances** : Epic 1 | **Slice** : 1

## Objectif

Création, lecture, modification, suppression entreprises (clients/prospects/fournisseurs).

## Critères acceptation

- Créer entreprise (nom, statut, adresse, description)
- Voir uniquement ses entreprises
- Filtrer par statut
- Rechercher par nom
- Pagination 20/page
- Modifier/supprimer entreprise
- Endpoints FR : /v1/entreprises

## User Stories

- US 2.1 : Créer entreprise nom/statut/adresse
- US 2.2 : Liste toutes entreprises
- US 2.3 : Filtrer par statut (client/prospect)
- US 2.4 : Rechercher par nom
- US 2.5 : Modifier infos entreprise
- US 2.6 : Supprimer entreprise

## Tasks Backend

- [x] Créer table entreprises MySQL (id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL, nom VARCHAR(255) NOT NULL, statut ENUM('client','prospect','fournisseur') NOT NULL, rue VARCHAR(255), code_postal VARCHAR(10), ville VARCHAR(100), pays VARCHAR(100), description TEXT, logo VARCHAR(500), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_user_statut_nom(user_id, statut, nom))
- [x] Model entreprise (getAll, getById, create, update, delete)
- [x] Controller entrepriseController (list, get, create, update, delete)
- [x] Schéma Zod : CreateEntreprise, UpdateEntreprise
- [x] Route GET /v1/entreprises?recherche=&statut=&page=&limite=
- [x] Route GET /v1/entreprises/:id
- [x] Route POST /v1/entreprises
- [x] Route PUT /v1/entreprises/:id
- [x] Route DELETE /v1/entreprises/:id
- [ ] Test Postman

## Tasks Frontend

- [x] Service entreprisesService
- [x] Hooks TanStack Query (useEntreprises, useCreateEntreprise, etc.)
- [x] Liste entreprises (FlatList, pull-refresh, recherche, filtres)
- [ ] Détail entreprise ([id].tsx)
- [x] Création entreprise (create.tsx)
- [ ] Modification entreprise (edit/[id].tsx)
- [x] Cache TanStack Query
- [x] Loading + erreurs
- [x] Navigation (Stack layout)
