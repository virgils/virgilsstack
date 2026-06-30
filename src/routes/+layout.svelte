<script lang="ts">
  import favicon from "$lib/assets/favicon.png";
  import faviconWhite from "$lib/assets/favicon.white.png";
  import { LogoAnimation, categories } from "$lib";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { page } from "$app/state";
  import "../app.css"; // Ensure your global variables are imported here

  let { children } = $props();

  // Social share (Open Graph / Twitter) defaults, applied site-wide. Per-page
  // <title> still controls the browser tab. og:image must be absolute for
  // scrapers — derived from the request origin (pages are SSR'd, so this
  // resolves to the live host).
  const SITE_NAME = "Virgil's Stack";
  const SHARE_DESC =
    "Portfolio of Virgil — creative developer building interactive, design-led web experiences.";
  let canonical = $derived(page.url.href);
  let shareImage = $derived(`${page.url.origin}/images/share.png`);

  // The category currently filtering the homepage (from the ?category= query).
  let activeCategory = $derived(
    page.url.pathname === "/" ? page.url.searchParams.get("category") : null,
  );

  // Mobile menu (only used when there are categories to show).
  let menuOpen = $state(false);
  // Close the menu whenever the route/filter changes (covers back/forward too).
  $effect(() => {
    page.url.href;
    menuOpen = false;
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} media="(prefers-color-scheme: light)" />
  <link rel="icon" href={faviconWhite} media="(prefers-color-scheme: dark)" />
  <!-- Fonts are loaded once in src/app.html (DM Sans). -->

  <!-- Social share defaults (per-page <title> still wins for the tab). -->
  <meta name="description" content={SHARE_DESC} />
  <link rel="canonical" href={canonical} />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:title" content={SITE_NAME} />
  <meta property="og:description" content={SHARE_DESC} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={shareImage} />
  <meta property="og:image:width" content="2560" />
  <meta property="og:image:height" content="1600" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={SITE_NAME} />
  <meta name="twitter:description" content={SHARE_DESC} />
  <meta name="twitter:image" content={shareImage} />
</svelte:head>

<nav class="nav" class:has-menu={categories.length > 0}>
  <a href="/" class="nav-brand">
    <!-- <img src="/images/stack.png" alt="Virgil's Stack Logo" class="nav-logo" /> -->
    <span class="nav-title">Virgil's Stack.</span>
  </a>

  {#if categories.length > 0}
    <button
      class="nav-toggle"
      aria-label={menuOpen ? "Close menu" : "Open menu"}
      aria-expanded={menuOpen}
      aria-controls="nav-menu"
      onclick={() => (menuOpen = !menuOpen)}
    >
      {#if menuOpen}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        >
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      {:else}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        >
          <line x1="3" y1="7" x2="21" y2="7" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="17" x2="21" y2="17" />
        </svg>
      {/if}
    </button>
  {/if}

  <div class="nav-links">
    {@render navItems()}
  </div>
</nav>

{#if menuOpen}
  <!-- Dark overlay over the page content; click to close -->
  <button
    class="nav-backdrop"
    aria-label="Close menu"
    transition:fade={{ duration: 250 }}
    onclick={() => (menuOpen = false)}
  ></button>
  <!-- Slide-out drawer -->
  <div
    id="nav-menu"
    class="nav-drawer"
    transition:fly={{ x: 320, duration: 320, easing: cubicOut }}
  >
    {@render navItems()}
  </div>
{/if}

{#snippet navItems()}
  {#each categories as category}
    <a
      href={activeCategory === category.tag ? "/" : `/?category=${category.tag}`}
      class="nav-link"
      class:active={activeCategory === category.tag}
      data-sveltekit-noscroll
      onclick={() => (menuOpen = false)}
    >
      {category.label}
    </a>
  {/each}
  <a
    href="/about"
    class="nav-link"
    class:active={page.url.pathname === "/about"}
    onclick={() => (menuOpen = false)}>About</a
  >
{/snippet}

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
    white-space: nowrap;
  }

  .nav-links {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 20px;
  }

  @media (--bp-sm) {
    .nav-links {
      gap: 28px;
    }
  }

  /* Hamburger toggle — only shown on mobile when categories exist */
  .nav-toggle {
    display: none;
    padding: 4px;
    margin: -4px;
    border: none;
    background: none;
    color: var(--text-primary);
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .nav-toggle:hover {
    color: var(--color-blue);
  }

  /* Dark overlay behind the drawer — clicking it closes the menu */
  .nav-backdrop {
    position: fixed;
    inset: 0;
    z-index: 90;
    border: none;
    padding: 0;
    background: rgba(0, 0, 0, 0.4);
    cursor: pointer;
  }

  /* Slide-out drawer (mobile) */
  .nav-drawer {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 95; /* above backdrop, below the nav bar so the ✕ stays tappable */
    height: 100vh;
    height: 100dvh;
    width: min(78vw, 320px);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 22px;
    padding: 96px var(--page-padding-x) 32px;
    background: var(--bg-color);
    box-shadow: -8px 0 30px rgba(0, 0, 0, 0.12);
  }

  .nav-drawer .nav-link {
    font-size: var(--fs-body-sm);
  }

  /* On mobile with categories: show the hamburger, hide the inline links. */
  @media (max-width: 767px) {
    .nav.has-menu .nav-toggle {
      display: inline-flex;
      align-items: center;
    }

    .nav.has-menu .nav-links {
      display: none;
    }
  }

  /* Never show the mobile drawer/backdrop on desktop (e.g. if open during a
     resize) — the inline links take over there. */
  @media (min-width: 768px) {
    .nav-backdrop,
    .nav-drawer {
      display: none;
    }
  }

  .nav-link {
    font-size: var(--fs-meta);
    font-weight: var(--fw-regular);
    letter-spacing: var(--ls-wide);
    color: var(--text-primary);
    position: relative;
    transition: color 0.3s ease;
  }

  /* Hovers Blue */
  .nav-link:hover {
    color: var(--color-blue);
  }

  /* Active category / page */
  .nav-link.active {
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
    /* Clip the parallax/evenOut column transforms so a drifted column can't
       bleed past the page edges. Safe: main has no height, so it stays a
       normal (non-scrolling) block and the window-scroll parallax is intact. */
    overflow: hidden;
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
