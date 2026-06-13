# Ameliorations projet

Ce fichier sert a suivre les gros chantiers avant validation. Chaque ligne explique a quoi sert l'amelioration, puis sera cochee quand elle sera terminee et poussee sur `develop`.

- [ ] Brancher `healthService.ts` dans les routes health
  - Sert a eviter du code mort et a centraliser le controle API + MySQL + Mongo au meme endroit.

- [ ] Securiser le reset password
  - Sert a limiter les abus, a eviter les tokens reutilisables longtemps, et a ne pas stocker de token sensible en clair.

- [ ] Renforcer les fixtures avec Faker + Drizzle
  - Sert a recreer rapidement une base de demo realiste avec une commande claire.

- [ ] Centraliser les validations Zod backend
  - Sert a avoir les memes regles propres pour entreprises, contacts, RDV, notes et objectifs au lieu de validations dispersees.

- [ ] Stabiliser l'UX mobile des formulaires
  - Sert a garder les boutons visibles avec la nav du bas et a afficher les erreurs clairement en rouge.

- [ ] Ajouter un test e2e leger
  - Sert a verifier le parcours principal : inscription/connexion, creation entreprise, liste entreprise, deconnexion cote client.

- [ ] Nettoyer le README en workflow dev
  - Sert a garder uniquement les commandes utiles : Docker, backend, frontend web, iOS, tests, seed et acces DB.
