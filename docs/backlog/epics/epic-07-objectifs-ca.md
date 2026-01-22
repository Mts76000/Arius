# Epic 7 : Objectifs & Chiffre d'affaires (CA)

**Estimation** : M (3-5j) | **Dépendances** : Epic 2 | **Slice** : 5

## Objectif

Définir des objectifs mensuels de chiffre d'affaires et saisir le CA réalisé pour visualiser la progression (% d'atteinte) et la tendance.

## Critères acceptation

- CRUD objectifs mensuels (mois/année) par utilisateur.
- Saisie du CA mensuel (agrégé par utilisateur, mois/année).
- Calcul progression du mois courant (% CA / objectif) et tendance 3 derniers mois.
- Filtre par année, pagination si nécessaire.
- Sécurité : isolement par `utilisateur_id`.

## User Stories

- US 7.1 : Définir l'objectif du mois courant.
- US 7.2 : Enregistrer le CA du mois.
- US 7.3 : Voir la progression du mois (jauge %) et la tendance.
- US 7.4 : Consulter l'historique par année.

## Tasks Backend

- [ ] Créer table `objectifs_mensuels` MySQL (id CHAR(36) PRIMARY KEY, utilisateur_id CHAR(36), mois TINYINT, annee SMALLINT, montant_objectif DECIMAL(12,2), cree_le DATETIME, UNIQUE idx_user_mois_annee(utilisateur_id, annee, mois)).
- [ ] Créer table `ca_mensuel` MySQL (id CHAR(36) PRIMARY KEY, utilisateur_id CHAR(36), mois TINYINT, annee SMALLINT, montant_ca DECIMAL(12,2), cree_le DATETIME, UNIQUE idx_user_mois_annee(utilisateur_id, annee, mois)).
- [ ] Requêtes SQL avec mysql2.
- [ ] Schémas Zod: Create/Update Objectif, Create/Update CA.
- [ ] Route GET /v1/objectifs-mensuels?annee=&page=&limite=
- [ ] Route POST /v1/objectifs-mensuels
- [ ] Route PUT /v1/objectifs-mensuels/:id
- [ ] Route DELETE /v1/objectifs-mensuels/:id
- [ ] Route GET /v1/ca-mensuel?annee=
- [ ] Route POST /v1/ca-mensuel
- [ ] KPIs: GET /v1/kpis/ca?annee=&mois= (progression, somme CA, objectif, tendance 3 mois)
- [ ] Tests Postman (flux objectif + CA + KPIs)

## Tasks Frontend

- [ ] Services `objectifsService`, `caService`.
- [ ] Écran "Objectifs & CA":
  - [ ] Formulaire objectif mois (montant, mois, année)
  - [ ] Saisie CA du mois
  - [ ] Jauge progression (%) et delta vs. objectif
  - [ ] Tendance (mini-graph/sparkline) des 3 derniers mois
- [ ] Widgets KPIs sur Dashboard (objectif, CA, progression).
- [ ] Cache TanStack Query + invalidations cohérentes.
- [ ] Validation côté client (montants positifs, mois 1-12).
