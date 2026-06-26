<script lang="ts">
  import favicon from "$lib/assets/favicon.png";
  import faviconWhite from "$lib/assets/favicon.white.png";
  import { LogoAnimation } from "$lib";
  import { fade } from "svelte/transition";
  import { page } from "$app/state";
  import "../app.css"; // Ensure your global variables are imported here

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} media="(prefers-color-scheme: light)" />
  <link rel="icon" href={faviconWhite} media="(prefers-color-scheme: dark)" />
  <!-- Fonts are loaded once in src/app.html (DM Sans). -->
</svelte:head>

<nav class="nav">
  <a href="/" class="nav-brand">
    <!-- <img src="/images/stack.png" alt="Virgil's Stack Logo" class="nav-logo" /> -->
    <span class="nav-title">Virgil's Stack.</span>
  </a>
  <a href="/about" class="nav-link">About</a>
</nav>

<!-- Add the fade-in-on-load class to main -->
<main class="fade-in-on-load">
  {#key page.url.pathname}
    <div in:fade={{ duration: 200, delay: 50 }}>
      {@render children()}
    </div>
  {/key}
</main>

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* font-family is set globally in app.css from the --ff-sans token */

  :global(body) {
    min-height: 100vh;
  }

  :global(a) {
    color: inherit;
    text-decoration: none;
  }

  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px var(--page-padding-x);
    background: rgba(255, 255, 255, 0.55);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  /* Separate @supports blocks so the CSS minifier can't collapse the
     prefixed + standard pair down to only -webkit- (which breaks Firefox). */
  @supports (backdrop-filter: blur(1px)) {
    .nav {
      backdrop-filter: blur(8px);
    }
  }

  @supports (-webkit-backdrop-filter: blur(1px)) {
    .nav {
      -webkit-backdrop-filter: blur(8px);
    }
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--text-primary);
    transition: color 0.3s ease;
  }

  /* Home hovers Orange */
  .nav-brand:hover {
    color: var(--color-orange);
  }

  .nav-title {
    font-size: var(--fs-meta);
    font-weight: var(--fw-regular);
    letter-spacing: var(--ls-wide);
  }

  .nav-link {
    font-size: var(--fs-meta);
    font-weight: var(--fw-regular);
    letter-spacing: var(--ls-wide);
    color: var(--text-primary);
    position: relative;
    transition: color 0.3s ease;
  }

  /* About hovers Blue */
  .nav-link:hover {
    color: var(--color-blue);
  }

  /* .nav-link::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--text-primary);
    transition:
      width 0.3s ease,
      background-color 0.3s ease;
  } */

  .nav-link:hover::after {
    width: 100%;
    background-color: var(--color-blue);
  }

  main {
    padding-top: 80px;
  }

  @keyframes initialFade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .fade-in-on-load {
    animation: initialFade 0.4s ease-in backwards;
  }

  div {
    width: 100%;
  }
</style>
