<script lang="ts">
  import type { PageData } from "./$types";
  import {
    Intro,
    SideBySide,
    WideMedia,
    Footer,
    Text,
    Gallery,
    SectionHeading,
    PullQuote,
    revealWipes,
  } from "$lib";

  let { data }: { data: PageData } = $props();
  let project = $derived(data.project);
</script>

<svelte:head>
  <title>{project.client} — {project.project}</title>
  <meta name="description" content={project.description} />
</svelte:head>

<article class="project-page" use:revealWipes>
  {#if project.sections && project.sections.length > 0}
    {#each project.sections as section}
      {#if section.type === "intro"}
        <Intro
          client={project.client}
          project={project.project}
          description={project.description}
          year={project.year}
          awards={section.awards}
          techStack={section.techStack}
          links={section.links}
        />
      {:else if section.type === "text"}
        <Text {...section} />
      {:else if section.type === "side-by-side"}
        <SideBySide {...section} />
      {:else if section.type === "wide-media"}
        <WideMedia
          media={section.media}
          mediaRatio={section.mediaRatio}
          mediaType={section.mediaType}
          poster={section.poster}
          alt={section.alt || ""}
          caption={section.caption || ""}
          text={section.text || ""}
          contained={section.contained}
          browser={section.browser}
          playbackRate={section.playbackRate || 1}
          collapsed={section.collapsed || false}
        />
      {:else if (section as any).type === "gallery"}
        <Gallery {...(section as any)} />
      {:else if (section as any).type === "heading"}
        <SectionHeading {...(section as any)} />
      {:else if (section as any).type === "quote"}
        <PullQuote {...(section as any)} />
      {/if}
    {/each}
  {:else}
    <header class="project-header">
      <div class="project-hero">
        {#if project.heroMediaType === "video"}
          <video
            src={project.heroMedia}
            autoplay
            loop
            muted
            playsinline
            preload="metadata"
            class="project-media"
            aria-hidden="true"
          ></video>
        {:else}
          <img
            src={project.heroMedia}
            alt="{project.client} — {project.project}"
            class="project-media"
          />
        {/if}
        <div class="project-hero-overlay"></div>
        <div class="project-hero-titles">
          <p class="project-label">
            {project.client}
            {#if project.year}
              <span class="project-year-label"> — {project.year}</span>
            {/if}
          </p>
          <h1 class="project-title">{project.project}</h1>
        </div>
      </div>
    </header>

    <section class="project-body">
      <div class="project-content">
        <p class="project-description">{@html project.description}</p>
      </div>
    </section>

    <a href="/" class="back-link" aria-label="Back to all projects">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 3L5 8L10 13"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      All Projects
    </a>
  {/if}

  <Footer
    nextProjectName={data.nextProject?.name}
    nextProjectClient={data.nextProject?.client}
    nextProjectSlug={data.nextProject?.slug}
  />
</article>

<style>
  .project-page {
    min-height: 100vh;
  }

  .project-hero {
    position: relative;
    height: 70vh;
    min-height: 480px;
    overflow: hidden;
  }

  .project-media {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .project-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 30%,
      var(--bg-color) 100%
    );
  }

  .project-hero-titles {
    position: absolute;
    bottom: 32px;
    left: var(--page-padding-x);
    right: var(--page-padding-x);
  }

  .project-label {
    font-size: var(--fs-label);
    font-weight: var(--fw-medium);
    letter-spacing: var(--ls-label);
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 10px;
  }

  .project-title {
    font-size: var(--fs-h1);
    font-weight: var(--fw-light);
    letter-spacing: var(--ls-tight);
    line-height: var(--lh-display);
    color: var(--text-primary);
  }

  .project-body {
    padding: 48px var(--page-padding-x);
    max-width: 720px;
  }

  .project-description {
    font-size: var(--fs-body);
    font-weight: var(--fw-light);
    line-height: var(--lh-relaxed);
    color: var(--text-primary);
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 var(--page-padding-x) 48px;
    font-size: var(--fs-meta);
    font-weight: var(--fw-medium);
    letter-spacing: var(--ls-label);
    text-transform: uppercase;
    color: var(--text-secondary);
    transition: color 0.2s ease;
  }

  .back-link:hover {
    color: var(--text-primary);
  }

  @media (--bp-sm) {
    .project-hero-titles {
      bottom: 48px;
      left: var(--page-padding-x);
      right: var(--page-padding-x);
    }

    .project-body {
      padding: 72px var(--page-padding-x);
    }

    .back-link {
      margin: 0 var(--page-padding-x) 72px;
    }
  }
</style>
