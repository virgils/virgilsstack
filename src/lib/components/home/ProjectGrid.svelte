<script lang="ts">
  import ProjectCard from "./ProjectCard.svelte";
  import { ENABLE_TILT, ENABLE_PARALLAX } from "$lib/effects";

  type Project = Record<string, any>;

  let { projects }: { projects: Project[] } = $props();

  // Track viewport width to pick the column count (matches breakpoints in app.css).
  let innerWidth = $state(0);
  let columnCount = $derived(
    innerWidth >= 1600 ? 4 : innerWidth >= 1024 ? 3 : innerWidth >= 560 ? 2 : 1,
  );

  // innerWidth is 0 until the window binding measures it (and during SSR), which
  // would briefly render a 1-column fallback. Keep the grid hidden until we have
  // a real measurement so it only ever paints at the correct column count.
  let measured = $derived(innerWidth > 0);

  // Fade the grid when the filter changes: fade out, swap the rendered set
  // while invisible (so the swap isn't seen), then fade back in. `displayed`
  // is the set actually laid out; it lags `projects` by one fade-out.
  const FADE_MS = 220;
  // $state.raw (not $state) so `displayed` stays reference-equal to the prop —
  // a deep-proxied $state would never === `projects`, causing an endless fade.
  let displayed = $state.raw(projects);
  let shown = $state(true);
  let visible = $derived(measured && shown);

  $effect(() => {
    if (projects === displayed) return; // no change (or already in sync)
    shown = false; // fade out
    const t = setTimeout(() => {
      displayed = projects; // swap while invisible
      shown = true; // fade back in
    }, FADE_MS);
    return () => clearTimeout(t);
  });

  // How many leading projects keep their curated, deterministic placement.
  const FIXED_COUNT = 8;
  // Rough height a card's title/year block + column gap adds on top of the
  // media, in the same normalized units as the media height (column width = 1).
  const INFO_BLOCK = 0.35;

  // Estimate a card's rendered height relative to the column width.
  // mediaRatio is "w / h" (defaults to 16/9, matching ProjectCard), so the
  // media's height for a unit-width column is h / w = 1 / ratio.
  function estimateHeight(project: Project): number {
    const raw = project.mediaRatio || "16 / 9";
    const [w, h] = String(raw)
      .split("/")
      .map((n) => parseFloat(n.trim()));
    const ratio = w && h ? w / h : 16 / 9;
    return 1 / ratio + INFO_BLOCK;
  }

  // First FIXED_COUNT projects keep their JSON order (round-robin so they read
  // left-to-right). After that, each project drops into the currently shortest
  // column so column heights stay as even as possible toward the bottom.
  let columns = $derived.by(() => {
    const cols: Project[][] = Array.from({ length: columnCount }, () => []);
    const heights: number[] = Array.from({ length: columnCount }, () => 0);

    displayed.forEach((project, i) => {
      let target: number;
      if (i < FIXED_COUNT) {
        target = i % columnCount;
      } else {
        // index of the shortest column
        target = heights.reduce(
          (min, h, idx) => (h < heights[min] ? idx : min),
          0,
        );
      }
      cols[target].push(project);
      heights[target] += estimateHeight(project);
    });

    return cols;
  });

  // ── Per-column scroll parallax ─────────────────────────────────────────
  // Each column's vertical offset is a direct function of how far the grid has
  // scrolled through the viewport, so columns visibly fan out at different
  // rates as you scroll. Locked to scroll position (no lag/smoothing), so it
  // tracks the scroll frame-for-frame and never has a catch-up or settle.
  // Desktop / multi-column only; disabled for reduced motion.
  let gridEl: HTMLElement;
  let colEls: HTMLElement[] = [];
  // Each card registers its .media-wrapper here so we can tilt just the media.
  // (The hover-zoom was moved onto the inner img/video so the wrapper's
  // transform is free for this tilt — see ProjectCard.)
  const tiltEls = new Set<HTMLElement>();
  function card(node: HTMLElement) {
    const media = node.querySelector<HTMLElement>(".media-wrapper");
    if (!media) return;
    tiltEls.add(media);
    return {
      destroy() {
        tiltEls.delete(media);
      },
    };
  }
  // Travel (px) per column as you scroll down through the grid. Alternating
  // signs make neighbours move opposite ways; magnitude = how far each drifts.
  const COLUMN_SPEED = [-50, 55, -35, 81];
  // Each media tilts on the X axis while scrolling: angle scales with scroll
  // speed, sign follows direction (down vs up), easing back to flat on stop.
  // Written as the --tilt-scroll CSS var so it composes with the per-card
  // mouse tilt (see ProjectCard) rather than fighting over `transform`.
  const MAX_TILT = 9; // max degrees at full speed
  const TILT_VELOCITY = 2600; // px/s at which the tilt hits its max
  const VEL_SMOOTH = 0.08; // velocity low-pass (s) so the tilt isn't jumpy

  $effect(() => {
    const n = columnCount;
    if (typeof window === "undefined" || !gridEl) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Off on mobile (single column), with reduced motion, or if both toggles
    // are disabled. Always clear any stale styles first.
    if (n <= 1 || reduce || (!ENABLE_TILT && !ENABLE_PARALLAX)) {
      colEls.forEach((el) => el && (el.style.transform = ""));
      tiltEls.forEach((el) => el.style.removeProperty("--tilt-scroll"));
      return;
    }

    // Clear whichever single effect is turned off (the other still runs).
    if (!ENABLE_PARALLAX) {
      colEls.forEach((el) => el && (el.style.transform = ""));
    }
    if (!ENABLE_TILT) {
      tiltEls.forEach((el) => el.style.removeProperty("--tilt-scroll"));
    }

    let lastScroll = window.scrollY;
    let velocity = 0; // smoothed scroll velocity, px/s
    let last = 0;
    let frame = 0;
    let running = false;

    function tick(now: number) {
      if (!last) last = now;
      let dt = (now - last) / 1000;
      last = now;
      if (dt < 0.001) dt = 0.001;
      if (dt > 0.05) dt = 0.05; // clamp after tab refocus / long frames

      const cur = window.scrollY;
      const instant = (cur - lastScroll) / dt; // px/s this frame
      lastScroll = cur;
      const a = 1 - Math.exp(-dt / VEL_SMOOTH);
      velocity += (instant - velocity) * a;

      const moving = Math.abs(velocity) > 5;

      // Per-media tilt: signed by scroll direction, scaled by speed.
      if (ENABLE_TILT) {
        const tilt = moving
          ? Math.max(
              -MAX_TILT,
              Math.min(MAX_TILT, (velocity / TILT_VELOCITY) * MAX_TILT),
            )
          : 0;
        tiltEls.forEach((el) =>
          el.style.setProperty("--tilt-scroll", `${tilt.toFixed(2)}deg`),
        );
      }

      // Parallax offset — locked to scroll position (top row stays aligned).
      if (ENABLE_PARALLAX) {
        const rect = gridEl.getBoundingClientRect();
        let progress = -rect.top / rect.height;
        progress = Math.max(0, Math.min(1, progress));
        for (let i = 0; i < n; i++) {
          const el = colEls[i];
          if (!el) continue;
          const offset = progress * COLUMN_SPEED[i % COLUMN_SPEED.length];
          el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
        }
      }

      if (moving) frame = requestAnimationFrame(tick);
      else running = false;
    }

    function start() {
      if (!running) {
        running = true;
        // Reset only the frame clock (so dt is sane on resume). Keep lastScroll
        // persistent — resetting it here would zero out the very delta we need
        // to measure velocity, leaving the fade permanently at 0.
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    }

    window.addEventListener("scroll", start, { passive: true });
    window.addEventListener("resize", start);
    start(); // set initial positions

    return () => {
      window.removeEventListener("scroll", start);
      window.removeEventListener("resize", start);
      cancelAnimationFrame(frame);
      colEls.forEach((el) => el && (el.style.transform = ""));
      tiltEls.forEach((el) => el.style.removeProperty("--tilt-scroll"));
    };
  });
</script>

<svelte:window bind:innerWidth />

<!-- Responsive masonry: 1 / 2 / 3 / 4 columns, cards read left-to-right in JSON order -->
<section class="projects-grid" class:measured bind:this={gridEl}>
  {#each columns as column, ci}
    <div class="grid-column" bind:this={colEls[ci]}>
      {#each column as project (project.slug)}
        <div class="card-wrap" use:card>
          <ProjectCard {project} />
        </div>
      {/each}
    </div>
  {/each}
</section>

<style>
  /* Columns are rendered as flex tracks; the round-robin split in the
     script keeps cards in projects.json order left-to-right, while each
     column stacks its cards tightly (masonry). Column count is JS-driven. */
  .projects-grid {
    display: flex;
    gap: 32px;
    padding: 32px var(--page-padding-x) 64px;
    /* Hidden until measured (avoids the 1-column flash) and while swapping the
       filtered set; fades in/out via `.visible`. */
    opacity: 0;
    transition: opacity 0.22s ease;
  }

  .projects-grid.visible {
    opacity: 1;
  }

  .grid-column {
    flex: 1;
    min-width: 0; /* allow columns to shrink instead of overflowing */
    display: flex;
    flex-direction: column;
    gap: 40px;
    will-change: transform; /* parallax translate, driven in JS */
  }

  @media (--bp-sm) {
    .projects-grid {
      padding: 48px var(--page-padding-x) 96px;
    }

    .grid-column {
      gap: 48px;
    }
  }
</style>
