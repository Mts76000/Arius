import React from "react";
import { LegalLayout } from "@/components/landing/LegalLayout";
import { LegalSection, LegalParagraph } from "@/components/landing/LegalSection";

export default function MentionsLegalesScreen() {
  return (
    <LegalLayout
      title="Mentions légales"
      description="Mentions légales du site Arius : éditeur, hébergeur et propriété intellectuelle."
    >
      <LegalSection title="Éditeur du site">
        <LegalParagraph>
          Le site Arius est édité par Mathis Lamotte, en qualité de développeur et
          responsable de publication.
        </LegalParagraph>
        <LegalParagraph>
          Contact : lamottemathis@gmail.com
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Hébergeur">
        <LegalParagraph>
          L’hébergement du site et des données est assuré par un hébergeur situé sur
          le territoire français. Pour toute question relative à l’hébergement,
          contactez l’éditeur.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <LegalParagraph>
          L’ensemble du site, y compris la structure, les textes, les images, les
          graphismes, les logos et les icônes, est la propriété exclusive d’Arius ou de
          ses partenaires. Toute reproduction, distribution ou utilisation sans autorisation
          est interdite.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Responsabilité">
        <LegalParagraph>
          Arius met tout en œuvre pour assurer l’exactitude des informations publiées.
          Toutefois, l’éditeur ne saurait être tenu responsable des erreurs, omissions
          ou de l’indisponibilité temporaire du service.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Liens externes">
        <LegalParagraph>
          Le site peut contenir des liens vers des sites tiers. Arius n’exerce aucun
          contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
        </LegalParagraph>
      </LegalSection>
    </LegalLayout>
  );
}
