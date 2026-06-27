/**
 * `use:lazyMedia={src}` — lazy-loads an <img> or <video> and fades it in.
 *
 * Holds off setting `src` until the element is just about to scroll into view,
 * then assigns it; once the media loads, adds the `is-loaded` class so it fades
 * in over the blurred placeholder backdrop (src/lib/placeholders.json). The
 * small rootMargin means loading begins right around the viewport edge, so the
 * fade is visible as the element scrolls in rather than completing off-screen.
 */
export function lazyMedia(
  node: HTMLImageElement | HTMLVideoElement,
  src: string,
) {
  let current = src;
  const isVideo = node.tagName === "VIDEO";
  const loadEvent = isVideo ? "loadeddata" : "load";

  // Mark the frame (parent) as loaded — its CSS fades the media in and the
  // blurred placeholder backdrop out (so it doesn't show through transparent PNGs).
  const onLoaded = () => (node.parentElement ?? node).classList.add("is-loaded");
  node.addEventListener(loadEvent, onLoaded);

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && current) {
        node.src = current;
        if (isVideo) (node as HTMLVideoElement).load();
        // If it was already cached and decoded, the load event may not fire —
        // reveal immediately in that case.
        if (!isVideo && (node as HTMLImageElement).complete) onLoaded();
        observer.unobserve(node);
      }
    },
    { rootMargin: "100px" },
  );
  observer.observe(node);

  return {
    update(next: string) {
      current = next;
    },
    destroy() {
      observer.disconnect();
      node.removeEventListener(loadEvent, onLoaded);
    },
  };
}
