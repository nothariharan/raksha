/**
 * End-to-end test of VisionFireworksExtractor with .env.local credentials.
 */
import { loadEnv } from "../packages/shared/dist/env.js";
import { VisionFireworksExtractor } from "../services/core/dist/extraction/vision-fireworks.js";

loadEnv(process.cwd());

const imgRes = await fetch(
  "https://storage.googleapis.com/fireworks-public/image_assets/fireworks-ai-wordmark-color-dark.png"
);
const b64 = Buffer.from(await imgRes.arrayBuffer()).toString("base64");

const result = await VisionFireworksExtractor.extract({
  modality: "image",
  content: b64,
  sourceId: "smoke#1",
  language: "en",
});

console.log(
  JSON.stringify(
    {
      source: result.source,
      readable: result.readable,
      warning: result.warning || null,
      summary: result.candidate.narrative,
      amount: result.candidate.amount ?? null,
      utr: result.candidate.transactionId ?? null,
      model: process.env.FIREWORKS_VISION_MODEL,
      hasKey: !!(process.env.FIREWORKS_API_KEY && !process.env.FIREWORKS_API_KEY.startsWith("synthetic")),
    },
    null,
    2
  )
);

if (result.source !== "fireworks") {
  console.error("EXPECTED_FIREWORKS_SOURCE");
  process.exit(2);
}
console.log("VISION_EXTRACTOR_OK");
