# Epic 4 : Notes (Templates + Offline-first)

**Estimation** : L (5-7j) | **Dépendances** : Epic 2, 3 | **Slice** : 2

## Objectif
Notes liées entreprises, templates réutilisables, synchronisation offline.

## Critères acceptation
- Créer note liée entreprise (+ optionnel contact)
- Note marquée comme template
- Stockage MongoDB (collection notes)
- Création offline (UUID + cree_cote_client_le)
- Endpoint /v1/notes/synchroniser (upsert batch idempotent)
- statut_sync : en_attente / synchronise / echec
- Templates section dédiée

## User Stories
- US 4.1 : Créer note après visite client
- US 4.2 : Créer templates notes (compte-rendu, relance)
- US 4.3 : Créer notes sans internet
- US 4.4 : Sync auto notes offline

## Tasks Backend
- [ ] Modèle Mongoose Note (id UUID, utilisateur_id, entreprise_id, contact_id opt, contenu, est_modele, nom_modele, cree_le, cree_cote_client_le, statut_sync)
- [ ] Index : (utilisateur_id, entreprise_id, cree_le desc)
- [ ] Schéma Zod : CreateNote (accepte id + cree_cote_client_le opt)
- [ ] Route GET /v1/entreprises/:id/notes?page=&limite=
- [ ] Route GET /v1/notes/:id
- [ ] Route POST /v1/notes (upsert si id fourni)
- [ ] Route PUT /v1/notes/:id
- [ ] Route DELETE /v1/notes/:id
- [ ] Route POST /v1/notes/synchroniser (batch upsert)
- [ ] Émettre activité
- [ ] Test sync offline→online

## Tasks Frontend
- [ ] Service notesService
- [ ] Store local (AsyncStorage/SQLite) notes offline
- [ ] Hook useOfflineNotes (queue sync)
- [ ] Liste notes (onglet détail entreprise)
- [ ] Création note (textarea, checkbox template)
- [ ] Liste templates (sélection pré-remplissage)
- [ ] Génération UUID client
- [ ] Sync auto retour réseau (NetInfo)
- [ ] Badge sync status
- [ ] Retry manuel si échec
