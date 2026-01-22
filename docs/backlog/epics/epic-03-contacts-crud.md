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

- [ ] Créer table contacts MySQL (id CHAR(36) PRIMARY KEY, utilisateur_id CHAR(36), entreprise_id CHAR(36), prenom VARCHAR(100), nom VARCHAR(100), poste VARCHAR(150), email VARCHAR(255), tel_direct VARCHAR(50), tel_mobile VARCHAR(50), contact_principal BOOLEAN, commentaire TEXT, cree_le DATETIME, INDEX idx_user_entreprise(utilisateur_id, entreprise_id, contact_principal))
- [ ] Requêtes SQL avec mysql2
- [ ] Schéma Zod : CreateContact, UpdateContact
- [ ] Route GET /v1/entreprises/:entreprise_id/contacts
- [ ] Route GET /v1/contacts/:id
- [ ] Route POST /v1/entreprises/:entreprise_id/contacts
- [ ] Route PUT /v1/contacts/:id
- [ ] Route DELETE /v1/contacts/:id
- [ ] Émettre activité
- [ ] Test Postman

## Tasks Frontend

- [ ] Service contactsService
- [ ] Onglet Contacts dans détail entreprise
- [ ] Liste contacts (badge Principal)
- [ ] Création contact (form)
- [ ] Modification contact
- [ ] Cache TanStack Query
- [ ] Boutons action (appeler, email) avec Linking
