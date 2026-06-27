<script>
  import { onMount, onDestroy } from "svelte";

  let {
    ambientMovement = 0.08,
    numParticles = 6000,
    spreadScale = 1.0,
    cursorSize = 5.0,
    pointSize = 13.0,
    pulse = false,
    nycColorTop = "#00D2FF",
    nycColorBottom = "#0066FF",
    amsColorTop = "#FFB347",
    amsColorBottom = "#FF6B35",
    city = "nyc",
    nycLocationX = 0.01,
    nycLocationY = -0.04,
    amsLocationX = -0.09,
    amsLocationY = 0.06,
    hasStroke = false,
    scrollFade = false, // NEW: spread + fade particles on window scroll
    scrollFadeDistance = 0.9, // portion of a viewport to fully fade over — lower = fades faster
    scrollSpread = 300.0, // how far particles fly apart on scroll — higher = particles fly farther apart
  } = $props();

  let THREE;

  // Marker size is responsive: larger on mobile so it stays prominent.
  let viewportWidth = $state(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  let markerSize = $derived(viewportWidth < 768 ? 360.0 : 180.0);

  let movementDistance = $derived(
    typeof ambientMovement === "boolean"
      ? ambientMovement
        ? 0.08
        : 0.0
      : typeof ambientMovement === "number"
        ? ambientMovement
        : 0.08,
  );

  let container;
  let animationFrameId;
  let scene,
    camera,
    renderer,
    particlesMaterial,
    particlesGeometry,
    particlesMesh;
  let locationMesh, locationMaterial; // NEW: tracking the location marker

  let mouseWorld;
  let targetMouseWorld;
  let prevMouseWorld;
  let mouseVelocity;
  let raycaster;
  let mouse;
  let plane;

  let currentTransition = 0.0;
  let targetTransition = 0.0;

  // NEW: Separate transition variable for the marker so it can be slower
  let currentMarkerTransition = 0.0;

  let currentIntro = 0.0;
  let targetIntro = 0.0;

  // NEW: scroll-driven spread/fade (0 = top of page, 1 = scrolled away)
  let currentScroll = 0.0;
  let targetScroll = 0.0;

  let maxAspect = 1.0;

  const vertexShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uMouseVelocity;
    uniform float uPointSize;
    uniform float uAmbientMovement;
    uniform float uCursorSize;
    uniform float uMapHeight;
    uniform float uTransition;
    uniform float uIntroProgress; // NEW
    uniform float uScroll;        // NEW: 0 = at top, 1 = scrolled away
    uniform float uScrollSpread;  // NEW: max outward distance on scroll

    attribute vec2 aRandomOffset;
    attribute vec3 aPosition2;
    
    varying float vPulseOffset;
    varying float vGradientT;
    varying float vIntroAlpha; // NEW
    
    void main() {
        vPulseOffset = aRandomOffset.x;
        
        vec3 pos1 = position;
        vec3 pos2 = aPosition2;
        
        if (uAmbientMovement > 0.0) {
            vec2 mov = vec2(
                sin(uTime * 1.5 + aRandomOffset.x) * uAmbientMovement,
                cos(uTime * 1.5 + aRandomOffset.y) * uAmbientMovement
            );
            pos1.xy += mov;
            pos2.xy += mov;
        }
        
        vec3 pos = mix(pos1, pos2, smoothstep(0.0, 1.0, uTransition));
        
        // --- NEW: Intro Pull-In Animation ---
        // Stagger each particle's timeline based on random seed (reduced stagger)
        float staggerDelay = fract(aRandomOffset.y * 34.56) * 0.15;
        
        // Map global intro progress to this particle's specific timeline span
        float pIntro = smoothstep(staggerDelay, staggerDelay + 0.85, uIntroProgress);
        
        // Less ease-out: exponent reduced from 3.0 to 1.5
        float introForce = pow(1.0 - pIntro, 1.5);
        
        // 360-degree radial spread (both X and Y axes)
        float angle = fract(aRandomOffset.x * 78.91) * 6.283185; // 0 to 2*PI
        
        // More spread: push out between 150 and 300 units
        float spreadDist = 150.0 + fract(aRandomOffset.y * 12.34) * 150.0;
        
        // Displace outward radially
        pos.x += cos(angle) * introForce * spreadDist;
        pos.y += sin(angle) * introForce * spreadDist;
        
        // CHANGED: Keep opacity low much longer. 
        // It stays 0.0 (transparent) until 80% of its timeline, then fades in quickly.
        vIntroAlpha = smoothstep(0.8, 1.0, pIntro);
        // -------------------------------------

        // --- NEW: Scroll Spread + Fade ---
        // Push each particle outward radially (reusing the intro angle) and
        // fade it out as the page scrolls down.
        float scrollT = smoothstep(0.0, 1.0, uScroll);
        // per-particle distance, scaled by uScrollSpread (range ~0.4x – 1.0x)
        float scrollDist = scrollT * uScrollSpread * (0.4 + 0.6 * fract(aRandomOffset.y * 56.78));
        pos.x += cos(angle) * scrollDist;
        pos.y += sin(angle) * scrollDist;
        vIntroAlpha *= (1.0 - scrollT);
        // ---------------------------------

        // Calculate linear gradient from top to bottom
        vGradientT = (pos.y / uMapHeight) + 0.5;
        vGradientT = smoothstep(0.0, 1.0, vGradientT); 
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = floor(uPointSize * (30.0 / -mvPosition.z) + 0.5);
    }
  `;

  const fragmentShader = `
    uniform vec3 uNycTop;
    uniform vec3 uNycBottom;
    uniform vec3 uAmsTop;
    uniform vec3 uAmsBottom;
    uniform float uTransition;
    uniform float uTime;
    uniform float uPulse;
    
    varying float vPulseOffset;
    varying float vGradientT;
    varying float vIntroAlpha; // NEW
    
    void main() {
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        float r = dot(cxy, cxy);
        if (r > 1.0) discard;

        vec3 nycColor = mix(uNycBottom, uNycTop, vGradientT);
        vec3 amsColor = mix(uAmsBottom, uAmsTop, vGradientT);
        vec3 linearColor = mix(nycColor, amsColor, smoothstep(0.0, 1.0, uTransition));
        vec3 color = pow(linearColor, vec3(1.0 / 2.2));

        float brightness = uPulse > 0.5
          ? 0.2 + 0.8 * (0.5 + 0.5 * sin(uTime * 1.8 + vPulseOffset))
          : 1.0;

        // Multiply final alpha by the intro transition alpha
        float alpha = (1.0 - r) * 0.85 * vIntroAlpha; 
        gl_FragColor = vec4(color * brightness, alpha);
    }
  `;

  async function loadMapData(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const w = img.width;
        const h = img.height;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h).data;
        const valid = [];
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            if (imgData[idx] < 128) {
              valid.push({ x: x / w - 0.5, y: -(y / h - 0.5) });
            }
          }
        }
        resolve({ validPixels: valid, aspect: h / w });
      };
      img.onerror = reject;
    });
  }

  function buildParticleArrays(pixels, n, spread, aspect) {
    const positions = new Float32Array(n * 3);
    const randomOffsets = new Float32Array(n * 2);
    const mapW = 30;
    const mapH = 30 * aspect;

    for (let i = 0; i < n; i++) {
      const baseP =
        pixels.length > 0
          ? pixels[Math.floor(Math.random() * pixels.length)]
          : { x: Math.random() - 0.5, y: Math.random() - 0.5 };

      const jitterX = (Math.random() - 0.5) * spread * 0.005;
      const jitterY = (Math.random() - 0.5) * spread * 0.005;

      positions[i * 3] = (baseP.x + jitterX) * mapW;
      positions[i * 3 + 1] = (baseP.y + jitterY) * mapH;
      positions[i * 3 + 2] = 0;

      randomOffsets[i * 2] = Math.random() * 100;
      randomOffsets[i * 2 + 1] = Math.random() * 100;
    }

    return { positions, randomOffsets };
  }

  onMount(async () => {
    THREE = await import("https://esm.sh/three@0.158.0");

    mouseWorld = new THREE.Vector2(9999, 9999);
    targetMouseWorld = new THREE.Vector2(9999, 9999);
    prevMouseWorld = new THREE.Vector2(9999, 9999);
    mouseVelocity = new THREE.Vector2(0, 0);
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(-9999, -9999);

    let nycData, amsData;
    try {
      nycData = await loadMapData("/images/city-nyc.png");
      amsData = await loadMapData("/images/city-ams.png");
      maxAspect = Math.max(nycData.aspect, amsData.aspect);
    } catch (e) {
      console.error("Failed to load map image data", e);
    }

    const nycArrays = buildParticleArrays(
      nycData.validPixels,
      numParticles,
      spreadScale,
      nycData.aspect,
    );
    const amsArrays = buildParticleArrays(
      amsData.validPixels,
      numParticles,
      spreadScale,
      amsData.aspect,
    );

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 25;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    updateCameraDistance();

    const mapHeightWorld = 30 * maxAspect;

    particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(nycArrays.positions, 3),
    );
    particlesGeometry.setAttribute(
      "aPosition2",
      new THREE.BufferAttribute(amsArrays.positions, 3),
    );
    particlesGeometry.setAttribute(
      "aRandomOffset",
      new THREE.BufferAttribute(nycArrays.randomOffsets, 2),
    );

    particlesMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(9999, 9999) },
        uMouseVelocity: { value: new THREE.Vector2(0, 0) },
        uNycTop: { value: new THREE.Color(nycColorTop) },
        uNycBottom: { value: new THREE.Color(nycColorBottom) },
        uAmsTop: { value: new THREE.Color(amsColorTop) },
        uAmsBottom: { value: new THREE.Color(amsColorBottom) },
        uPointSize: { value: pointSize * Math.min(window.devicePixelRatio, 2) },
        uAmbientMovement: { value: movementDistance },
        uCursorSize: { value: cursorSize },
        uPulse: { value: pulse ? 1.0 : 0.0 },
        uMapHeight: { value: mapHeightWorld },
        uTransition: { value: 0.0 },
        uIntroProgress: { value: 0.0 }, // NEW
        uScroll: { value: 0.0 }, // NEW
        uScrollSpread: { value: scrollSpread }, // NEW
      },
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // --- NEW: THE LOCATION MARKER ---
    // Single vertex geometry
    const locGeo = new THREE.BufferGeometry();
    locGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3),
    );

    // Convert the normalized prop values into actual WebGL space
    const locNycPos = new THREE.Vector3(
      nycLocationX * 30,
      nycLocationY * mapHeightWorld,
      1.0,
    );
    const locAmsPos = new THREE.Vector3(
      amsLocationX * 30,
      amsLocationY * mapHeightWorld,
      1.0,
    );

    locationMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        uniform vec3 uPosNyc;
        uniform vec3 uPosAms;
        uniform float uMarkerTransition;
        uniform float uIntroProgress;
        uniform float uMarkerSize;       // NEW: Import uniform
        uniform float uScroll;           // NEW
        varying float vIntroAlpha;

        void main() {
          float t = smoothstep(0.0, 1.0, uMarkerTransition);
          vec3 basePos = mix(uPosNyc, uPosAms, t);
          
          vec2 dir = uPosAms.xy - uPosNyc.xy;
          vec2 normal = length(dir) > 0.0 ? normalize(vec2(-dir.y, dir.x)) : vec2(0.0, 1.0);
          
          float arcT = sin(t * 3.14159265);
          basePos.xy += normal * arcT * 3.0; 
          
          // Fade the marker out faster than the particles (gone by ~55% scroll)
          vIntroAlpha = smoothstep(0.8, 1.0, uIntroProgress) * (1.0 - smoothstep(0.0, 0.55, uScroll));
          vec4 mvPosition = modelViewMatrix * vec4(basePos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // CHANGED: Use the uniform variable
          gl_PointSize = floor(uMarkerSize * (30.0 / -mvPosition.z) + 0.5); 
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uMarkerTransition; 
        uniform vec3 uColorNycMarker;
        uniform vec3 uColorAmsMarker;
        uniform float uHasStroke;
        varying float vIntroAlpha;
        
        void main() {
          vec2 cxy = 2.0 * gl_PointCoord - 1.0;
          float r = length(cxy);
          
          if (r > 1.0) discard;
          
          float fullDot = 1.0 - smoothstep(0.12, 0.15, r); 
          float colorDot = 1.0 - smoothstep(0.08, 0.11, r); 
          
          float pulseTime = fract(uTime * 0.15); 
          float outWave = smoothstep(pulseTime - 0.2, pulseTime, r) 
                        - smoothstep(pulseTime, pulseTime + 0.05, r);
          
          float pulseAlpha = outWave * (1.0 - pulseTime) * 0.4;
          
          vec3 linearColor = mix(uColorNycMarker, uColorAmsMarker, smoothstep(0.0, 1.0, uMarkerTransition));
          vec3 dotColor = pow(linearColor, vec3(1.0 / 2.2));
          
          // Layer the colored dot on top of pure white (the stroke)
          vec3 strokedDot = mix(vec3(1.0), dotColor, colorDot);
          
          // Switch between the stroked dot and the pure colored dot
          vec3 finalDot = mix(dotColor, strokedDot, uHasStroke);
          
          // Mask size depends on if stroke is active
          float coreMask = mix(colorDot, fullDot, uHasStroke);
          
          vec3 color = mix(vec3(0.5), finalDot, coreMask);
          
          float finalAlpha = max(coreMask, pulseAlpha) * vIntroAlpha;
          if (finalAlpha < 0.01) discard;
          
          gl_FragColor = vec4(color, finalAlpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uPosNyc: { value: locNycPos },
        uPosAms: { value: locAmsPos },
        uMarkerTransition: { value: 0 },
        uIntroProgress: { value: 0 },
        uScroll: { value: 0 }, // NEW
        uMarkerSize: { value: markerSize }, // NEW: Register uniform
        uColorNycMarker: { value: new THREE.Color(amsColorBottom) },
        uColorAmsMarker: { value: new THREE.Color(nycColorBottom) },
        uHasStroke: { value: hasStroke ? 1.0 : 0.0 },
      },
      transparent: true,
      depthTest: false,
      blending: THREE.NormalBlending,
    });

    locationMesh = new THREE.Points(locGeo, locationMaterial);
    // Push it physically slightly towards the camera to guarantee z-order
    locationMesh.position.z = 2.0;
    scene.add(locationMesh);
    // ---------------------------------

    plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    scene.add(plane);

    window.addEventListener("resize", onWindowResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initialise in case the page loads already scrolled

    animate();

    // Trigger the intro animation 10ms after mounting
    setTimeout(() => {
      targetIntro = 1.0;
    }, 10);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
    }
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (renderer) renderer.dispose();
    if (particlesMaterial) particlesMaterial.dispose();
    if (locationMaterial) locationMaterial.dispose(); // NEW
  });

  $effect(() => {
    if (particlesMaterial)
      particlesMaterial.uniforms.uAmbientMovement.value = movementDistance;
  });
  $effect(() => {
    if (particlesMaterial)
      particlesMaterial.uniforms.uCursorSize.value = cursorSize;
  });
  $effect(() => {
    if (particlesMaterial)
      particlesMaterial.uniforms.uPulse.value = pulse ? 1.0 : 0.0;
  });
  $effect(() => {
    if (particlesMaterial)
      particlesMaterial.uniforms.uNycTop.value.set(nycColorTop);
  });
  $effect(() => {
    if (particlesMaterial)
      particlesMaterial.uniforms.uNycBottom.value.set(nycColorBottom);
  });
  $effect(() => {
    if (particlesMaterial)
      particlesMaterial.uniforms.uAmsTop.value.set(amsColorTop);
  });
  $effect(() => {
    if (particlesMaterial)
      particlesMaterial.uniforms.uAmsBottom.value.set(amsColorBottom);

    // Keep location marker updated if props change
    if (locationMaterial)
      locationMaterial.uniforms.uColorNycMarker.value.set(amsColorBottom);
  });

  $effect(() => {
    if (particlesMaterial)
      particlesMaterial.uniforms.uNycBottom.value.set(nycColorBottom);

    // Keep location marker updated if props change
    if (locationMaterial)
      locationMaterial.uniforms.uColorAmsMarker.value.set(nycColorBottom);
  });

  // NEW: React to stroke prop changes
  $effect(() => {
    if (locationMaterial) {
      locationMaterial.uniforms.uHasStroke.value = hasStroke ? 1.0 : 0.0;
      locationMaterial.uniforms.uMarkerSize.value = markerSize; // NEW: React to size changes
    }
  });

  $effect(() => {
    if (particlesMaterial)
      particlesMaterial.uniforms.uScrollSpread.value = scrollSpread;
  });

  $effect(() => {
    targetTransition = city === "ams" ? 1.0 : 0.0;
  });

  function onWindowResize() {
    viewportWidth = window.innerWidth; // keep responsive markerSize in sync
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateCameraDistance();
  }

  function updateCameraDistance() {
    if (!camera || !renderer) return;
    const windowAspect = window.innerWidth / window.innerHeight;
    const mapW = 30;
    const mapH = 30 * maxAspect;
    const neededHeight = Math.max(mapH, mapW / windowAspect);
    const margin = 1.15;
    const fovRad = (camera.fov * Math.PI) / 180;
    camera.position.z = (neededHeight * margin) / (2 * Math.tan(fovRad / 2));
    camera.position.y = 0;
  }

  function onKeyDown(event) {
    if (event.code === "Space") {
      event.preventDefault();
      targetTransition = targetTransition === 0.0 ? 1.0 : 0.0;
    }
  }

  function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0) {
      targetMouseWorld.x = intersects[0].point.x;
      targetMouseWorld.y = intersects[0].point.y;
    }
  }

  function onMouseLeave() {
    targetMouseWorld.set(9999, 9999);
  }

  function onScroll() {
    if (!scrollFade) return;
    // Fully spread/faded after `scrollFadeDistance` viewports of scrolling.
    const denom = window.innerHeight * scrollFadeDistance || 1;
    targetScroll = Math.min(Math.max(window.scrollY / denom, 0), 1);
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    if (container) {
      prevMouseWorld.copy(mouseWorld);
      mouseWorld.lerp(targetMouseWorld, 0.08);
      mouseVelocity.subVectors(mouseWorld, prevMouseWorld);
    }

    // 1. PARTICLES: Strong ease-out
    let diff = targetTransition - currentTransition;
    let particleEase = 0.03 + Math.abs(diff) * 0.12;
    currentTransition += diff * particleEase;

    // 2. MARKER: Slower ease-out so it trails behind and lands after the particles
    let markerDiff = targetTransition - currentMarkerTransition;
    let markerEase = 0.015 + Math.abs(markerDiff) * 0.06; // CHANGED: Lowered the base speed and multiplier
    currentMarkerTransition += markerDiff * markerEase;

    currentIntro += (targetIntro - currentIntro) * 0.04;

    // Smoothly ease the scroll spread/fade toward its target
    currentScroll += (targetScroll - currentScroll) * 0.1;

    if (particlesMaterial) {
      particlesMaterial.uniforms.uTime.value += 0.01;
      particlesMaterial.uniforms.uMouse.value.copy(mouseWorld);
      particlesMaterial.uniforms.uMouseVelocity.value.copy(mouseVelocity);
      particlesMaterial.uniforms.uTransition.value = currentTransition;
      particlesMaterial.uniforms.uIntroProgress.value = currentIntro;
      particlesMaterial.uniforms.uScroll.value = currentScroll;
    }

    if (locationMaterial) {
      locationMaterial.uniforms.uTime.value += 0.02;
      locationMaterial.uniforms.uMarkerTransition.value =
        currentMarkerTransition; // Pass the separate slower value
      locationMaterial.uniforms.uIntroProgress.value = currentIntro;
      locationMaterial.uniforms.uScroll.value = currentScroll;
    }

    renderer.render(scene, camera);
  }

  export function setLive(key, value) {
    if (!particlesMaterial?.uniforms[key]) return;
    const u = particlesMaterial.uniforms[key].value;
    if (u && typeof u.set === "function" && typeof value === "string")
      u.set(value);
    else particlesMaterial.uniforms[key].value = value;
  }
</script>

<div bind:this={container} class="particle-map-container"></div>

<style>
  .particle-map-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 0;
    background-color: #ffffff;
    overflow: hidden;
    /* CSS fade removed entirely, handled in shader */
  }
</style>
