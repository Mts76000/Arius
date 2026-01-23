// Fix pour React Navigation sur web - désactiver aria-hidden problématique
if (typeof window !== "undefined" && typeof document !== "undefined") {
  // Attendre que le DOM soit chargé
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", removeAriaHidden);
  } else {
    removeAriaHidden();
  }

  // Observer pour corriger les nouveaux éléments
  const observer = new MutationObserver(() => {
    removeAriaHidden();
  });

  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["aria-hidden"],
  });

  function removeAriaHidden() {
    // Trouver tous les éléments avec aria-hidden qui contiennent des éléments focalisables
    const ariaHiddenElements = document.querySelectorAll(
      '[aria-hidden="true"]',
    );
    ariaHiddenElements.forEach((element) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusableElements.length > 0) {
        // Supprimer aria-hidden si des éléments focalisables sont présents
        element.removeAttribute("aria-hidden");
      }
    });
  }
}

// Supprimer les avertissements React Native sur les nœuds texte vides dans les View
if (typeof window !== "undefined" && typeof console !== "undefined") {
  const originalError = console.error;
  console.error = function (...args) {
    // Ignorer l'erreur "Unexpected text node" qui provient d'espaces dans les View
    if (
      args[0] &&
      typeof args[0] === "string" &&
      args[0].includes("Unexpected text node: .")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}
