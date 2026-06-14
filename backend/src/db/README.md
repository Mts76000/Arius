# Donnees backend

## Regle de stockage

MySQL est la base relationnelle du projet. Elle stocke les donnees qui ont des relations fortes, des contraintes d'unicite, des jointures ou des agregations commerciales :

- `users`
- `password_reset_tokens`
- `entreprises`
- `contacts`
- `objectifs_mensuels`
- `ca_mensuel`

MongoDB stocke les documents applicatifs plus souples ou lies a un historique :

- `notes`
- `rdvs`
- `devis`

## Schema MySQL

La source de verite cote code est `src/db/schema.ts` avec Drizzle.

Les migrations Drizzle sont dans `drizzle/` et se generent avec :

```bash
npm run db:generate
```

Elles s'appliquent sur une base existante avec :

```bash
npm run db:migrate
```

Le fichier `src/db/schema.sql` reste present pour initialiser rapidement une base Docker vide au premier demarrage du volume MySQL. Il doit rester synchronise avec le schema Drizzle.
