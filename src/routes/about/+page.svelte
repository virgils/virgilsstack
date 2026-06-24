<script lang="ts">
  import { Footer, ParticleMap } from "$lib";
  import { fade } from "svelte/transition";

  let activeCity = $state("nyc");
  let hoveredCity = $state<string | null>(null);

  function onCityEnter(city: string) {
    hoveredCity = city;
    activeCity = city;
  }

  function onCityLeave() {
    hoveredCity = null;
  }

  type Job = {
    role: string;
    company: string;
    period: string;
    url?: string; // optional — renders the company as a link when present
  };

  const experience: Job[] = [
    {
      role: "Senior Developer",
      company: "Hello Monday",
      period: "2018–2026",
      url: "https://hellomonday.com",
    },
    {
      role: "Jury Member",
      company: "Awwwards",
      period: "2025–Present",
      url: "https://www.awwwards.com",
    },
    {
      role: "Jury Member",
      company: "TheFWA",
      period: "2017–Present",
      url: "https://thefwa.com",
    },
    {
      role: "Freelance Creative Developer",
      company: "Klash",
      period: "2016–2018",
    },
    {
      role: "Senior Developer",
      company: "Cartelle",
      period: "2011–2014",
      url: "https://www.cartelle.nl",
    },
    {
      role: "Web Developer",
      company: "TAXI",
      period: "2009–2011",
      url: "https://www.taxi.ca",
    },
    {
      role: "Front-end Developer",
      company: "The Valley",
      period: "2008–2009",
      url: "https://www.thevalley.nl",
    },
    { role: "ColdFusion Developer", company: "Concrete3", period: "2002–2008" },
    {
      role: "Visual Basic Programmer",
      company: "Gigaprint",
      period: "2000–2002",
      url: "https://www.gigaprint.nl",
    },
    { role: "Web Designer", company: "Better Image", period: "2000" },
    {
      role: "HTML Developer",
      company: "University of Amsterdam",
      period: "1998–1999",
      url: "https://www.uva.nl",
    },
  ];

  // Show the first 6 roles; the remaining 5 are revealed via "Load more".
  const INITIAL_COUNT = 6;
  let showAll = $state(false);
  let visibleExperience = $derived(
    showAll ? experience : experience.slice(0, INITIAL_COUNT),
  );

  // Cursor-following preview image for any `.hover-image` span (uses its data-img).
  let hoverImg = $state<string | null>(null);
  let cursorX = $state(0);
  let cursorY = $state(0);

  function hoverImage(node: HTMLElement) {
    const src = node.dataset.img;
    if (!src) return;

    const enter = (e: MouseEvent) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      hoverImg = src;
    };
    const move = (e: MouseEvent) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
    };
    const leave = () => {
      if (hoverImg === src) hoverImg = null;
    };

    node.addEventListener("mouseenter", enter);
    node.addEventListener("mousemove", move);
    node.addEventListener("mouseleave", leave);

    return {
      destroy() {
        node.removeEventListener("mouseenter", enter);
        node.removeEventListener("mousemove", move);
        node.removeEventListener("mouseleave", leave);
      },
    };
  }
</script>

<svelte:head>
  <title>About — Virgil</title>
  <meta
    name="description"
    content="Senior developer and creative technologist bringing digital concepts to life through code, based in New York."
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
    <a href="mailto:hello@virgilsstack.com" class="about-contact"
      >hello@virgilsstack.com</a
    >
  </div>

  <div class="about-lists">
    <div class="list-block">
      <h2 class="list-heading">Awards</h2>
      <ul class="about-list">
        <li><span>8x Awwwards</span></li>
        <li><span>9x TheFWA</span></li>
        <li><span>5x Webby Awards</span></li>
        <li><span>1x Lovie Awards</span></li>
        <li><span>3x Anthem Awards</span></li>
      </ul>
      <h2 class="list-heading">Recognition</h2>
      <ul class="about-list">
        <li>
          <span
            class="hover-image"
            data-img="/images/webby-acceptance.jpg"
            use:hoverImage>Webby's Agency of the Year, accepted for Dept</span
          >
        </li>
        <li>
          <span
            >Jury Member, <a
              href="https://www.awwwards.com/virgil.spruit/"
              target="_blank">Awwwards</a
            >
            &
            <a href="https://thefwa.com/" target="_blank">TheFWA</a></span
          >
        </li>
        <li>
          <a
            href="https://x.com/virgilrocks/status/963005637171978240"
            target="_blank"><span>Featured in net magazine</span></a
          >
        </li>
        <li>
          <a href="https://thefwa.com/interviews/virgil-spruit" target="_blank"
            ><span>Interviewed by TheFWA</span></a
          >
        </li>
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
    <ParticleMap city={activeCity} scrollFade />
  </div>
</section>

<section class="experience">
  <div class="experience-inner">
    <h2 class="experience-heading">Experience</h2>
    <ul class="experience-list">
      {#each visibleExperience as job, i}
        <li
          class="experience-item"
          in:fade={{
            delay: Math.max(0, i - INITIAL_COUNT) * 90,
            duration: 400,
          }}
        >
          <span class="job-role">{job.role}</span>
          {#if job.url}
            <a
              class="job-company"
              href={job.url}
              target="_blank"
              rel="noopener noreferrer">{job.company}</a
            >
          {:else}
            <span class="job-company">{job.company}</span>
          {/if}
          <span class="job-period">{job.period}</span>
        </li>
      {/each}
    </ul>

    {#if !showAll && experience.length > INITIAL_COUNT}
      <button
        type="button"
        class="experience-toggle"
        onclick={() => (showAll = true)}
      >
        Load more
      </button>
    {/if}
  </div>
</section>

{#if hoverImg}
  <img
    class="cursor-image"
    src={hoverImg}
    alt=""
    aria-hidden="true"
    style="transform: translate({cursorX}px, {cursorY}px) translate(20px, -50%);"
    transition:fade={{ duration: 150 }}
  />
{/if}

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

    a,
    a span {
      text-decoration: underline;
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
    max-width: 510px;
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
    margin-bottom: 16px;
    margin-top: 40px;
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

  .hover-image {
    cursor: pointer;
    border-bottom: 1px dotted var(--text-tertiary);
  }

  /* Floating preview that tracks the cursor while hovering a .hover-image */
  .cursor-image {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    width: clamp(200px, 22vw, 320px);
    height: auto;
    border-radius: 6px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
    pointer-events: none;
    will-change: transform;
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

  /* Work history — sits below the hero, opaque so it covers the fixed map */
  .experience {
    position: relative;
    z-index: 10;
    width: 100%;
    padding-top: 0; /* override the blanket `section` padding-top */
    background: var(--bg-color);
  }

  .experience-inner {
    max-width: 1400px; /* aligns with the .about content width */
    margin: 0 auto;
    padding: 64px var(--page-padding-x) 96px;
    width: 100%;
  }

  .experience-heading {
    display: block; /* override component-wide inline h2 */
    margin-bottom: 32px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    background: none;
  }

  .experience-list {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }

  .experience-item {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2px;
    padding: 20px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .job-role {
    font-size: 16px;
    font-weight: 400;
    color: var(--text-primary);
  }

  .job-company {
    font-size: 15px;
    font-weight: 300;
    color: var(--text-secondary);
  }

  a.job-company {
    transition: color 0.2s ease;
    text-decoration: underline;
  }

  a.job-company:hover {
    color: var(--text-primary);
  }

  .job-period {
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.04em;
    color: var(--text-tertiary);
  }

  .experience-toggle {
    margin-top: 24px;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    font: inherit;
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

  .experience-toggle:hover {
    color: var(--text-primary);
    border-color: var(--text-primary);
  }

  @media (--bp-md) {
    .experience-item {
      /* fixed period column so the company column aligns across every row
         (an `auto` column varies in width: "2025–Present" ≠ "2018–2026") */
      grid-template-columns: 1.5fr 1fr 7.5rem;
      gap: 24px;
      align-items: baseline;
    }

    .job-period {
      text-align: right;
    }
  }
</style>
