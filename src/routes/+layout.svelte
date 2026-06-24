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
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap"
    rel="stylesheet"
  />
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

  :global(html) {
    /* font-family: "Inter", system-ui, sans-serif; */
    font-family: "DM Sans", sans-serif;
  }

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
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.04em;
  }

  .nav-link {
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.06em;
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
