// Site-wide effect settings.
export type RevealMode = "wipe" | "fadein";

// How `.reveal` elements appear when scrolled into view (see the `reveal`
// action and the .reveal styles in app.css):
//   "wipe"   — a cover slides away (right → left)
//   "fadein" — the element fades in
export const reveal: RevealMode = "wipe";

// Toggles for the homepage scroll effects. Flip to false to disable.
export const ENABLE_TILT = true; // media tilt — scroll-speed + cursor-directional
export const ENABLE_PARALLAX = true; // per-column parallax drift
