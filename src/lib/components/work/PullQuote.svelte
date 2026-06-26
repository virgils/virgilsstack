<script lang="ts">
  let {
    quote = "",
    author = "",
    role = "",
  }: {
    quote?: string;
    author?: string;
    role?: string;
  } = $props();
</script>

<section class="pull-quote component layout-contained">
  <figure class="quote-inner">
    <blockquote class="quote-text">{@html quote}</blockquote>
    {#if author}
      <figcaption class="quote-attribution">
        <span class="quote-author">{author}</span>
        {#if role}
          <span class="quote-role">{role}</span>
        {/if}
      </figcaption>
    {/if}
  </figure>
</section>

<style>
  .quote-inner {
    margin: 0;
    max-width: 18em;
  }

  .quote-text {
    margin: 0;
    font-size: var(--fs-quote);
    font-weight: var(--fw-light);
    line-height: 1.3;
    letter-spacing: var(--ls-snug);
    color: var(--text-primary);
  }

  .quote-attribution {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 28px;
  }

  .quote-author {
    font-size: var(--fs-meta);
    font-weight: var(--fw-medium);
    color: var(--text-primary);
  }

  .quote-role {
    font-size: var(--fs-meta);
    font-weight: var(--fw-light);
    color: var(--text-secondary);
  }
</style>
