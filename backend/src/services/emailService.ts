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
      <div style="margin:0;background:#f8fafc;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;">
          <div style="background:#087ef2;padding:28px 32px;color:#ffffff;">
            <div style="font-size:22px;font-weight:700;">Arius CRM</div>
            <div style="margin-top:6px;font-size:14px;opacity:.9;">Réinitialisation du mot de passe</div>
          </div>
          <div style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#0f172a;">Choisis un nouveau mot de passe</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
              Une demande de réinitialisation a été faite pour ton compte Arius.
              Clique sur le bouton ci-dessous pour définir un nouveau mot de passe.
            </p>
            <a href="${resetUrl}" style="display:inline-block;background:#087ef2;color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 22px;font-weight:700;font-size:15px;">
              Réinitialiser mon mot de passe
            </a>
            <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#64748b;">
              Ce lien expire dans 30 minutes et ne peut être utilisé qu'une seule fois.
            </p>
            <p style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#94a3b8;">
              Si tu n'es pas à l'origine de cette demande, tu peux ignorer cet email.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}
