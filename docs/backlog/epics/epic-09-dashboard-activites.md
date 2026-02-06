# Epic 9 : Dashboard (raccourcis & infos utiles)

**Estimation** : M (3-5j) | **Dépendances** : Epic 2, 4, 5, 6, 8 | **Slice** : 7

## Objectif

Vue d’accueil orientée action : raccourcis rapides et informations réellement utiles à l’utilisateur.

## Critères acceptation

- Raccourcis d’actions prioritaires (création + accès rapide).
- Informations pertinentes uniquement (aucune métrique “bruit” comme le CA affiché en permanence).
- Données contextualisées (ex : prochains RDV, derniers devis à relancer, prospects inactifs).
- Sécurité : isolement par `user_id`.

## User Stories

- US 8.1 : Accéder en 1 clic aux actions clés.
- US 8.2 : Voir des infos utiles et actionnables.

## Tasks Backend

- [ ] Réutiliser les routes existantes pour alimenter le dashboard.
- [ ] Clarifier les endpoints utilisés par section (RDV, devis, contacts, notes).
- [ ] Tests Postman des filtres/limites nécessaires.

## Tasks Frontend

- [x] Agréger les données via les services existants.
- [x] Écran Dashboard (raccourcis + infos utiles).
- [ ] Cartes KPI réactives (TanStack Query + invalidations).
