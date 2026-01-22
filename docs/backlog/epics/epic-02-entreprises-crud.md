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

- [ ] Créer table entreprises MySQL (id CHAR(36) PRIMARY KEY, utilisateur_id CHAR(36), nom VARCHAR(255), statut ENUM('client','prospect','fournisseur'), adresse TEXT, ville VARCHAR(100), code_postal VARCHAR(20), pays VARCHAR(100), description TEXT, logo_url VARCHAR(500), cree_le DATETIME, modifie_le DATETIME, INDEX idx_user_statut_nom(utilisateur_id, statut, nom))
- [ ] Requêtes SQL avec mysql2 (SELECT, INSERT, UPDATE, DELETE)
- [ ] Schéma Zod : CreateEntreprise, UpdateEntreprise
- [ ] Route GET /v1/entreprises?recherche=&statut=&page=&limite=
- [ ] Route GET /v1/entreprises/:id
- [ ] Route POST /v1/entreprises
- [ ] Route PUT /v1/entreprises/:id
- [ ] Route DELETE /v1/entreprises/:id
- [ ] Émettre activité (insert MongoDB activites)
- [ ] Test Postman

## Tasks Frontend

- [ ] Store useEntreprisesStore
- [ ] Service entreprisesService
- [ ] Liste entreprises (FlatList, pull-refresh, recherche, filtres)
- [ ] Détail entreprise
- [ ] Création entreprise (form + Zod)
- [ ] Modification entreprise
- [ ] Cache TanStack Query
- [ ] Loading + erreurs
