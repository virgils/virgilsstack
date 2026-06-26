<script>
  let { project } = $props();

  // When a project has an externalUrl, the card links out instead of to /work
  let isExternal = $derived(!!project.externalUrl);
  // A `blocked` project is never clickable; otherwise it links if it has a slug/externalUrl
  let isLink = $derived(!project.blocked && (isExternal || !!project.slug));
  let href = $derived(
    isLink ? (project.externalUrl ?? `/work/${project.slug}`) : undefined,
  );

  let isLoaded = $state(false);

  function handleLoad() {
    // Generate a random delay between 50ms and 600ms
    const randomDelay = Math.floor(Math.random() * (600 - 50 + 1)) + 50;

    setTimeout(() => {
      isLoaded = true;
    }, randomDelay);
  }

  // RENAMED AND UPDATED for both Video and Image
  function lazyLoadMedia(node, src) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          node.src = src;
          observer.unobserve(node);
        }
      },
      // CHANGED: 0px means it triggers exactly when entering the viewport
      { rootMargin: "0px" },
    );

    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }
</script>

<svelte:element
  this={isLink ? "a" : "div"}
  {href}
  class="card"
  class:external={isExternal}
  class:static={!isLink}
  aria-label="{project.client} — {project.project}{isExternal
    ? ' (opens in a new tab)'
    : ''}"
  target={isExternal ? "_blank" : undefined}
  rel={isExternal ? "noopener noreferrer" : undefined}
>
  <div class="card-media">
    {#if project.blocked}
      <span class="nda-label">{project.blocked}</span>
    {/if}
    <!-- ADDED: Inline style for aspect-ratio with a fallback -->
    <div
      class="media-wrapper"
      class:show={isLoaded}
      style="aspect-ratio: {project.mediaRatio || '16 / 9'};"
    >
      {#if project.mediaType === "video"}
        <video
          use:lazyLoadMedia={project.media}
          autoplay
          loop
          muted
          playsinline
          onloadeddata={handleLoad}
        ></video>
      {:else}
        <img
          use:lazyLoadMedia={project.media}
          alt="{project.client} — {project.project}"
          onload={handleLoad}
        />
      {/if}

      {#if isExternal}
        <div class="external-overlay" aria-hidden="true">
          <svg
            class="external-icon"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </div>
      {/if}
    </div>
  </div>

  <div class="card-info">
    <div class="card-titles">
      <!-- Add class:show to spans -->
      <span class="card-client" class:show={isLoaded}>{project.client}</span>
      <span class="card-project" class:show={isLoaded}>{project.project}</span>
    </div>
    {#if project.year}
      <span class="card-year" class:show={isLoaded}>{project.year}</span>
    {/if}
  </div>
</svelte:element>

<style>
  .card {
    display: block;
    cursor: pointer;
    text-decoration: none;
  }

  .card.static {
    cursor: default;
  }

  .card-media {
    position: relative;
    width: 100%;
    margin: 0 auto;
    overflow: hidden;
    padding: 20px;
    background-color: var(--bg-color-secondary);
  }

  .nda-label {
    position: absolute;
    top: 30px;
    right: 30px;
    z-index: 4;
    padding: 4px 8px;
    font-size: var(--fs-label);
    font-weight: var(--fw-medium);
    letter-spacing: var(--ls-label);
    text-transform: uppercase;
    color: #fff;
    background: rgba(0, 0, 0, 0.55);
    border-radius: 3px;
  }

  /* Separate @supports blocks so the CSS minifier can't collapse the
     prefixed + standard pair down to only -webkit- (which breaks Firefox). */
  @supports (backdrop-filter: blur(1px)) {
    .nda-label {
      backdrop-filter: blur(4px);
    }
  }

  @supports (-webkit-backdrop-filter: blur(1px)) {
    .nda-label {
      -webkit-backdrop-filter: blur(4px);
    }
  }

  @media (--bp-sm) {
    .nda-label {
      top: 40px;
      right: 40px;
    }
  }

  @media (--bp-sm) {
    .card-media {
      padding: 30px;
    }
  }

  .media-wrapper {
    width: 100%;
    /* REMOVED: height: auto; and min-height: 300px; - Aspect ratio handles this perfectly now! */
    display: block;
    overflow: hidden;
    position: relative;
    box-shadow: 0 0 21px 0px rgba(0, 0, 0, 0.25);

    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    /* `transform` is left free for the scroll-speed tilt (driven in
       ProjectGrid). Only box-shadow transitions here so the tilt tracks
       instantly; the hover-zoom now lives on the inner media below. */
    will-change: transform;
    transition: box-shadow 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .card:hover .media-wrapper {
    box-shadow: 0 0 11px 0px rgba(0, 0, 0, 0.1);
  }

  .media-wrapper video,
  .media-wrapper img {
    width: 100%;
    height: auto;
    display: block;
    transform: translateZ(0) scale(1.008);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    opacity: 0;
    transition:
      opacity 0.6s ease-in-out,
      transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  /* Hover-zoom: pull the media in slightly (moved off .media-wrapper so its
     transform stays available for the tilt). */
  .card:hover .media-wrapper video,
  .card:hover .media-wrapper img {
    transform: translateZ(0) scale(0.988);
  }

  /* Fade in media when loaded */
  .media-wrapper.show video,
  .media-wrapper.show img {
    opacity: 1;
  }

  /* Black cover overlay */
  .media-wrapper:before {
    content: "";
    position: absolute;
    z-index: 1;
    background: #000;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    transition: width 0.4s ease-out;
  }

  .media-wrapper.show:before {
    width: 0%;
  }

  /* External-link hover state: dim the media and reveal the icon */
  .external-overlay {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
  }

  .card.external:hover .external-overlay {
    opacity: 1;
  }

  .external-icon {
    transform: scale(0.85);
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .card.external:hover .external-icon {
    transform: scale(1);
  }

  .card-info {
    width: 90%;
    margin: 16px auto 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .card-titles {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .card-info span {
    position: relative;
    display: inline-block;
  }

  /* Slide-off cover for text */
  .card-info span:before {
    content: "";
    position: absolute;
    z-index: 1;
    background: #000;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    /* Removed global transition, applying specifically to each below */
  }

  /* Reveal text by shrinking cover */
  .card-info span.show:before {
    width: 0%;
  }

  /* Staggered Transitions written in full shorthand: property duration easing delay */
  .card-client:before {
    transition: width 0.4s ease-out 0.1s;
  }

  .card-project:before {
    transition: width 0.4s ease-out 0.25s;
  }

  .card-year:before {
    transition: width 0.4s ease-out 0.4s;
  }

  .card-client {
    font-size: var(--fs-label);
    font-weight: var(--fw-medium);
    letter-spacing: var(--ls-label);
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .card-project {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-regular);
    letter-spacing: var(--ls-snug);
    color: var(--text-primary);
    line-height: var(--lh-snug);
  }

  .card-year {
    font-size: var(--fs-label);
    font-weight: var(--fw-medium);
    letter-spacing: var(--ls-label);
    color: var(--text-tertiary);
  }
</style>
