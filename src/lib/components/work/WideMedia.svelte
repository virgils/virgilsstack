<script lang="ts">
  import VideoPlayer from "svelte-video-player";
  import placeholders from "$lib/placeholders.json";
  import { lazyMedia } from "$lib/actions/lazyMedia";

  let {
    media,
    mediaType = "image",
    poster = "",
    alt = "",
    caption = "",
    text = "",
    contained = false,
    browser = false,
    mediaRatio = "16 / 9",
    playbackRate = 1,
    collapsed = false, // NEW: Accepts the collapsed state from projects.json
  }: {
    media: string;
    mediaType?: "image" | "video" | "videoplayer";
    poster?: string;
    alt?: string;
    caption?: string;
    text?: string;
    contained?: boolean;
    browser?: boolean;
    mediaRatio?: string;
    playbackRate?: number;
    collapsed?: boolean; // NEW
  } = $props();

  // NEW: State and dynamic aspect ratio
  let isExpanded = $state(false);
  let currentRatio = $derived(collapsed && !isExpanded ? "4 / 3" : mediaRatio);

  // Blurred LQIP placeholder shown behind the media until it lazy-loads.
  const lookup = placeholders as Record<string, string>;
  let placeholder = $derived(lookup[poster] ?? lookup[media] ?? "");
  let frameStyle = $derived(
    `aspect-ratio: ${currentRatio};` +
      (placeholder ? ` --ph: url('${placeholder}');` : ""),
  );

  function rate(node: HTMLVideoElement, speed: number) {
    node.defaultPlaybackRate = speed;
    node.playbackRate = speed;
    return {
      update(newSpeed: number) {
        speed = newSpeed;
        node.defaultPlaybackRate = speed;
        node.playbackRate = speed;
      },
    };
  }
</script>

<section
  class="wide-media-section component {contained
    ? 'layout-contained'
    : 'full-width'}"
>
  <div class="media-wrapper custom-player-theme" class:browser class:contained>
    {#if mediaType === "videoplayer"}
      <div class="collapsible-media" style={frameStyle}>
        <VideoPlayer source={media} {poster} color="#000000" />
      </div>
    {:else if mediaType === "video"}
      <div class="collapsible-media" style={frameStyle}>
        <video
          class="media-el"
          use:rate={playbackRate}
          use:lazyMedia={media}
          autoplay
          loop
          muted
          playsinline
          aria-hidden="true"
        ></video>
      </div>
    {:else}
      <div class="collapsible-media" style={frameStyle}>
        <img class="media-el" use:lazyMedia={media} {alt} />
      </div>
    {/if}
  </div>

  {#if caption || text}
    <div class="details-container">
      {#if caption}
        <span class="caption">{@html caption}</span>
      {/if}
      {#if text}
        <p class="content-text">{@html text}</p>
      {/if}
    </div>
  {/if}

  <!-- NEW: Reveal Gradient Overlay and Button -->
  {#if collapsed && !isExpanded}
    <div class="reveal-overlay">
      <button class="reveal-btn" onclick={() => (isExpanded = true)}>
        Expand
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
  {/if}
</section>

<style>
  .wide-media-section {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
  }

  /* Full width only gets margin, no padding/max-width */
  .wide-media-section.full-width {
    margin: 48px 0;
  }

  .media-wrapper {
    width: 100%;
    overflow: hidden;
    position: relative; /* NEW: Required for absolute overlay */
  }

  .media-wrapper.contained {
    padding: 20px 30px;
    background-color: var(--bg-color-secondary);
  }

  @media (--bp-sm) {
    .media-wrapper.contained {
      padding: 50px 60px;
    }
  }

  /* Frame: holds the aspect-ratio + the blurred placeholder backdrop. */
  .collapsible-media {
    position: relative;
    width: 100%;
    display: block;
    overflow: hidden;
    transition: aspect-ratio 0.8s cubic-bezier(0.25, 1, 0.5, 1); /* Smooth expansion */
  }

  /* Blurred placeholder backdrop — fades out once the media loads so it never
     shows through transparent (PNG) media. */
  .collapsible-media::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--ph);
    background-size: cover;
    background-position: top;
    transition: opacity 0.6s ease;
  }

  /* The real media fills the frame and fades in once loaded. */
  .media-el {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: top;
    opacity: 0;
    transition: opacity 0.6s ease;
  }

  /* :global on the runtime-added class so Svelte doesn't prune these as "unused" */
  .collapsible-media:global(.is-loaded) .media-el {
    opacity: 1;
  }

  .collapsible-media:global(.is-loaded)::before {
    opacity: 0;
  }

  /* svelte-video-player fills the frame */
  .collapsible-media :global(.video-player),
  .collapsible-media :global(video) {
    width: 100%;
  }

  /* On mobile, full-width media uses a 5/3 crop regardless of its native ratio.
     !important is required to override the inline aspect-ratio on .collapsible-media. */
  @media (max-width: 767px) {
    .full-width .collapsible-media {
      aspect-ratio: 5 / 3 !important;
    }
  }

  /* --- NEW: Overlay Styles --- */
  .reveal-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 300px;
    background: linear-gradient(to bottom, transparent, #ffffff 60%);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 30px;
    z-index: 10;
    pointer-events: none; /* Let clicks pass through the gradient */
  }

  /* Adapt gradient color when inside a contained layout block */
  :global(.layout-contained) .reveal-overlay {
    background: linear-gradient(
      to bottom,
      transparent,
      var(--bg-color-secondary, #f5f5f5) 80%
    );
  }

  .reveal-btn {
    pointer-events: auto; /* Reactivate clicks on button */
    background: #000;
    color: #fff;
    border: none;
    padding: 12px 28px;
    border-radius: 30px;
    font-size: var(--fs-meta);
    font-weight: var(--fw-medium);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease;
    bottom: -50px;
    position: relative;

    /* Center text and caret */
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .reveal-btn:hover {
    transform: scale(1.05);
  }

  .details-container {
    padding: 12px var(--page-padding-x) 0;
    max-width: var(--content-max-width);
    margin: 10px auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  @media (--bp-sm) {
    .details-container {
      width: 40%;
      margin: 10px 20px;
    }
  }

  :global(.layout-contained) .details-container {
    padding: 12px 0 0;
  }

  :global(.layout-contained) .collapsible-media {
    border-radius: 8px;
  }
</style>
