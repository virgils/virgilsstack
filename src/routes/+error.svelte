<script lang="ts">
  import { page } from "$app/state";
  import { Footer } from "$lib";

  // SvelteKit renders this for unmatched routes (404) and thrown load errors.
  let status = $derived(page.status);
  let isNotFound = $derived(status === 404);
  let heading = $derived(isNotFound ? "Page not found" : "Something went wrong");
  let message = $derived(
    isNotFound
      ? "The page you’re looking for doesn’t exist, moved, or never did."
      : (page.error?.message ?? "An unexpected error occurred."),
  );
</script>

<svelte:head>
  <title>{status} — Virgil’s Stack</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="error-page">
  <div class="error-inner">
    <span class="t-label error-eyebrow">Error {status}</span>
    <p class="error-code">{status}</p>
    <h1 class="error-heading">{heading}</h1>
    <p class="t-body-lg error-message">{message}</p>
    <a href="/" class="error-home">Back to work →</a>
  </div>
</section>

<Footer />

<style>
  .error-page {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-height: calc(100vh - 80px); /* viewport minus the fixed nav */
    max-width: var(--content-max-width);
    margin: 0 auto;
    padding: 96px var(--page-padding-x);
  }

  .error-eyebrow {
    display: block;
    color: var(--text-tertiary);
    margin-bottom: 24px;
  }

  .error-code {
    font-size: var(--fs-display);
    font-weight: var(--fw-light);
    line-height: var(--lh-display);
    letter-spacing: var(--ls-tight);
    color: var(--text-primary);
    margin: 0;
  }

  .error-heading {
    font-size: var(--fs-h2);
    font-weight: var(--fw-light);
    line-height: var(--lh-heading);
    letter-spacing: var(--ls-tight);
    color: var(--text-primary);
    margin: 16px 0 0;
  }

  .error-message {
    color: var(--text-secondary);
    max-width: 34em;
    margin: 20px 0 0;
  }

  .error-home {
    display: inline-block;
    margin-top: 40px;
    font-size: var(--fs-body-sm);
    color: var(--text-primary);
    border-bottom: 1px solid currentColor;
    padding-bottom: 2px;
    transition: color 0.3s ease;
  }

  .error-home:hover {
    color: var(--color-blue);
  }
</style>
