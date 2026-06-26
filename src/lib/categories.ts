export interface Category {
  /** Text shown in the nav. */
  label: string;
  /** Matches a project's `tags` entry in projects.json (and the ?category= URL). */
  tag: string;
}

// Categories rendered in the nav, next to About. Clicking one filters the
// homepage to projects whose `tags` array includes its `tag`.
//
// Fully configurable — edit/reorder/rename freely. For a film producer this
// might be:
//   { label: "Commercials", tag: "commercials" },
//   { label: "Features",    tag: "features" },
//   { label: "Shorts",      tag: "shorts" },
// An empty array shows no category links (nav looks unchanged).
export const categories: Category[] = [];

// { label: "Brand", tag: "brand" },
// { label: "Product", tag: "product" },
// { label: "Interactive", tag: "interactive" },
