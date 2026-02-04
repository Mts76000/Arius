# Epic 9 : Dashboard & Activités

**Estimation** : M (3-5j) | **Dépendances** : Epic 2, 4, 5, 6, 8 | **Slice** : 7

## Objectif

Vue consolidée des activités récentes et des indicateurs clés (KPIs).

## Critères acceptation

- Flux d'activités trié par date décroissante.
- Filtres : type d'activité, période (de/à).
- KPIs du mois courant (nouveaux contacts, RDVs à venir, devis uploadés, notes créées).
- Pagination ou infinite scroll.
- Sécurité : isolement par `utilisateur_id`.

## User Stories

- US 8.1 : Voir le flux d'activités.
- US 8.2 : Filtrer par type et période.
- US 8.3 : Voir les KPIs du mois courant.

## Tasks Backend

- [ ] Modèle Mongoose `activites` (vérifier index: (utilisateur_id, type, cree_le)).
- [ ] Route GET /v1/activites?type=&de=&a=&page=&limite=
- [ ] Route GET /v1/kpis/tableau-de-bord?mois=&annee=
- [ ] Harmoniser les émissions d'activités des autres epics (payload uniforme).
- [ ] Tests Postman (filtres + pagination).

## Tasks Frontend

- [ ] Services `activitesService`, `kpisService`.
- [ ] Écran Dashboard (liste + filtres + KPIs).
- [ ] Infinite scroll + pull-to-refresh.
- [ ] Cartes KPI réactives (TanStack Query + invalidations).
