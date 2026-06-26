<script lang="ts">
  import ProjectCard from "./ProjectCard.svelte";

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

    projects.forEach((project, i) => {
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
  // Travel (px) per column as you scroll down through the grid. Alternating
  // signs make neighbours move opposite ways; magnitude = how far each drifts.
  const COLUMN_SPEED = [-50, 55, -35, 80];

  $effect(() => {
    const n = columnCount;
    if (typeof window === "undefined" || !gridEl) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // No parallax on mobile (single column) or when reduced motion is set.
    if (n <= 1 || reduce) {
      colEls.forEach((el) => el && (el.style.transform = ""));
      return;
    }

    let frame = 0;
    let ticking = false;

    function update() {
      ticking = false;
      const rect = gridEl.getBoundingClientRect();
      // 0 while the grid's top is at/below the viewport top (so the top row of
      // cards stays aligned), then grows toward 1 as you scroll down through it.
      let progress = -rect.top / rect.height;
      progress = Math.max(0, Math.min(1, progress));
      for (let i = 0; i < n; i++) {
        const el = colEls[i];
        if (!el) continue;
        const offset = progress * COLUMN_SPEED[i % COLUMN_SPEED.length];
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        frame = requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update(); // set initial positions

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      colEls.forEach((el) => el && (el.style.transform = ""));
    };
  });
</script>

<svelte:window bind:innerWidth />

<!-- Responsive masonry: 1 / 2 / 3 / 4 columns, cards read left-to-right in JSON order -->
<section class="projects-grid" class:measured bind:this={gridEl}>
  {#each columns as column, ci}
    <div class="grid-column" bind:this={colEls[ci]}>
      {#each column as project (project.slug)}
        <div class="card-wrap">
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
    /* Hidden until the column count is measured, so the 1-column fallback
       never flashes; revealed (with a soft fade) once we know the width. */
    opacity: 0;
  }

  .projects-grid.measured {
    opacity: 1;
    transition: opacity 0.3s ease;
  }

  .grid-column {
    flex: 1;
    min-width: 0; /* allow columns to shrink instead of overflowing */
    display: flex;
    flex-direction: column;
    gap: 40px;
    will-change: transform; /* parallax lag is applied via translate3d in JS */
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
