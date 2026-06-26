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
    const [w, h] = String(raw).split("/").map((n) => parseFloat(n.trim()));
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
</script>

<svelte:window bind:innerWidth />

<!-- Responsive masonry: 1 / 2 / 3 / 4 columns, cards read left-to-right in JSON order -->
<section class="projects-grid" class:visible>
  {#each columns as column}
    <div class="grid-column">
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
