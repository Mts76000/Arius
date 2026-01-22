import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectMongo } from "./db/mongo.js";

async function main() {
  try {
    await connectMongo();
    console.log("✓ MongoDB connecté");

    const app = createApp();
    app.listen(env.port, () => {
      console.log(`✓ API démarrée sur http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error("Erreur au démarrage:", err);
    process.exit(1);
  }
}

main();
