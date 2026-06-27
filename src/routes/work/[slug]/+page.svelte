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
    reveal,
  } from "$lib";

  let { data }: { data: PageData } = $props();
  let project = $derived(data.project);
</script>

<svelte:head>
  <title>{project.client} — {project.project}</title>
  <meta name="description" content={project.description} />
</svelte:head>

<article class="project-page" use:reveal>
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
</style>
