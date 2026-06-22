<script lang="ts">
  import { projects, Hero, ProjectGrid, Footer } from "$lib";
</script>

<svelte:head>
  <title>Virgil — Creative Direction & Design</title>
</svelte:head>

<Hero />
<ProjectGrid {projects} />
<Footer />
