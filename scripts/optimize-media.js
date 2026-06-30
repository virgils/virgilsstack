import fs from "fs";
import path from "path";
import util from "util";
import { exec } from "child_process";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffprobeStatic from "ffprobe-static";

const execPromise = util.promisify(exec);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const JSON_PATH = path.join(process.cwd(), "src", "lib", "projects.json");
const STATIC_DIR = path.join(process.cwd(), "static");

// NEW: Check for overwrite flag
const forceOverwrite = process.argv.includes("--overwrite");

// Optional positional folder filter (first non-flag arg), e.g. "projects/cracked".
// Limits the run to media under that folder (relative to /static); a leading
// "static/" and surrounding slashes are tolerated.
//   npm run optimize -- projects/cracked
const folderArg = process.argv.slice(2).find((a) => !a.startsWith("-"));
const targetFolder = folderArg
  ? folderArg.replace(/^\/+|\/+$/g, "").replace(/^static\//, "")
  : null;
function inTarget(mediaPath) {
  if (!targetFolder) return true;
  const clean = mediaPath.split("?")[0].replace(/^\/+/, "");
  return clean === targetFolder || clean.startsWith(`${targetFolder}/`);
}

// Keep track of processed files to avoid duplicating work
// since 'media' and 'heroMedia' sometimes point to the same file
const processedFiles = new Set();

// CHANGED: Now fetches both width and the actual source bitrate
async function getVideoMetadata(filePath) {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return resolve({ width: 500, bitrateK: 500 });

      const stream = metadata.streams.find((s) => s.codec_type === "video");
      const width = stream && stream.width ? stream.width : 500;

      // Calculate original bitrate in bps
      let originalBitrate = 0;
      if (metadata.format && metadata.format.bit_rate) {
        originalBitrate = parseInt(metadata.format.bit_rate, 10);
      } else if (stream && stream.bit_rate) {
        originalBitrate = parseInt(stream.bit_rate, 10);
      } else if (
        metadata.format &&
        metadata.format.size &&
        metadata.format.duration
      ) {
        // Fallback calculation: (size in bits) / duration
        originalBitrate =
          (parseInt(metadata.format.size, 10) * 8) /
          parseFloat(metadata.format.duration);
      }

      // Convert to kbps
      let bitrateK = originalBitrate
        ? Math.floor(originalBitrate / 1000)
        : width;

      // Target 80% of the original bitrate, ensuring WebM is smaller but retains quality
      let targetBitrateK = Math.max(100, Math.floor(bitrateK * 0.8));

      resolve({ width, bitrateK: targetBitrateK });
    });
  });
}

async function processObject(obj) {
  const mediaKeys = [
    "heroMedia",
    "media",
    "media2",
    "leftMedia",
    "rightMedia",
    "poster",
  ];

  if (Array.isArray(obj)) {
    for (const item of obj) await processObject(item);
  } else if (typeof obj === "object" && obj !== null) {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === "object") {
        await processObject(obj[key]);
      } else if (mediaKeys.includes(key) && typeof obj[key] === "string") {
        const fileUrl = obj[key];
        if (!inTarget(fileUrl)) continue;
        const cleanPath = fileUrl.split("?")[0].replace(/^\/+/, "");
        const filePath = path.join(STATIC_DIR, cleanPath);

        if (!fs.existsSync(filePath) || processedFiles.has(filePath)) continue;
        processedFiles.add(filePath);

        const ext = path.extname(filePath).toLowerCase();

        // --- PROCESS IMAGES TO WEBP ---
        if ([".jpg", ".jpeg", ".png"].includes(ext)) {
          const targetPath = filePath.replace(new RegExp(`${ext}$`), ".webp");

          // CHANGED: Added forceOverwrite condition
          if (!fs.existsSync(targetPath) || forceOverwrite) {
            console.log(`🖼️  Converting to WebP: ${path.basename(filePath)}`);
            try {
              await sharp(filePath).webp({ quality: 80 }).toFile(targetPath);
              console.log(`   ✅ Created ${path.basename(targetPath)}`);
            } catch (e) {
              console.error(`   ❌ Failed to convert ${filePath}:`, e.message);
            }
          }
        }

        // --- PROCESS VIDEOS TO WEBM ---
        else if (ext === ".mp4") {
          const targetPath = filePath.replace(/\.mp4$/i, ".webm");

          // CHANGED: Added forceOverwrite condition
          if (!fs.existsSync(targetPath) || forceOverwrite) {
            console.log(`🎥 Converting to WebM: ${path.basename(filePath)}`);
            try {
              const meta = await getVideoMetadata(filePath);

              // CHANGED: Added -y right after ffmpeg to force overwrite without prompting
              //const command = `ffmpeg -y -loglevel error -i "${filePath}" -vf "scale=${meta.width}:-2" -c:v libvpx-vp9 -b:v ${meta.bitrateK}k -row-mt 1 -threads 8 -c:a libopus -b:a 64k "${targetPath}"`;
              const command = `ffmpeg -y -loglevel error -i "${filePath}" -vf "scale=${meta.width}:-2" -c:v libvpx-vp9 -crf 30 -b:v ${meta.bitrateK}k -row-mt 1 -threads 8 -c:a libopus -b:a 64k "${targetPath}"`;
              console.log(
                `   ⏳ Running: ffmpeg scale=${meta.width} & target bitrate=${meta.bitrateK}k...`,
              );
              await execPromise(command);
              console.log(`   ✅ Created ${path.basename(targetPath)}`);
            } catch (e) {
              console.error(
                `   ❌ Failed to convert video ${filePath}:`,
                e.message,
              );
            }
          }
        }
      }
    }
  }
}

async function run() {
  console.log(
    targetFolder
      ? `Scanning projects.json for media under "${targetFolder}"...\n`
      : "Scanning projects.json for media optimization...\n",
  );
  const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

  await processObject(data);

  console.log("\n🎉 Finished optimizing all media!");
}

run();
