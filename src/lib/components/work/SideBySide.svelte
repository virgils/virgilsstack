<script lang="ts">
  import placeholders from "$lib/placeholders.json";
  import { lazyMedia } from "$lib/actions/lazyMedia";

  let {
    media = "",
    mediaType = "image",
    media2 = "",
    mediaType2 = "image",
    alt = "",
    alt2 = "",
    direction = "right", // "left" means text on left, "right" means text on right
    text = "",
    caption = "",
    caption2 = "",
    ratio = "50-50",
    mediaRatio = "4 / 3",
    mediaRatio2 = "4 / 3",
  } = $props();

  // Determine layouts based on the JSON configuration
  let textOnLeft = $derived(!!text && direction === "left");
  let textOnRight = $derived(!!text && direction !== "left");

  const lookup = placeholders as Record<string, string>;
  function frameStyle(src: string, aspect: string) {
    const ph = lookup[src];
    return (
      `aspect-ratio: ${aspect};` +
      (ph
        ? ` background-image: url('${ph}'); background-size: cover; background-position: top;`
        : "")
    );
  }
</script>

{#snippet mediaFrame(src, type, aspect, altText)}
  <div class="media-frame" style={frameStyle(src, aspect)}>
    {#if type === "video"}
      <video
        class="media-el"
        use:lazyMedia={src}
        autoplay
        loop
        muted
        playsinline
        aria-hidden="true"
      ></video>
    {:else}
      <img class="media-el" use:lazyMedia={src} alt={altText} />
    {/if}
  </div>
{/snippet}

<div class="side-by-side component layout-contained ratio-{ratio}">
  <!-- COLUMN A (LEFT) -->
  <div class="col-a {textOnLeft ? 'text-container' : 'media-container'}">
    {#if textOnLeft}
      <p class="content-text">{@html text}</p>
    {:else}
      {@render mediaFrame(media, mediaType, mediaRatio, alt)}
      {#if caption}
        <span class="caption">{@html caption}</span>
      {/if}
    {/if}
  </div>

  <!-- COLUMN B (RIGHT) -->
  <div class="col-b {textOnRight ? 'text-container' : 'media-container'}">
    {#if textOnRight}
      <p class="content-text">{@html text}</p>
    {:else if textOnLeft}
      <!-- text took the left column → primary media goes right -->
      {@render mediaFrame(media, mediaType, mediaRatio, alt)}
      {#if caption}
        <span class="caption">{@html caption}</span>
      {/if}
    {:else if media2}
      <!-- no text → secondary media -->
      {@render mediaFrame(media2, mediaType2, mediaRatio2, alt2)}
      {#if caption2}
        <span class="caption">{@html caption2}</span>
      {/if}
    {/if}
  </div>
</div>

<style>
  .side-by-side {
    display: grid;
    gap: 20px;
    /* mobile-first: single column by default */
    grid-template-columns: 1fr;
  }

  @media (--bp-md) {
    .ratio-50-50 {
      grid-template-columns: 1fr 1fr;
    }
    .ratio-66-33 {
      grid-template-columns: 2fr 1fr;
    }
    .ratio-33-66 {
      grid-template-columns: 1fr 2fr;
    }
  }

  .text-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  @media (--bp-sm) {
    .col-a.text-container .content-text {
      padding-right: 80px;
    }

    .col-b.text-container .content-text {
      padding-left: 80px;
    }
  }

  .media-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Frame holds the aspect-ratio + blurred placeholder; media fades in over it. */
  .media-frame {
    position: relative;
    width: 100%;
    display: block;
    overflow: hidden;
  }

  .media-el {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.6s ease;
  }

  /* :global on the runtime-added class so Svelte doesn't prune it as "unused" */
  .media-el:global(.is-loaded) {
    opacity: 1;
  }
</style>
