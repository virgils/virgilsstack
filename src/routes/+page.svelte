<script lang="ts">
  import { projects, Hero, ProjectGrid, Footer } from "$lib";
</script>

<svelte:head>
  <title>Virgil — Creative Development</title>
</svelte:head>

<Hero />
<ProjectGrid {projects} />
<Footer />
