# Epic 1 : Authentification & Utilisateurs

**Estimation** : M (3-5j) | **Dépendances** : Epic 0 | **Slice** : 1

## Objectif

Inscription, connexion, gestion session JWT avec Better Auth.

## Critères acceptation

- Inscription avec email + password
- Connexion retourne JWT (~1h)
- Connexion avec Google (ID Token vérifié côté backend)
- JWT stocké SecureStore/localStorage
- Routes API protégées Authorization: Bearer
- Isolation données par utilisateur_id
- Endpoint /v1/auth/moi

## User Stories

- US 1.1 : Inscription email/password
- US 1.2 : Connexion avec identifiants
- US 1.3 : Connexion avec Google
- US 1.4 : Session persiste après fermeture
- US 1.5 : Toutes requêtes authentifiées

## Tasks Backend

- [x] Créer table utilisateurs MySQL (id CHAR(36) PRIMARY KEY, email VARCHAR(255) UNIQUE, mot_de_passe_hache VARCHAR(255) NULLABLE, prenom VARCHAR(100), nom VARCHAR(100), photo_url VARCHAR(500) NULLABLE, google_sub VARCHAR(255) NULLABLE UNIQUE, cree_le DATETIME, modifie_le DATETIME)
- [x] Install better-auth + bcryptjs + jsonwebtoken + google-auth-library
- [x] Service auth : hashPassword, comparePassword, generateJWT, verifyJWT
- [x] Vérification ID Token Google (Google JWKS via `google-auth-library`) et mapping utilisateur (création si premier login)
- [x] Route POST /v1/auth/inscription
- [x] Route POST /v1/auth/connexion
- [x] Route POST /v1/auth/google (body: { id_token }) → retourne JWT
- [x] Route GET /v1/auth/moi
- [x] Middleware authMiddleware (vérifie JWT, attache req.utilisateurId)
- [x] Appliquer authMiddleware (sauf /auth/\*)
- [ ] Test Postman (email/password + Google)

## Tasks Frontend

- [x] Store Zustand useAuthStore (token, user, setToken, logout)
- [x] Service authService (register, login, loginWithGoogle, getMe)
- [x] Écran inscription (form email/password, Zod)
- [ ] Écran connexion (incl. bouton "Continuer avec Google")
- [ ] Intégrer Google Sign-In (expo-auth-session/providers/google) – récup idToken
- [ ] Envoyer idToken à /v1/auth/google, recevoir JWT, persister SecureStore/localStorage
- [x] Hook useAuth (charge token démarrage)
- [x] Navigation conditionnelle (token → app, sinon → auth)
- [x] Bouton Déconnexion
