# Epic 3 : Contacts CRUD

**Estimation** : S (2-3j) | **Dépendances** : Epic 2 | **Slice** : 3

## Objectif

Gestion des contacts liés aux entreprises.

## Critères acceptation

- Créer contact lié à entreprise (prenom, nom, poste, email, téléphones)
- Liste contacts entreprise
- Marquer contact principal
- Modifier/supprimer contacts
- Endpoints : /v1/entreprises/:id/contacts, /v1/contacts/:id

## User Stories

- US 3.1 : Ajouter contact à entreprise
- US 3.2 : Voir tous contacts entreprise
- US 3.3 : Marquer contact comme principal
- US 3.4 : Modifier/supprimer contact

## Tasks Backend

- [x] Créer table contacts MySQL (id CHAR(36) PRIMARY KEY, utilisateur_id CHAR(36), entreprise_id CHAR(36), prenom VARCHAR(100), nom VARCHAR(100), poste VARCHAR(150), email VARCHAR(255), tel_direct VARCHAR(50), tel_mobile VARCHAR(50), contact_principal BOOLEAN, commentaire TEXT, cree_le DATETIME, INDEX idx_user_entreprise(utilisateur_id, entreprise_id, contact_principal))
- [x] Requêtes SQL avec mysql2
- [x] Schéma Zod : CreateContact, UpdateContact
- [x] Route GET /v1/entreprises/:entreprise_id/contacts
- [x] Route GET /v1/contacts/:id
- [x] Route POST /v1/entreprises/:entreprise_id/contacts
- [x] Route PUT /v1/contacts/:id
- [x] Route DELETE /v1/contacts/:id
- [ ] Test Postman

## Tasks Frontend

- [x] Service contactsService
- [x] Onglet Contacts dans détail entreprise
- [x] Liste contacts (badge Principal)
- [x] Création contact (form)
- [x] Modification contact
- [x] Cache TanStack Query
- [x] Boutons action (appeler, email) avec Linking
