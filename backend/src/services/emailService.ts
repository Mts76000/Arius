import { Resend } from "resend";
import { env } from "../config/env.js";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!env.resendApiKey) {
    return null;
  }

  resendClient ??= new Resend(env.resendApiKey);
  return resendClient;
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const client = getResendClient();

  if (!client || !env.resendFromEmail) {
    if (env.nodeEnv !== "production") {
      console.info(`Password reset link for ${email}: ${resetUrl}`);
      return;
    }

    throw new Error("email service not configured");
  }

  await client.emails.send({
    from: `Arius <${env.resendFromEmail}>`,
    to: email,
    subject: "Réinitialisation de votre mot de passe Arius",
    html: `
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe Arius.</p>
      <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
      <p>Ce lien expire dans 30 minutes.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `,
  });
}
