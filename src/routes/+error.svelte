<script lang="ts">
  import { page } from "$app/state";
  import { Footer } from "$lib";

  // ── WebGL palette — adjust colors here ──────────────────────────────────
  // NOTE: the shader inverts its final output (1.0 - col), so these are the
  // PRE-inversion values: a lighter color here shows up DARKER on screen. The
  // glyph gradient (near-white) is what becomes the near-black "404".
  const COLORS = {
    bgCenter: [0.051, 0.07, 0.105], // background toward the centre
    bgEdge: [0.031, 0.043, 0.066], // background toward the edges (vignette)
    glow: [0.45, 0.62, 1.0], // bloom tint where the field is disturbed (blue-ish)
    glyphGradient: ["#ffffff", "#f2f2f2", "#e4e4e4"], // 404 fill, top → bottom
  };
  const toVec3 = (c: number[]) => `vec3(${c[0]}, ${c[1]}, ${c[2]})`;

  // SvelteKit renders this for unmatched routes (404) and thrown load errors.
  let status = $derived(page.status);
  let isNotFound = $derived(status === 404);
  let heading = $derived(isNotFound ? "Page not found" : "Something went wrong");
  let message = $derived(
    isNotFound
      ? "The page you’re looking for doesn’t exist, moved, or never did."
      : (page.error?.message ?? "An unexpected error occurred."),
  );

  let canvas: HTMLCanvasElement;

  // Interactive WebGL backdrop: the status number as a texture, disturbed by
  // chromatic ripples on drag. Colors are inverted from the source demo →
  // black glyph on a white field. Fully torn down on unmount.
  $effect(() => {
    if (typeof window === "undefined" || !canvas) return;

    const label = String(page.status ?? 404);
    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: false,
      premultipliedAlpha: false,
    }) as WebGLRenderingContext | null;
    if (!gl) return; // no WebGL → the CSS white background + overlay still work

    const MAX_POINTS = 32; // length of the drag trail fed to the shader
    const LIFETIME = 1.15; // seconds each trail point stays alive
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const VERT = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    // Identical to the source shader, except the final line inverts the color
    // (1.0 - col): the deep-ink field becomes white and the near-white glyph
    // becomes black.
    const FRAG = `
      precision highp float;
      #define MAX ${MAX_POINTS}
      uniform vec2  u_res;
      uniform float u_time;
      uniform sampler2D u_tex;
      uniform vec4  u_points[MAX];
      uniform vec2  u_vel[MAX];

      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        float aspect = u_res.x / u_res.y;

        vec2 disp = vec2(0.0);
        float energy = 0.0;

        for (int i = 0; i < MAX; i++) {
          vec4 p = u_points[i];
          if (p.w <= 0.0) continue;
          float life = 1.0 - p.z;
          life = life * life;
          vec2 d = uv - p.xy;
          d.x *= aspect;
          float dist = length(d);
          vec2 dir = dist > 1e-4 ? d / dist : vec2(0.0);

          float radius = 0.02 + p.z * 0.32;
          float ring = exp(-pow((dist - radius) / 0.055, 2.0));
          float blob = exp(-pow(dist / 0.13, 2.0));

          disp += u_vel[i] * blob * life * p.w * 1.35;
          disp += dir * ring * life * p.w * 0.032;
          energy += (ring * 0.6 + blob) * life * p.w;
        }

        disp += 0.0016 * vec2(
          sin(uv.y * 9.0 + u_time * 0.7),
          cos(uv.x * 11.0 + u_time * 0.6)
        );

        float m = length(disp);
        energy = clamp(energy, 0.0, 1.4);

        float ca = 1.0 + energy * 2.2;
        vec2 dR = disp * (1.15 * ca);
        vec2 dG = disp * (0.55 * ca);
        vec2 dB = disp * (-0.35 * ca);

        vec4 tR = texture2D(u_tex, uv + dR);
        vec4 tG = texture2D(u_tex, uv + dG);
        vec4 tB = texture2D(u_tex, uv + dB);

        vec2 c = uv - 0.5; c.x *= aspect;
        float d0 = length(c);
        vec3 bg = mix(${toVec3(COLORS.bgCenter)}, ${toVec3(COLORS.bgEdge)}, d0 * 1.15);
        bg -= smoothstep(0.35, 0.95, d0) * 0.03;

        vec3 col = bg;
        col.r = mix(col.r, tR.r, tR.a);
        col.g = mix(col.g, tG.g, tG.a);
        col.b = mix(col.b, tB.b, tB.a);

        col += energy * 0.06 * ${toVec3(COLORS.glow)} * max(tG.a, 0.12);

        float g = hash(gl_FragCoord.xy + fract(u_time) * 100.0);
        col += (g - 0.5) * 0.028;
        col *= 0.985 + 0.015 * sin(gl_FragCoord.y * 1.6);

        col = clamp(col, 0.0, 1.0);
        gl_FragColor = vec4(1.0 - col, 1.0); // invert → black glyph on white
      }
    `;

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS))
        throw new Error(gl!.getShaderInfoLog(s) ?? "shader error");
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      tex: gl.getUniformLocation(prog, "u_tex"),
      points: gl.getUniformLocation(prog, "u_points"),
      vel: gl.getUniformLocation(prog, "u_vel"),
    };

    // --- text texture (the status number) ---
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const tc = document.createElement("canvas");
    const tctx = tc.getContext("2d")!;

    function drawText(w: number, h: number) {
      tc.width = w;
      tc.height = h;
      tctx.clearRect(0, 0, w, h);

      const text = label;

      // Contain the number within the screen: measure at a reference size, then
      // scale so the whole glyph fits inside FIT_W × FIT_H. The smaller axis
      // wins, so it's width-limited on tall/narrow screens and height-limited on
      // wide ones.
      const FIT_W = 0.86; // max fraction of width the number may span
      const FIT_H = 0.62; // max fraction of height the number may span
      const REF = 1000; // reference font size for measuring (scales linearly)

      tctx.font = `900 ${REF}px "Helvetica Neue", Arial, sans-serif`;
      tctx.textAlign = "center";
      tctx.textBaseline = "middle";

      const trackRef = -REF * 0.04;
      const refWidths = [...text].map((ch) => tctx.measureText(ch).width);
      const refTotal =
        refWidths.reduce((a, b) => a + b, 0) + trackRef * (text.length - 1);
      const mb = tctx.measureText("4");
      const refHeight =
        mb.actualBoundingBoxAscent + mb.actualBoundingBoxDescent || REF * 0.72;

      const size = Math.min(
        (w * FIT_W) / (refTotal / REF),
        (h * FIT_H) / (refHeight / REF),
      );
      const scale = size / REF;

      tctx.font = `900 ${size}px "Helvetica Neue", Arial, sans-serif`;
      const widths = refWidths.map((v) => v * scale);
      const track = trackRef * scale;
      const total = refTotal * scale;
      let x = w / 2 - total / 2;
      const y = h / 2 + size * 0.02;

      // Grayscale fill so, once inverted, the glyph reads as clean near-black
      // (a colored fill would invert to a muddy hue).
      const grad = tctx.createLinearGradient(0, y - size * 0.55, 0, y + size * 0.55);
      grad.addColorStop(0.0, COLORS.glyphGradient[0]);
      grad.addColorStop(0.5, COLORS.glyphGradient[1]);
      grad.addColorStop(1.0, COLORS.glyphGradient[2]);
      tctx.fillStyle = grad;

      for (let i = 0; i < text.length; i++) {
        tctx.fillText(text[i], x + widths[i] / 2, y);
        x += widths[i] + track;
      }

      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, tc);
    }

    function resize() {
      const w = Math.floor(window.innerWidth * DPR);
      const h = Math.floor(window.innerHeight * DPR);
      canvas.width = w;
      canvas.height = h;
      gl!.viewport(0, 0, w, h);
      gl!.uniform2f(U.res, w, h);
      drawText(w, h);
    }

    // --- interaction / trail ---
    const points = new Float32Array(MAX_POINTS * 4);
    const vels = new Float32Array(MAX_POINTS * 2);
    const meta = Array.from({ length: MAX_POINTS }, () => ({
      born: -10,
      base: 0,
      vx: 0,
      vy: 0,
    }));
    let head = 0;
    let last: { x: number; y: number; t: number } | null = null;
    let pressed = false;

    const T0 = performance.now();
    const perf = () => (performance.now() - T0) / 1000;

    function spawn(uvx: number, uvy: number, vx: number, vy: number, strength: number) {
      const i = head;
      meta[i].born = perf();
      meta[i].base = strength;
      meta[i].vx = vx;
      meta[i].vy = vy;
      points[i * 4] = uvx;
      points[i * 4 + 1] = uvy;
      head = (head + 1) % MAX_POINTS;
    }

    function onMove(clientX: number, clientY: number) {
      const t = perf();
      const uv = { x: clientX / window.innerWidth, y: 1 - clientY / window.innerHeight };
      if (last) {
        const dt = Math.max(t - last.t, 1 / 240);
        let vx = (uv.x - last.x) / dt;
        let vy = (uv.y - last.y) / dt;
        const speed = Math.hypot(uv.x - last.x, uv.y - last.y);
        const cap = 0.9;
        vx = Math.max(-cap, Math.min(cap, vx * 0.045));
        vy = Math.max(-cap, Math.min(cap, vy * 0.045));
        const strength = (pressed ? 1.0 : 0.5) * Math.min(1, speed * 26 + 0.12);
        if (speed > 0.002 || pressed) spawn(uv.x, uv.y, vx, vy, strength);
      }
      last = { x: uv.x, y: uv.y, t };
    }

    const onPointerMove = (e: PointerEvent) => onMove(e.clientX, e.clientY);
    const onPointerDown = (e: PointerEvent) => {
      pressed = true;
      last = null;
      onMove(e.clientX, e.clientY);
    };
    const onPointerUp = () => (pressed = false);
    const onPointerLeave = () => (last = null);

    function render() {
      const now = perf();
      for (let i = 0; i < MAX_POINTS; i++) {
        const m = meta[i];
        const age = (now - m.born) / LIFETIME;
        if (m.base > 0 && age < 1) {
          points[i * 4 + 2] = age;
          points[i * 4 + 3] = m.base;
          vels[i * 2] = m.vx;
          vels[i * 2 + 1] = m.vy;
        } else {
          points[i * 4 + 3] = 0;
          vels[i * 2] = 0;
          vels[i * 2 + 1] = 0;
        }
      }
      gl!.uniform1f(U.time, now);
      gl!.uniform4fv(U.points, points);
      gl!.uniform2fv(U.vel, vels);
      gl!.uniform1i(U.tex, 0);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    if (reduce) {
      render(); // single static frame — no animation, no interaction
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointerleave", onPointerLeave);
      const loop = () => {
        render();
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointerleave", onPointerLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  });
</script>

<svelte:head>
  <title>{status} — Virgil’s Stack</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<canvas bind:this={canvas} class="gl-bg" aria-hidden="true"></canvas>

<div class="error-content">
  <section class="error-page">
    <div class="error-inner">
      <div class="row-bottom">
        <div class="msg">
          <h1 class="error-heading">{heading}</h1>
          <p class="t-body error-message">{message}</p>
          <a href="/" class="error-home">Back to work →</a>
        </div>
        <p class="hint"><span class="arrow">↔</span> drag to disturb</p>
      </div>
    </div>
  </section>

  <Footer />
</div>

<style>
  .gl-bg {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    display: block;
    /* z-index 0 (not -1): a negative-z fixed element paints behind the body's
       white background and would be hidden. The content wrapper sits above. */
    z-index: 0;
  }

  /* All page content above the canvas. */
  .error-content {
    position: relative;
    z-index: 1;
  }

  .error-page {
    min-height: calc(100vh - 80px); /* viewport minus the fixed nav */
    display: flex;
    padding: 40px var(--page-padding-x) 64px;
    cursor: crosshair;
  }

  .error-inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    /* Let drags fall through to the canvas; re-enable on the link. */
    pointer-events: none;
  }

  .row-bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 24px;
  }

  .error-heading {
    font-size: var(--fs-h3);
    font-weight: var(--fw-light);
    line-height: var(--lh-heading);
    letter-spacing: var(--ls-tight);
    color: var(--text-primary);
    margin: 0;
  }

  .error-message {
    color: var(--text-secondary);
    max-width: 34em;
    margin: 12px 0 0;
  }

  .error-home {
    display: inline-block;
    margin-top: 24px;
    font-size: var(--fs-body-sm);
    color: var(--text-primary);
    border-bottom: 1px solid currentColor;
    padding-bottom: 2px;
    pointer-events: auto; /* clickable through the pass-through overlay */
    transition: color 0.3s ease;
  }

  .error-home:hover {
    color: var(--color-blue);
  }

  .hint {
    font-size: var(--fs-meta);
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    white-space: nowrap;
  }

  .arrow {
    display: inline-block;
    animation: hint-nudge 2.2s ease-in-out infinite;
  }

  @keyframes hint-nudge {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(5px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .arrow {
      animation: none;
    }
  }
</style>
