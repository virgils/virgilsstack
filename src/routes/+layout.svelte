<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import { LogoAnimation } from "$lib";
  import { fade } from "svelte/transition";
  import { page } from "$app/state";
  import "../app.css"; // Ensure your global variables are imported here

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
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

<nav>
  <a href="/" class="nav-brand">
    <LogoAnimation />
    <span class="nav-title">Virgil's Stack</span>
  </a>
  <a href="/about" class="nav-link">About</a>
</nav>

<main>
  {#key page.url.pathname}
    <div in:fade={{ duration: 300, delay: 50 }}>
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
    font-family: "Inter", system-ui, sans-serif;
  }

  :global(body) {
    min-height: 100vh;
  }

  :global(a) {
    color: inherit;
    text-decoration: none;
  }

  nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 32px;
    background: rgba(250, 250, 250, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--text-primary);
    font-family: "Iosevka Charon", monospace;
  }

  .nav-title {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .nav-link {
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-primary);
    position: relative;
  }

  .nav-link::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--text-primary);
    transition: width 0.3s ease;
  }

  .nav-link:hover::after {
    width: 100%;
  }

  main {
    padding-top: 80px;
  }

  /* Optional: ensures the wrapper doesn't break layout */
  div {
    width: 100%;
  }
</style>
