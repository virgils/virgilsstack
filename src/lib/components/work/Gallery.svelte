<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import placeholders from "$lib/placeholders.json";
  import { lazyMedia } from "$lib/actions/lazyMedia";

  interface GalleryItem {
    media: string;
    mediaType?: "image" | "video";
    alt?: string;
    caption?: string;
    mediaRatio?: string;
  }

  const lookup = placeholders as Record<string, string>;
  function frameStyle(src: string, aspect = "4 / 3") {
    const ph = lookup[src];
    return `aspect-ratio: ${aspect};` + (ph ? ` --ph: url('${ph}');` : "");
  }

  let {
    items = [],
    columns = 3,
    caption = "",
    modalBackground = "rgba(0, 0, 0, 0.88)",
  }: {
    items?: GalleryItem[];
    columns?: 2 | 3 | 4;
    caption?: string;
    /** Backdrop color of this gallery's lightbox (any CSS color). */
    modalBackground?: string;
  } = $props();

  // Lightbox: only images open in the modal (videos play inline).
  let images = $derived(items.filter((i) => i.mediaType !== "video"));
  let activeIndex = $state<number | null>(null);
  let activeItem = $derived(
    activeIndex !== null ? images[activeIndex] : null,
  );

  function open(item: GalleryItem) {
    const idx = images.indexOf(item);
    if (idx !== -1) activeIndex = idx;
  }
  const close = () => (activeIndex = null);
  const next = () => {
    if (activeIndex !== null)
      activeIndex = (activeIndex + 1) % images.length;
  };
  const prev = () => {
    if (activeIndex !== null)
      activeIndex = (activeIndex - 1 + images.length) % images.length;
  };

  function onKeydown(e: KeyboardEvent) {
    if (activeIndex === null) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  }

  // Lock background scroll while the lightbox is open.
  $effect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = activeItem ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  });
</script>

<svelte:window onkeydown={onKeydown} />

<section class="gallery component layout-contained" style="--cols: {columns}">
  <div class="gallery-grid">
    {#each items as item}
      <figure class="gallery-item">
        {#if item.mediaType === "video"}
          <div class="media-frame" style={frameStyle(item.media, item.mediaRatio)}>
            <video
              class="media-el"
              use:lazyMedia={item.media}
              autoplay
              loop
              muted
              playsinline
              aria-hidden="true"
            ></video>
          </div>
        {:else}
          <button
            type="button"
            class="gallery-trigger"
            onclick={() => open(item)}
            aria-label={item.alt
              ? `View larger: ${item.alt}`
              : "View larger image"}
          >
            <div class="media-frame" style={frameStyle(item.media, item.mediaRatio)}>
              <img class="media-el" use:lazyMedia={item.media} alt={item.alt ?? ""} />
            </div>
          </button>
        {/if}
        {#if item.caption}
          <figcaption class="caption">{@html item.caption}</figcaption>
        {/if}
      </figure>
    {/each}
  </div>

  {#if caption}
    <span class="caption gallery-caption">{@html caption}</span>
  {/if}
</section>

{#if activeItem}
  <div
    class="lightbox"
    role="dialog"
    aria-modal="true"
    aria-label="Image viewer"
    style="--lb-bg: {modalBackground};"
    transition:fade={{ duration: 200 }}
  >
    <!-- Full-screen backdrop doubles as the close target -->
    <button class="lb-backdrop" aria-label="Close" onclick={close}></button>

    <button class="lb-close" aria-label="Close" onclick={close}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      >
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    </button>

    {#if images.length > 1}
      <button class="lb-nav prev" aria-label="Previous image" onclick={prev}>
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button class="lb-nav next" aria-label="Next image" onclick={next}>
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    {/if}

    <figure class="lb-content" transition:scale={{ duration: 200, start: 0.96 }}>
      <img src={activeItem.media} alt={activeItem.alt ?? ""} />
      {#if activeItem.caption}
        <figcaption>{@html activeItem.caption}</figcaption>
      {/if}
    </figure>
  </div>
{/if}

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

  /* Frame holds the aspect-ratio + blurred placeholder; media fades in over it. */
  .media-frame {
    position: relative;
    width: 100%;
    display: block;
    overflow: hidden;
  }

  /* Blurred placeholder backdrop — fades out once the media loads. */
  .media-frame::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--ph);
    background-size: cover;
    background-position: top;
    transition: opacity 0.6s ease;
  }

  .media-el {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    opacity: 0;
    transition:
      opacity 0.6s ease,
      transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  /* :global on the runtime-added class so Svelte doesn't prune these as "unused" */
  .media-frame:global(.is-loaded) .media-el {
    opacity: 1;
  }

  .media-frame:global(.is-loaded)::before {
    opacity: 0;
  }

  /* Clickable image wrapper — reset native button styling */
  .gallery-trigger {
    display: block;
    width: 100%;
    padding: 0;
    margin: 0;
    border: none;
    background: none;
    cursor: zoom-in;
    overflow: hidden;
  }

  .gallery-trigger:hover .media-el {
    transform: scale(1.03);
  }

  .gallery-caption {
    display: block;
    margin-top: 16px;
  }

  /* --- Lightbox / modal --- */
  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5vmin;
  }

  .lb-backdrop {
    position: absolute;
    inset: 0;
    border: none;
    padding: 0;
    margin: 0;
    background: rgba(0, 0, 0, 0.88);
    cursor: zoom-out;
  }

  /* Separate @supports blocks so the CSS minifier can't collapse the
     prefixed + standard pair down to only -webkit- (which breaks Firefox). */
  @supports (backdrop-filter: blur(1px)) {
    .lb-backdrop {
      backdrop-filter: blur(4px);
    }
  }

  @supports (-webkit-backdrop-filter: blur(1px)) {
    .lb-backdrop {
      -webkit-backdrop-filter: blur(4px);
    }
  }

  .lb-content {
    position: relative;
    z-index: 1;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    max-width: 100%;
    pointer-events: none; /* clicks fall through to the backdrop (close) */
  }

  .lb-content img {
    display: block;
    max-width: 90vw;
    max-height: 82vh;
    width: auto;
    height: auto;
    object-fit: contain;
    background: var(--lb-bg, transparent);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .lb-content figcaption {
    color: rgba(255, 255, 255, 0.7);
    font-size: var(--fs-meta);
    text-align: center;
    max-width: 70ch;
  }

  /* Controls */
  .lb-close,
  .lb-nav {
    position: absolute;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
    cursor: pointer;
    border-radius: 50%;
    transition:
      background 0.2s ease,
      transform 0.2s ease;
  }

  .lb-close:hover,
  .lb-nav:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .lb-close {
    top: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
  }

  .lb-nav {
    top: 50%;
    transform: translateY(-50%);
    width: 52px;
    height: 52px;
  }

  .lb-nav:hover {
    transform: translateY(-50%) scale(1.08);
  }

  .lb-nav.prev {
    left: 20px;
  }

  .lb-nav.next {
    right: 20px;
  }

  @media (--bp-sm) {
    .lb-close {
      top: 32px;
      right: 32px;
    }
    .lb-nav.prev {
      left: 32px;
    }
    .lb-nav.next {
      right: 32px;
    }
  }
</style>
