# Epic 8 : Profil & Paramètres Utilisateur

**Estimation** : M (3-5j) | **Dépendances** : Epic 1 | **Slice** : 6

## Objectif

Permettre à l'utilisateur de gérer son profil, modifier ses informations personnelles, changer son mot de passe, et accéder à l'export de ses données.

## Critères acceptation

### Header Utilisateur

- Affichage sur toutes les pages : date à gauche, "Bonjour {prénom}" en dessous.
- Avatar circulaire à droite avec initiales (première lettre prénom + première lettre nom).
- Clic sur avatar → redirection vers page de profil.
- Responsive et accessible.

### Page Profil

- Section "Informations personnelles" : édition du prénom et nom.
- Section "Sécurité" : changement de mot de passe avec validation (ancien mot de passe + nouveau x2).
- Section "Données" : bouton "Exporter mes données" (lien vers Epic 9).
- Bouton "Déconnexion".
- Notifications success/erreur pour chaque action.

## User Stories

- US 11.1 : Voir le header avec ma date et mon prénom sur toutes les pages.
- US 11.2 : Cliquer sur mon avatar pour accéder à mon profil.
- US 11.3 : Modifier mon prénom et mon nom.
- US 11.4 : Changer mon mot de passe.
- US 11.5 : Exporter mes données via un lien vers l'export RGPD (Epic 9).
- US 11.6 : Me déconnecter depuis la page profil.

## Tasks Backend

- [x] Route GET /v1/utilisateurs/profil (récupérer les données du profil actuel).
- [x] Route PATCH /v1/utilisateurs/profil (mettre à jour prénom/nom).
- [x] Route POST /v1/utilisateurs/changer-motdepasse (validation ancien + nouveau x2 + hachage).
- [ ] Validation : prénom et nom non vides (3-50 caractères), mot de passe fort (min 8 caractères, maj/min/chiffre/special).
- [ ] Audit log : enregistrer les changements de profil et mot de passe.
- [ ] Tests Postman (succès + erreurs).

## Tasks Frontend

- [x] Service `profilService` (GET /profil, PATCH /profil, POST /changer-motdepasse).
- [ ] Composant `Header` réutilisable : date, "Bonjour {prénom}", avatar cliquable.
- [x] Écran Profil : sections infos perso + sécurité + données.
- [x] Formulaire édition profil avec validation client.
- [x] Formulaire changement mot de passe avec confirmation.
- [ ] Intégration avec l'export RGPD (Epic 9).
- [ ] Toasts/notifications pour les actions utilisateur.
- [ ] Sécurité : confirmation avant suppression/déconnexion.

## Notes

- Le header doit être intégré dans la navigation principale et visible sur toutes les pages.
- Réutiliser les composants `FormInput` existants pour la cohérence UI.
- Vérifier l'accessibilité des modales et formulaires.
