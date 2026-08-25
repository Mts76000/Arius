import React from "react";
import { LegalLayout } from "@/components/landing/LegalLayout";
import { LegalSection, LegalParagraph, LegalList } from "@/components/landing/LegalSection";

export default function CguScreen() {
  return (
    <LegalLayout
      title="Conditions générales d’utilisation"
      description="Conditions générales d’utilisation d’Arius : modalités d’accès, d’utilisation et de responsabilité."
    >
      <LegalSection title="Objet">
        <LegalParagraph>
          Les présentes conditions générales d’utilisation (CGU) définissent les règles
          d’accès et d’utilisation du service Arius, un outil de CRM destiné aux
          indépendants, freelances et petites entreprises.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Acceptation des CGU">
        <LegalParagraph>
          L’utilisation du service implique l’acceptation pleine et entière des
          présentes CGU. Si vous ne les acceptez pas, vous ne devez pas utiliser Arius.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Inscription et compte">
        <LegalList
          items={[
            "L’utilisateur doit fournir des informations exactes lors de l’inscription.",
            "L’utilisateur est responsable de la confidentialité de ses identifiants.",
            "Arius se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des CGU.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Utilisation du service">
        <LegalParagraph>
          Arius permet de :
        </LegalParagraph>
        <LegalList
          items={[
            "Gérer des entreprises, contacts, rendez-vous, notes, devis, objectifs et chiffre d’affaires.",
            "Exporter ses données aux formats proposés.",
            "Supprimer son compte et ses données.",
          ]}
        />
        <LegalParagraph>
          L’utilisateur s’engage à utiliser le service conformément à la loi et à
          ne pas y insérer de contenu illicite, diffamatoire ou portant atteinte aux droits de
          tiers.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <LegalParagraph>
          Tous les éléments du service sont protégés par les lois relatives à la propriété
          intellectuelle. L’utilisateur ne peut les reproduire, modifier ou distribuer sans
          autorisation écrite.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Données personnelles">
        <LegalParagraph>
          Les données collectées sont décrites dans la Politique de confidentialité. L’utilisateur
          dispose d’un droit d’accès, de rectification et de suppression sur ses données.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <LegalParagraph>
          Arius s’efforce d’assurer la disponibilité et la sécurité du service mais
          ne peut garantir une disponibilité ininterrompue. L’utilisateur est seul
          responsable des données qu’il saisit et des conséquences de leur utilisation.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Modification des CGU">
        <LegalParagraph>
          Arius peut modifier les présentes CGU à tout moment. Les modifications seront
          notifiées lors de la prochaine connexion ou publiées sur cette page.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Résiliation">
        <LegalParagraph>
          L’utilisateur peut supprimer son compte à tout moment depuis son profil. Arius
          se réserve le droit de suspendre ou supprimer un compte en cas de violation des
          présentes CGU.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Droit applicable">
        <LegalParagraph>
          Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux
          compétents seront ceux du ressort du siège de l’éditeur.
        </LegalParagraph>
      </LegalSection>
    </LegalLayout>
  );
}
