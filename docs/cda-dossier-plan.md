# Plan dossier projet CDA - Arius

Ce document sert de checklist pour construire le dossier projet de 40 a 60 pages demande par le referentiel CDA.

## 1. Competences couvertes

- Installer et configurer l'environnement de travail.
- Developper des interfaces utilisateur.
- Developper des composants metier.
- Contribuer a la gestion d'un projet informatique.
- Analyser les besoins et maquetter une application.
- Definir l'architecture logicielle.
- Concevoir et mettre en place une base relationnelle.
- Developper des composants d'acces aux donnees SQL et NoSQL.
- Preparer et executer les plans de tests.

Le deploiement et la demarche DevOps seront documentes comme perimetre a finaliser si la mise en production n'est pas realisee avant l'examen.

## 2. Structure conseillee du dossier

1. Page de garde, sommaire.
2. Contexte et expression du besoin.
3. Presentation du projet Arius et objectifs.
4. Environnement technique et outils.
5. Gestion de projet: backlog, priorites, planning, suivi.
6. Specifications fonctionnelles.
7. Maquettes et enchainement des ecrans.
8. Architecture logicielle.
9. Modele de donnees: MCD/MLD/MPD, MySQL et MongoDB.
10. Securite applicative.
11. Realisations: interfaces, composants metier, acces donnees.
12. Plan de tests et resultats.
13. Jeu d'essai representatif.
14. Veille securite.
15. Bilan: difficultes, satisfactions, evolutions.

## 3. Annexes a preparer

- Captures d'ecran des principaux parcours.
- Extraits de code significatifs:
  - composant frontend;
  - controller backend;
  - modele SQL;
  - modele MongoDB;
  - middleware auth;
  - test automatise.
- Script SQL `backend/src/db/schema.sql`.
- Resultats de commandes: `npm run build`, `npm test`, `pnpm lint`, `pnpm test`.
- Diagrammes:
  - cas d'utilisation;
  - sequence creation entreprise;
  - sequence creation contact principal;
  - sequence connexion JWT;
  - schema architecture.

## 4. Diaporama oral

Plan conseille pour 40 minutes:

1. Contexte et probleme utilisateur.
2. Demo rapide du parcours principal.
3. Architecture technique.
4. Modele de donnees SQL/NoSQL.
5. Securite: auth, isolation utilisateur, validation.
6. Extraits de code significatifs.
7. Tests et qualite.
8. Veille securite.
9. Limites et evolutions: deploiement, tests UI, activity feed eventuel.
10. Conclusion.
