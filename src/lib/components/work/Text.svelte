<script lang="ts">
  let {
    text = "",
  }: {
    text?: string;
  } = $props();
</script>

<section class="text-section component layout-contained">
  <div class="container">
    <p class="content-text">{@html text}</p>
  </div>
</section>

<style>
  .container {
    width: 100%;
  }

  @media (--bp-sm) {
    .container {
      width: 50%;
    }
  }

  .content-text {
    font-size: 22px;
  }
</style>
