<script lang="ts">
  interface GalleryItem {
    media: string;
    mediaType?: "image" | "video";
    alt?: string;
    caption?: string;
  }

  let {
    items = [],
    columns = 3,
    caption = "",
  }: {
    items?: GalleryItem[];
    columns?: 2 | 3 | 4;
    caption?: string;
  } = $props();
</script>

<section class="gallery component layout-contained" style="--cols: {columns}">
  <div class="gallery-grid">
    {#each items as item}
      <figure class="gallery-item">
        {#if item.mediaType === "video"}
          <video
            src={item.media}
            autoplay
            loop
            muted
            playsinline
            preload="metadata"
            aria-hidden="true"
          ></video>
        {:else}
          <img src={item.media} alt={item.alt ?? ""} loading="lazy" />
        {/if}
        {#if item.caption}
          <figcaption class="caption">{item.caption}</figcaption>
        {/if}
      </figure>
    {/each}
  </div>

  {#if caption}
    <span class="caption gallery-caption">{caption}</span>
  {/if}
</section>

<style>
  .gallery-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  /* > 560px → two columns */
  @media (--bp-sm) {
    .gallery-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }

  /* > 768px → the requested column count (2 / 3 / 4) */
  @media (--bp-md) {
    .gallery-grid {
      grid-template-columns: repeat(var(--cols), 1fr);
      gap: 24px;
    }
  }

  .gallery-item {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  .gallery-item img,
  .gallery-item video {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }

  .gallery-caption {
    display: block;
    margin-top: 16px;
  }
</style>
