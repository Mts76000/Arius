# Epic 4 : Historique Client (Timeline + Traçabilité)

**Estimation** : XL (8-10j) | **Dépendances** : Epic 2, 3 | **Slice** : 2

## Objectif

Système central de traçabilité : chaque interaction (appel, réunion, email) est notée, taguée, et visible en timeline. La mémoire du commercial.

**Scope** : Notes utilisateur seul (pas de partage multi-user pour l'instant)

## Critères acceptation

- [x] Créer note liée entreprise avec type (appel, réunion, email, info, autre)
- [x] ~~Tagger notes (urgent, bloquant, follow-up, client_content, etc.)~~ **SUPPRIMÉ** - Simplification UX, utiliser le contenu pour catégoriser
- [x] Stockage MongoDB (collection notes + index performant)
- [x] Timeline visuelle dans détail entreprise (chronologique inversée)
- [x] Templates réutilisables par type (compte-rendu réunion type, suivi type, etc.)
- [ ] Dashboard "Clients en attente" (dernier contact + jours écoulés)
- [x] Recherche notes par contenu/date/entreprise

## User Stories

- [x] US 4.1 : Après appel client → créer note type "appel" avec contexte
- [x] US 4.2 : Voir timeline complète des interactions (appels + réunions + emails)
- [ ] US 4.3 : ~~Tagger note comme "urgent" ou "suivi requis"~~ **SUPPRIMÉ** → voir dashboard clients en attente
- [x] US 4.4 : Utiliser template (ex: PV réunion standard) → pré-remplissage + édition
- [ ] US 4.5 : Dashboard affiche clients pas contactés depuis X jours → trigger suivi
- [x] US 4.6 : Rechercher historique (ex: "intégration API") → retrouve interactions

## Tasks Backend

- [x] Modèle Mongoose Note (id, utilisateur_id, entreprise_id, contact_id opt, contenu, type: enum[appel|reunion|email|info|autre], ~~tags~~, est_template, nom_template opt, created_at, updated_at)
- [x] Index : (utilisateur_id, entreprise_id, created_at desc)
- [x] Schéma Zod : CreateNote (type requis), UpdateNote
- [x] Route GET /v1/entreprises/:id/notes?page=&limite=&type= (filtré + paginé)
- [x] Route GET /v1/notes/:id
- [x] Route POST /v1/notes (créer note ou template)
- [x] Route PUT /v1/notes/:id (éditer)
- [x] Route DELETE /v1/notes/:id
- [x] Route GET /v1/templates/notes (lister templates par type)
- [x] Route GET /v1/notes/search?q= (recherche full-text)
- [ ] Route GET /v1/dashboard/clients-suivi?jours_seuil=7 (clients pas contactés)
- [x] Émettre activité création/modification
- [x] Tests CRUD + search + dashboard

## Tasks Frontend

- [x] Service notesService (API + caching)
- [x] Hook useNotes (fetch + filtrage local)
- [ ] Hook useDashboardSuivi (clients timeout)
- [x] **Timeline visuelle** (détail entreprise) : notes triées desc, icônes par type, date/contenu visibles
- [x] Modal création note : type selector → template selector → textarea → validation
- [ ] ~~Gestion tags~~ **SUPPRIMÉ**
- [x] Liste templates (par type) : sélection → pré-remplissage
- [x] Modal édition note
- [x] Suppression note (confirm)
- [ ] Dashboard "Clients en attente" : liste + dernier contact + jours écoulés + action rapide
- [x] Barre recherche notes (détail entreprise) - recherche par contenu et date
- [x] Design clean : timeline, cards modernes, filtres par type
- [x] Composants modulaires : TabNavigation, EntrepriseHeader, InfosTab, NotesTab
