// Site-wide effect settings.

export type RevealMode = "wipe" | "fadein";

// How `.reveal` elements appear when scrolled into view (see the `reveal`
// action and the .reveal styles in app.css):
//   "wipe"   — a cover slides away (right → left)
//   "fadein" — the element fades in
export const reveal: RevealMode = "wipe";
