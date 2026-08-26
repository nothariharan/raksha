import { generateImage } from "file:///C:/Users/HARIHARAN/playwright-image-gen/generate.mjs";
import path from "path";

const MASTER_PREFIX = "RAKSHA CAP VISUAL SYSTEM: premium bespoke 2D editorial technical iconography; precise vector-like geometry; highly refined proportions; elegant negative space; subtle Indian geometric influence inspired by civic seals, radial geometry and modern Indian graphic design; minimal but distinctive silhouettes; restrained flat colors; no gradients; no glow; no 3D; no photorealism; no sketching; no clip-art; no generic icon-library aesthetics; sophisticated technology-product visual language; designed as an original brand asset for a high-end Indian civic technology platform. ";

const ASSETS = [
  {
    name: "cap-step-request",
    prompt: MASTER_PREFIX + "Premium bespoke 2D vector-style editorial asset for Raksha Civic Action Protocol, representing a civic action request entering a protocol system. Create a clean geometric action packet consisting of layered structured document surfaces with precise modular geometry, a subtle orange protocol marker and refined negative space. The silhouette should feel like a public-service transaction packet rather than a generic document icon. Sophisticated technical brand illustration, highly polished vector geometry, flat 2D, precise linework, restrained neutral palette with Raksha orange accent, subtle Indian geometric construction inspired by editorial civic seals, completely original visual language. No text, no letters, no numbers, no UI, no card background, no scene, no people, no 3D, no gradients, no glow, no sketch style, no clip-art, transparent background."
  },
  {
    name: "cap-step-validate",
    prompt: MASTER_PREFIX + "Premium bespoke 2D vector-style technical asset for Raksha CAP representing deterministic validation. Build a distinctive geometric verification symbol using a protective outer frame, structured inner grid and a precise confirmation mark. The symbol should communicate schema validation, policy validation and field checking without using literal text. Subtle Indian geometric influence through balanced radial geometry and editorial seal-like construction, but fully abstract and modern. Precise vector edges, flat 2D, elegant negative space, restrained blue accent, charcoal structure, professional product-brand illustration. No generic shield icon, no text, no letters, no numbers, no UI, no 3D, no gradient, no glow, no clip-art, transparent background."
  },
  {
    name: "cap-step-confirm",
    prompt: MASTER_PREFIX + "Premium bespoke 2D editorial technical asset representing explicit citizen confirmation before a high-impact civic action. Create an elegant approval seal built from a refined human authorization motif and a precise confirmation mark, using geometric radial construction inspired subtly by Indian civic seals. The visual should communicate a person authorizes the action without using a literal person illustration or generic fingerprint icon. Flat 2D vector-like geometry, sophisticated proportions, minimal linework, muted green accent, charcoal and off-white structure, premium technology-brand quality. No text, no letters, no numbers, no UI, no 3D, no gradient, no glow, no primitive iconography, transparent background."
  },
  {
    name: "cap-step-execute",
    prompt: MASTER_PREFIX + "Premium bespoke 2D vector-style technical asset representing execution and service routing in the Civic Action Protocol. Create a central action node from which three precisely controlled paths branch toward distinct service endpoints, with one highlighted active route. Use geometric routing lines, elegant nodes and a strong central protocol marker. The geometry should feel like a high-end technical systems diagram compressed into one visual symbol. Subtle Indian geometric influence through radial balance and precise symmetry. Flat 2D, sophisticated, minimal, precise, restrained violet and orange accents, no text, no UI, no generic network icon, no 3D, no gradient, no glow, transparent background."
  },
  {
    name: "cap-step-track",
    prompt: MASTER_PREFIX + "Premium bespoke 2D editorial technical asset representing persistent case tracking and event history. Create a refined vertical or radial event structure with several connected state markers, one active highlighted state and a subtle chronological path. The asset should visually communicate every transition is recorded without using text. Clean vector geometry, sophisticated linework, elegant spacing, restrained blue accent, subtle Indian editorial geometric influence, highly polished product-brand illustration, flat 2D, precise and minimal. No bell icon, no text, no letters, no numbers, no UI, no 3D, no gradient, no glow, transparent background."
  },
  // Guarantee Rules Assets
  {
    name: "cap-rule-idempotent",
    prompt: MASTER_PREFIX + "Premium bespoke 2D technical asset representing idempotency: two identical incoming action requests converging seamlessly into one deterministic outcome node. Elegant geometric construction with twin parallel input paths merging at an atomic central focal point. Flat 2D vector linework, terracotta orange accent and charcoal structure, subtle Indian geometric symmetry, no text, no repeat icon, no 3D, transparent background."
  },
  {
    name: "cap-rule-controlled",
    prompt: MASTER_PREFIX + "Premium bespoke 2D technical asset representing controlled authorization: a high-impact civic action protected behind an explicit geometric approval gate. Geometric yantra-inspired hexagonal security threshold with an elegant authorization checkpoint in center. Flat 2D, muted green and charcoal palette, no generic lock icon, no text, no 3D, transparent background."
  },
  {
    name: "cap-rule-auditable",
    prompt: MASTER_PREFIX + "Premium bespoke 2D technical asset representing cryptographic auditability: a chronological sequence of verified state blocks linked with a subtle cryptographic seal marker. Geometric precision, radial chakra dots arrayed around an immutable data core. Flat 2D, muted purple and charcoal palette, no generic database or pen icon, no text, no 3D, transparent background."
  },
  {
    name: "cap-rule-isolated",
    prompt: MASTER_PREFIX + "Premium bespoke 2D technical asset representing isolated simulation: a controlled geometric perimeter / safety sandbox separating demo execution from production banking access. Clean dual-perimeter boundary with an isolated core. Flat 2D, deep cyan and charcoal palette, no generic cardboard box, no text, no 3D, transparent background."
  },
  // Channel Assets
  {
    name: "cap-chan-web",
    prompt: MASTER_PREFIX + "Miniature editorial technical asset representing the Web reporting channel. A minimalist geometric workstation / portal frame with a subtle structured civic-action packet hovering cleanly inside. Flat 2D vector style, terracotta orange accent, no text, no UI, transparent background."
  },
  {
    name: "cap-chan-whatsapp",
    prompt: MASTER_PREFIX + "Miniature editorial technical asset representing the WhatsApp conversational channel. A sleek geometric smartphone silhouette integrating an audio speech waveform and a minimalist message capsule. Flat 2D vector style, muted emerald green accent, no text, no generic chat bubble, transparent background."
  },
  {
    name: "cap-chan-phone",
    prompt: MASTER_PREFIX + "Miniature editorial technical asset representing the Phone / Telephony voice channel. A refined geometric telephone receiver motif paired with an elegant multi-frequency soundwave spectrum. Flat 2D vector style, warm orange accent, no text, transparent background."
  },
  {
    name: "cap-chan-mcp",
    prompt: MASTER_PREFIX + "Miniature editorial technical asset representing Autonomous AI / MCP Agent interface. An abstract agent constellation with radial orbital nodes converging on a central tool execution marker. Flat 2D vector style, cobalt blue and orange accents, no text, transparent background."
  },
  // Destination Service Assets
  {
    name: "cap-serv-cybercrime",
    prompt: MASTER_PREFIX + "Civic service emblem representing 1930 Cybercrime Intake authority. A fortified public-service intake portal / secure civic gateway with subtle classical civic colonnade geometry. Flat 2D vector illustration, royal cyan and charcoal, no text, transparent background."
  },
  {
    name: "cap-serv-bank",
    prompt: MASTER_PREFIX + "Civic service emblem representing Bank / FIU Financial Intermediary Response. A structured institutional financial transaction ledger and treasury node. Flat 2D vector illustration, muted green and charcoal, no text, transparent background."
  },
  {
    name: "cap-serv-future",
    prompt: MASTER_PREFIX + "Civic service emblem representing Extensible Future Services (Pensions, Benefits, Entitlements). A modular expanding civic service cluster with subtle stylized peacock feather geometry. Flat 2D vector illustration, rich violet and azure, no text, transparent background."
  }
];

const outDir = "C:/Users/HARIHARAN/Desktop/Raksha/apps/web/public/images/cap";

async function run() {
  for (let i = 0; i < ASSETS.length; i++) {
    const asset = ASSETS[i];
    const targetFile = path.join(outDir, `${asset.name}.png`);
    console.log(`[${i + 1}/${ASSETS.length}] Generating ${asset.name}...`);
    try {
      const res = await generateImage(asset.prompt, targetFile, { transparent: true });
      console.log(`✓ Saved ${asset.name} to ${res}`);
    } catch (err) {
      console.error(`✗ Failed ${asset.name}:`, err.message);
    }
  }
  console.log("All generation requests processed.");
}

run();
