<script lang="ts">
  import type { PageData } from "./$types";
  import { Intro, SideBySide, WideMedia, Footer } from "$lib";

  let { data }: { data: PageData } = $props();
  let project = $derived(data.project);
</script>

<svelte:head>
  <title>{project.client} — {project.project}</title>
  <meta name="description" content={project.description} />
</svelte:head>

<article class="project-page">
  {#if project.sections && project.sections.length > 0}
    {#each project.sections as section}
      {#if section.type === "intro"}
        <Intro
          client={section.client}
          project={section.project}
          description={section.description}
          awards={section.awards}
          year={section.year}
          techStack={section.techStack}
          links={section.links}
        />
      {:else if section.type === "side-by-side"}
        <SideBySide {...section} />
      {:else if section.type === "wide-media"}
        <WideMedia
          media={section.media}
          mediaType={section.mediaType}
          alt={section.alt || ""}
          caption={section.caption}
          contained={section.contained}
        />
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
          <p class="project-label">{project.client}</p>
          <h1 class="project-title">{project.project}</h1>
        </div>
      </div>
    </header>

    <section class="project-body">
      <div class="project-content">
        <p class="project-description">{project.description}</p>
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
    nextProjectName={data.nextProject.name}
    nextProjectClient={data.nextProject.client}
    nextProjectSlug={data.nextProject.slug}
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
    bottom: 48px;
    left: 48px;
    right: 48px;
  }

  .project-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 10px;
  }

  .project-title {
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 300;
    letter-spacing: -0.02em;
    line-height: 1.05;
    color: var(--text-primary);
  }

  .project-body {
    padding: 72px 48px;
    max-width: 720px;
  }

  .project-description {
    font-size: 17px;
    font-weight: 300;
    line-height: 1.75;
    color: var(--text-primary);
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 48px 72px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
    transition: color 0.2s ease;
  }

  .back-link:hover {
    color: var(--text-primary);
  }

  @media (max-width: 600px) {
    .project-hero-titles {
      left: 24px;
      right: 24px;
      bottom: 32px;
    }

    .project-body {
      padding: 48px 24px;
    }

    .back-link {
      margin: 0 24px 48px;
    }
  }
</style>
