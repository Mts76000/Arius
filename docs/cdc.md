Je veux que tu mettes à jour mon document docs/fullstack-architecture.md pour qu’il soit 100% cohérent et prêt pour le dev, avec ces règles :

Stack imposée (non négociable)

SQL = MySQL 8 (pas PostgreSQL)

NoSQL = MongoDB 6

Backend Express.js (Node 20)

Auth Better Auth + JWT

Monorepo : apps/mobile, apps/web, apps/api, packages/shared, packages/db-sql, packages/db-mongo

Offline-first mobile : cache lecture + création offline (notes) + sync idempotent

Répartition des données (à respecter)

MySQL (relationnel) : utilisateurs, entreprises, contacts, objectifs_mensuels, ca_mensuel

MongoDB (documents) : notes, rdvs, devis, activities

Important : rdvs et devis sont bien en Mongo.

Standardisation FR (très important)

Tout doit être en français : noms de tables/collections + champs + endpoints.

Supprimer tous les doublons “companies” vs “entreprises” → on garde uniquement “entreprises”.

Ce que je veux dans le doc final (pas résumé)

Une architecture propre (sections numérotées sans “12b/12c” au milieu)

Schéma MySQL complet : tables, champs, types, contraintes, indexes, relations

Schéma Mongo complet : collections, champs, indexes, règles offline (upsert)

Stratégie ID : UUID v4 commun (MySQL CHAR(36), Mongo champ id string + \_id)

Comment Mongo référence SQL : entreprise_id / contact_id en UUID string

Activity feed : collection activities (structure + comment on l’écrit + idempotence)

Endpoints REST en FR (/v1/entreprises, /v1/rdvs, /v1/devis, etc.) + filtres + pagination

Chapitre “Limites multi-DB” : pas de joins cross-db, cohérence éventuelle, patterns anti-bugs

Chapitre “Risques & mitigations” spécifique multi-DB

Choix libs backend + justification : Prisma (MySQL) + Mongoose (Mongo) + Zod + Multer + Pino + Helmet + rate-limit

Résultat attendu

Tu me rends le fichier docs/fullstack-architecture.md réécrit proprement et cohérent, prêt pour passer au dev.
