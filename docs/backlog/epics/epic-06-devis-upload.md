# Epic 6 : Devis (Upload fichiers)

**Estimation** : M (3-5j) | **Dépendances** : Epic 2 | **Slice** : 4 | **Status** : ✅ COMPLÉTÉ

## Objectif

Upload et gestion fichiers devis (PDF uniquement) dans la page détail entreprise.

## Critères acceptation

- [x] Upload devis lié entreprise (PDF uniquement)
- [x] Limite 20 Mo
- [x] Métadonnées MongoDB : nom, notes, date, taille, URL fichier
- [x] Fichiers sur disque local (uploads/)
- [x] Télécharger/visualiser/supprimer devis
- [x] Barre de recherche dans la liste
- [x] Endpoints : /v1/entreprises/:id/devis, /v1/devis/:id

## User Stories

- US 6.1 : Upload devis PDF avec nom obligatoire et notes optionnelles
- US 6.2 : Voir liste devis entreprise avec recherche par nom
- US 6.3 : Télécharger/visualiser devis en ligne
- US 6.4 : Supprimer devis obsolète

## Tasks Backend

- [x] multer déjà installé
- [x] Config multer (20 Mo, filtre MIME : application/pdf uniquement)
- [x] Dossier uploads/ déjà créé
- [x] Modèle Mongoose Devis (id UUID, user_id, entreprise_id, nom, notes, nom_fichier, url_fichier, type_mime, taille_octets, createdAt, updatedAt)
- [x] Index : (user_id, entreprise_id, createdAt desc)
- [x] Route GET /v1/entreprises/:id/devis?search= (recherche par nom)
- [x] Route GET /v1/devis/:id
- [x] Route POST /v1/entreprises/:id/devis (multipart upload avec nom + notes)
- [x] Route DELETE /v1/devis/:id (supprime fichier + métadonnées)
- [x] Émettre activité (upload/suppression)
- [x] Test upload Postman (form-data)
- [x] Fichiers organisés : /uploads/entreprises/{id}/devis/
- [x] Logo upload refactorisé : /uploads/entreprises/{id}/logos/

## Tasks Frontend

- [x] Service devisService (GET/POST/DELETE avec FormData multipart fix)
- [x] Hook useDevis (fetch devis par entreprise, useUploadDevis, useDeleteDevis)
- [x] Section devis dans détail entreprise :
  - [x] Liste devis avec cards (nom, date, taille)
  - [x] Barre de recherche (filtre par nom)
  - [x] Actions : Visualiser, Télécharger, Supprimer
- [x] Modal upload devis :
  - [x] Champ nom (obligatoire, min 3 chars)
  - [x] Sélection fichier PDF (expo-document-picker, web file input, max 20 MB)
  - [x] Champ notes (optionnel, multiline)
  - [x] Preview nom fichier + taille avant upload
  - [x] Modal closes après successful upload
- [x] Visualisation PDF (ouvrir dans navigateur)
- [x] Téléchargement (via API endpoint)
- [x] Cache TanStack Query + mutations
- [x] Design : modal matching app pattern (modalContainer, modalHeader, modalForm)
- [x] Cross-platform file picker (web, iOS, Android)
- [x] Logo upload refactorisé pour folder structure
- [x] FormData axios Content-Type fix (set to undefined)
