# Epic 5 : Rendez-vous (RDVs)

**Estimation** : M (4-6j) | **Dépendances** : Epic 2 | **Slice** : 3 | **Statut** : ✅ Terminé

## Objectif

Planification et suivi des rendez-vous clients. Vue centralisée de tous les RDVs + section détail entreprise.

## Critères acceptation

- [x] Créer RDV lié entreprise (titre, date/heure, durée, description)
- [x] Statut : planifie, en_cours, termine, annule, reporte
- [x] Filtrer par statut et plage dates
- [x] Modifier/supprimer RDV
- [x] Collection MongoDB rdvs
- [x] **Page RDVs globale** : voir tous les RDVs de l'utilisateur
- [x] **Section RDVs dans détail entreprise** : voir les RDVs de cette entreprise
- [x] **Lier RDV à Contact** : optionnel, filtré par entreprise
- [x] Durées intelligentes : proposer 15, 30, 45, 60 min + durée personnalisée
- [ ] ~~Lier RDV à Note : après RDV, créer note automatiquement~~ (non nécessaire)
- [ ] ~~Rappels (notifications 15 min avant)~~ → **À FAIRE PLUS TARD** : Intégration Google Calendar pour synchronisation et notifications

## User Stories

- US 5.1 : Planifier RDV client avec titre, date, heure, durée, description
- US 5.2 : Voir tous mes RDVs dans page dédiée (calendrier/liste par date)
- US 5.3 : Voir RDVs liés à une entreprise dans le détail (section tabs)
- US 5.4 : Marquer RDV terminé ou annulé (mise à jour statut)
- US 5.5 : ~~Créer note automatiquement après RDV~~ (abandonné)
- US 5.6 : ~~Recevoir rappel 15 min avant RDV~~ → **Futur : Google Calendar sync**
- US 5.7 : Modifier/supprimer RDV
- US 5.8 : Associer un contact (optionnel) au RDV

## Tasks Backend

- [x] Modèle Mongoose Rdv (id UUID, utilisateur_id, entreprise_id, contact_id, titre, description, date_prevue, duree_minutes, statut: enum[planifie|en_cours|termine|annule|reporte], cree_le, updated_at)
- [x] Index : (utilisateur_id, date_prevue desc), (utilisateur_id, statut), (entreprise_id, date_prevue)
- [x] Schéma Zod : CreateRdv (titre, date_prevue, duree_minutes, description opt, contact_id opt, statut opt), UpdateRdv
- [x] Route GET /v1/rdvs?statut=&de=&a=&page=&limite= (tous mes RDVs, filtrable)
- [x] Route GET /v1/entreprises/:id/rdvs (RDVs d'une entreprise)
- [x] Route GET /v1/rdvs/:id
- [x] Route POST /v1/rdvs (créer RDV)
- [x] Route PUT /v1/rdvs/:id (modifier statut/infos)
- [x] Route DELETE /v1/rdvs/:id (supprimer)
- [x] Validation durée personnalisée (min 1 minute)
- [x] Émettre activité (création/modif)
- [x] Test Postman

## Tasks Frontend

- [x] Service rdvsService (GET/POST/PUT/DELETE)
- [x] Hook useRdvs (fetch tous les RDVs utilisateur)
- [x] Hook useRdvsByEntreprise (fetch RDVs d'une entreprise)
- [x] **Page RDVs globale** (/rdvs) :
  - [x] Liste des RDVs triée par date
  - [x] Filtres : statut (planifie, en_cours, termine, annule, reporte), plage dates (aujourd'hui/semaine/mois/tous/date personnalisée)
  - [x] Cards RDV : titre, date/heure, entreprise, durée, statut badge, contact (si présent)
  - [x] Actions rapides : Modifier, Terminer, Annuler, Supprimer
  - [x] Design moderne : bordure colorée gauche, badges pill, boutons transparents
- [x] **Section RDVs dans détail entreprise** :
  - [x] Liste RDVs de l'entreprise
  - [x] Bouton "+ Ajouter RDV"
  - [x] Affichage cards avec actions
- [x] Modal création/édition RDV :
  - [x] Titre (requis)
  - [x] Entreprise (sélection)
  - [x] Contact (optionnel, filtré par entreprise)
  - [x] Date/heure picker (DateTimePicker)
  - [x] Durée : boutons (15, 30, 45, 60 min) + champ personnalisé
  - [x] Statut : boutons (Prévu/Terminé/Annulé)
  - [x] Description (optionnel)
  - [x] Validation + erreurs
- [x] Changement statut avec boutons colorés :
  - [x] Prévu : "Terminer" (vert transparent), "Annuler" (rouge transparent), "Modifier" (indigo)
  - [x] En cours : "Terminer", "Annuler"
  - [x] Terminé/Annulé : "Réactiver"
  - [x] Reporté : "Replanifier", "Annuler"
  - [x] Icône poubelle sur tous les statuts
- [x] Cache TanStack Query + mutations
- [x] Design : cards modernes, statuts avec couleurs (bleu/orange/vert/rouge/jaune)
- [x] Filtres de dates corrigés (semaine = lundi→dimanche, mois = 1er→dernier jour)

## Améliorations Futures

- [ ] **Intégration Google Calendar** :
  - Synchronisation bidirectionnelle des RDVs
  - Notifications/rappels via Google Calendar
  - Import/export événements
  - OAuth Google pour authentification
- [ ] Vue calendrier visuel (en plus de la liste)
- [ ] Récurrence des RDVs (hebdomadaire, mensuel)
- [ ] Invitation participants externes (email)

## Navigation et Flux

### Page RDVs globale (`/rdvs`)

- Vue: Tous mes RDVs (entreprise, contact, date, heure, statut)
- Filtres: Statut, plage dates (aujourd'hui/semaine/mois/tous/date personnalisée)
- Tri: Date (à venir d'abord)
- Actions: Créer, Modifier, Terminer, Annuler, Supprimer

### Détail Entreprise - RDVs

- Affiche: RDVs de cette entreprise uniquement
- Bouton: "+ Ajouter RDV" → ouvre modal (entreprise pré-remplie)
- Contacts disponibles filtrés automatiquement

### Workflow Statuts

- **Prévu** → Terminer / Annuler / Modifier
- **En cours** → Terminer / Annuler (rarement utilisé, passage direct Prévu→Terminé)
- **Terminé** → Réactiver (repasse en Prévu)
- **Annulé** → Réactiver (repasse en Prévu)
- **Reporté** → Replanifier / Annuler
