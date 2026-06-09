# Forms Architecture (Simple)

Objectif: avoir seulement 2 composants partages pour tous les formulaires.

## Composants partages

```text
frontend/components/forms/
├── FormInput.tsx
├── Form.tsx
├── formDefinitions.ts
└── EntrepriseForm.tsx
```

- FormInput.tsx
  : input unique, meme style que login.

- Form.tsx
  : composant unique de structure form.
  : exporte:
- FormHeader (Annuler / Titre / Enregistrer)
- FormBlock (label + required + error + contenu)

- formDefinitions.ts
  : options/constantes partagees (status, mois, modes modal/screen).

## Formulaires metier

```text
frontend/components/modals/
├── ContactModal.tsx
├── NoteModal.tsx
├── RdvModal.tsx
├── DevisModal.tsx
├── CAModal.tsx
└── ObjectifModal.tsx
```

Regle:

- Tous les champs texte => FormInput.
- Tous les headers de modal => FormHeader.
- Tous les blocs de formulaire => FormBlock.

## Points d'entree

- frontend/app/(auth)/login.tsx
- frontend/app/(tabs)/entreprises/create.tsx
- frontend/app/(tabs)/entreprises/[id]/edit.tsx
- frontend/app/(tabs)/entreprises/[id].tsx
- frontend/app/(tabs)/rdvs.tsx
- frontend/app/(tabs)/ca.tsx
- frontend/components/sections/DevisSection.tsx

## Checklist

1. Nouveau form: creer le composant metier.
2. Utiliser FormInput pour les saisies.
3. Utiliser FormHeader/FormBlock pour la structure.
4. Ajouter options partagees dans formDefinitions.ts si necessaire.
