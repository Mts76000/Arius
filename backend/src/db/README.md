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

Docker lance aussi `npm run db:migrate` avant l'API. Le fichier SQL manuel n'est plus utilise : pour modifier MySQL, on change `src/db/schema.ts`, puis on genere une migration Drizzle.
