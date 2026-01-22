# Epic 5 : Rendez-vous (RDVs)

**Estimation** : M (3-5j) | **Dépendances** : Epic 2 | **Slice** : 3

## Objectif
Planification et suivi des rendez-vous clients.

## Critères acceptation
- Créer RDV lié entreprise (titre, date/heure, durée, description)
- Statut : planifie, termine, annule
- Filtrer par statut et plage dates
- Modifier/supprimer RDV
- Collection MongoDB rdvs

## User Stories
- US 5.1 : Planifier RDV client
- US 5.2 : Voir RDVs à venir
- US 5.3 : Marquer RDV terminé
- US 5.4 : Annuler RDV

## Tasks Backend
- [ ] Modèle Mongoose Rdv (id UUID, utilisateur_id, entreprise_id, titre, description, date_prevue, duree_minutes, statut, cree_le)
- [ ] Index : (utilisateur_id, entreprise_id, date_prevue), (utilisateur_id, statut)
- [ ] Schéma Zod : CreateRdv, UpdateRdv
- [ ] Route GET /v1/rdvs?statut=&de=&a=&page=&limite=
- [ ] Route GET /v1/rdvs/:id
- [ ] Route POST /v1/rdvs
- [ ] Route PUT /v1/rdvs/:id
- [ ] Route DELETE /v1/rdvs/:id
- [ ] Émettre activité
- [ ] Test Postman

## Tasks Frontend
- [ ] Service rdvsService
- [ ] Calendrier RDVs (liste par date, filtres)
- [ ] Création RDV (DateTimePicker, durée, titre, description)
- [ ] Détail RDV (boutons Terminer/Annuler/Modifier/Supprimer)
- [ ] Notifications locales (expo-notifications) rappels
- [ ] Indicateur RDV à venir dans détail entreprise
- [ ] Cache TanStack Query
