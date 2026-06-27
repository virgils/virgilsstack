# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.16.1 create --template minimal --types ts --install npm virgils
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> Deployed to Cloudflare Workers via `@sveltejs/adapter-cloudflare` (see `wrangler.jsonc`).

## Scripts

| Script | Command | What it does |
| --- | --- | --- |
| `dev` | `vite dev` | Start the dev server. |
| `build` | `vite build` | Production build. |
| `preview` | `vite preview` | Preview the production build locally. |
| `media` | `node scripts/process-media.js` | Update media metadata in `projects.json` + `placeholders.json` (see below). |
| `optimize` | `node scripts/optimize-media.js` | Transcode source files in `static/` to web formats (see below). |

### Dev server flags

```sh
npm run dev -- --open      # open a browser tab automatically
npm run dev -- --host      # expose on your local network
npm run dev -- --port 3000 # use a specific port
```

### `npm run media` — ratios + placeholders

Walks every image/video referenced in `src/lib/projects.json` (keys: `media`,
`media2`, `leftMedia`, `rightMedia`, `poster`) and, in one pass:

1. **Aspect ratios** — measures each file (sharp for images, ffprobe for
   videos) and writes a CSS-ready `<key>Ratio`, e.g. `"mediaRatio": "1600 / 900"`,
   used to reserve space and avoid layout shift.
2. **Placeholders** — generates a tiny blurred LQIP (≤100px, aspect ratio
   preserved; videos use their first frame) as a base64 data URI in
   `src/lib/placeholders.json`, keyed by media path. Components show it as a
   blurred backdrop while the real media lazy-loads and fades in.

```sh
npm run media                 # ratios recomputed; placeholders cached (incremental)
npm run media -- --overwrite  # also regenerate every placeholder from scratch
```

Run it whenever you add or change media. Requires `ffmpeg` on your PATH for videos.

### `npm run optimize` — transcode source media

Compresses the actual files in `static/` for delivery (does **not** edit
`projects.json`):

- `.jpg` / `.jpeg` / `.png` → `.webp` (quality 80)
- `.mp4` → `.webm` (VP9, CRF 30, ~80% of the source bitrate, original width)

New files are written next to the originals; already-converted files are skipped.

```sh
npm run optimize                 # skip files already converted
npm run optimize -- --overwrite  # re-encode everything
```

Requires `ffmpeg` on your PATH for video conversion.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
