<script lang="ts">
  import { Footer, ParticleMap } from "$lib";

  let activeCity = $state("nyc");
  let hoveredCity = $state<string | null>(null);

  function onCityEnter(city: string) {
    hoveredCity = city;
    activeCity = city;
  }

  function onCityLeave() {
    hoveredCity = null;
  }
</script>

<svelte:head>
  <title>About — Virgil</title>
  <meta
    name="description"
    content="Creative director, designer, and visual storyteller based in New York."
  />
</svelte:head>

<section class="about">
  <div class="about-content">
    <h1 class="about-heading">About</h1>
    <p class="about-bio">
      Originally from <span
        data-city="ams"
        class="location"
        class:active={activeCity === "ams"}
        class:hovering={hoveredCity === "ams"}
        onmouseenter={() => onCityEnter("ams")}
        onmouseleave={onCityLeave}
        role="button"
        tabindex="0">Amsterdam</span
      >
      and now based in
      <span
        data-city="nyc"
        class="location"
        class:active={activeCity === "nyc"}
        class:hovering={hoveredCity === "nyc"}
        onmouseenter={() => onCityEnter("nyc")}
        onmouseleave={onCityLeave}
        role="button"
        tabindex="0">New York</span
      >, I enjoy collaborating with clients and creative teams to translate
      complex ideas into intuitive digital experiences.
    </p>
    <br /><br />
    <p class="about-bio">
      Over more than two decades in the industry, I've helped launch platforms,
      products, and campaigns for brands ranging from startups to globally
      recognized organizations. My focus is on bridging design, technology, and
      user experience to create thoughtful digital products that are both
      engaging and effective.
    </p>
    <br /><br />
    <p class="about-bio">Open to new collaborations.</p>
    <br /><br />
    <a href="mailto:hello@virgil.studio" class="about-contact"
      >hello@virgilstack.com</a
    >
  </div>

  <div class="about-lists">
    <div class="list-block">
      <h2 class="list-heading">Awards</h2>
      <ul class="about-list">
        <li><span>8x Awwwards</span></li>
        <li><span>9x TheFWA</span></li>
        <li><span>3x Webby Awards</span></li>
        <li><span>1x Love Awards</span></li>
        <li><span>1x Creative Circle</span></li>
        <li><span>3x Anthem Awards</span></li>
      </ul>
    </div>

    <div class="list-block">
      <h2 class="list-heading">Selected Clients</h2>
      <ul class="about-list">
        <li><span>Google</span></li>
        <li><span>OpenAI</span></li>
        <li><span>Virgin Galactic</span></li>
        <li><span>Virgin Hyperloop</span></li>
        <li><span>Bartlett</span></li>
        <li><span>Lyft</span></li>
        <li><span>Heineken</span></li>
        <li><span>Redbull</span></li>
        <li><span>Scotch & Soda</span></li>
        <li><span>G-Star</span></li>
        <li><span>Adidas</span></li>
        <li><span>Piet Boon</span></li>
      </ul>
    </div>
  </div>

  <div class="canvas-wrapper">
    <ParticleMap city={activeCity} />
  </div>
</section>

<Footer />

<style>
  /* 1. Mobile-first Stack Layout */
  section {
    /* Or your main wrapper class */
    display: flex;
    flex-direction: column;
    padding-top: 80px; /* Adjust to match your Nav height */
  }

  /* 2. Give the Canvas physical space on mobile */
  .canvas-wrapper {
    /* Update this class to whatever wraps your ParticleMap/Canvas */
    position: relative !important;
    width: 100%;
    height: 45vh; /* Gives the canvas enough space to show */
    min-height: 250px;
    order: 1;
  }

  /* 3. Stack the text naturally below */
  .about-content {
    order: 2;
    position: relative;
    z-index: 10;
    padding: 40px 0 0; /* Add some breathing room */
  }

  .about-lists {
    order: 3;
    position: relative;
    z-index: 10;
    padding: 40px 0;

    li span {
      display: inline-block;
      background-color: white;
      color: black;
    }
  }

  /* 4. Restore Desktop Layout */
  @media (--bp-md) {
    section {
      display: block; /* Or whatever your desktop wrapper layout was */
      padding-top: 0;
    }

    .canvas-wrapper {
      position: fixed !important; /* Or absolute, depends on your desktop layout */
      height: 100vh;
      top: 0;
      left: 0;
    }

    .about-content,
    .about-lists {
      padding: 0; /* Clear mobile passing if needed */
    }

    .about-bio {
      font-size: 16px;
    }
  }

  .about {
    display: grid;
    grid-template-columns: 1fr;
    align-items: end;
    gap: 64px;
    min-height: calc(100vh - 72px);
    padding: 48px var(--page-padding-x);
    max-width: 1400px;
    margin: 0 auto;
  }

  @media (--bp-lg) {
    .about {
      grid-template-columns: 1.2fr 1fr;
      gap: 48px;
    }
  }

  .about-content {
    max-width: 560px;
    position: relative;
    z-index: 1;
  }

  .about-heading {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    margin-bottom: 32px;
  }

  .about-bio {
    font-size: 20px;
    font-weight: 300;
    line-height: 1.6;
    color: var(--text-primary);
    margin-bottom: 20px;
  }

  .about-contact {
    display: inline-block;
    margin-top: 16px;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
    padding-bottom: 2px;
    transition:
      color 0.2s ease,
      border-color 0.2s ease;
  }

  .about-contact:hover {
    color: var(--text-primary);
    border-color: var(--text-primary);
  }

  .about-lists {
    display: flex;
    flex-direction: column;
    gap: 48px;
    position: relative;
    z-index: 1;
  }

  @media (--bp-sm) {
    .about-lists {
      flex-direction: row;
      gap: 80px;
      align-items: end;
      justify-content: end;
    }
  }

  .list-heading {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    margin-bottom: 24px;
  }

  .about-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 14px;
    line-height: 1.4;
    font-weight: 400;
    color: var(--text-secondary);
  }

  @media (--bp-sm) {
    .about {
      padding: 72px var(--page-padding-x);
    }
  }

  .location {
    cursor: pointer;
    display: inline-block;
    position: relative;
    border-bottom: 1px dotted var(--text-tertiary);
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      font-weight 0.2s ease;
    /* 
    &[data-city="ams"] {
      color: orange;
    }

    &[data-city="nyc"] {
      color: blue;
    } */
  }

  .location.hovering {
    color: var(--text-primary);
    border-bottom-style: solid;
    border-bottom-color: var(--text-primary);
  }

  .location.active {
    color: var(--text-primary);
    font-weight: 400;
    border-bottom-style: solid;
    border-bottom-color: currentColor;
  }

  h2,
  p {
    display: inline;
    background-color: white;
    line-height: 1.6;
  }

  h2 {
    margin-bottom: 32px;
    display: inline-block;
  }
</style>
