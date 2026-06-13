import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env.js";

const serverUrl =
  env.nodeEnv === "production"
    ? "/"
    : `http://localhost:${env.port}`;

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Arius API",
      version: "0.1.0",
      description:
        "Documentation OpenAPI de l'API Arius CRM: authentification, entreprises, contacts, notes, RDVs, devis, objectifs, chiffre d'affaires, profil et export RGPD.",
    },
    servers: [{ url: serverUrl }],
    tags: [
      { name: "Health", description: "Etat de l'API et des dependances" },
      { name: "Auth", description: "Authentification et utilisateur courant" },
      { name: "Entreprises", description: "Gestion des entreprises" },
      { name: "Contacts", description: "Gestion des contacts" },
      { name: "Notes", description: "Gestion des notes" },
      { name: "RDVs", description: "Gestion des rendez-vous" },
      { name: "Devis", description: "Gestion des devis PDF" },
      { name: "Objectifs", description: "Objectifs de chiffre d'affaires" },
      { name: "CA", description: "Chiffre d'affaires" },
      { name: "Profil", description: "Profil et parametres utilisateur" },
      { name: "Export", description: "Export des donnees utilisateur" },
      { name: "Upload", description: "Upload de fichiers" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "Message d'erreur" },
          },
        },
        HealthCheck: {
          type: "object",
          properties: {
            name: {
              type: "string",
              enum: ["api", "mysql", "mongo"],
              example: "mysql",
            },
            status: {
              type: "string",
              enum: ["ok", "error"],
              example: "ok",
            },
            message: { type: "string", example: "connected" },
            latencyMs: { type: "number", example: 4 },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["ok", "error"],
              example: "ok",
            },
            service: { type: "string", example: "arius-api" },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2026-06-13T12:00:00.000Z",
            },
            uptimeSeconds: { type: "number", example: 42 },
            lines: {
              type: "array",
              items: { type: "string" },
              example: [
                "api: ok (running, 0ms)",
                "mysql: ok (connected, 4ms)",
                "mongo: ok (connected, 6ms)",
              ],
            },
            checks: {
              type: "array",
              items: { $ref: "#/components/schemas/HealthCheck" },
            },
          },
        },
        AuthCredentials: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
        },
        EntrepriseInput: {
          type: "object",
          properties: {
            nom: { type: "string", example: "Acme SAS" },
            secteur: { type: "string", example: "Industrie" },
            adresse: { type: "string", example: "10 rue de Paris" },
            telephone: { type: "string", example: "+33123456789" },
            email: { type: "string", format: "email" },
            site_web: { type: "string", example: "https://example.com" },
          },
        },
        ContactInput: {
          type: "object",
          properties: {
            prenom: { type: "string", example: "Ada" },
            nom: { type: "string", example: "Lovelace" },
            poste: { type: "string", example: "CTO" },
            email: { type: "string", format: "email" },
            telephone: { type: "string", example: "+33123456789" },
          },
        },
        NoteInput: {
          type: "object",
          properties: {
            entreprise_id: { type: "string" },
            titre: { type: "string", example: "Compte rendu appel" },
            contenu: { type: "string", example: "Client interesse par l'offre." },
            tags: {
              type: "array",
              items: { type: "string" },
              example: ["prospect", "relance"],
            },
          },
        },
        RdvInput: {
          type: "object",
          properties: {
            entreprise_id: { type: "string" },
            titre: { type: "string", example: "Demo produit" },
            date: { type: "string", format: "date-time" },
            statut: { type: "string", example: "planifie" },
          },
        },
        ObjectifInput: {
          type: "object",
          properties: {
            mois: { type: "string", example: "2026-06" },
            montant: { type: "number", example: 50000 },
          },
        },
        CAInput: {
          type: "object",
          properties: {
            entreprise_id: { type: "string" },
            montant: { type: "number", example: 12000 },
            date: { type: "string", format: "date" },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Authentification requise ou token invalide",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        NotFound: {
          description: "Ressource introuvable",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
  apis: ["./src/app.ts", "./src/routes/*.ts"],
});
