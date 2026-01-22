# Epic 10 : Déploiement VPS

**Estimation** : S-M (2-4j) | **Dépendances** : Epic 0, 1 | **Slice** : 8

## Objectif

Déployer le backend et le frontend sur VPS avec process manager (PM2), exposer via reverse proxy (Nginx/Caddy), et mettre en place les sauvegardes.

## Critères acceptation

- Backend déployé avec PM2 (auto-restart, logs).
- Frontend build web servi par Nginx.
- Services configurés (env vars, SSL).
- Healthchecks et logs accessibles.
- Sauvegardes planifiées MySQL/Mongo (mysqldump/mongodump) avec rétention.

## Tasks Backend

- [ ] Config PM2 (ecosystem.config.js).
- [ ] Endpoint /healthz + readiness checks.
- [ ] Script de déploiement (build, restart PM2).
- [ ] Documentation variables d'environnement.
- [ ] Script backup (mysqldump/mongodump) + cron système.

## Tasks Frontend

- [ ] Configuration URL API par environnement (env files).
- [ ] Build web (expo export) + Nginx (ou Coolify Static site).
- [ ] En-têtes cache basiques et compression.

## Tasks Ops

- [ ] Config reverse proxy Nginx/Caddy (domaines, certificats Let's Encrypt auto).
- [ ] Politique de rétention des backups et test de restauration.
- [ ] Journalisation (logs PM2/système) et monitoring (healthchecks).
