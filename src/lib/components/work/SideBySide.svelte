<script lang="ts">
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
  } = $props();

  // Determine layouts based on the JSON configuration
  let textOnLeft = $derived(!!text && direction === "left");
  let textOnRight = $derived(!!text && direction !== "left");
</script>

<div class="side-by-side component layout-contained ratio-{ratio}">
  <!-- COLUMN A (LEFT) -->
  <div class="col-a {textOnLeft ? 'text-container' : 'media-container'}">
    {#if textOnLeft}
      <p class="content-text">{text}</p>
    {:else}
      <!-- Render primary media here if text is on the right OR if it's a media/media2 split -->
      {#if mediaType === "video"}
        <video
          src={media}
          autoplay
          loop
          muted
          playsinline
          preload="metadata"
          aria-hidden="true"
        ></video>
      {:else}
        <img src={media} {alt} loading="lazy" />
      {/if}
      {#if caption}
        <span class="caption">{caption}</span>
      {/if}
    {/if}
  </div>

  <!-- COLUMN B (RIGHT) -->
  <!-- Assign text-container class if we render text, otherwise media-container -->
  <div class="col-b {textOnRight ? 'text-container' : 'media-container'}">
    {#if textOnRight}
      <p class="content-text">{text}</p>
    {:else if textOnLeft}
      <!-- If text took the left column, primary media is pushed to the right column -->
      {#if mediaType === "video"}
        <video
          src={media}
          autoplay
          loop
          muted
          playsinline
          preload="metadata"
          aria-hidden="true"
        ></video>
      {:else}
        <img src={media} {alt} loading="lazy" />
      {/if}
      {#if caption}
        <span class="caption">{caption}</span>
      {/if}
    {:else if media2}
      <!-- If there is no text, render the secondary media here -->
      {#if mediaType2 === "video"}
        <video
          src={media2}
          autoplay
          loop
          muted
          playsinline
          preload="metadata"
          aria-hidden="true"
        ></video>
      {:else}
        <img src={media2} alt={alt2} loading="lazy" />
      {/if}
      {#if caption2}
        <span class="caption">{caption2}</span>
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

  .media-container video,
  .media-container img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }
</style>
