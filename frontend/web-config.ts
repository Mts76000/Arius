export function initWebConfig() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  removeAriaHidden();
  const observer = new MutationObserver(() => {
    removeAriaHidden();
  });

  if (document.body) {
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ["aria-hidden"],
    });
  }

  patchConsoleError();

  return () => {
    observer.disconnect();
  };
}

function removeAriaHidden() {
  const ariaHiddenElements = document.querySelectorAll('[aria-hidden="true"]');

  ariaHiddenElements.forEach((element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length > 0) {
      element.removeAttribute("aria-hidden");
    }
  });
}

let consoleErrorPatched = false;

function patchConsoleError() {
  if (consoleErrorPatched || typeof console === "undefined") {
    return;
  }

  consoleErrorPatched = true;
  const originalError = console.error;

  console.error = function (...args) {
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
