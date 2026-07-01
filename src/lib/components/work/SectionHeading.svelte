<script lang="ts">
  import { reveal } from "$lib/actions/reveal";

  let {
    index = "",
    title = "",
    text = "",
  }: {
    index?: string;
    title?: string;
    text?: string;
  } = $props();
</script>

<section class="section-heading component layout-contained" use:reveal>
  <div class="heading-inner">
    {#if index}
      <span class="caption heading-index">{index}</span>
    {/if}
    {#if title}
      <h2 class="heading-title"><span class="reveal">{@html title}</span></h2>
    {/if}
    {#if text}
      <p class="content-text heading-text">{@html text}</p>
    {/if}
  </div>
</section>

<style>
  /* Full-viewport-width gray band behind the heading, so it reads as a page
     breaker. The text stays in its contained position — only the background
     bleeds out. `isolation` keeps the negative-z band behind just this section,
     and main's overflow:hidden absorbs the 100vw (no horizontal scroll). */
  .section-heading {
    position: relative;
    isolation: isolate;
    --band-pad: 28px; /* how far the band extends above/below the content */
    margin-top: 100px;
  }

  @media (--bp-sm) {
    .section-heading {
      --band-pad: 48px;
      margin-top: 200px;
    }
  }

  .section-heading::before {
    content: "";
    position: absolute;
    z-index: -1;
    top: calc(var(--band-pad) * -1);
    bottom: calc(var(--band-pad) * -1);
    left: 50%;
    width: 100vw;
    transform: translateX(-50%);
    background: linear-gradient(var(--bg-color-secondary), #fff);
    height: calc(100% + 15vw);
  }

  .heading-inner {
    padding-top: 24px;
  }

  .heading-index {
    display: block;
    margin-bottom: 16px;
  }

  .heading-title {
    font-size: var(--fs-h2);
    font-weight: var(--fw-light);
    line-height: var(--lh-heading);
    letter-spacing: var(--ls-tight);
    color: var(--text-primary);
    margin: 0;
    max-width: 16em;
  }

  .heading-text {
    margin-top: 24px;
    max-width: 38em;
  }

  :global(.section-heading .content-text a) {
    text-decoration: underline;
  }

  :global(.intro-section + .wide-media-section + .section-heading) {
    border: 2px solid green;
  }
</style>
