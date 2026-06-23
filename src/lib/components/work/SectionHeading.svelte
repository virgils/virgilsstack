<script lang="ts">
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

<section class="section-heading component layout-contained">
  <div class="heading-inner">
    {#if index}
      <span class="caption heading-index">{index}</span>
    {/if}
    {#if title}
      <h2 class="heading-title">{title}</h2>
    {/if}
    {#if text}
      <p class="content-text heading-text">{text}</p>
    {/if}
  </div>
</section>

<style>
  .heading-inner {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding-top: 24px;
  }

  .heading-index {
    display: block;
    margin-bottom: 16px;
  }

  .heading-title {
    font-size: clamp(1.75rem, 4vw, 3rem);
    font-weight: 300;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin: 0;
    max-width: 16em;
  }

  .heading-text {
    margin-top: 24px;
    max-width: 38em;
  }
</style>
