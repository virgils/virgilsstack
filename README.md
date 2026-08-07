# Virgil's Stack

Portfolio site for Virgil — creative developer. Built with SvelteKit 2, Svelte 5 (runes), and TypeScript.

## Stack

- **Framework:** [SvelteKit](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/)
- **Build:** Vite
- **Deploy:** Cloudflare Workers (default) or Node (Porter.run)
- **Media tooling:** sharp, ffmpeg

## Getting started

```sh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Useful dev flags:

```sh
npm run dev -- --open      # open a browser tab automatically
npm run dev -- --host      # expose on your local network
npm run dev -- --port 3000 # use a specific port
```

## Building

```sh
npm run build
npm run preview   # preview the production build locally
```

### Deployment

Set `SVELTEKIT_ADAPTER` at build time:

| Target | Adapter | Start command |
| --- | --- | --- |
| Cloudflare Workers (default) | `cloudflare` | — (Wrangler serves the worker) |
| Porter.run | `node` | `npm start` → `node build/index.js` |

**Porter.run checklist:**

- Build command: `npm run build`
- Start command: `npm start`
- Build env var: `SVELTEKIT_ADAPTER=node`

**Cloudflare:** config lives in `wrangler.jsonc`. Deploy with Wrangler after `npm run build`.

## Project structure

```
src/
  app.css              Global styles, reveal animations, design tokens
  lib/
    projects.json      All projects + case-study sections (content source)
    placeholders.json  Blurred LQIP placeholders (auto-generated)
    categories.ts      Homepage category filter links
    effects.ts         Site-wide effect toggles (reveal mode, tilt, parallax)
    actions/
      lazyMedia.ts     Lazy-load + fade-in for images and video
      reveal.ts        In-view reveal for {@html} content
    components/
      home/            Hero, ProjectGrid, ProjectCard
      work/            Case-study section components
      layout/          LogoAnimation, Footer
      about/           ParticleMap
  routes/
    +page.svelte       Homepage (hero + project grid)
    about/             About page
    work/[slug]/       Individual case studies
static/
  projects/            Project media (images, video)
  images/              Site assets (share image, icons)
scripts/
  process-media.js     Ratios + placeholders (`npm run media`)
  optimize-media.js    Transcode source files (`npm run optimize`)
```

## Content

### Projects

All project data lives in `src/lib/projects.json`. Each entry drives both the homepage card and its case-study page at `/work/<slug>`.

Key fields:

| Field | Purpose |
| --- | --- |
| `slug` | URL path (`/work/google-io-machine-learning`) |
| `client`, `project`, `year` | Card + page titles |
| `tags` | Category filtering (see below) |
| `media`, `mediaType` | Homepage thumbnail (image or autoplay video) |
| `description` | Case-study intro text |
| `sections` | Ordered blocks: `intro`, `heading`, `text`, `wide-media`, `side-by-side`, `gallery`, `quote` |
| `blocked` | Set to e.g. `"NDA"` to gray out the card and disable its link |
| `externalUrl` | Link the card out instead of to the case study |

Ratio fields (`mediaRatio`, `posterRatio`, etc.) are written automatically by `npm run media` — don't edit them by hand.

A [Pages CMS](https://pagescms.org/) schema is included in `.pages.yml` for editing `projects.json` and uploading media to `static/projects/`.

### Categories

Edit `src/lib/categories.ts` to add nav filter links. Each category maps a label to a `tag` that matches entries in a project's `tags` array:

```ts
export const categories: Category[] = [
  { label: "Product", tag: "product" },
  { label: "Interactive", tag: "interactive" },
];
```

An empty array hides category links entirely.

### Effects

Toggle site-wide behavior in `src/lib/effects.ts`:

| Setting | Default | What it does |
| --- | --- | --- |
| `reveal` | `"wipe"` | How elements appear on scroll: `"wipe"` (cover slides away) or `"fadein"` |
| `ENABLE_TILT` | `true` | Scroll-speed + cursor-directional tilt on homepage media |
| `ENABLE_PARALLAX` | `true` | Per-column parallax drift on the project grid |

Both tilt and parallax respect `prefers-reduced-motion`.

### In-view text reveals

Mark text in any `{@html}` field with:

```html
<span class='reveal'>Machine Learning</span>
```

Attach `use:reveal` to a container holding such spans (see `src/lib/actions/reveal.ts`). Styles live in `src/app.css`.

## Scripts

| Script | Command | What it does |
| --- | --- | --- |
| `dev` | `vite dev` | Start the dev server |
| `build` | `vite build` | Production build |
| `start` | `node build/index.js` | Run the Node adapter build |
| `preview` | `vite preview` | Preview the production build locally |
| `media` | `node scripts/process-media.js` | Update ratios + placeholders |
| `optimize` | `node scripts/optimize-media.js` | Transcode source media to web formats |

### `npm run media` — ratios + placeholders

Walks every image/video referenced in `src/lib/projects.json` (keys: `heroMedia`, `media`, `media2`, `leftMedia`, `rightMedia`, `poster`) and, in one pass:

1. **Aspect ratios** — measures each file (sharp for images, ffprobe for videos) and writes a CSS-ready `<key>Ratio`, e.g. `"mediaRatio": "1600 / 900"`, used to reserve space and avoid layout shift.
2. **Placeholders** — generates a tiny blurred LQIP (≤100px, aspect ratio preserved; videos use their first frame) as a base64 data URI in `src/lib/placeholders.json`, keyed by media path. Components show it as a blurred backdrop while the real media lazy-loads and fades in.

```sh
npm run media                                    # ratios recomputed; placeholders cached (incremental)
npm run media -- --overwrite                     # also regenerate every placeholder from scratch
npm run media -- projects/cracked                # only media under that folder
npm run media -- --overwrite projects/cracked    # combine: scope + force
```

The optional folder argument (relative to `static/`; a leading `static/` is tolerated) limits the run to media whose path lives under it — handy when you add a single project. In folder mode the other folders' placeholders are kept; a full run prunes placeholders that are no longer referenced.

Run it whenever you add or change media. Requires `ffmpeg` on your PATH for videos.

### `npm run optimize` — transcode source media

Compresses the actual files in `static/` for delivery (does **not** edit `projects.json`):

- `.jpg` / `.jpeg` / `.png` → `.webp` (quality 80)
- `.mp4` → `.webm` (VP9, CRF 30, ~80% of the source bitrate, original width)

New files are written next to the originals; already-converted files are skipped.

```sh
npm run optimize                                    # skip files already converted
npm run optimize -- --overwrite                     # re-encode everything
npm run optimize -- projects/cracked                # only media under that folder
npm run optimize -- --overwrite projects/cracked    # combine: scope + force
```

The optional folder argument works the same as for `npm run media` (relative to `static/`, leading `static/` tolerated).

Requires `ffmpeg` on your PATH for video conversion.

### Typical media workflow

1. Drop source files into `static/projects/<slug>/`
2. Reference them in `projects.json`
3. `npm run optimize` — transcode to web-friendly formats
4. Update `projects.json` paths if file extensions changed (`.webp`, `.webm`)
5. `npm run media` — compute ratios and generate placeholders
