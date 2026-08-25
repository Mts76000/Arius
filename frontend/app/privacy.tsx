import React from "react";
import { LegalLayout } from "@/components/landing/LegalLayout";
import { LegalSection, LegalParagraph, LegalList } from "@/components/landing/LegalSection";

export default function PrivacyScreen() {
  return (
    <LegalLayout
      title="Politique de confidentialité"
      description="Politique de confidentialité d’Arius : quelles données sont collectées, pourquoi, combien de temps et quels sont vos droits."
    >
      <LegalSection title="Qui sommes-nous ?">
        <LegalParagraph>
          Arius est un CRM mobile et web destiné aux indépendants, freelances et petites
          entreprises pour les aider à gérer leurs clients, rendez-vous, notes et chiffre
          d’affaires.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Données collectées">
        <LegalParagraph>
          Nous collectons uniquement les données nécessaires au fonctionnement du service :
        </LegalParagraph>
        <LegalList
          items={[
            "Données d’identification : nom, prénom, adresse email.",
            "Données d’authentification : mot de passe hashé.",
            "Données CRM saisies par l’utilisateur : entreprises, contacts, rendez-vous, notes, devis, objectifs et chiffre d’affaires.",
            "Documents téléversés : logos d’entreprises et devis (optionnels, limités en taille et en type).",
          ]}
        />
      </LegalSection>

      <LegalSection title="Finalités du traitement">
        <LegalParagraph>
          Les données sont traitées pour :
        </LegalParagraph>
          <LegalList
            items={[
              "Créer, authentifier et sécuriser le compte utilisateur.",
              "Permettre la gestion des clients, rendez-vous, notes et chiffre d’affaires.",
              "Permettre l’export et la suppression des données.",
              "Assurer la sécurité du service et le support utilisateur.",
            ]}
          />
      </LegalSection>

      <LegalSection title="Base légale du traitement">
        <LegalParagraph>
          Les traitements sont fondés sur l’exécution du contrat (CGU), l’intérêt
          légitime de fournir et sécuriser le service, et, le cas échéant, le consentement
          explicite de l’utilisateur.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Durée de conservation">
        <LegalParagraph>
          Les données sont conservées tant que le compte est actif. En cas de suppression du
          compte, les données personnelles et CRM sont effacées ou anonymisées dans un délai
          raisonnable.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Destinataires et transferts">
        <LegalParagraph>
          Les données sont strictement réservées à l’utilisateur et à l’équipe
          technique chargée de la maintenance et de la sécurité du service. Aucune donnée
          n’est vendue à des tiers. Les données sont hébergées en France.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Vos droits">
        <LegalParagraph>
          Conformément au RGPD, vous disposez des droits suivants :
        </LegalParagraph>
        <LegalList
          items={[
            "Droit d’accès à vos données.",
            "Droit de rectification des informations inexactes.",
            "Droit à l’effacement de vos données.",
            "Droit à la portabilité de vos données.",
            "Droit d’opposition et de limitation du traitement.",
            "Droit de retirer votre consentement à tout moment.",
          ]}
        />
        <LegalParagraph>
          Pour exercer ces droits, contactez : lamottemathis@gmail.com.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Cookies et technologies similaires">
        <LegalParagraph>
          Arius n’utilise pas de cookies publicitaires ou de traçage tiers. Seuls les
          cookies strictement nécessaires au fonctionnement de l’authentification et de
          la navigation peuvent être utilisés.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Sécurité">
        <LegalParagraph>
          Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger
          vos données : mots de passe hashés, authentification JWT, rate limiting, limitation
          des uploads et séparation des données par utilisateur.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Modifications">
        <LegalParagraph>
          Cette politique peut être mise à jour. Les modifications seront publiées sur cette
          page avec la date de dernière mise à jour.
        </LegalParagraph>
        <LegalParagraph>
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}.
        </LegalParagraph>
      </LegalSection>
    </LegalLayout>
  );
}
