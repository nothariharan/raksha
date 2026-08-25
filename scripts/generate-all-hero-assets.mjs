/**
 * Sequentially generates the 3 canonical Raksha hero character illustrations
 * via the Playwright ChatGPT Image-Gen MCP.
 */

import path from "node:path";
import fs from "node:fs";

async function main() {
  const { generateImage } = await import("file:///C:/Users/HARIHARAN/playwright-image-gen/generate.mjs");
  const outputDir = path.join(process.cwd(), "apps", "web", "public", "images", "raksha");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const prompt1 = "Create a clean modern Indian editorial cartoon illustration for a public-service emergency product called Raksha. Show a young Indian teenager / young adult who has just realized they have been scammed and is urgently calling for help. He is sitting at a simple home desk, holding a smartphone to his ear, visibly worried and slightly panicked, with an expressive cartoon face and an immediate sense of urgency. A laptop or gaming screen can be visible in the background with a generic suspicious payment/fraud context, but do not make it visually complicated. The character should have simplified cartoon anatomy, rounded shapes, expressive eyes and hands, clean hand-drawn outlines, flat 2D color blocks, very light shading and subtle paper texture. The environment should feel like an ordinary contemporary Indian home. Warm beige, muted orange and soft neutral colors. Sophisticated editorial magazine cartoon. Clearly illustrated and cartoony, not anime, not manga, not realistic, not 3D, not Pixar, not cinematic, not glossy CGI, not hyper-realistic. The emotional storytelling is the priority: the viewer should immediately understand that the young person has experienced a scam and is calling Raksha for help. Wide horizontal composition, central character, generous negative space around the character, suitable for a modern web hero image.";

  const prompt2 = "Create the second illustration in the exact same modern Indian editorial cartoon style as the previous Raksha hero artwork. Show an elderly Indian woman, around 65 to 80 years old, sitting comfortably in a warm everyday Indian living room and using her smartphone to send a voice message for help after a financial scam. She should look concerned but calm, capable and human, not helpless or stereotyped. Show subtle details such as a houseplant, a simple chair or sofa, a small family photograph and everyday household objects. Her phone can suggest that she is recording a short voice message to Raksha, but avoid relying on readable generated interface text. Use the same simplified rounded cartoon anatomy, expressive face, clean hand-drawn outlines, flat 2D color blocks, minimal soft shading, warm beige/orange/green palette and subtle editorial paper texture as the first illustration. The character must clearly look illustrated and cartoony, not anime, not manga, not realistic, not 3D, not Pixar, not glossy, not cinematic. The emotional story should be immediately understandable: an older woman does not need to navigate a government website; she simply speaks into her phone to get help. Wide horizontal web-hero composition with a strong central character and clean negative space.";

  const prompt3 = "Create the third illustration in the exact same visual language as the previous two Raksha illustrations. Show a young Indian adult around 22 to 30 years old sitting at a simple modern desk using a laptop to report a financial scam through Raksha. The person should look focused, attentive and slightly relieved, as if they have found a simple way to solve the problem. The laptop should visibly be the main interaction device, with only a vague clean interface suggestion on the screen; do not generate large readable UI text because the actual UI will be overlaid in HTML. Include subtle everyday Indian home details such as a small plant, coffee cup, notebooks or simple desk objects. Use simplified 2D cartoon anatomy, rounded shapes, expressive but minimal facial features, clean hand-drawn outlines, flat colors, very light shading, subtle paper texture, warm beige and orange palette with restrained blue accents. Sophisticated Indian editorial magazine illustration. Clearly cartoony and illustrated, not anime, not manga, not realistic, not 3D, not Pixar, not cinematic, not glossy CGI. Wide horizontal web composition, character centered with balanced negative space and consistent framing with the previous Raksha illustrations.";

  // 1. Asset 1: Call
  console.log("\n=======================================================");
  console.log("▶ [Asset 1/3] Generating hero-call.png (Young person panicking & calling)...");
  console.log("=======================================================");
  const path1 = path.join(outputDir, "hero-call.png");
  await generateImage(prompt1, path1, { transparent: false });
  console.log("✓ Saved Asset 1:", path1);

  // 2. Asset 2: WhatsApp
  console.log("\n=======================================================");
  console.log("▶ [Asset 2/3] Generating hero-whatsapp.png (Elderly woman voice note)...");
  console.log("=======================================================");
  const path2 = path.join(outputDir, "hero-whatsapp.png");
  await generateImage(prompt2, path2, { transparent: false });
  console.log("✓ Saved Asset 2:", path2);

  // 3. Asset 3: Web
  console.log("\n=======================================================");
  console.log("▶ [Asset 3/3] Generating hero-web.png (Young adult with laptop)...");
  console.log("=======================================================");
  const path3 = path.join(outputDir, "hero-web.png");
  await generateImage(prompt3, path3, { transparent: false });
  console.log("✓ Saved Asset 3:", path3);

  console.log("\n🎉 ALL 3 HERO ASSETS SUCCESSFULLY GENERATED IN apps/web/public/images/raksha/!");
}

main().catch(err => {
  console.error("Asset generation failed:", err);
  process.exit(1);
});
