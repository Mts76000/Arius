/**
 * Echappe les caracteres speciaux d'une chaine pour l'utiliser en toute
 * securite dans un pattern RegExp (MongoDB $regex ou RegExp natif).
 * Empeche l'injection de regex utilisateur (ReDoS, bypass de filtre).
 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
