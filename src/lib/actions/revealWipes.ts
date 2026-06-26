/**
 * `use:revealWipes` — drives the inline "wipe" reveal effect.
 *
 * Mark text in any {@html} field (e.g. a project `description`/`text` in
 * projects.json) with a span:
 *
 *     <span class='wipe'>Machine Learning</span>
 *
 * (use single quotes so the JSON stays valid). Attach this action to a
 * container that holds such content — it finds every `.wipe` inside and, via
 * an IntersectionObserver, adds `is-revealed` once each scrolls into view so
 * the cover wipes away a single time. The visual lives in the global `.wipe`
 * CSS (src/app.css). An action is used rather than a component because the
 * spans are injected HTML, which Svelte components can't wrap.
 */
interface RevealWipesOptions {
  /** Per-element stagger (ms) for wipes revealed together. */
  stagger?: number;
  /** Fraction of the element visible before it reveals (0–1). */
  threshold?: number;
}

export function revealWipes(node: HTMLElement, options: RevealWipesOptions = {}) {
  const { stagger = 90, threshold = 0.6 } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      }
    },
    { threshold },
  );

  function scan() {
    const wipes = node.querySelectorAll<HTMLElement>(
      ".wipe:not([data-wipe-armed])",
    );
    wipes.forEach((el, i) => {
      el.dataset.wipeArmed = "";
      // Stagger wipes that come into view together; cap so later ones aren't slow.
      el.style.setProperty("--wipe-delay", `${Math.min(i, 5) * stagger}ms`);
      observer.observe(el);
    });
  }

  scan();

  return {
    // Re-scan if the container's content changes (e.g. new section rendered).
    update() {
      scan();
    },
    destroy() {
      observer.disconnect();
    },
  };
}
