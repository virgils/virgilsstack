<script lang="ts">
  import { Footer, ParticleMap } from "$lib";
</script>

<svelte:head>
  <title>Particles — Virgil</title>
  <meta name="description" content="Interactive particle map exploration." />
</svelte:head>

<section class="particles-container">
  <ParticleMap />
</section>

<Footer />

<style>
  .particles-container {
    min-height: calc(100vh - 72px);
    padding: 48px 24px;
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (--bp-sm) {
    .particles-container {
      padding: 72px 48px;
    }
  }
</style>
