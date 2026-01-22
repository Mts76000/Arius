# Epic 6 : Devis (Upload fichiers)

**Estimation** : M (3-5j) | **Dépendances** : Epic 2 | **Slice** : 4

## Objectif
Upload et gestion fichiers devis (PDF, DOCX, images).

## Critères acceptation
- Upload devis lié entreprise (PDF, DOCX, XLSX, images)
- Limite 10 Mo
- Métadonnées MongoDB (collection devis)
- Fichiers sur disque local (ou S3)
- Télécharger/supprimer devis
- Endpoints : /v1/entreprises/:id/devis, /v1/devis/:id

## User Stories
- US 6.1 : Upload devis PDF client
- US 6.2 : Voir liste devis entreprise
- US 6.3 : Télécharger devis
- US 6.4 : Supprimer devis obsolète

## Tasks Backend
- [ ] Install multer + @types/multer
- [ ] Config multer (10 Mo, filtres MIME : pdf, docx, xlsx, image/*)
- [ ] Dossier uploads/ (ou config S3)
- [ ] Modèle Mongoose Devis (id UUID, utilisateur_id, entreprise_id, nom_fichier, url_fichier, type_mime, taille_octets, cree_le)
- [ ] Index : (utilisateur_id, entreprise_id, cree_le)
- [ ] Route GET /v1/entreprises/:id/devis?page=&limite=
- [ ] Route GET /v1/devis/:id
- [ ] Route POST /v1/devis (multipart upload)
- [ ] Route DELETE /v1/devis/:id (supprime fichier + métadonnées)
- [ ] Route GET /v1/devis/:id/telecharger
- [ ] Émettre activité
- [ ] Test upload Postman (form-data)

## Tasks Frontend
- [ ] Service devisService
- [ ] Liste devis (onglet détail entreprise)
- [ ] Sélection fichier (expo-document-picker)
- [ ] Upload devis (preview nom/taille, progress bar)
- [ ] Détail devis (aperçu, Télécharger/Partager/Supprimer)
- [ ] Téléchargement (expo-file-system)
- [ ] Partage (expo-sharing)
- [ ] Cache TanStack Query
