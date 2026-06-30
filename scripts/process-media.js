import fs from "fs";
import os from "os";
import path from "path";
import util from "util";
import { exec } from "child_process";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffprobeStatic from "ffprobe-static";

// One pass over projects.json that does two things for every referenced image
// and video:
//   1. Measures its dimensions and writes a CSS-ready `<key>Ratio` next to the
//      media key (e.g. mediaRatio: "1600 / 900").  →  src/lib/projects.json
//   2. Generates a tiny blurred LQIP placeholder (base64), keyed by media path.
//      →  src/lib/placeholders.json
//
// (Replaces the old `ratios` + `thumbs` scripts.)
//
// Run with:  npm run media
//   --overwrite        regenerate placeholders even if they already exist
//                      (ratios are always recomputed; placeholders are cached)
//   [folder]           limit the run to media under a folder (relative to
//                      /static), e.g.  npm run media -- projects/cracked
//                      In folder mode, placeholders for other folders are kept
//                      (a full run prunes placeholders no longer referenced).

const execPromise = util.promisify(exec);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const JSON_PATH = path.join(process.cwd(), "src", "lib", "projects.json");
const OUT_PATH = path.join(process.cwd(), "src", "lib", "placeholders.json");
const STATIC_DIR = path.join(process.cwd(), "static");

const MEDIA_KEYS = [
  "heroMedia",
  "media",
  "media2",
  "leftMedia",
  "rightMedia",
  "poster",
];
const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const VIDEO_EXT = [".mp4", ".webm", ".mov"];

const MAX = 100; // placeholder longest side (px); aspect ratio preserved
const forceOverwrite = process.argv.includes("--overwrite");

// Optional positional folder filter (first non-flag arg), e.g. "projects/cracked".
// A leading "static/" and surrounding slashes are tolerated.
const folderArg = process.argv.slice(2).find((a) => !a.startsWith("-"));
const targetFolder = folderArg
  ? folderArg.replace(/^\/+|\/+$/g, "").replace(/^static\//, "")
  : null;
function inTarget(mediaPath) {
  if (!targetFolder) return true;
  const clean = mediaPath.split("?")[0].replace(/^\/+/, "");
  return clean === targetFolder || clean.startsWith(`${targetFolder}/`);
}

const existing = fs.existsSync(OUT_PATH)
  ? JSON.parse(fs.readFileSync(OUT_PATH, "utf8"))
  : {};
const placeholders = {}; // src -> data URI (deduped)
const stats = { ratios: 0, made: 0, reused: 0, missing: 0 };

// --- dimensions ---------------------------------------------------------
async function videoDims(filePath) {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err, meta) => {
      if (err) return resolve(null);
      const s = meta.streams.find((x) => x.codec_type === "video");
      resolve(s ? { width: s.width, height: s.height } : null);
    });
  });
}

// --- placeholders -------------------------------------------------------
async function imagePlaceholder(buf) {
  const out = await sharp(buf)
    .resize(MAX, MAX, { fit: "inside", withoutEnlargement: true })
    .blur(3)
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${out.toString("base64")}`;
}

async function videoPlaceholder(filePath) {
  const tmp = path.join(
    os.tmpdir(),
    `lqip-${process.pid}-${Math.random().toString(36).slice(2)}.png`,
  );
  try {
    await execPromise(
      `ffmpeg -y -loglevel error -ss 0.1 -i "${filePath}" -frames:v 1 "${tmp}"`,
    );
    return await imagePlaceholder(fs.readFileSync(tmp));
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}

// --- traversal ----------------------------------------------------------
async function processObject(obj) {
  if (Array.isArray(obj)) {
    for (const item of obj) await processObject(item);
    return;
  }
  if (!obj || typeof obj !== "object") return;

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === "object") {
      await processObject(val);
      continue;
    }
    if (!MEDIA_KEYS.includes(key) || typeof val !== "string") continue;
    if (!inTarget(val)) continue;

    const ext = path.extname(val.split("?")[0]).toLowerCase();
    const isImage = IMAGE_EXT.includes(ext);
    const isVideo = VIDEO_EXT.includes(ext);
    if (!isImage && !isVideo) continue;

    const filePath = path.join(STATIC_DIR, val.split("?")[0].replace(/^\/+/, ""));
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Not found: ${val}`);
      stats.missing++;
      continue;
    }

    // Read image bytes once (reused for dims + placeholder).
    const buf = isImage ? fs.readFileSync(filePath) : null;

    // 1. Ratio (always recomputed)
    const dims = isImage
      ? await sharp(buf).metadata()
      : await videoDims(filePath);
    if (dims && dims.width && dims.height) {
      obj[`${key}Ratio`] = `${dims.width} / ${dims.height}`;
      stats.ratios++;
    }

    // 2. Placeholder (deduped by path, cached unless --overwrite)
    if (!placeholders[val]) {
      if (!forceOverwrite && existing[val]) {
        placeholders[val] = existing[val];
        stats.reused++;
      } else {
        try {
          placeholders[val] = isImage
            ? await imagePlaceholder(buf)
            : await videoPlaceholder(filePath);
          stats.made++;
          console.log(`✅ ${val}`);
        } catch (e) {
          console.error(`❌ ${val}: ${e.message}`);
          stats.missing++;
        }
      }
    }
  }
}

async function run() {
  console.log(
    targetFolder
      ? `Processing media under "${targetFolder}"…\n`
      : "Processing media in projects.json…\n",
  );
  const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

  await processObject(data);

  // projects.json with fresh ratios
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");

  // placeholders.json, keys sorted for stable diffs. A full run writes only
  // what it processed (so unreferenced entries are pruned); a folder-scoped run
  // merges over the existing file so other folders' placeholders are retained.
  const merged = targetFolder ? { ...existing, ...placeholders } : placeholders;
  const sorted = Object.fromEntries(
    Object.keys(merged)
      .sort()
      .map((k) => [k, merged[k]]),
  );
  fs.writeFileSync(OUT_PATH, JSON.stringify(sorted, null, 2) + "\n", "utf8");

  console.log(
    `\n🎉 Done — ${stats.ratios} ratios written; placeholders: ${stats.made} generated, ${stats.reused} reused, ${stats.missing} skipped (${
      Object.keys(sorted).length
    } total).`,
  );
}

run();
