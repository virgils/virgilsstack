<script lang="ts">
  import { reveal } from "$lib/actions/reveal";

  interface Award {
    year?: string;
    title: string;
    category?: string;
  }

  interface Link {
    title: string;
    url: string;
  }

  let {
    client,
    project,
    description,
    awards = [],
    year,
    techStack,
    links = [],
  }: {
    client: string;
    project: string;
    description: string;
    awards?: Award[];
    year?: string;
    techStack?: string;
    links?: Link[];
  } = $props();
</script>

<section class="intro-section" use:reveal>
  <div class="intro-main">
    <div class="metadata">
      <span class="client reveal">{client}</span>
    </div>
    <h1 class="project-title">{project}</h1>
    <p class="description">{@html description}</p>
  </div>

  <div class="intro-sidebar">
    {#if year || techStack}
      <div class="sidebar-block">
        <h3 class="sidebar-heading">Details</h3>
        {#if year}
          <div class="list-item">
            <span class="list-label">Year</span>
            <span class="list-value">{year}</span>
          </div>
        {/if}
        {#if techStack}
          <div class="list-item">
            <span class="list-label">Tech</span>
            <span class="list-value">{techStack}</span>
          </div>
        {/if}
      </div>
    {/if}

    {#if awards && awards.length > 0}
      <div class="sidebar-block">
        <h3 class="sidebar-heading">Recognition</h3>
        <ul class="sidebar-list">
          {#each awards as award}
            <li class="list-item">
              {#if award.year}
                <span class="list-label">{award.year}</span>
              {/if}
              <div class="list-value">
                <span class="award-title">{award.title}</span>
                {#if award.category}
                  <span class="award-category">{award.category}</span>
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if links && links.length > 0}
      <div class="sidebar-block">
        <h3 class="sidebar-heading">Links</h3>
        <ul class="sidebar-list">
          {#each links as link}
            <li class="list-item link-item">
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.title} ↗
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</section>

<style>
  .intro-section {
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px;
    padding: 80px var(--page-padding-x) 48px;
    max-width: var(--content-max-width);
    margin: 0 auto;
    align-items: start;
  }

  @media (--bp-md) {
    .intro-section {
      grid-template-columns: 2fr 1fr;
      gap: 80px;
    }
  }

  .intro-main {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .metadata {
    display: flex;
    align-items: center;
  }

  .client {
    font-size: var(--fs-label);
    font-weight: var(--fw-medium);
    letter-spacing: var(--ls-label);
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .project-title {
    font-size: var(--fs-display);
    font-weight: var(--fw-light);
    line-height: var(--lh-display);
    letter-spacing: var(--ls-tight);
    color: var(--text-primary);
  }

  .description {
    font-size: var(--fs-body);
    line-height: var(--lh-body);
    font-weight: var(--fw-light);
    color: var(--text-secondary);
    max-width: 680px;
  }

  .intro-sidebar {
    display: flex;
    flex-direction: column;
    gap: 40px;
    align-self: start;
  }

  .sidebar-block {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sidebar-heading {
    font-size: var(--fs-label);
    font-weight: var(--fw-medium);
    letter-spacing: var(--ls-label);
    text-transform: uppercase;
    color: var(--text-tertiary);
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding-bottom: 8px;
  }

  .sidebar-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .list-item {
    display: flex;
    gap: 16px;
    font-size: var(--fs-meta);
    line-height: 1.4;
  }

  .list-label {
    font-weight: var(--fw-medium);
    color: var(--text-secondary);
    width: 40px;
    flex-shrink: 0;
  }

  .list-value {
    display: flex;
    flex-direction: column;
    color: var(--text-primary);
  }

  .award-title {
    font-weight: var(--fw-regular);
    color: var(--text-primary);
  }

  .award-category {
    color: var(--text-tertiary);
    font-size: var(--fs-meta);
  }

  .link-item a {
    color: var(--text-primary);
    text-decoration: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    padding-bottom: 2px;
    transition: opacity 0.2s ease;
  }

  .link-item a:hover {
    opacity: 0.6;
  }

  :global(.intro-section .description a) {
    text-decoration: underline;
  }
</style>
