import fs from "fs";
import path from "path";
import sizeOf from "image-size";
import ffmpeg from "fluent-ffmpeg";
import ffprobeStatic from "ffprobe-static";

// Set the path to the ffprobe binary
ffmpeg.setFfprobePath(ffprobeStatic.path);

const JSON_PATH = path.join(process.cwd(), "src", "lib", "projects.json");
const STATIC_DIR = path.join(process.cwd(), "static");

// Helper to get video dimensions
async function getVideoDims(filePath) {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return resolve(null);
      const stream = metadata.streams.find((s) => s.codec_type === "video");
      if (stream) resolve({ width: stream.width, height: stream.height });
      else resolve(null);
    });
  });
}

// Recursively process the JSON object
async function processObject(obj) {
  // Keys in your JSON that contain file paths
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

        // Remove query parameters and any leading slashes to prevent absolute path issues
        const cleanPath = fileUrl.split("?")[0].replace(/^\/+/, "");
        const filePath = path.join(STATIC_DIR, cleanPath);

        if (fs.existsSync(filePath)) {
          const ext = path.extname(filePath).toLowerCase();
          let dims = null;

          if ([".mp4", ".webm", ".mov"].includes(ext)) {
            dims = await getVideoDims(filePath);
          } else {
            try {
              // Read the file natively first, then pass the Buffer to image-size
              const imageBuffer = fs.readFileSync(filePath);
              dims = sizeOf(imageBuffer);
            } catch (e) {
              console.error(
                `❌ Failed to read image ${filePath}: ${e.message}`,
              );
            }
          }

          if (dims && dims.height > 0) {
            const ratioKey = key + "Ratio";
            // CHANGED: Write it as a CSS-ready string instead of a decimal
            obj[ratioKey] = `${dims.width} / ${dims.height}`;
            console.log(`✅ Measured ${fileUrl} -> ${obj[ratioKey]}`);
          }
        } else {
          console.warn(`⚠️ File not found: ${filePath}`);
        }
      }
    }
  }
}

async function run() {
  console.log("Reading projects.json...");
  const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

  await processObject(data);

  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), "utf8");
  console.log("\n🎉 Successfully updated projects.json with media ratios!");
}

run();
