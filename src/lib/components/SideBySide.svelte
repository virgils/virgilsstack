<script lang="ts">
  let {
    media,
    mediaType = "image",
    alt = "",
    text = "",
    direction = "left",
    caption = "",
    media2 = "",
    mediaType2 = "image",
    alt2 = "",
    caption2 = "",
  }: {
    media: string;
    mediaType?: "image" | "video";
    alt?: string;
    text?: string;
    direction?: "left" | "right";
    caption?: string;
    media2?: string;
    mediaType2?: "image" | "video";
    alt2?: string;
    caption2?: string;
  } = $props();
</script>

<section class="side-by-side {direction === 'right' ? 'rev' : ''}">
  <!-- Column A: Primary Media -->
  <div class="col-a media-container">
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
  </div>

  <!-- Column B: Secondary Media OR Text -->
  <div class="col-b {media2 ? 'media-container' : 'text-container'}">
    {#if media2}
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
    {:else if text}
      <p class="content-text">{text}</p>
    {/if}
  </div>
</section>

<style>
  .side-by-side {
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
    padding: 48px;
    max-width: 1200px;
    margin: 0 auto;
    align-items: center;
  }

  @media (min-width: 768px) {
    .side-by-side {
      grid-template-columns: 1fr 1fr;
      gap: 80px;
    }

    .side-by-side.rev .col-a {
      order: 2;
    }

    .side-by-side.rev .col-b {
      order: 1;
    }
  }

  .text-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .content-text {
    font-size: 18px;
    line-height: 1.6;
    font-weight: 300;
    color: var(--text-secondary);
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

  .caption {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }
</style>
