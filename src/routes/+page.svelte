<script lang="ts">
  import projects from "$lib/projects.json";
  import { Footer } from "$lib";

  // Distribute projects into columns for desktop (left-to-right order)
  let col1 = projects.filter((_, i) => i % 3 === 0);
  let col2 = projects.filter((_, i) => i % 3 === 1);
  let col3 = projects.filter((_, i) => i % 3 === 2);
</script>

<svelte:head>
  <title>Virgil — Creative Direction & Design</title>
  <meta
    name="description"
    content="Portfolio of creative direction, brand, and design work."
  />
</svelte:head>

<!-- Mobile Layout: 1 column sequentially -->
<section class="mobile-layout">
  {#each projects as project}
    {@render card(project)}
  {/each}
</section>

<!-- Desktop Layout: 3 columns stacking vertically -->
<section class="desktop-layout">
  <div class="col">
    {#each col1 as project}
      {@render card(project)}
    {/each}
  </div>
  <div class="col">
    {#each col2 as project}
      {@render card(project)}
    {/each}
  </div>
  <div class="col">
    {#each col3 as project}
      {@render card(project)}
    {/each}
  </div>
</section>

<Footer />

{#snippet card(project)}
  <a
    href="/work/{project.slug}"
    class="card"
    aria-label="{project.client} — {project.project}"
  >
    <div class="card-media">
      <div class="media-wrapper">
        {#if project.mediaType === "video"}
          <video
            src={project.media}
            autoplay
            loop
            muted
            playsinline
            preload="metadata"
            aria-hidden="true"
          ></video>
        {:else}
          <img
            src={project.media}
            alt="{project.client} — {project.project}"
            loading="lazy"
          />
        {/if}
      </div>
    </div>
    <div class="card-info">
      <span class="card-client">{project.client}</span>
      <span class="card-project">{project.project}</span>
    </div>
  </a>
{/snippet}

<style>
  .mobile-layout {
    display: flex;
    flex-direction: column;
    gap: 40px;
    padding: 32px 20px 64px;
  }

  .desktop-layout {
    display: none;
  }

  @media (min-width: 560px) {
    .mobile-layout {
      display: none;
    }

    .desktop-layout {
      display: flex;
      gap: 32px;
      padding: 48px 32px 96px;
      align-items: start;
    }

    .col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 48px;
    }
  }

  .card {
    display: block;
    cursor: pointer;
  }

  .card-media {
    width: 100%;
    margin: 0 auto;
    overflow: hidden;
    padding: 20px;
    background-color: var(--bg-color-secondary);
  }

  @media (min-width: 560px) {
    .card-media {
      padding: 30px;
    }
  }

  .media-wrapper {
    width: 100%;
    height: auto;
    display: block;
    overflow: hidden;
    box-shadow: 0 0 21px 0px rgba(0, 0, 0, 0.25);

    /* Hardware acceleration on the wrapper to keep scaling stable */
    transform: translateZ(0) scale(1.008) rotate(0.001deg);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;

    transition:
      transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
      box-shadow 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .card:hover .media-wrapper {
    /* Scale down subtly on hover */
    transform: translateZ(0) scale(0.988) rotate(0.001deg);
    box-shadow: 0 0 11px 0px rgba(0, 0, 0, 0.1);
  }

  .media-wrapper video,
  .media-wrapper img {
    width: 100%;
    height: auto;
    display: block;
    /* Static render plane to eliminate subpixel layout shifts */
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .card-info {
    width: 90%;
    margin: 16px auto 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .card-client {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .card-project {
    font-size: 15px;
    font-weight: 400;
    letter-spacing: -0.01em;
    color: var(--text-primary);
    line-height: 1.2;
  }
</style>
