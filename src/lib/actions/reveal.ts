import { reveal as revealMode } from "$lib/effects";

/**
 * `use:reveal` — drives the in-view reveal effect for `.reveal` elements.
 *
 * Mark text in any {@html} field (e.g. a project `description`/`text` in
 * projects.json) with a span:
 *
 *     <span class='reveal'>Machine Learning</span>
 *
 * (use single quotes so the JSON stays valid). Attach this action to a
 * container that holds such content — it finds every `.reveal` inside, tags it
 * with the active mode (`reveal-wipe` or `reveal-fade`, from effects.ts), and
 * via an IntersectionObserver adds `is-revealed` once each scrolls into view so
 * it reveals a single time. The visuals live in the global `.reveal` CSS
 * (src/app.css). An action is used rather than a component because the spans
 * are injected HTML, which Svelte components can't wrap.
 */
interface RevealOptions {
  /** Per-element stagger (ms) for elements revealed together. */
  stagger?: number;
  /** Fraction of the element visible before it reveals (0–1). */
  threshold?: number;
}

const MODE_CLASS = revealMode === "fadein" ? "reveal-fade" : "reveal-wipe";

export function reveal(node: HTMLElement, options: RevealOptions = {}) {
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
    const els = node.querySelectorAll<HTMLElement>(
      ".reveal:not([data-reveal-armed])",
    );
    els.forEach((el, i) => {
      el.dataset.revealArmed = "";
      el.classList.add(MODE_CLASS);
      // Stagger elements that come into view together; cap so later ones aren't slow.
      el.style.setProperty("--reveal-delay", `${Math.min(i, 5) * stagger}ms`);
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
