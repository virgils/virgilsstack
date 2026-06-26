<script lang="ts">
  import { projects, categories, Hero, ProjectGrid, Footer } from "$lib";
  import { page } from "$app/state";

  // Active category from the ?category= query (set by the nav links).
  let activeCategory = $derived(page.url.searchParams.get("category"));
  let activeLabel = $derived(
    categories.find((c) => c.tag === activeCategory)?.label,
  );

  // Filter the grid to projects tagged with the active category (all if none).
  let visibleProjects = $derived(
    activeCategory
      ? projects.filter((p) => ((p as any).tags ?? []).includes(activeCategory))
      : projects,
  );
</script>

<svelte:head>
  <title>Virgil — Creative Development</title>
</svelte:head>

<Hero />

{#if activeCategory && visibleProjects.length === 0}
  <p class="no-results">No projects tagged “{activeLabel ?? activeCategory}”.</p>
{:else}
  <ProjectGrid projects={visibleProjects} />
{/if}

<Footer />

<style>
  .no-results {
    max-width: var(--content-max-width);
    margin: 0 auto;
    padding: 48px var(--page-padding-x) 120px;
    color: var(--text-secondary);
  }
</style>
