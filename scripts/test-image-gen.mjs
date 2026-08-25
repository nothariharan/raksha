import path from "node:path";
import fs from "node:fs";

async function main() {
  const { generateImage } = await import("file:///C:/Users/HARIHARAN/playwright-image-gen/generate.mjs");
  const outputDir = path.join(process.cwd(), "apps", "web", "public", "images");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const promptCall = "2D editorial cartoon illustration, modern Indian graphic art style. A young Indian teenager in a casual purple hoodie sitting at a clean desk, holding a smartphone to his ear with an attentive, focused expression. Minimalist room with soft warm lighting, computer monitor in background, clean rounded shapes, gentle hand-drawn texture, flat color shading with warm beige and orange tones. Negative space around the character. Non-photorealistic, no 3D, no glossy CGI, high quality editorial magazine art.";

  console.log("Generating call-character.png via playwright image-gen...");
  const outputPath = path.join(outputDir, "call-character.png");
  try {
    const res = await generateImage(promptCall, outputPath, {
      transparent: false,
    });
    console.log("Result:", res);
  } catch (err) {
    console.error("Image generation error:", err.message);
  }
}

main();
