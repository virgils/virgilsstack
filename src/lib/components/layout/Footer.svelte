<script lang="ts">
  import "../../../app.css";

  let {
    nextProjectName = "",
    nextProjectSlug = "",
    nextProjectClient = "",
  }: {
    nextProjectName?: string;
    nextProjectSlug?: string;
    nextProjectClient?: string;
  } = $props();
</script>

<footer class="footer">
  {#if nextProjectSlug && nextProjectName}
    <a href="/work/{nextProjectSlug}" class="next-project-link">
      <span class="next-label">Next Project</span>
      <div class="next-project-info">
        <span class="next-client">{nextProjectClient}</span>
        <span class="next-title">{nextProjectName}</span>
      </div>
    </a>
  {/if}

  <div class="footer-bottom">
    <div class="footer-left">
      <span class="copyright">© {new Date().getFullYear()} Virgil's Stack</span
      >
    </div>
    <div class="footer-links">
      <a
        href="https://www.linkedin.com/in/virgils/"
        target="_blank"
        rel="noopener noreferrer"
        class="footer-link">LinkedIn</a
      >
      <a
        href="https://www.instagram.com/virgilrocks"
        target="_blank"
        rel="noopener noreferrer"
        class="footer-link">Instagram</a
      >
      <a href="mailto:hello@virgilsstack.com" class="footer-link">Email</a>
    </div>
  </div>
</footer>

<style>
  .footer {
    width: 100%;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    background: var(--bg-color);
    margin-top: 96px;
    background-color: var(--bg-color-secondary);
    z-index: 1;
    position: relative;
  }

  .next-project-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 96px var(--page-padding-x);
    text-align: center;
    background: rgba(0, 0, 0, 0.02);
    transition: background 0.3s ease;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .next-project-link:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .next-label {
    font-size: var(--fs-label);
    font-weight: var(--fw-medium);
    letter-spacing: var(--ls-label);
    text-transform: uppercase;
    color: var(--text-primary);
    margin-bottom: 32px;
    padding: 6px 16px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    background: var(--bg-color);
  }

  .next-project-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .next-client {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-light);
    color: var(--text-secondary);
  }

  .next-title {
    font-size: var(--fs-h2);
    font-weight: var(--fw-light);
    letter-spacing: var(--ls-tight);
    color: var(--text-primary);
    line-height: var(--lh-heading);
  }

  .footer-bottom {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 48px var(--page-padding-x);
    align-items: center;
  }

  @media (--bp-md) {
    .footer-bottom {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  .copyright {
    font-size: var(--fs-meta);
    color: var(--text-secondary);
  }

  .footer-links {
    display: flex;
    gap: 24px;
  }

  .footer-link {
    font-size: var(--fs-meta);
    color: var(--text-secondary);
    transition: color 0.2s ease;
  }

  .footer-link:hover {
    color: var(--text-primary);
  }
</style>
