import { describe, expect, it } from "vitest";
import { hasErrors, validateField, ValidationRules } from "../../utils/validation";

describe("ValidationRules", () => {
  it("validates email values", () => {
    expect(ValidationRules.email("")).toBe("Email requis");
    expect(ValidationRules.email("not-an-email")).toBe("Email invalide");
    expect(ValidationRules.email("mathis@example.com")).toBeNull();
  });

  it("validates password strength and confirmation", () => {
    expect(ValidationRules.password("")).toBe("Mot de passe requis");
    expect(ValidationRules.password("123")).toBe("Au moins 6 caractères");
    expect(ValidationRules.password("123456")).toBeNull();

    expect(ValidationRules.passwordConfirm("", "123456")).toBe(
      "Confirmation requise",
    );
    expect(ValidationRules.passwordConfirm("abcdef", "123456")).toBe(
      "Les mots de passe ne correspondent pas",
    );
    expect(ValidationRules.passwordConfirm("123456", "123456")).toBeNull();
  });

  it("validates text and required fields after trimming", () => {
    expect(ValidationRules.text("  ", 2)).toBe("Au moins 2 caractère(s) requis");
    expect(ValidationRules.text(" abc ", 2)).toBeNull();
    expect(ValidationRules.required(" ", "Le nom")).toBe("Le nom requis");
    expect(ValidationRules.required("Arius", "Le nom")).toBeNull();
  });

  it("exposes generic field validation and error aggregation helpers", () => {
    expect(validateField("email", "bad", ValidationRules.email)).toBe(
      "Email invalide",
    );
    expect(hasErrors({ email: null, nom: "Nom requis" })).toBe(true);
    expect(hasErrors({ email: null, nom: null })).toBe(false);
  });
});
