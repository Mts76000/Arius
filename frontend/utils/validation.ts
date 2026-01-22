export const ValidationRules = {
  email: (value: string): string | null => {
    if (!value) return "Email requis";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Email invalide";
    return null;
  },

  password: (value: string): string | null => {
    if (!value) return "Mot de passe requis";
    if (value.length < 6) return "Au moins 6 caractères";
    return null;
  },

  passwordConfirm: (value: string, password: string): string | null => {
    if (!value) return "Confirmation requise";
    if (value !== password) return "Les mots de passe ne correspondent pas";
    return null;
  },

  text: (value: string, minLength: number = 1): string | null => {
    if (!value || value.trim().length < minLength)
      return `Au moins ${minLength} caractère(s) requis`;
    return null;
  },

  required: (value: string, fieldName: string = "Ce champ"): string | null => {
    if (!value || value.trim().length === 0) return `${fieldName} requis`;
    return null;
  },
};

export interface FormErrors {
  [key: string]: string | null;
}

export const validateField = (
  fieldName: string,
  value: string,
  rule: (val: string) => string | null,
): string | null => {
  return rule(value);
};

export const hasErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some((error) => error !== null);
};
