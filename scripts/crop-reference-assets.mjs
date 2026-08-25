/**
 * Extracts and crops exact high-res hero assets and the Samarkan wordmark
 * from the reference images into apps/web/public/images/
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PNG } = require("C:/Users/HARIHARAN/playwright-image-gen/node_modules/pngjs");

const outDir = path.join(process.cwd(), "apps", "web", "public", "images");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Process Wordmark
const img0Path = "C:/Users/HARIHARAN/.gemini/antigravity-cli/brain/a9bc5800-8b4b-4c58-9ab2-1af19034e1a4/.user_uploaded/uploaded_media_0_1787623236649.png";
const img0Data = fs.readFileSync(img0Path);
const png0 = PNG.sync.read(img0Data);

// Make white background transparent
const wordmarkPng = new PNG({ width: png0.width, height: png0.height });
for (let y = 0; y < png0.height; y++) {
  for (let x = 0; x < png0.width; x++) {
    const idx = (png0.width * y + x) << 2;
    const r = png0.data[idx];
    const g = png0.data[idx + 1];
    const b = png0.data[idx + 2];
    const a = png0.data[idx + 3];

    const isWhite = r > 240 && g > 240 && b > 240;
    wordmarkPng.data[idx] = r;
    wordmarkPng.data[idx + 1] = g;
    wordmarkPng.data[idx + 2] = b;
    wordmarkPng.data[idx + 3] = isWhite ? 0 : a;
  }
}
fs.writeFileSync(path.join(outDir, "raksha-wordmark.png"), PNG.sync.write(wordmarkPng));
console.log("  ✓ Created apps/web/public/images/raksha-wordmark.png");

// 2. Process 3 Hero Sections from image 1 (1536 x 1024)
const img1Path = "C:/Users/HARIHARAN/.gemini/antigravity-cli/brain/a9bc5800-8b4b-4c58-9ab2-1af19034e1a4/.user_uploaded/uploaded_media_1_1787623236649.png";
const img1Data = fs.readFileSync(img1Path);
const png1 = PNG.sync.read(img1Data);

function crop(src, x, y, width, height) {
  const dest = new PNG({ width, height });
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      const srcIdx = (src.width * (y + dy) + (x + dx)) << 2;
      const destIdx = (width * dy + dx) << 2;
      dest.data[destIdx] = src.data[srcIdx];
      dest.data[destIdx + 1] = src.data[srcIdx + 1];
      dest.data[destIdx + 2] = src.data[srcIdx + 2];
      dest.data[destIdx + 3] = src.data[srcIdx + 3];
    }
  }
  return dest;
}

// 3 full banners (1536 x 341 each)
const banner1 = crop(png1, 0, 0, 1536, 341);
const banner2 = crop(png1, 0, 341, 1536, 341);
const banner3 = crop(png1, 0, 682, 1536, 342);

fs.writeFileSync(path.join(outDir, "hero-banner-call.png"), PNG.sync.write(banner1));
fs.writeFileSync(path.join(outDir, "hero-banner-whatsapp.png"), PNG.sync.write(banner2));
fs.writeFileSync(path.join(outDir, "hero-banner-web.png"), PNG.sync.write(banner3));
console.log("  ✓ Created hero-banner-call.png, hero-banner-whatsapp.png, hero-banner-web.png");

// Center illustrations (focusing on the character artwork)
// Center region is roughly x=500, y=50, width=540, height=260 in each panel
const center1 = crop(png1, 480, 40, 560, 260);
const center2 = crop(png1, 480, 380, 560, 260);
const center3 = crop(png1, 480, 720, 560, 260);

fs.writeFileSync(path.join(outDir, "hero-illustration-call.png"), PNG.sync.write(center1));
fs.writeFileSync(path.join(outDir, "hero-illustration-whatsapp.png"), PNG.sync.write(center2));
fs.writeFileSync(path.join(outDir, "hero-illustration-web.png"), PNG.sync.write(center3));
console.log("  ✓ Created hero-illustration-call.png, hero-illustration-whatsapp.png, hero-illustration-web.png");
