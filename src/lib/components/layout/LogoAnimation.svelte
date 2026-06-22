<script>
  // replaced `export let size = 50;` with rune-compatible props API
  let { size = 50 } = $props();
</script>

<div class="logo-wrap" style="width:{size}px;height:{size}px;">
  <div class="stack-scene">
    <div class="sq-wrap wrap1"><div class="sq-inner inner1"></div></div>
    <div class="sq-wrap wrap2"><div class="sq-inner inner2"></div></div>
    <div class="sq-wrap wrap3"><div class="sq-inner inner3"></div></div>
  </div>
</div>

<style>
  .logo-wrap {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stack-scene {
    position: relative;
    width: 26px;
    height: 26px;
    transform-style: preserve-3d;
  }

  .sq-wrap {
    position: absolute;
    width: 22px;
    height: 22px;
    transform-style: preserve-3d;
    transition:
      transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.5s ease;
  }

  .sq-inner {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    animation: spinFlat 12s linear infinite;
  }

  .wrap1 {
    transform: rotateX(55deg) rotateZ(-20deg) translate(-4px, 7px);
    opacity: 0.7;
  }
  .wrap2 {
    transform: rotateX(55deg) rotateZ(-20deg) translate(-2px, 2px);
    opacity: 0.85;
  }
  .wrap3 {
    transform: rotateX(55deg) rotateZ(-20deg) translate(0px, -3px);
    opacity: 1;
  }

  .inner1 {
    background: #1a1a1a;
    animation-delay: 0s;
  }
  .inner2 {
    background: #555555;
    animation-delay: -4s;
  }
  .inner3 {
    background: #999999;
    animation-delay: -8s;
  }

  @keyframes spinFlat {
    from {
      transform: rotateZ(0deg);
    }
    to {
      transform: rotateZ(360deg);
    }
  }

  .logo-wrap:hover .wrap1 {
    transform: rotateX(0deg) rotateZ(0deg) translate(0px, 0px);
    opacity: 1;
  }
  .logo-wrap:hover .wrap2 {
    transform: rotateX(0deg) rotateZ(0deg) translate(0px, 0px);
    opacity: 1;
  }
  .logo-wrap:hover .wrap3 {
    transform: rotateX(0deg) rotateZ(0deg) translate(0px, 0px);
    opacity: 1;
  }
  .logo-wrap:hover .sq-inner {
    animation: none;
    background: #1a1a1a;
    transform: none;
  }
</style>
