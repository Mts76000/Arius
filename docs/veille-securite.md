# Veille securite - Arius

## Objectif

Documenter les risques suivis pendant le projet et les actions appliquees ou prevues. Ce fichier alimente le dossier CDA et l'oral.

## Perimetre surveille

- Authentification JWT.
- Hash des mots de passe.
- Validation des entrees API.
- Isolation des donnees par utilisateur.
- Upload de fichiers.
- Bases MySQL et MongoDB.
- Dependances npm/pnpm.
- Exposition web mobile React Native Web.

## Risques identifies et mesures

### JWT

Risque: vol ou falsification de token.

Mesures:

- Signature HS256 via `jsonwebtoken`.
- Secret configure par `JWT_SECRET`.
- Expiration des tokens.
- Verification serveur sur les routes protegees.

Actions restantes:

- Imposer un secret fort en production.
- Etudier refresh token / rotation si besoin.

### Mots de passe

Risque: compromission de mots de passe en base.

Mesures:

- Hash avec `bcryptjs`.
- Aucun retour du champ password dans `/auth/me`.

Actions restantes:

- Ajouter politique de complexite plus stricte.
- Ajouter rate-limit specifique sur login/register.

### Injection SQL

Risque: injection via filtres, ids ou payloads.

Mesures:

- Requetes parametrees `mysql2`.
- Validation Zod dans les controllers.
- Filtrage systematique par `user_id`.

Actions restantes:

- Ajouter tests sur tous les endpoints sensibles.
- Eviter les noms de table dynamiques hors liste blanche.

### MongoDB

Risque: acces a des documents d'un autre utilisateur.

Mesures:

- Requetes avec `user_id`.
- References SQL stockees comme UUID string.

Actions restantes:

- Ajouter tests sur RDV, devis et notes pour verifier l'isolation.

### Uploads

Risque: upload de fichier dangereux ou trop lourd.

Mesures:

- Multer limite la taille.
- Controle MIME sur les images entreprise.
- Stockage dans un repertoire dedie.

Actions restantes:

- Etendre la validation aux devis.
- Scanner les fichiers si passage en production.
- Servir les fichiers avec droits d'acces utilisateur si fichiers sensibles.

### Dependances

Risque: vulnerabilites dans les packages.

Mesures:

- Lockfiles presents.
- CI prevue avec build/lint/tests.

Actions restantes:

- Ajouter `npm audit` / `pnpm audit` dans une routine manuelle ou CI non bloquante.
- Traiter les vulnerabilites signalees par le backend.

## Routine de veille

- Hebdomadaire pendant le projet: `npm audit` backend, `pnpm audit` frontend.
- Avant livraison: relire les dependances critiques auth, upload, db.
- Avant production: verifier configuration HTTPS, CORS, JWT_SECRET, sauvegardes DB.
