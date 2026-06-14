import { expect, test } from "@playwright/test";

const apiBase = "http://localhost:3000";

test("login, entreprise creation and logout flow", async ({ page }) => {
  const entreprises = [
    {
      id: "e1",
      user_id: "user-1",
      nom: "ACME",
      statut: "prospect",
      ville: "Rouen",
      code_postal: "76000",
      logo: null,
    },
  ];

  await page.route(`${apiBase}/v1/auth/login`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ token: "e2e-token" }),
    });
  });

  await page.route(`${apiBase}/v1/auth/me`, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        id: "user-1",
        email: "demo@arius.local",
        prenom: "Demo",
        nom: "Arius",
      }),
    });
  });

  await page.route(`${apiBase}/v1/entreprises**`, async (route) => {
    const request = route.request();

    if (request.method() === "POST") {
      const payload = request.postDataJSON();
      const created = {
        id: "e2",
        user_id: "user-1",
        ...payload,
      };
      entreprises.push(created);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(created),
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ entreprises, total: entreprises.length }),
    });
  });

  await page.goto("/login");
  await page.getByPlaceholder("email@exemple.com").fill("demo@arius.local");
  await page.getByPlaceholder("Mot de passe").fill("Password123");
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.getByText("Accueil").first()).toBeVisible();

  await page.goto("/entreprises");
  await expect(page.getByText("ACME")).toBeVisible();

  await page.goto("/entreprises/create");
  await page.getByPlaceholder("Nom de l'entreprise").fill("Nouvelle Entreprise");
  await page.getByRole("button", { name: "Créer l'entreprise" }).click();

  await page.goto("/entreprises");
  await expect(page.getByText("Nouvelle Entreprise")).toBeVisible();

  await page.goto("/profil");
  await page.getByRole("button", { name: "Déconnexion" }).click();
  await expect(page.getByText("Connexion à votre compte")).toBeVisible();
});
