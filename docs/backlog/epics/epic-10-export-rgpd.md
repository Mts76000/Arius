# Epic 10 : Export RGPD

**Estimation** : S-M (2-4j) | **Dépendances** : Epic 1, 2, 3, 4, 5, 6, 8 | **Slice** : 8

## Objectif

Permettre à l'utilisateur d'exporter l'ensemble de ses données (conformité RGPD) sous forme d'archive ZIP.

## Critères acceptation

- Archive ZIP contenant données MySQL (entreprises, contacts, objectifs, ca) et MongoDB (notes, rdvs, devis métadonnées, activités).
- Inclusion des fichiers de devis (stockage local ou S3).
- Lien de téléchargement sécurisé, expiration après délai configuré.
- Enregistrement d'une activité d'export.

## User Stories

- US 9.1 : Demander l'export de mes données.
- US 9.2 : Télécharger l'archive.

## Tasks Backend

- [ ] Endpoint POST /v1/export/rgpd (démarre la génération et retourne un id).
- [ ] Endpoint GET /v1/export/rgpd/:id (statut + téléchargement si prêt).
- [ ] Extraction MySQL (entreprises, contacts, objectifs_mensuels, ca_mensuel) par utilisateur.
- [ ] Extraction Mongo (notes, rdvs, devis, activites) par utilisateur.
- [ ] Inclusion des fichiers devis depuis le stockage.
- [ ] Génération ZIP en flux (ex: archiver) dans un répertoire temporaire isolé par utilisateur.
- [ ] TTL + job de nettoyage périodique (cron) des exports expirés.
- [ ] Tests Postman (volumétrie: 1000+ items).

## Tasks Frontend

- [ ] Service `exportService`.
- [ ] Écran/section Paramètres : bouton "Exporter mes données".
- [ ] Affichage statut export (en cours, prêt, erreur) + téléchargement.
- [ ] Notifications/toasts et gestion d'erreurs.
