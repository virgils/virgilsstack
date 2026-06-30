<script lang="ts">
  import ProjectCard from "./ProjectCard.svelte";
  import { ENABLE_TILT, ENABLE_PARALLAX } from "$lib/effects";
  import { BP_SM, BP_LG, BP_XL, isMobileWidth } from "$lib/breakpoints";

  type Project = Record<string, any>;

  let {
    projects,
    // When true, columns drift so their BOTTOMS align on one line at the end of
    // the grid (mirroring how their tops align at the top), instead of fanning
    // out by the fixed COLUMN_SPEED amounts.
    evenOut = false,
  }: { projects: Project[]; evenOut?: boolean } = $props();

  // Track viewport width to pick the column count (matches breakpoints in app.css).
  let innerWidth = $state(0);
  let columnCount = $derived(
    innerWidth >= BP_XL ? 4 : innerWidth >= BP_LG ? 3 : innerWidth >= BP_SM ? 2 : 1,
  );
  let isMobile = $derived(isMobileWidth(innerWidth));

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
  const COLUMN_SPEED = [-70, 65, -35, 81];

  // evenOut: per-column travel so shorter columns drift DOWN until their bottoms
  // line up with the tallest column's bottom. Uses real rendered column heights
  // (estimate-based was too subtle — the masonry already balances by estimate).
  //
  // Safeguards against the earlier runaway/footer-overlap:
  //   • content height = lastCard.bottom − column.top (ignores flex `stretch`,
  //     transform-invariant); skips any column we can't measure → 0 drift.
  //   • offset = maxHeight − thisHeight keeps each bottom AT the tallest column's
  //     bottom (inside the columns box), so it can't reach the footer.
  //   • hard ceiling EVEN_MAX_DRIFT as an absolute backstop.
  //   • measured one frame later (see measureGeometry) so layout has settled —
  //     a mid-resize measurement was what blew up before.
  const EVEN_MAX_DRIFT = 1200; // px — absolute backstop against a bad measurement
  let evenSpeeds: number[] = [];
  function computeEvenSpeeds() {
    const n = columns.length;
    const heights: number[] = [];
    for (let i = 0; i < n; i++) {
      const col = colEls[i];
      const last = col?.lastElementChild;
      heights[i] =
        col && col.isConnected && last
          ? last.getBoundingClientRect().bottom -
            col.getBoundingClientRect().top
          : NaN; // unmeasurable
    }
    const valid = heights.filter((h) => h > 0);
    const maxH = valid.length ? Math.max(...valid) : 0;
    evenSpeeds = heights.map((h) => {
      if (!(h > 0)) return 0; // couldn't measure → don't move it
      const drift = maxH - h;
      return drift <= 0 ? 0 : drift > EVEN_MAX_DRIFT ? EVEN_MAX_DRIFT : drift;
    });
  }
  // Each media tilts on the X axis while scrolling: angle scales with scroll
  // speed, sign follows direction (down vs up), easing back to flat on stop.
  // Written as the --tilt-scroll CSS var so it composes with the per-card
  // mouse tilt (see ProjectCard) rather than fighting over `transform`.
  // Max tilt degrees at full speed — exaggerated on mobile, where it's the
  // primary scroll effect (parallax is desktop/multi-column only).
  let maxTilt = $derived(isMobile ? 18 : 9);
  const TILT_VELOCITY = 2600; // px/s at which the tilt hits its max
  const VEL_SMOOTH = 0.08; // velocity low-pass (s) so the tilt isn't jumpy

  $effect(() => {
    const n = columnCount;
    if (typeof window === "undefined" || !gridEl) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Tilt works on any column count (incl. single-column mobile); parallax
    // needs multiple columns to fan. Both respect reduced motion + their toggle.
    const tiltActive = ENABLE_TILT && !reduce;
    const parallaxActive = ENABLE_PARALLAX && !reduce && n > 1;

    // Nothing to do — clear any stale styles and bail.
    if (!tiltActive && !parallaxActive) {
      colEls.forEach((el) => el && (el.style.transform = ""));
      tiltEls.forEach((el) => el.style.removeProperty("--tilt-scroll"));
      return;
    }

    // Clear whichever effect is inactive (the other still runs).
    if (!parallaxActive) {
      colEls.forEach((el) => el && (el.style.transform = ""));
    }
    if (!tiltActive) {
      tiltEls.forEach((el) => el.style.removeProperty("--tilt-scroll"));
    }

    // Cache the grid's geometry so the per-frame loop never calls
    // getBoundingClientRect — reading layout every frame forces a reflow, which
    // is the main source of jitter. We derive the grid's viewport position from
    // the cached document offset + scrollY instead. Recomputed on resize.
    let gridTop = 0; // grid's distance from the top of the document
    let gridHeight = 0;
    let viewportH = window.innerHeight;
    function measureGeometry() {
      const rect = gridEl.getBoundingClientRect();
      gridTop = rect.top + window.scrollY;
      gridHeight = rect.height;
      viewportH = window.innerHeight;
      if (evenOut) {
        computeEvenSpeeds();
      }
    }
    measureGeometry();

    let lastScroll = window.scrollY;
    let velocity = 0; // smoothed scroll velocity, px/s
    let last = 0;
    let lastScrollTime = 0;
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

      // Per-media tilt: signed by scroll direction, scaled by speed.
      if (tiltActive) {
        const tilt =
          Math.abs(velocity) > 5
            ? Math.max(
                -maxTilt,
                Math.min(maxTilt, (velocity / TILT_VELOCITY) * maxTilt),
              )
            : 0;
        tiltEls.forEach((el) =>
          el.style.setProperty("--tilt-scroll", `${tilt.toFixed(2)}deg`),
        );
      }

      // Parallax offset — locked to scroll position (top row stays aligned).
      // Computed purely from cached geometry + scrollY (no layout reads).
      if (parallaxActive) {
        const rectTop = gridTop - cur;
        // evenOut completes (progress 1) when the grid's bottom reaches the
        // viewport bottom; the default fan spans the full grid height.
        const denom = evenOut ? gridHeight - viewportH : gridHeight;
        let progress = denom > 0 ? -rectTop / denom : 0;
        progress = progress < 0 ? 0 : progress > 1 ? 1 : progress;
        for (let i = 0; i < n; i++) {
          const el = colEls[i];
          if (!el) continue;
          const speed = evenOut
            ? (evenSpeeds[i] ?? 0)
            : COLUMN_SPEED[i % COLUMN_SPEED.length];
          el.style.transform = `translate3d(0, ${(progress * speed).toFixed(2)}px, 0)`;
        }
      }

      // Keep ticking through the whole scroll gesture (so the position-locked
      // parallax tracks every frame, even on slow scrolls), plus a tail while
      // the tilt velocity settles. Idle → stop.
      if (now - lastScrollTime < 140 || Math.abs(velocity) > 5) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    function start() {
      if (!running) {
        running = true;
        last = 0; // reset frame clock; lastScroll persists for velocity
        frame = requestAnimationFrame(tick);
      }
    }

    function onScroll() {
      lastScrollTime = performance.now();
      start();
    }

    function onResize() {
      measureGeometry();
      start();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Re-measure whenever the grid's box actually changes size — media loading
    // in, font swaps, and (crucially) client-side back-navigation, where the
    // grid mounts inside the layout's fade while scroll restoration and cached
    // media reflow asynchronously. A one-shot measure can catch a too-small
    // height there (denom = gridHeight - viewportH ≤ 0 → evenOut pins to 0 and
    // the columns never move). The observer fires once on observe() and again
    // on every resize, so geometry/evenSpeeds self-correct regardless of nav
    // timing. Column transforms don't affect the border-box, so no feedback.
    const ro = new ResizeObserver(() => {
      measureGeometry();
      start();
    });
    ro.observe(gridEl);
    start(); // set initial positions

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      cancelAnimationFrame(frame);
      colEls.forEach((el) => el && (el.style.transform = ""));
      tiltEls.forEach((el) => el.style.removeProperty("--tilt-scroll"));
    };
  });
</script>

<svelte:window bind:innerWidth />

<!-- Responsive masonry: 1 / 2 / 3 / 4 columns, cards read left-to-right in JSON order -->
<section class="projects-grid" class:visible bind:this={gridEl}>
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
