<script>
  let { project } = $props();

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

<a
  href="/work/{project.slug}"
  class="card"
  aria-label="{project.client} — {project.project}"
>
  <div class="card-media">
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
</a>

<style>
  .card {
    display: block;
    cursor: pointer;
    text-decoration: none;
  }

  .card-media {
    width: 100%;
    margin: 0 auto;
    overflow: hidden;
    padding: 20px;
    background-color: var(--bg-color-secondary);
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

    transform: translateZ(0) scale(1.008) rotate(0.001deg);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;

    transition:
      transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94),
      box-shadow 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .card:hover .media-wrapper {
    transform: translateZ(0) scale(0.988) rotate(0.001deg);
    box-shadow: 0 0 11px 0px rgba(0, 0, 0, 0.1);
  }

  .media-wrapper video,
  .media-wrapper img {
    width: 100%;
    height: auto;
    display: block;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    opacity: 0;
    transition: opacity 0.6s ease-in-out;
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

  .card-year {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    color: var(--text-tertiary);
  }
</style>
