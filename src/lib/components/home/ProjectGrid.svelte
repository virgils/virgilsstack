<script lang="ts">
  import ProjectCard from "./ProjectCard.svelte";

  type Project = Record<string, any>;

  let { projects }: { projects: Project[] } = $props();

  // Track viewport width to pick the column count (matches breakpoints in app.css).
  let innerWidth = $state(0);
  let columnCount = $derived(
    innerWidth >= 1600 ? 4 : innerWidth >= 1024 ? 3 : innerWidth >= 560 ? 2 : 1,
  );

  // Distribute projects round-robin across columns so the cards read
  // left-to-right in projects.json order (col 0: 0,3,6… / col 1: 1,4,7… …)
  // while each column still stacks its cards tightly (masonry).
  let columns = $derived.by(() => {
    const cols: Project[][] = Array.from({ length: columnCount }, () => []);
    projects.forEach((project, i) => cols[i % columnCount].push(project));
    return cols;
  });
</script>

<svelte:window bind:innerWidth />

<!-- Responsive masonry: 1 / 2 / 3 / 4 columns, cards read left-to-right in JSON order -->
<section class="projects-grid">
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
