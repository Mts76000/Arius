import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { connectMongo, disconnectMongo } from "../../src/db/mongo.js";
import { pool } from "../../src/db/mysql.js";
import { Note } from "../../src/models/note.js";
import { Rdv } from "../../src/models/rdv.js";
import { Devis } from "../../src/models/devis.js";

const runRealDbTests = process.env.RUN_REAL_DB_TESTS === "1";
const describeRealDb = runRealDbTests ? describe : describe.skip;

const testUserIdQuery = "SELECT id FROM users WHERE email = ?";
const email = `integration-${Date.now()}@arius.local`;
const password = "secret123";

async function cleanup(emailToDelete: string) {
  const [rows] = await pool.query(testUserIdQuery, [emailToDelete]);
  const user = (rows as Array<{ id: string }>)[0];
  if (!user) return;

  await Promise.all([
    Note.deleteMany({ user_id: user.id }),
    Rdv.deleteMany({ user_id: user.id }),
    Devis.deleteMany({ user_id: user.id }),
  ]);
  await pool.query("DELETE FROM users WHERE id = ?", [user.id]);
}

describeRealDb("real DB workflow", () => {
  beforeAll(async () => {
    await connectMongo();
    await cleanup(email);
  });

  afterAll(async () => {
    await cleanup(email);
    await disconnectMongo();
    await pool.end();
  });

  it("creates auth, MySQL and Mongo data through the API", async () => {
    const app = createApp();

    const registerResponse = await request(app).post("/v1/auth/register").send({
      email,
      password,
      prenom: "Integration",
      nom: "Arius",
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.token).toEqual(expect.any(String));

    const loginResponse = await request(app).post("/v1/auth/login").send({
      email,
      password,
    });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.token as string;

    const entrepriseResponse = await request(app)
      .post("/v1/entreprises")
      .set("Authorization", `Bearer ${token}`)
      .send({ nom: "Integration SAS", statut: "prospect" });

    expect(entrepriseResponse.status).toBe(201);
    expect(entrepriseResponse.body).toMatchObject({
      nom: "Integration SAS",
      statut: "prospect",
    });
    const entrepriseId = entrepriseResponse.body.id as string;

    const noteResponse = await request(app)
      .post("/v1/notes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        entreprise_id: entrepriseId,
        contenu: "Note integration",
        type: "info",
      });

    expect(noteResponse.status).toBe(201);
    expect(noteResponse.body).toMatchObject({
      entreprise_id: entrepriseId,
      contenu: "Note integration",
      type: "info",
    });

    const rdvResponse = await request(app)
      .post("/v1/rdvs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        entreprise_id: entrepriseId,
        titre: "RDV integration",
        date_prevue: new Date(Date.now() + 86_400_000).toISOString(),
        duree_minutes: 45,
      });

    expect(rdvResponse.status).toBe(201);
    expect(rdvResponse.body).toMatchObject({
      entreprise_id: entrepriseId,
      titre: "RDV integration",
      duree_minutes: 45,
    });
  });
});
