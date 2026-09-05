/**
 * /app & /demo — Interactive Citizen Emergency Console & Developer CAP Drawer
 */

import { renderPageLayout } from "./layout.js";

function formatWhatsAppDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return raw.startsWith("+") ? raw : `+${digits}`;
}

export function renderAppPageHtml(config?: {
  coreUrl?: string;
  capUrl?: string;
  elevenLabsAgentId?: string;
  portalAUrl?: string;
  portalBUrl?: string;
  whatsappNumber?: string;
  whatsappJoin?: string;
}): string {
  const coreUrl = config?.coreUrl ?? "http://localhost:3001";
  const capUrl = config?.capUrl ?? "http://localhost:3002";
  const elevenLabsAgentId = config?.elevenLabsAgentId ?? "";
  const portalAUrl = config?.portalAUrl ?? process.env.PORTAL_A_BASE_URL ?? "http://localhost:3003";
  const portalBUrl = config?.portalBUrl ?? process.env.PORTAL_B_BASE_URL ?? "http://localhost:3004";
  const whatsappE164 = (config?.whatsappNumber || process.env.WHATSAPP_SANDBOX_NUMBER || "+14155238886").replace(/\s/g, "");
  const whatsappDigits = whatsappE164.replace(/\D/g, "");
  const whatsappDisplay = formatWhatsAppDisplay(whatsappE164);
  const whatsappJoin = (config?.whatsappJoin || process.env.WHATSAPP_SANDBOX_JOIN || "join milk-work").trim();
  const whatsappHref = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(whatsappJoin)}`;

  const extraStyles = `
    .app-shell {
      position: relative;
      min-height: calc(100dvh - 148px);
      overflow: hidden;
    }
    .app-flow-story {
      position: absolute;
      left: 50%;
      top: 74%;
      transform: translate(-50%, -50%);
      width: min(1520px, 118vw);
      height: auto;
      pointer-events: none;
      user-select: none;
      opacity: 0.68;
      z-index: 0;
    }
    .app-container {
      max-width: 800px;
      margin: 3rem auto;
      padding: 0 1.5rem;
      position: relative;
      z-index: 1;
    }
    .app-card {
      background: var(--bg-white);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: var(--card-shadow-lg);
      position: relative;
    }

    .app-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .app-title {
      font-size: 1.7rem;
      font-weight: 600;
      letter-spacing: -0.03em;
      margin-bottom: 0.35rem;
    }
    .app-subtitle {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    .action-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .action-btn {
      background: #fafaf9;
      border: 1.5px solid var(--border);
      border-radius: 14px;
      padding: 1.6rem 1.2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      color: var(--text);
      text-decoration: none;
    }
    .action-btn:hover {
      border-color: var(--orange);
      background: var(--orange-light);
      transform: translateY(-2px);
    }
    .action-btn .btn-icon {
      width: 56px;
      height: 56px;
      display: grid;
      place-items: center;
    }
    .action-btn .btn-icon img,
    .line-icon {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      pointer-events: none;
      user-select: none;
    }
    .action-btn .btn-label {
      font-weight: 700;
      font-size: 0.98rem;
    }
    .action-btn .btn-sub {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .btn-link-type {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.88rem;
      cursor: pointer;
      text-decoration: underline;
      display: block;
      margin: 0 auto;
    }
    .btn-link-type:hover { color: var(--text); }

    .wa-path {
      background: #fafaf9;
      border: 1.5px solid var(--border);
      border-radius: 14px;
      padding: 1.15rem 1.25rem 1.2rem;
      margin: 0 0 1.25rem;
      text-align: left;
    }
    .wa-path-head {
      display: flex;
      align-items: flex-start;
      gap: 0.8rem;
      margin-bottom: 0.9rem;
    }
    .wa-path-icon {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
    }
    .wa-path-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      pointer-events: none;
      user-select: none;
    }
    .wa-path-kicker {
      font-size: 0.7rem;
      font-weight: 650;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--orange);
      margin-bottom: 0.2rem;
    }
    .wa-path-title {
      font-weight: 700;
      font-size: 0.98rem;
      margin: 0 0 0.2rem;
      color: var(--text);
    }
    .wa-path-copy {
      font-size: 0.82rem;
      color: var(--text-muted);
      line-height: 1.45;
      margin: 0;
    }
    .wa-path-facts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.65rem;
      margin-bottom: 0.85rem;
    }
    .wa-fact {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.6rem 0.75rem;
    }
    .wa-fact-lbl {
      font-size: 0.68rem;
      font-weight: 650;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 0.2rem;
    }
    .wa-fact-val {
      font-family: var(--mono);
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--text);
      word-break: break-word;
    }
    .wa-path-steps {
      margin: 0 0 0.95rem;
      padding-left: 1.15rem;
      color: var(--text-muted);
      font-size: 0.82rem;
      line-height: 1.55;
    }
    .wa-path-cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: #1c1917;
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      padding: 0.6rem 1.15rem;
      font-weight: 600;
      font-size: 0.88rem;
    }
    .wa-path-cta:hover { background: #0c0a09; }
    .wa-path-note {
      font-size: 0.75rem;
      color: var(--text-light);
      margin: 0.65rem 0 0;
      line-height: 1.4;
    }

    @media (max-width: 900px) {
      .app-flow-story {
        width: 160vw;
        top: 74%;
        opacity: 0.22;
      }
    }

    .type-box {
      margin-top: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    textarea.narrative-input {
      width: 100%;
      height: 95px;
      padding: 0.85rem;
      border: 1.5px solid var(--border);
      border-radius: 10px;
      font-family: var(--font);
      font-size: 0.92rem;
      outline: none;
      resize: vertical;
    }
    textarea.narrative-input:focus { border-color: var(--orange); }

    .btn-submit-narrative {
      background: #1c1917;
      color: white;
      border: none;
      padding: 0.65rem 1.35rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      align-self: flex-end;
    }

    .ready-card, .filed-card {
      text-align: left;
      max-width: 440px;
      margin: 0 auto;
    }
    .ready-card-head, .filed-card-head {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      margin-bottom: 1.1rem;
    }
    .ready-card-mark, .filed-card-mark {
      width: 52px;
      height: 52px;
      flex-shrink: 0;
      object-fit: contain;
    }
    .ready-card h3, .filed-card h3 {
      font-family: var(--font-display);
      font-size: 1.7rem;
      font-weight: 400;
      letter-spacing: -0.02em;
      line-height: 1.15;
      margin: 0 0 0.25rem;
      color: var(--text);
    }
    .filed-card h3 { color: var(--green); }
    .ready-card-sub, .filed-card-sub {
      color: var(--text-muted);
      font-size: 0.88rem;
      line-height: 1.45;
      margin: 0;
    }
    .details-grid {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.1rem 1.2rem;
      margin: 0 0 1.15rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem 1.2rem;
      text-align: left;
    }
    .dt-lbl { font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); font-weight: 650; letter-spacing: 0.06em; margin-bottom: 0.2rem; }
    .dt-val { font-size: 1.02rem; font-weight: 700; color: var(--text); word-break: break-word; }
    .dt-amount { font-size: 1.45rem; color: var(--orange); }
    @media (max-width: 520px) {
      .details-grid { grid-template-columns: 1fr; gap: 0.85rem; }
      .action-grid, .wa-path-facts { grid-template-columns: 1fr; }
    }

    .btn-dispatch {
      background: var(--orange);
      color: #fff;
      border: none;
      padding: 0.85rem 1.4rem;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 700;
      width: 100%;
      cursor: pointer;
      font-family: var(--font);
      transition: background 0.15s, transform 0.12s;
    }
    .btn-dispatch:hover { background: var(--orange-hover); }
    .btn-dispatch:active { transform: scale(0.98); }

    .status-list {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      margin: 0 0 1rem;
    }
    .status-step {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.75rem;
      padding: 0.55rem 0.7rem;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 10px;
    }
    .status-step-label {
      font-size: 0.88rem;
      font-weight: 650;
      color: var(--text);
    }
    .status-step-time {
      font-family: var(--mono);
      font-size: 0.72rem;
      color: var(--text-muted);
      flex-shrink: 0;
    }
    .filed-ref {
      font-family: var(--mono);
      font-size: 0.95rem;
      font-weight: 650;
      color: var(--text);
      margin: 0 0 0.85rem;
    }
    .filed-disclaimer {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0.35rem 0 0;
    }

    /* Raksha Minimal Live Voice Experience (FluidOrb - White / Light Theme) */
    .call-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(250, 250, 249, 0.98);
      backdrop-filter: blur(24px);
      z-index: 9999;
      display: none;
      place-items: center;
      padding: 1.5rem;
      animation: fadeIn 0.25s ease;
      color: #1c1917;
    }
    .call-modal-overlay.active { display: flex; justify-content: center; align-items: stretch; }

    .call-space {
      width: min(1180px, 100%);
      min-height: calc(100dvh - 2rem);
      max-height: 100dvh;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      padding: 1.25rem 1.5rem 1rem;
      position: relative;
      overflow: hidden;
    }

    .call-top-bar {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.84rem;
      color: #78716c;
    }
    .call-back-btn {
      background: #ffffff;
      border: 1px solid #e7e5e4;
      color: #57534e;
      padding: 0.45rem 0.95rem;
      border-radius: 999px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: all 0.2s;
    }
    .call-back-btn:hover {
      background: #f5f5f4;
      color: #1c1917;
      border-color: #d6d3d1;
    }
    .call-brand-mark {
      font-weight: 800;
      letter-spacing: 0.18em;
      font-size: 0.85rem;
      color: #1c1917;
      text-transform: uppercase;
    }
    .call-lang-indicator {
      font-size: 0.82rem;
      color: #78716c;
      font-weight: 500;
    }

    .call-center-stage {
      width: 100%;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      text-align: left;
      margin: 0.75rem 0 0;
    }

    /* FluidOrb — soft filled disk (matches apps/web FluidOrb shader) */
    .voice-fluid-orb {
      width: 148px;
      height: 148px;
      margin: 0 auto 0.85rem auto;
      display: grid;
      place-items: center;
      position: relative;
      background: transparent;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }
    .voice-fluid-orb canvas {
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 50%;
    }
    @media (max-width: 500px) {
      .voice-fluid-orb {
        width: 112px;
        height: 112px;
      }
    }

    /* Language gate — first step before live session */
    .call-lang-gate {
      width: min(420px, 100%);
      text-align: center;
      margin: 0.5rem auto 1.5rem;
    }
    .call-lang-gate[hidden] { display: none !important; }
    .call-lang-kicker {
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--orange);
      margin-bottom: 0.65rem;
    }
    .call-lang-title {
      font-family: var(--font-display);
      font-size: clamp(1.55rem, 3.5vw, 2rem);
      font-weight: 400;
      line-height: 1.2;
      color: var(--text);
      margin: 0 0 0.55rem;
    }
    .call-lang-sub {
      font-size: 0.92rem;
      color: var(--text-muted);
      line-height: 1.45;
      margin: 0 0 1.35rem;
    }
    .call-lang-grid {
      display: grid;
      gap: 0.65rem;
    }
    .call-lang-option {
      appearance: none;
      width: 100%;
      border: 1.5px solid var(--border);
      background: var(--bg-white);
      border-radius: 14px;
      padding: 0.95rem 1.1rem;
      text-align: left;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .call-lang-option:hover,
    .call-lang-option[aria-pressed="true"] {
      border-color: var(--orange);
      background: var(--orange-light);
      box-shadow: 0 1px 0 rgba(234, 88, 12, 0.08);
    }
    .call-lang-option .lang-native {
      font-size: 1.05rem;
      font-weight: 650;
      color: var(--text);
    }
    .call-lang-option .lang-en {
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .call-session-body[hidden] { display: none !important; }
    .call-session-body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      width: 100%;
    }
    .call-session-hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      flex-shrink: 0;
    }
    .call-workspace {
      flex: 1;
      min-height: 0;
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
      gap: 1rem;
      align-items: stretch;
    }
    .call-pane {
      background: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 18px;
      padding: 0.95rem 1rem 1rem;
      display: flex;
      flex-direction: column;
      min-height: 0;
      box-shadow: 0 1px 0 rgba(28, 25, 23, 0.03);
    }
    .call-pane-label {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #a8a29e;
      margin-bottom: 0.7rem;
      flex-shrink: 0;
    }
    .transcript-feed {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding-right: 0.35rem;
      scroll-behavior: smooth;
      scrollbar-width: thin;
      scrollbar-color: #d6d3d1 transparent;
    }
    .transcript-feed::-webkit-scrollbar {
      width: 5px;
    }
    .transcript-feed::-webkit-scrollbar-track {
      background: transparent;
    }
    .transcript-feed::-webkit-scrollbar-thumb {
      background: #d6d3d1;
      border-radius: 999px;
    }
    .transcript-feed::-webkit-scrollbar-thumb:hover {
      background: #a8a29e;
    }
    .transcript-empty {
      color: #a8a29e;
      font-size: 0.9rem;
      line-height: 1.45;
      margin: auto 0;
      text-align: center;
      padding: 1.5rem 0.5rem;
    }
    .transcript-bubble {
      max-width: 94%;
      animation: fadeIn 0.25s ease;
    }
    .transcript-bubble.agent {
      align-self: flex-start;
    }
    .transcript-bubble.user {
      align-self: flex-end;
    }
    .transcript-who {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 0.28rem;
      color: #a8a29e;
    }
    .transcript-bubble.user .transcript-who { color: #ea580c; text-align: right; }
    .transcript-text {
      font-size: 0.98rem;
      line-height: 1.5;
      color: #1c1917;
      font-weight: 600;
    }
    .transcript-bubble.user .transcript-text {
      color: #c2410c;
      font-style: italic;
      font-weight: 600;
      text-align: right;
    }
    .dossier-body {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      min-height: 0;
      padding-right: 0.2rem;
      scrollbar-width: thin;
      scrollbar-color: #d6d3d1 transparent;
    }
    .dossier-body::-webkit-scrollbar {
      width: 5px;
    }
    .dossier-body::-webkit-scrollbar-track {
      background: transparent;
    }
    .dossier-body::-webkit-scrollbar-thumb {
      background: #d6d3d1;
      border-radius: 999px;
    }
    .dossier-body::-webkit-scrollbar-thumb:hover {
      background: #a8a29e;
    }
    .dossier-empty {
      color: #a8a29e;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: auto 0;
      text-align: left;
    }
    .dossier-row {
      display: grid;
      grid-template-columns: 7.2rem minmax(0, 1fr);
      gap: 0.45rem 0.75rem;
      align-items: baseline;
      padding-bottom: 0.55rem;
      border-bottom: 1px solid #f5f5f4;
    }
    .dossier-row:last-child { border-bottom: none; }
    .dossier-k {
      font-size: 0.72rem;
      font-weight: 650;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #a8a29e;
    }
    .dossier-v {
      font-size: 0.92rem;
      font-weight: 650;
      color: #1c1917;
      word-break: break-word;
    }
    .dossier-v.muted { color: #a8a29e; font-weight: 500; }
    .dossier-status {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.78rem;
      font-weight: 700;
      color: #0369a1;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 999px;
      padding: 0.28rem 0.7rem;
      width: fit-content;
      margin-bottom: 0.25rem;
    }
    .dossier-status.ready {
      color: #c2410c;
      background: #fff7ed;
      border-color: #fed7aa;
    }
    .dossier-status.filed {
      color: #15803d;
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    .dossier-actions {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid #e7e5e4;
    }
    .dossier-actions[hidden] { display: none !important; }
    .dossier-confirm-note {
      font-size: 0.82rem;
      color: #57534e;
      line-height: 1.4;
      margin: 0;
    }
    .dossier-link {
      display: block;
      text-decoration: none;
      border: 1.5px solid #e7e5e4;
      border-radius: 12px;
      padding: 0.7rem 0.85rem;
      background: #fafaf9;
      transition: border-color 0.15s, background 0.15s;
    }
    .dossier-link:hover {
      border-color: #ea580c;
      background: #fff7ed;
    }
    .dossier-link-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: #1c1917;
      margin-bottom: 0.15rem;
    }
    .dossier-link-sub {
      font-size: 0.75rem;
      color: #78716c;
      line-height: 1.35;
    }
    .dossier-ref {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 0.92rem;
      font-weight: 700;
      color: #15803d;
    }
    .dossier-status.proof {
      color: #7c2d12;
      background: #fff7ed;
      border-color: #fdba74;
    }
    .btn-proof-upload {
      appearance: none;
      border: 1.5px dashed #fdba74;
      background: #fff7ed;
      color: #c2410c;
      border-radius: 12px;
      padding: 0.85rem 1rem;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      font-family: var(--font);
      text-align: center;
    }
    .btn-proof-upload:hover { background: #ffedd5; border-color: #ea580c; }
    .call-outcome {
      display: none;
      flex: 1;
      min-height: 0;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      gap: 1rem;
      padding: 0.5rem 0 1rem;
      max-width: 640px;
      margin: 0 auto;
      width: 100%;
      text-align: left;
      animation: fadeIn 0.35s ease;
    }
    .call-outcome.active { display: flex; }
    .call-outcome-kicker {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #16a34a;
    }
    .call-outcome-title {
      font-family: var(--font-display);
      font-size: clamp(1.55rem, 3vw, 2rem);
      font-weight: 400;
      margin: 0;
      color: #1c1917;
      line-height: 1.2;
    }
    .call-outcome-copy {
      font-size: 0.95rem;
      color: #57534e;
      line-height: 1.5;
      margin: 0;
    }
    .call-outcome-ref {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 1.05rem;
      font-weight: 700;
      color: #15803d;
    }
    .call-outcome-links {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }
    .call-outcome-done {
      font-size: 0.88rem;
      font-weight: 650;
      color: #1c1917;
      margin: 0.25rem 0 0;
    }
    .call-outcome-disclaimer {
      font-size: 0.78rem;
      color: #a8a29e;
      margin: 0;
    }
    @media (max-width: 860px) {
      .call-workspace {
        grid-template-columns: 1fr;
        grid-template-rows: minmax(180px, 42vh) minmax(200px, 1fr);
      }
      .call-space {
        overflow-y: auto;
        max-height: none;
      }
    }

    /* Clarification step — editorial, no emoji card chrome */
    .clarify-block {
      text-align: center;
      max-width: 440px;
      margin: 0 auto;
      padding: 0.5rem 0 0.25rem;
    }
    .clarify-kicker {
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--orange);
      margin-bottom: 0.55rem;
    }
    .clarify-title {
      font-family: var(--font-display);
      font-size: clamp(1.35rem, 3vw, 1.7rem);
      font-weight: 400;
      line-height: 1.25;
      color: var(--text);
      margin: 0 0 0.45rem;
    }
    .clarify-sub {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0 0 1.25rem;
      line-height: 1.45;
    }
    .clarify-row {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .clarify-input {
      width: 100%;
      padding: 0.85rem 1rem;
      border: 1.5px solid var(--border);
      border-radius: 12px;
      font-family: var(--font);
      font-size: 0.95rem;
      outline: none;
      background: var(--bg-white);
    }
    .clarify-input:focus {
      border-color: var(--orange);
      box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.12);
    }
    .clarify-submit {
      appearance: none;
      border: none;
      border-radius: 999px;
      padding: 0.85rem 1.35rem;
      background: var(--orange);
      color: #fff;
      font-weight: 650;
      font-size: 0.92rem;
      cursor: pointer;
      font-family: var(--font);
    }
    .clarify-submit:hover { background: var(--orange-hover); }

    .process-block {
      text-align: center;
      padding: 2rem 0 1.5rem;
    }
    .process-title {
      font-family: var(--font-display);
      font-size: 1.45rem;
      font-weight: 400;
      margin: 0 0 0.4rem;
    }
    .process-sub {
      color: var(--text-muted);
      font-size: 0.88rem;
      margin: 0;
    }

    .btn-start-speaking .speak-icon {
      width: 22px;
      height: 22px;
      display: grid;
      place-items: center;
    }
    .btn-start-speaking .speak-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: brightness(0) invert(1);
    }
    @media (prefers-reduced-motion: reduce) {
      .voice-fluid-orb {
        box-shadow: 0 10px 24px -10px rgba(234, 88, 12, 0.2);
      }
    }

    .call-state-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      border-radius: 999px;
      background: #ffffff;
      border: 1px solid #fed7aa;
      color: #c2410c;
      font-size: 0.84rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      margin-bottom: 0;
      box-shadow: 0 2px 8px rgba(234, 88, 12, 0.08);
      transition: all 0.25s ease;
    }
    .call-state-pill .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ea580c;
      box-shadow: 0 0 8px rgba(234, 88, 12, 0.6);
      animation: pulseDot 1.6s infinite;
    }

    .call-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.65rem;
      width: 100%;
      flex-shrink: 0;
      padding-top: 0.25rem;
    }
    .btn-start-speaking {
      background: #ea580c;
      color: #ffffff;
      border: none;
      padding: 0.72rem 1.85rem;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      box-shadow: 0 4px 16px rgba(234, 88, 12, 0.28);
      transition: all 0.2s ease;
    }
    .btn-start-speaking:hover {
      background: #c2410c;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(234, 88, 12, 0.35);
    }
    .btn-end-conversation {
      background: #ffffff;
      color: #c2410c;
      border: 1.5px solid #fed7aa;
      padding: 0.68rem 1.7rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 2px 8px rgba(234, 88, 12, 0.08);
      transition: all 0.2s ease;
    }
    .btn-end-conversation:hover {
      background: #fff7ed;
      border-color: #ea580c;
      color: #9a3412;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.15);
    }
    .btn-end-conversation .end-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ea580c;
    }

    .btn-view-technical {
      background: none;
      border: none;
      color: #a8a29e;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.2s;
      padding: 0.4rem 0.6rem;
    }
    .btn-view-technical:hover {
      color: #57534e;
    }

    /* Developer CAP drawer — light editorial, matches site (not dark IDE chrome) */
    #devDrawer {
      position: fixed;
      top: 0;
      right: 0;
      width: min(420px, 100vw);
      height: 100vh;
      background: #fafaf9;
      color: var(--text);
      border-left: 1px solid var(--border);
      box-shadow: -12px 0 40px rgba(28, 25, 23, 0.08);
      padding: 1.35rem 1.4rem 2rem;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 10000;
      overflow-y: auto;
      font-family: var(--font);
    }
    #devDrawer.open {
      transform: translateX(0);
    }
    .drawer-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.35rem;
      padding-bottom: 0.95rem;
      border-bottom: 1px solid var(--border);
    }
    .drawer-kicker {
      font-size: 0.7rem;
      font-weight: 650;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--orange);
      margin-bottom: 0.35rem;
    }
    .drawer-title {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 400;
      color: var(--text);
      line-height: 1.2;
      margin: 0;
    }
    .drawer-close {
      appearance: none;
      background: #fff;
      border: 1px solid var(--border);
      color: var(--text-muted);
      width: 2rem;
      height: 2rem;
      border-radius: 999px;
      font-size: 1.1rem;
      line-height: 1;
      cursor: pointer;
      flex-shrink: 0;
    }
    .drawer-close:hover {
      border-color: var(--orange-border);
      color: var(--text);
      background: var(--orange-light);
    }
    .drawer-label {
      font-size: 0.7rem;
      font-weight: 650;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
    }
    .drawer-incident {
      font-family: var(--mono);
      font-weight: 650;
      font-size: 0.95rem;
      color: var(--text);
      padding: 0.7rem 0.85rem;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 12px;
    }
    .drawer-intro {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.45;
      margin: 0 0 1.25rem;
    }
    .json-view {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.85rem;
      font-family: var(--mono);
      font-size: 0.76rem;
      color: #44403c;
      max-height: min(55vh, 480px);
      overflow-y: auto;
      white-space: pre-wrap;
      margin: 0;
    }
    .protocol-warming {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 12000;
      align-items: center;
      justify-content: center;
      background: rgba(28, 25, 23, 0.28);
      backdrop-filter: blur(6px);
    }
    .protocol-warming.active { display: flex; }
    .protocol-warming-card {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      box-shadow: var(--card-shadow-lg);
      max-width: 22rem;
      text-align: center;
    }
    .protocol-warming-copy {
      margin: 0.75rem 0 0;
      color: var(--text-muted);
      font-size: 0.92rem;
      line-height: 1.45;
    }
    .protocol-warming-spinner {
      width: 28px;
      height: 28px;
      margin: 0 auto;
      border-radius: 50%;
      border: 2px solid var(--orange-border);
      border-top-color: var(--orange);
      animation: protocol-spin 0.8s linear infinite;
    }
    @keyframes protocol-spin { to { transform: rotate(360deg); } }
  `;
const bodyContent = `
    <div class="protocol-warming" id="protocolWarming" aria-live="polite">
      <div class="protocol-warming-card">
        <div class="protocol-warming-spinner" aria-hidden="true"></div>
        <p class="protocol-warming-copy" id="protocolWarmingCopy">Starting the protocol…</p>
      </div>
    </div>
    <!-- Custom ElevenLabs Real Voice Call Modal -->
    <div class="call-modal-overlay" id="rakshaCallModal">
      <div class="call-space">
        
        <!-- Top Bar -->
        <div class="call-top-bar">
          <button class="call-back-btn" onclick="endLiveVoiceCall()">
            <span>← Exit</span>
          </button>
          <div class="call-brand-mark">RAKSHA</div>
          <div class="call-lang-indicator" id="callLangIndicator">Choose language</div>
        </div>

        <!-- Central Focused Living Experience -->
        <div class="call-center-stage">
          
          <div class="voice-fluid-orb" id="callDiyaOrb" data-state="IDLE" data-color="#ea580c">
            <canvas id="callFluidOrb" aria-hidden="true"></canvas>
          </div>

          <!-- Language gate (must choose before session starts) -->
          <div class="call-lang-gate" id="callLangGate">
            <div class="call-lang-kicker">Before we begin</div>
            <h2 class="call-lang-title">Which language are you comfortable in?</h2>
            <p class="call-lang-sub">Raksha will listen and reply only in the language you pick.</p>
            <div class="call-lang-grid" role="group" aria-label="Language">
              <button type="button" class="call-lang-option" data-lang="en" onclick="selectCallLanguage('en')">
                <span class="lang-native">English</span>
                <span class="lang-en">Speak with me in English</span>
              </button>
              <button type="button" class="call-lang-option" data-lang="hi" onclick="selectCallLanguage('hi')">
                <span class="lang-native">हिंदी</span>
                <span class="lang-en">हिंदी में बात करें</span>
              </button>
              <button type="button" class="call-lang-option" data-lang="ta" onclick="selectCallLanguage('ta')">
                <span class="lang-native">தமிழ்</span>
                <span class="lang-en">தமிழில் பேசுங்கள்</span>
              </button>
            </div>
          </div>

          <div class="call-session-body" id="callSessionBody" hidden>
            <div class="call-session-hero">
              <div class="call-state-pill" id="callStatePillWrap" aria-live="polite">
                <span class="dot"></span>
                <span id="callStatusBadge">Tap below to start speaking</span>
              </div>
            </div>

            <div class="call-workspace">
              <section class="call-pane call-transcript-pane" aria-label="Conversation">
                <div class="call-pane-label">Conversation</div>
                <div class="transcript-feed" id="liveTranscriptFeed" aria-live="polite">
                  <div class="transcript-empty" id="transcriptEmpty">Raksha’s replies appear here. What you say shows underneath.</div>
                </div>
                <!-- Compatibility hooks for older script paths -->
                <div id="agentTurnPrompt" hidden></div>
                <div id="userTurnSpeech" hidden></div>
              </section>

              <aside class="call-pane call-dossier-pane" aria-label="Gathered information">
                <div class="call-pane-label">Gathered so far</div>
                <div class="dossier-body" id="callDossierBody">
                  <p class="dossier-empty" id="dossierEmpty">As Raksha understands your report, amount, bank, UTR, and other details will appear here for you to confirm.</p>
                </div>
                <div class="dossier-actions" id="callDossierActions" hidden></div>
              </aside>
            </div>

            <div class="call-case-capsule" id="callCaseCapsule" style="display: none;" aria-hidden="true">
              <span class="capsule-id" id="capsuleCaseId">—</span>
              <span id="capsuleFacts" class="capsule-facts"></span>
              <span id="capsuleState" class="capsule-state"></span>
            </div>

            <div class="call-controls">
              <button class="btn-start-speaking" id="btnStartSpeaking" onclick="connectAndStartSpeaking()">
                <span class="speak-icon"><img src="/images/line/voice-shankha.png" alt="" draggable="false" /></span>
                <span id="lblStartBtn">Start speaking</span>
              </button>

              <button class="btn-end-conversation" id="btnEndConversation" style="display: none;" onclick="endLiveVoiceCall()">
                <span class="end-dot"></span>
                <span>End conversation</span>
              </button>

              <button class="btn-submit-narrative" id="btnCallConfirm" style="display: none;" onclick="confirmFromLiveCall()">
                Confirm these details
              </button>

              <label class="btn-proof-upload" id="btnCallProof" style="display: none;" hidden>
                Attach payment / scam proof
                <input type="file" accept="image/*" style="display:none;" onchange="handleCallProofUpload(event)" />
              </label>

              <button class="btn-view-technical" onclick="toggleDevDrawer()">
                View technical case details →
              </button>
            </div>
          </div>

          <div class="call-outcome" id="callOutcome" aria-live="polite">
            <div class="call-outcome-kicker">Report filed</div>
            <h2 class="call-outcome-title">Emergency freeze request sent</h2>
            <p class="call-outcome-copy" id="callOutcomeCopy">
              We sent your verified details to the cyber cell desk and your bank’s freeze desk.
            </p>
            <div>Tracking reference<br /><span class="call-outcome-ref" id="callOutcomeRef">—</span></div>
            <div class="call-outcome-links" id="callOutcomeLinks"></div>
            <p class="call-outcome-done">Nothing else you need to do here.</p>
            <p class="call-outcome-disclaimer">Simulated demonstration — not a real government filing.</p>
            <button class="btn-end-conversation" type="button" onclick="endLiveVoiceCall()" style="align-self:flex-start;margin-top:0.5rem;">
              Exit
            </button>
          </div>

        </div>

        <div style="font-size: 0.76rem; color: #a8a29e; text-align: center; font-weight: 500;">
          Simulated demonstration · Powered by ElevenLabs Voice Agent & GPT-4o
        </div>

      </div>
    </div>

    <div class="app-shell">
    <img class="app-flow-story" src="/images/line/app-flow-story.png" alt="" aria-hidden="true" />
    <div class="app-container">
      <div class="app-card">

        <!-- IDLE -->
        <div id="wsIdle">
          <div class="app-header">
            <h1 class="app-title" id="wsHead">Report Financial Cyber-Fraud</h1>
            <p class="app-subtitle" id="wsSub">Speak in your language, show your payment receipt, message on WhatsApp, or describe what happened.</p>
          </div>

          <!-- Citizen identity: shown for demo; lets the mentor confirm cross-channel linkage -->
          <div style="display:flex;align-items:center;gap:0.5rem;margin:0 0 1rem 0;font-size:0.82rem;color:var(--text-muted);">
            <span>Mobile:</span>
            <input id="reporterMobile" type="tel" value="+919876543210"
              style="flex:1;padding:0.3rem 0.5rem;border:1.5px solid var(--border);border-radius:6px;font-size:0.82rem;outline:none;"
              oninput="currentReporterMobile=this.value" />
          </div>

          <div class="action-grid">
            <div class="action-btn" onclick="startLiveVoiceCall()">
              <span class="btn-icon"><img class="line-icon" src="/images/line/voice-shankha.png" alt="" draggable="false" /></span>
              <span class="btn-label" id="lblVoice">Talk to Raksha (Live Voice)</span>
              <span class="btn-sub">ElevenLabs Agent in Hindi / English</span>
            </div>

            <label class="action-btn" style="cursor: pointer;">
              <span class="btn-icon"><img class="line-icon" src="/images/line/intake-camera.png" alt="" draggable="false" /></span>
              <span class="btn-label" id="lblImage">Show Transaction</span>
              <span class="btn-sub">Upload UPI screenshot</span>
              <input type="file" accept="image/*" style="display: none;" onchange="handleImageAction(event)" />
            </label>
          </div>

          <aside class="wa-path" aria-labelledby="waPathTitle">
            <div class="wa-path-head">
              <span class="wa-path-icon"><img class="line-icon" src="/images/line/channel-whatsapp.png" alt="" draggable="false" /></span>
              <div>
                <div class="wa-path-kicker" id="waPathKicker">WhatsApp pilot</div>
                <h2 class="wa-path-title" id="waPathTitle">Message Raksha on WhatsApp</h2>
                <p class="wa-path-copy" id="waPathCopy">Same case as this page. Send the join phrase once, then tell Raksha what happened.</p>
              </div>
            </div>
            <div class="wa-path-facts">
              <div class="wa-fact">
                <div class="wa-fact-lbl" id="waFactNumLbl">WhatsApp number</div>
                <div class="wa-fact-val">${whatsappDisplay}</div>
              </div>
              <div class="wa-fact">
                <div class="wa-fact-lbl" id="waFactJoinLbl">Join phrase</div>
                <div class="wa-fact-val">${whatsappJoin}</div>
              </div>
            </div>
            <ol class="wa-path-steps" id="waPathSteps">
              <li>Open the number in WhatsApp.</li>
              <li>Send <strong>${whatsappJoin}</strong> once.</li>
              <li>Then write what happened — language, story, UTR, YES.</li>
            </ol>
            <a class="wa-path-cta" id="waPathCta" href="${whatsappHref}" target="_blank" rel="noopener noreferrer">Open WhatsApp</a>
            <p class="wa-path-note" id="waPathNote">Live Twilio sandbox — not official 1930. No need to leave your number here. If you cannot join, use Talk, Show Transaction, or type on this page.</p>
          </aside>

          <button class="btn-link-type" onclick="toggleTypeArea()">Type details instead</button>

          <div class="type-box" id="typeArea" style="display: none;">
            <textarea class="narrative-input" id="narrativeText" placeholder="Describe what happened in your own words…"></textarea>
            <button class="btn-submit-narrative" onclick="submitTypedNarrative()">Understand Incident</button>
          </div>
        </div>

        <!-- PROCESSING -->
        <div id="wsProcessing" style="display: none;">
          <div class="process-block">
            <h3 class="process-title">Reconciling what you shared</h3>
            <p class="process-sub">Sealing evidence into your incident capsule…</p>
          </div>
        </div>

        <!-- MISSING FIELD QUESTION -->
        <div id="wsQuestion" style="display: none;">
          <div class="clarify-block">
            <div class="clarify-kicker">One detail needed</div>
            <h3 class="clarify-title" id="qPromptText">What is the 12-digit UTR or reference number?</h3>
            <p class="clarify-sub">Answer in the box below — or keep speaking with Raksha if you are still on the call.</p>
            <div class="clarify-row">
              <input type="text" class="clarify-input" id="qInputVal" placeholder="Transaction reference / UTR" autocomplete="off" />
              <button type="button" class="clarify-submit" onclick="submitQuestionAnswer()">Continue</button>
            </div>
          </div>
        </div>

        <!-- CONFLICT -->
        <div id="wsConflict" style="display: none;">
          <div class="clarify-block">
            <div class="clarify-kicker">Please confirm</div>
            <h3 class="clarify-title" id="conflictHead">Which amount is correct?</h3>
            <p class="clarify-sub">We found two different values — pick the one that matches your payment.</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem;" id="conflictBtnBox"></div>
          </div>
        </div>

        <!-- READY -->
        <div id="wsReady" style="display: none;">
          <div class="ready-card">
            <div class="ready-card-head">
              <img class="ready-card-mark" src="/images/line/card-payment-mark.png" alt="" draggable="false" />
              <div>
                <h3>Payment identified</h3>
                <p class="ready-card-sub">These are the facts from this conversation and any receipt you attached.</p>
              </div>
            </div>
            <div class="details-grid">
              <div>
                <div class="dt-lbl">Amount</div>
                <div class="dt-val dt-amount" id="repAmount">—</div>
              </div>
              <div>
                <div class="dt-lbl">Channel</div>
                <div class="dt-val" id="repChannel">—</div>
              </div>
              <div>
                <div class="dt-lbl">UTR / reference</div>
                <div class="dt-val" id="repUtr">—</div>
              </div>
              <div>
                <div class="dt-lbl">Debit bank</div>
                <div class="dt-val" id="repBank">—</div>
              </div>
            </div>
            <button class="btn-dispatch" onclick="dispatchEmergencyReport()">Send emergency report</button>
          </div>
        </div>

        <!-- ERROR -->
        <div id="wsError" style="display: none; text-align: center; padding: 1.5rem 0;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
          <h3 style="font-size: 1.2rem; font-weight: 700; color: #dc2626; margin-bottom: 0.5rem;" id="errorTitle">Something went wrong</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;" id="errorMessage">Your incident has not been lost.</p>
          <div style="display: flex; gap: 0.75rem; justify-content: center;">
            <button class="btn-submit-narrative" id="errorRetryBtn">Retry</button>
            <button class="btn-link-type" onclick="resetToHome()">Start over</button>
          </div>
        </div>

        <!-- SUBMITTED -->
        <div id="wsSubmitted" style="display: none;">
          <div class="filed-card">
            <div class="filed-card-head">
              <img class="filed-card-mark" src="/images/line/card-filed-mark.png" alt="" draggable="false" />
              <div>
                <h3>Report handed off</h3>
                <p class="filed-card-sub">The simulated 1930 desk and bank freeze desk have this case.</p>
                <p class="filed-disclaimer">Simulated demonstration. Not a real government filing.</p>
              </div>
            </div>
            <div class="filed-ref">Tracking <span id="repRefNum">—</span></div>
            <div id="wsFilingLinks" style="display:flex;flex-direction:column;gap:0.55rem;margin:0 0 1rem;"></div>
            <div class="status-list" id="liveTimeline"></div>
            <button class="btn-link-type" onclick="resetToHome()">File another report</button>
          </div>
        </div>

      </div>
    </div>

    <!-- Technical case drawer — light editorial, matches site -->
    <div id="devDrawer" aria-label="Technical case details">
      <div class="drawer-top">
        <div>
          <div class="drawer-kicker">Behind the scenes</div>
          <h2 class="drawer-title">Case &amp; CAP trace</h2>
        </div>
        <button type="button" class="drawer-close" onclick="toggleDevDrawer()" aria-label="Close">×</button>
      </div>
      <p class="drawer-intro">What happened on this case, in order. Technical event IDs stay off this screen.</p>
      <div style="margin-bottom: 1.15rem;">
        <div class="drawer-label">Active incident</div>
        <div class="drawer-incident" id="devIncId">None yet</div>
      </div>
      <div>
        <div class="drawer-label" style="margin-bottom: 0.45rem;">Status</div>
        <div class="status-list" id="devJsonDump">
          <div class="status-step"><span class="status-step-label">No case yet. Start a report to see progress here.</span></div>
        </div>
      </div>
    </div>
    </div>
  `;

  const extraScripts = `
    <script>
      const CORE_URL = "${coreUrl}";
      const CAP_URL = "${capUrl}";
      const PORTAL_A_URL = ${JSON.stringify(portalAUrl)};
      const PORTAL_B_URL = ${JSON.stringify(portalBUrl)};
      const ELEVENLABS_AGENT_ID = ${JSON.stringify(elevenLabsAgentId)};

      function showProtocolWarming(show, detail) {
        var el = document.getElementById("protocolWarming");
        var copy = document.getElementById("protocolWarmingCopy");
        if (!el) return;
        el.classList.toggle("active", !!show);
        if (copy && detail) copy.textContent = detail;
      }

      async function protocolFetch(url, options) {
        var slow = setTimeout(function () {
          showProtocolWarming(true, "Starting the protocol… first request after idle can take a few seconds.");
        }, 900);
        try {
          return await fetch(url, options);
        } finally {
          clearTimeout(slow);
          showProtocolWarming(false);
        }
      }

      let currentIncidentId = null;
      let currentIncident = null;
      let startFreshCase = true;
      let currentLanguage = "en";
      // Demo citizen identity — pre-filled for the Ramesh Kumar mentor demo.
      // The user can override via the mobile input field rendered in the idle card.
      const DEMO_MOBILE = "+919876543210";
      let currentReporterMobile = DEMO_MOBILE;
      let isDevOpen = false;
      let activeConversation = null;
      let conversationPollInterval = null;
      let currentOrbState = "IDLE";
      let fluidOrbResize = null;
      /** True while a live ElevenLabs ConvAI session owns mic/speaker. */
      let elevenLabsSessionLive = false;
      /** Dedup Core process calls when SDK emits duplicate user transcripts. */
      let lastVoiceTurnText = "";
      let lastVoiceTurnAt = 0;
      let sessionConnecting = false;
      /** True after ElevenLabs reports speaking mode at least once (audio path alive). */
      let elevenLabsAudioHeard = false;
      let earlyDisconnectTimer = null;
      /** Mic stream opened on the language-click gesture; kept until call ends. */
      let permissionMicStream = null;
      /** Citizen confirmed dossier; waiting for spoken 12-digit UTR before CAP file. */
      let proofPending = false;

      (function initFluidOrb() {
        var canvas = document.getElementById("callFluidOrb");
        var host = document.getElementById("callDiyaOrb");
        if (!canvas || !host) return;
        var gl = canvas.getContext("webgl", { antialias: true, alpha: true });
        if (!gl) return;

        var VERT = "attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}";
        var FRAG = [
          "#ifdef GL_FRAGMENT_PRECISION_HIGH",
          "precision highp float;",
          "#else",
          "precision mediump float;",
          "#endif",
          "uniform vec2 u_resolution;",
          "uniform float u_time;",
          "uniform vec3 u_color;",
          "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}",
          "float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);}",
          "float fbm(vec2 p){float v=0.0;float a=0.6;for(int i=0;i<3;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}",
          "void main(){",
          "vec2 uv=gl_FragCoord.xy/u_resolution.xy;",
          "float t=u_time*0.22;",
          "vec2 drift=vec2(sin(t)+0.6*sin(t*1.7+1.3),cos(t*0.8)+0.6*cos(t*1.3+2.1));",
          "vec2 p=vec2(uv.x*1.8,uv.y*1.0)+drift*0.7;",
          "vec2 q=vec2(fbm(p+drift),fbm(p+vec2(3.2,1.5)-drift));",
          "float f=fbm(p+1.2*q);",
          "float g=clamp(1.0-uv.y,0.0,1.0);",
          "float anchor=smoothstep(0.0,0.3,uv.y);",
          "float shade=clamp(g+(f-0.5)*0.8*anchor,0.0,1.0);",
          "vec3 white=vec3(0.99,1.0,1.0);",
          "vec3 light=mix(white,u_color,0.5);",
          "vec3 dark=u_color;",
          "vec3 col=white;",
          "col=mix(col,light,smoothstep(0.28,0.52,shade));",
          "col=mix(col,dark,smoothstep(0.58,0.88,shade));",
          "float edge=smoothstep(0.5,0.49,distance(uv,vec2(0.5)));",
          "gl_FragColor=vec4(col*edge,edge);",
          "}"
        ].join("\\n");

        function hexToRgb(hex) {
          var h = String(hex || "#ea580c").replace("#", "").trim();
          if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
          var n = parseInt(h, 16);
          if (h.length !== 6 || Number.isNaN(n)) return [0.918, 0.345, 0.047];
          return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
        }

        function compile(type, src) {
          var sh = gl.createShader(type);
          gl.shaderSource(sh, src);
          gl.compileShader(sh);
          if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
            console.warn("[Orb] shader compile failed", gl.getShaderInfoLog(sh));
            gl.deleteShader(sh);
            return null;
          }
          return sh;
        }

        var program = gl.createProgram();
        var vert = compile(gl.VERTEX_SHADER, VERT);
        var frag = compile(gl.FRAGMENT_SHADER, FRAG);
        if (!program || !vert || !frag) return;
        gl.attachShader(program, vert);
        gl.attachShader(program, frag);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
        gl.useProgram(program);

        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
        var aPos = gl.getAttribLocation(program, "a_pos");
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        var locRes = gl.getUniformLocation(program, "u_resolution");
        var locTime = gl.getUniformLocation(program, "u_time");
        var locColor = gl.getUniformLocation(program, "u_color");
        var rgb = hexToRgb(host.getAttribute("data-color") || "#ea580c");
        gl.uniform3f(locColor, rgb[0], rgb[1], rgb[2]);

        function updateSize() {
          var dpr = Math.min(window.devicePixelRatio || 1, 2);
          var target = host.clientWidth || 240;
          var px = Math.round(target * dpr);
          if (!px) return;
          canvas.width = px;
          canvas.height = px;
          canvas.style.width = target + "px";
          canvas.style.height = target + "px";
          gl.viewport(0, 0, px, px);
          gl.uniform2f(locRes, px, px);
        }

        updateSize();
        fluidOrbResize = updateSize;
        if (typeof ResizeObserver !== "undefined") {
          new ResizeObserver(updateSize).observe(host);
        }

        var speedFactors = { IDLE: 0.15, CONNECTING: 0.2, LISTENING: 0.5, SPEAKING: 0.85, PROCESSING: 0.35, ERROR: 0.12 };
        var accumulated = 0;
        var last = performance.now();
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        function render(now) {
          var dt = (now - last) * 0.001;
          last = now;
          if (document.visibilityState === "visible" && canvas.width) {
            var state = host.getAttribute("data-state") || "IDLE";
            if (!reduce) accumulated += dt * (speedFactors[state] || 0.5);
            gl.uniform1f(locTime, reduce ? 0 : accumulated);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
          }
          requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
      })();

      function setOrbState(state) {
        currentOrbState = state;
        const orb = document.getElementById("callDiyaOrb");
        if (orb) orb.setAttribute("data-state", state);
        const badge = document.getElementById("callStatusBadge");
        if (!badge) return;

        switch (state) {
          case "CONNECTING":
            badge.innerText = "Connecting to Raksha…";
            break;
          case "LISTENING":
            badge.innerText = "Listening…";
            break;
          case "SPEAKING":
            badge.innerText = "Raksha is speaking…";
            break;
          case "PROCESSING":
            badge.innerText = "Understanding…";
            break;
          case "ERROR":
            badge.innerText = "Connection issue — try again";
            break;
          case "IDLE":
            badge.innerText = "Tap below to start speaking";
            break;
          default:
            badge.innerText = "Raksha is active";
        }
      }

      let currentAudio = null;
      let speechRecognizer = null;

      async function playRakshaSpeech(text) {
        if (!text) return;
        setOrbState("SPEAKING");

        if (currentAudio) {
          try { currentAudio.pause(); } catch {}
          currentAudio = null;
        }

        try {
          const res = await protocolFetch(CORE_URL + "/v1/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
          });

          if (res.ok) {
            const blob = await res.blob();
            const audioUrl = URL.createObjectURL(blob);
            currentAudio = new Audio(audioUrl);
            currentAudio.onended = () => {
              setOrbState("LISTENING");
            };
            currentAudio.onerror = () => {
              setOrbState("LISTENING");
            };
            await currentAudio.play();
            return;
          }
        } catch (err) {
          console.warn("[TTS Playback fallback]:", err);
        }

        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = currentLanguage === "hi" ? "hi-IN" : currentLanguage === "ta" ? "ta-IN" : "en-IN";
          u.rate = 0.95;
          u.onend = () => setOrbState("LISTENING");
          window.speechSynthesis.speak(u);
        } else {
          setTimeout(() => setOrbState("LISTENING"), 3500);
        }
      }

      function resetLiveCallDisplay() {
        currentIncidentId = null;
        currentIncident = null;
        startFreshCase = true;
        lastVoiceTurnText = "";
        lastVoiceTurnAt = 0;
        elevenLabsSessionLive = false;
        sessionConnecting = false;
        proofPending = false;
        hideCallOutcome();
        
        if (currentAudio) {
          try { currentAudio.pause(); } catch {}
          currentAudio = null;
        }
        if (speechRecognizer) {
          try { speechRecognizer.stop(); } catch {}
          speechRecognizer = null;
        }

        const capsule = document.getElementById("callCaseCapsule");
        if (capsule) capsule.style.display = "none";
        
        const facts = document.getElementById("capsuleFacts");
        if (facts) facts.innerText = "";
        
        const stateEl = document.getElementById("capsuleState");
        if (stateEl) stateEl.innerText = "";

        const capsuleId = document.getElementById("capsuleCaseId");
        if (capsuleId) capsuleId.innerText = "—";

        resetTranscriptFeed();
        resetDossierPanel();

        const btnStart = document.getElementById("btnStartSpeaking");
        const btnEnd = document.getElementById("btnEndConversation");
        const btnConfirm = document.getElementById("btnCallConfirm");
        if (btnStart) btnStart.style.display = "inline-flex";
        if (btnEnd) btnEnd.style.display = "none";
        if (btnConfirm) btnConfirm.style.display = "none";

        document.querySelectorAll(".call-lang-option").forEach(function (btn) {
          btn.setAttribute("aria-pressed", "false");
        });
        showLanguageGate(true);
        setOrbState("IDLE");
      }

      function escapeHtml(s) {
        return String(s || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      function resetTranscriptFeed() {
        const feed = document.getElementById("liveTranscriptFeed");
        if (!feed) return;
        feed.innerHTML = '<div class="transcript-empty" id="transcriptEmpty">Raksha’s replies appear here. What you say shows underneath.</div>';
        const prompt = document.getElementById("agentTurnPrompt");
        if (prompt) prompt.innerText = "";
        const userSpeech = document.getElementById("userTurnSpeech");
        if (userSpeech) userSpeech.innerText = "";
      }

      function appendTranscript(role, text) {
        const clean = String(text || "").trim();
        if (!clean) return;
        const feed = document.getElementById("liveTranscriptFeed");
        if (!feed) return;
        const empty = document.getElementById("transcriptEmpty");
        if (empty) empty.remove();

        const last = feed.lastElementChild;
        if (last && last.getAttribute("data-role") === role && last.getAttribute("data-text") === clean) {
          return;
        }

        const bubble = document.createElement("div");
        bubble.className = "transcript-bubble " + (role === "user" ? "user" : "agent");
        bubble.setAttribute("data-role", role);
        bubble.setAttribute("data-text", clean);
        bubble.innerHTML =
          '<div class="transcript-who">' + (role === "user" ? "You" : "Raksha") + "</div>" +
          '<div class="transcript-text">' + escapeHtml(clean) + "</div>";
        feed.appendChild(bubble);
        feed.scrollTop = feed.scrollHeight;

        if (role === "user") {
          const u = document.getElementById("userTurnSpeech");
          if (u) u.innerText = clean;
        } else {
          const a = document.getElementById("agentTurnPrompt");
          if (a) a.innerText = clean;
        }
      }

      function resetDossierPanel() {
        const body = document.getElementById("callDossierBody");
        const actions = document.getElementById("callDossierActions");
        if (body) {
          body.innerHTML = '<p class="dossier-empty" id="dossierEmpty">As Raksha understands your report, amount, bank, UTR, and other details will appear here for you to confirm.</p>';
        }
        if (actions) {
          actions.innerHTML = "";
          actions.hidden = true;
        }
      }

      function filingLinkCardsHtml(bankName, refNumber) {
        const bank = bankName || "Bank";
        const ref = refNumber ? '<div class="dossier-ref" style="margin-bottom:0.35rem;">' + escapeHtml(refNumber) + "</div>" : "";
        return (
          ref +
          '<a class="dossier-link" href="' + escapeHtml(PORTAL_A_URL) + '" target="_blank" rel="noopener">' +
            '<div class="dossier-link-title">1930 cyber cell desk</div>' +
            '<div class="dossier-link-sub">Open the simulated Portal A intake for this case</div>' +
          "</a>" +
          '<a class="dossier-link" href="' + escapeHtml(PORTAL_B_URL) + '" target="_blank" rel="noopener">' +
            '<div class="dossier-link-title">' + escapeHtml(bank) + " freeze desk</div>" +
            '<div class="dossier-link-sub">Open the simulated Portal B bank response console</div>' +
          "</a>"
        );
      }

      function renderWsFilingLinks(inc, refNumber) {
        const box = document.getElementById("wsFilingLinks");
        if (!box) return;
        const bank = inc?.transaction?.debitInstitution || "Bank";
        box.innerHTML = filingLinkCardsHtml(bank, refNumber);
      }

      function syncReadyPanelFromIncident(inc) {
        if (!inc || !inc.transaction) return;
        const amt = document.getElementById("repAmount");
        const ch = document.getElementById("repChannel");
        const utr = document.getElementById("repUtr");
        const bank = document.getElementById("repBank");
        if (amt) amt.innerText = inc.transaction.amount ? "₹" + Number(inc.transaction.amount).toLocaleString() : "—";
        if (ch) {
          const app = inc.transaction.application;
          const rawCh = inc.transaction.channel;
          const chLabel =
            app ||
            (rawCh === "BANK_TRANSFER" ? "Bank transfer" :
             rawCh === "UPI" ? "UPI" :
             rawCh === "CARD" ? "Card" :
             rawCh === "WALLET" ? "Wallet" :
             rawCh && rawCh !== "OTHER" ? rawCh : "—");
          ch.innerText = chLabel;
        }
        if (utr) utr.innerText = inc.transaction.transactionId || "—";
        if (bank) bank.innerText = inc.transaction.debitInstitution || "—";
      }

      function setCallConfirmVisible(visible) {
        const btnConfirm = document.getElementById("btnCallConfirm");
        if (btnConfirm) btnConfirm.style.display = visible ? "inline-flex" : "none";
      }

      function scamCategoryLabel(cat) {
        const map = {
          ELECTRICITY_BILL_SCAM: "Electricity / utility bill scam",
          DIGITAL_ARREST: "Digital arrest scam",
          UPI_PAYMENT_FRAUD: "UPI payment fraud",
          TASK_SCAM: "Task / job scam",
          KYC_UPDATE_FRAUD: "KYC update fraud",
          LOTTERY_PHISHING: "Lottery / prize phishing",
          CUSTOMER_CARE_IMPERSONATION: "Fake customer care",
          OTHER: "Other cyber fraud"
        };
        return map[cat] || (cat ? String(cat) : "");
      }

      function setCallProofVisible(_visible) {
        const btn = document.getElementById("btnCallProof");
        if (btn) {
          btn.style.display = "none";
          btn.hidden = true;
        }
      }

      function showCallOutcome(inc, refNumber) {
        const outcome = document.getElementById("callOutcome");
        const session = document.getElementById("callSessionBody");
        const langGate = document.getElementById("callLangGate");
        if (langGate) langGate.hidden = true;
        if (session) session.hidden = true;
        if (outcome) outcome.classList.add("active");

        const bank = inc?.transaction?.debitInstitution || "Bank";
        const ref = refNumber || inc?.handoff?.externalReference || "Pending";
        const refEl = document.getElementById("callOutcomeRef");
        if (refEl) refEl.innerText = ref;
        const copy = document.getElementById("callOutcomeCopy");
        if (copy) {
          copy.innerText =
            "We sent your verified report to the 1930 cyber cell desk and the " +
            bank +
            " freeze desk. You can open both desks below to see the simulated handoff.";
        }
        const links = document.getElementById("callOutcomeLinks");
        if (links) links.innerHTML = filingLinkCardsHtml(bank, ref);

        const badge = document.getElementById("callStatusBadge");
        if (badge) badge.innerText = "Filed — nothing else to do";
        setOrbState("IDLE");
      }

      function hideCallOutcome() {
        const outcome = document.getElementById("callOutcome");
        if (outcome) outcome.classList.remove("active");
      }

      function updateDossierFromIncident(inc, state, externalRef) {
        const body = document.getElementById("callDossierBody");
        const actions = document.getElementById("callDossierActions");
        if (!body) return;

        const effectiveState = state || inc?.state || "INTAKE";
        const handoffRef = externalRef || inc?.handoff?.externalReference || "";
        const tx = inc?.transaction || {};
        const factsConfirmed = !!(inc?.validation?.factsConfirmed || proofPending);
        const proofVerified = !!inc?.validation?.proofVerified;
        const rows = [];

        function pushRow(label, value, muted) {
          if (value == null || value === "") return;
          rows.push({ label: label, value: String(value), muted: !!muted });
        }

        pushRow("Scam type", scamCategoryLabel(inc?.fraudCategory));
        if (tx.amount != null && tx.amount !== "") {
          pushRow("Amount", "₹" + Number(tx.amount).toLocaleString());
        }
        pushRow(
          "Channel",
          tx.application ||
            (tx.channel === "BANK_TRANSFER"
              ? "Bank transfer"
              : tx.channel === "UPI"
                ? "UPI"
                : tx.channel === "CARD"
                  ? "Card"
                  : tx.channel === "WALLET"
                    ? "Wallet"
                    : "")
        );
        pushRow("Bank", tx.debitInstitution);
        pushRow("UTR", tx.transactionId);
        if (tx.timestamp) {
          try {
            pushRow("When", new Date(tx.timestamp).toLocaleString());
          } catch (_) {
            pushRow("When", tx.timestamp);
          }
        }
        pushRow("Beneficiary", tx.beneficiaryIdentifier);
        const story = inc?.scamSummary || inc?.narrative?.text;
        if (story) {
          const n = String(story);
          pushRow("What happened", n.length > 180 ? n.slice(0, 177) + "…" : n);
        }

        const hasFacts = rows.length > 0;
        const isReady =
          effectiveState === "READY" || effectiveState === "USER_CONFIRMATION";
        const isFiled =
          effectiveState === "SUBMITTED" || effectiveState === "ACKNOWLEDGED";
        const spokenUtrOk =
          Number(tx.amount || 0) > 0 &&
          String(tx.transactionId || "").replace(/\D/g, "").length === 12;
        const needsProof =
          isReady && factsConfirmed && !proofVerified && !spokenUtrOk && !isFiled;

        let statusHtml = "";
        if (isFiled) {
          statusHtml = '<div class="dossier-status filed">Filed with 1930 / bank</div>';
        } else if (needsProof) {
          statusHtml = '<div class="dossier-status proof">Need 12-digit UTR</div>';
        } else if (isReady) {
          statusHtml = '<div class="dossier-status ready">Ready — please confirm</div>';
        } else if (hasFacts) {
          statusHtml = '<div class="dossier-status">Gathering details</div>';
        }

        if (!hasFacts && !isFiled) {
          body.innerHTML =
            statusHtml +
            '<p class="dossier-empty" id="dossierEmpty">As Raksha understands your report, scam type, amount, bank, UTR, and other details will appear here for you to confirm.</p>';
        } else {
          const caseId =
            hasFacts || isReady || isFiled
              ? (inc?.id || currentIncidentId || "")
              : "";
          let html = statusHtml;
          if (caseId && String(caseId).startsWith("RKS-") && (hasFacts || isReady || isFiled)) {
            html +=
              '<div class="dossier-row"><div class="dossier-k">Case</div><div class="dossier-v">' +
              escapeHtml(caseId) +
              "</div></div>";
          }
          rows.forEach(function (r) {
            html +=
              '<div class="dossier-row"><div class="dossier-k">' +
              escapeHtml(r.label) +
              '</div><div class="dossier-v' +
              (r.muted ? " muted" : "") +
              '">' +
              escapeHtml(r.value) +
              "</div></div>";
          });
          if (isFiled && handoffRef) {
            html +=
              '<div class="dossier-row"><div class="dossier-k">Tracking</div><div class="dossier-v"><span class="dossier-ref">' +
              escapeHtml(handoffRef) +
              "</span></div></div>";
          }
          body.innerHTML = html;
        }

        if (actions) {
          if (needsProof) {
            actions.hidden = false;
            actions.innerHTML =
              '<p class="dossier-confirm-note">Details confirmed. Say the 12-digit UTR from your bank SMS or receipt — that is the proof on a call. We cannot file from a spoken claim alone.</p>';
            setCallConfirmVisible(false);
            setCallProofVisible(false);
          } else if (isReady && !factsConfirmed) {
            actions.hidden = false;
            actions.innerHTML =
              '<p class="dossier-confirm-note">Please verify every detail on the right is correct, then confirm.</p>';
            setCallConfirmVisible(true);
            setCallProofVisible(false);
          } else if (isFiled) {
            actions.hidden = false;
            const bank = tx.debitInstitution || "Bank";
            actions.innerHTML =
              '<p class="dossier-confirm-note">Case filed (simulated). Open the desks below.</p>' +
              filingLinkCardsHtml(bank, handoffRef);
            setCallConfirmVisible(false);
            setCallProofVisible(false);
          } else {
            actions.innerHTML = "";
            actions.hidden = true;
            setCallConfirmVisible(false);
            setCallProofVisible(false);
          }
        }
      }

      function updateIncidentUI(inc, state, externalRef) {
        if (!inc && !currentIncidentId) return;

        const effectiveId = inc?.id || currentIncidentId;
        const capsule = document.getElementById("callCaseCapsule");
        const badge = document.getElementById("callStatusBadge");
        const effectiveState = state || inc?.state || "INTAKE";
        const handoffRef =
          externalRef ||
          inc?.handoff?.externalReference ||
          "";

        const devIncId = document.getElementById("devIncId");
        if (devIncId && effectiveId) devIncId.innerText = effectiveId;

        // Capsule stays hidden — dossier is the citizen-facing fact surface.
        if (capsule) capsule.style.display = "none";

        updateDossierFromIncident(inc, effectiveState, handoffRef);

        if (badge && currentOrbState !== "SPEAKING" && currentOrbState !== "PROCESSING") {
          if (effectiveState === "READY" || effectiveState === "USER_CONFIRMATION") {
            if (inc?.validation?.factsConfirmed || proofPending) {
              if (inc?.validation?.proofVerified) {
                badge.innerText = "Proof verified — filing…";
              } else {
                badge.innerText = "Say the 12-digit UTR to file";
              }
            } else {
              badge.innerText = "Awaiting your confirmation";
            }
            syncReadyPanelFromIncident(inc);
          } else if (effectiveState === "SUBMITTED" || effectiveState === "ACKNOWLEDGED") {
            badge.innerText = "Case filed — see outcome";
            if (handoffRef) {
              const refEl = document.getElementById("repRefNum");
              if (refEl) refEl.innerText = handoffRef;
            }
            renderWsFilingLinks(inc, handoffRef);
          } else if (effectiveState === "QUESTION_PENDING" || effectiveState === "INTAKE") {
            badge.innerText = "Gathering details…";
          }
        }
      }

      async function sendVoiceTurnToBackend(speechText) {
        const text = (speechText || "").trim();
        if (!text) return;

        const now = Date.now();
        if (text === lastVoiceTurnText && now - lastVoiceTurnAt < 2500) return;
        lastVoiceTurnText = text;
        lastVoiceTurnAt = now;

        try {
          setOrbState("PROCESSING");
          const looksConfirm =
            text.length < 48 &&
            /^(yes|yep|yeah|haan|ha|confirm|confirmed|sahi|theek|हाँ|சரி)([.,!\s]|$)/i.test(text);
          const canConfirmFacts =
            looksConfirm &&
            !startFreshCase &&
            !!currentIncidentId &&
            (currentIncident?.state === "READY" || currentIncident?.state === "USER_CONFIRMATION");
          const res = await protocolFetch(CORE_URL + "/v1/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              incidentId: startFreshCase ? undefined : (currentIncidentId || undefined),
              forceNew: startFreshCase,
              source: "web",
              modality: "voice",
              content: text,
              language: currentLanguage === "hi" ? "hi" : currentLanguage === "ta" ? "ta" : "en",
              reporter: { mobile: currentReporterMobile },
              confirmFacts: canConfirmFacts || undefined
            })
          });
          if (res.ok) {
            const data = await res.json();
            currentIncidentId = data.incidentId;
            currentIncident = data.incident;
            startFreshCase = false;
            updateIncidentUI(
              data.incident,
              data.state,
              data.incident?.handoff?.externalReference
            );
            fetchDevEvents();

            const spokenUtr = String(data.incident?.transaction?.transactionId || "").replace(/\D/g, "");
            const spokenAmount = Number(data.incident?.transaction?.amount || 0);
            const hasSpokenProof = spokenAmount > 0 && spokenUtr.length === 12;
            if (canConfirmFacts && hasSpokenProof) {
              await confirmFromLiveCall();
              return;
            }

            const coreQuestion = data.question || data.nextAction?.prompt;

            // ElevenLabs owns spoken audio when live — UI text only; Core owns facts.
            if (coreQuestion && data.state === "QUESTION_PENDING") {
              if (!elevenLabsSessionLive) {
                appendTranscript("agent", coreQuestion);
                playRakshaSpeech(coreQuestion);
              } else if (activeConversation && typeof activeConversation.sendContextualUpdate === "function") {
                try {
                  activeConversation.sendContextualUpdate(
                    "Raksha Core needs this clarification from the citizen: " + coreQuestion
                  );
                } catch (_) {}
              }
            } else if (data.state === "READY" || data.state === "USER_CONFIRMATION") {
              const isHi = currentLanguage === "hi";
              const amt = data.incident?.transaction?.amount;
              const bank = data.incident?.transaction?.debitInstitution;
              const utr = data.incident?.transaction?.transactionId;
              const parts = [];
              if (amt != null && amt !== "") parts.push("₹" + amt);
              if (bank) parts.push(bank);
              if (utr) parts.push("UTR " + utr);
              const detail = parts.length ? parts.join(" ") : "the details we gathered";
              const missingUtr = String(utr || "").replace(/\D/g, "").length !== 12;
              const reply = missingUtr
                ? (isHi
                    ? "मैंने विवरण दर्ज कर लिया है: " + detail + "। रिपोर्ट दर्ज करने से पहले बैंक SMS से 12 अंकों का UTR बताइए।"
                    : "I have recorded " + detail + ". I still need the 12-digit UTR from your bank SMS before I can file.")
                : (isHi
                    ? "मैंने विवरण दर्ज कर लिया है: " + detail + "। क्या मैं इसे 1930 और बैंक को भेज दूँ?"
                    : "I have recorded " + detail + ". Please confirm — shall I send this to 1930 and the bank?");
              if (!elevenLabsSessionLive) {
                appendTranscript("agent", reply);
                playRakshaSpeech(reply);
              } else if (activeConversation && typeof activeConversation.sendContextualUpdate === "function") {
                try {
                  activeConversation.sendContextualUpdate(
                    missingUtr
                      ? "Raksha Core still needs the 12-digit UTR before filing. Ask for it. Do not ask for a screenshot."
                      : "Raksha Core marked the incident READY for citizen confirmation. Ask them to confirm dispatch."
                  );
                } catch (_) {}
              }
            } else if (data.state === "SUBMITTED" || data.state === "ACKNOWLEDGED") {
              const trackingRef = data.incident?.handoff?.externalReference || "";
              const reply = trackingRef
                ? "Your emergency report is accepted. Tracking number " + trackingRef + "."
                : "Your emergency report has been accepted.";
              if (!elevenLabsSessionLive) {
                appendTranscript("agent", reply);
                playRakshaSpeech(reply);
              }
            }

            if (!elevenLabsSessionLive) {
              if (currentOrbState === "PROCESSING") setOrbState("LISTENING");
            } else if (currentOrbState === "PROCESSING") {
              // Core finished; wait for agent mode, but don't stay stuck on Understanding.
              setTimeout(function () {
                if (currentOrbState === "PROCESSING") setOrbState("LISTENING");
              }, 1200);
            }
          } else {
            setOrbState("ERROR");
          }
        } catch (e) {
          console.warn("[Voice] Backend sync failed:", e);
          setOrbState("ERROR");
        }
      }

      function startLiveVoiceCall() {
        const mobileEl = document.getElementById("reporterMobile");
        if (mobileEl && mobileEl.value) currentReporterMobile = mobileEl.value.trim();
        const modal = document.getElementById("rakshaCallModal");
        modal.classList.add("active");
        hideCallOutcome();
        resetLiveCallDisplay();
        showLanguageGate(true);
        setOrbState("IDLE");
        if (typeof fluidOrbResize === "function") {
          requestAnimationFrame(function () {
            requestAnimationFrame(fluidOrbResize);
          });
        }
      }

      function showLanguageGate(show) {
        const gate = document.getElementById("callLangGate");
        const body = document.getElementById("callSessionBody");
        if (gate) {
          if (show) gate.removeAttribute("hidden");
          else gate.setAttribute("hidden", "");
        }
        if (body) {
          if (show) body.setAttribute("hidden", "");
          else body.removeAttribute("hidden");
        }
        const ind = document.getElementById("callLangIndicator");
        if (show && ind) ind.innerText = "Choose language";
      }

      function languageLabel(lang) {
        if (lang === "hi") return "हिंदी";
        if (lang === "ta") return "தமிழ்";
        return "English";
      }

      function greetingForLanguage(lang) {
        if (lang === "hi") {
          return "नमस्ते, रक्षा आपातकालीन साइबर हेल्पलाइन में आपका स्वागत है। आप बिल्कुल चिंता मत कीजिए। मुझे बताइए क्या हुआ?";
        }
        if (lang === "ta") {
          return "வணக்கம், ரக்ஷா அவசர சைபர் உதவி மையம். கவலைப்பட வேண்டாம். என்ன நடந்தது என்று சொல்லுங்கள்?";
        }
        return "Hello, welcome to the Raksha emergency cyber helpline. Please don't worry — tell me what happened.";
      }

      function isIdleNudgeMessage(message) {
        const m = String(message || "").toLowerCase();
        return /still there|are you there|are you still|hello\?|can you hear me\??\s*$|क्या आप अभी भी|நீங்கள் இன்னும்/.test(m);
      }

      function languagePromptAddon(lang) {
        if (lang === "hi") {
          return "CRITICAL SESSION RULE (locked for entire call): Speak ONLY in Hindi (or natural Hinglish). Never switch to English or Tamil. After asking a question, wait patiently — do not say 'are you still there' quickly.";
        }
        if (lang === "ta") {
          return "CRITICAL SESSION RULE (locked for entire call): Speak ONLY in Tamil. Never switch to English or Hindi. After asking a question, wait patiently — do not nudge too quickly.";
        }
        return "CRITICAL SESSION RULE (locked for entire call): Speak ONLY in clear English. Never greet or reply in Hindi or Tamil. Stay in English for the whole conversation. After asking a question, wait patiently for the citizen to finish — do not say 'Are you still there?' quickly.";
      }

      /** Full prompt for overrides — must include base duties; EL replaces prompt.prompt entirely. */
      function sessionPromptForLanguage(lang) {
        const lock = languagePromptAddon(lang);
        const base =
          "You are Raksha — an emergency first-responder for Indian financial cyber-fraud reporting. " +
          "Be calm, brief, and empathetic. Collect missing facts (amount, bank, 12-digit UTR). " +
          "Never ask for OTP/PIN/passwords. Never claim the bank is already frozen. " +
          "Never say the report is already submitted. On a call, the 12-digit UTR is the proof — do not ask for a screenshot. " +
          "After they confirm amount, bank, and UTR, ask them to confirm so we can file with 1930 and the bank. " +
          "Do not invent amounts, banks, UTRs, or names that the citizen did not say. Keep sentences short.";
        if (lang === "en") {
          return (
            base +
            " " +
            lock +
            " All questions and confirmations must be in English only — even if the citizen uses a Hindi word."
          );
        }
        if (lang === "ta") {
          return base + " " + lock + " Reply only in Tamil for the entire call.";
        }
        return base + " " + lock + " Reply only in Hindi/Hinglish for the entire call.";
      }

      /** Session overrides — language is locked for the full call (agent platform allows these). */
      function buildLanguageOverrides(lang, firstMessage) {
        const overrides = {
          agent: {
            firstMessage: firstMessage,
            language: lang === "ta" ? "ta" : lang === "hi" ? "hi" : "en",
            prompt: { prompt: sessionPromptForLanguage(lang) }
          }
        };
        // English agents require turbo/flash v2 (not multilingual v2_5).
        if (lang === "en") {
          overrides.tts = { modelId: "eleven_turbo_v2" };
        }
        return overrides;
      }

      function ensureHtmlAudioPlaying() {
        try {
          document.querySelectorAll("audio").forEach(function (el) {
            el.muted = false;
            el.volume = 1;
            var p = el.play();
            if (p && typeof p.catch === "function") p.catch(function () {});
          });
        } catch (_) {}
      }

      function selectCallLanguage(lang) {
        currentLanguage = lang === "hi" || lang === "ta" ? lang : "en";
        // Prime audio SYNCHRONOUSLY on the click gesture (before any await).
        try {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (Ctx) {
            if (!window.__rakshaAudioCtx) window.__rakshaAudioCtx = new Ctx();
            window.__rakshaAudioCtx.resume();
            const ctx = window.__rakshaAudioCtx;
            const buf = ctx.createBuffer(1, 1, 22050);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(ctx.destination);
            src.start(0);
          }
        } catch (_) {}
        if (typeof window.switchLang === "function") window.switchLang(currentLanguage);
        document.querySelectorAll(".call-lang-option").forEach(function (btn) {
          btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === currentLanguage ? "true" : "false");
        });
        const ind = document.getElementById("callLangIndicator");
        if (ind) ind.innerText = languageLabel(currentLanguage);
        showLanguageGate(false);
        connectAndStartSpeaking();
      }

      async function loadElevenLabsConversation() {
        // Pin a version with WebRTC first-message audio fixes.
        const urls = [
          "https://esm.sh/@elevenlabs/client@1.8.1",
          "https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.8.1/+esm",
          "https://esm.sh/@elevenlabs/client@latest",
          "https://cdn.jsdelivr.net/npm/@elevenlabs/client/+esm"
        ];
        let lastErr = null;
        for (const url of urls) {
          try {
            const mod = await import(url);
            if (mod && mod.Conversation) return mod.Conversation;
          } catch (e) {
            lastErr = e;
          }
        }
        throw lastErr || new Error("ElevenLabs Conversation SDK unavailable");
      }

      async function fetchElevenLabsConversationToken(agentId) {
        const q = agentId ? ("?agentId=" + encodeURIComponent(agentId)) : "";
        const res = await fetch("/app/elevenlabs/conversation-token" + q);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || ("conversation-token HTTP " + res.status));
        }
        const data = await res.json();
        const token = data.token || data.conversation_token || data.conversationToken;
        if (!token) throw new Error("No conversation token in ElevenLabs response");
        return token;
      }

      async function fetchElevenLabsSignedUrl(agentId) {
        const q = agentId ? ("?agentId=" + encodeURIComponent(agentId)) : "";
        const res = await fetch("/app/elevenlabs/signed-url" + q);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || ("signed-url HTTP " + res.status));
        }
        const data = await res.json();
        const signedUrl = data.signed_url || data.signedUrl;
        if (!signedUrl) throw new Error("No signed_url in ElevenLabs response");
        return signedUrl;
      }

      async function resolveElevenLabsAgentId() {
        if (ELEVENLABS_AGENT_ID) return ELEVENLABS_AGENT_ID;
        try {
          const res = await fetch("/app/elevenlabs/config");
          if (!res.ok) return "";
          const data = await res.json();
          return data.agentId || "";
        } catch (_) {
          return "";
        }
      }

      /**
       * Client tools registered on the historical Raksha intake agent
       * (see scripts/configure-elevenlabs.mjs). Agent calls these; we route to Core/CAP.
       */
      function buildRakshaClientTools() {
        return {
          raksha_start_incident: async (params) => {
            setOrbState("PROCESSING");
            const narrative = String(params?.narrative || params?.text || "").trim();
            if (!narrative) return JSON.stringify({ ok: false, error: "narrative required" });
            const u = document.getElementById("userTurnSpeech");
            if (u) u.innerText = narrative;
            appendTranscript("user", narrative);
            await sendVoiceTurnToBackend(narrative);
            return JSON.stringify({
              ok: true,
              incidentId: currentIncidentId,
              state: currentIncident?.state || null,
              question: currentIncident?.clarification?.question || null
            });
          },
          raksha_process_input: async (params) => {
            setOrbState("PROCESSING");
            const speech = String(
              params?.userSpeech || params?.speech || params?.text || ""
            ).trim();
            if (params?.incidentId && !currentIncidentId) {
              currentIncidentId = String(params.incidentId);
            }
            if (!speech) return JSON.stringify({ ok: false, error: "userSpeech required" });
            appendTranscript("user", speech);
            await sendVoiceTurnToBackend(speech);
            return JSON.stringify({
              ok: true,
              incidentId: currentIncidentId,
              state: currentIncident?.state || null
            });
          },
          raksha_submit_incident: async (params) => {
            const confirmed = params?.confirmedByCitizen === true || params?.confirmedByCitizen === "true";
            if (!confirmed) {
              return JSON.stringify({ ok: false, error: "Citizen confirmation required" });
            }
            if (params?.incidentId) currentIncidentId = String(params.incidentId);
            if (!currentIncidentId || !currentIncident) {
              return JSON.stringify({ ok: false, error: "No active incident" });
            }
            const st = currentIncident.state;
            if (st !== "READY" && st !== "USER_CONFIRMATION") {
              return JSON.stringify({ ok: false, error: "Incident not READY", state: st });
            }
            await confirmFromLiveCall();
            return JSON.stringify({
              ok: true,
              incidentId: currentIncidentId,
              externalReference: document.getElementById("repRefNum")?.innerText || null
            });
          }
        };
      }

      async function startFallbackVoicePath() {
        elevenLabsSessionLive = false;
        const greeting = currentLanguage === "hi"
          ? "नमस्ते, रक्षा आपातकालीन साइबर हेल्पलाइन में आपका स्वागत है। आप बिल्कुल चिंता मत कीजिए। मुझे बताइए क्या हुआ?"
          : "Hello, welcome to the Raksha emergency cyber helpline. Please tell me what happened.";
        appendTranscript("agent", greeting);
        await playRakshaSpeech(greeting);

        try {
          const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!SpeechRec) {
            setOrbState("ERROR");
            return;
          }
          speechRecognizer = new SpeechRec();
          speechRecognizer.lang = currentLanguage === "hi" ? "hi-IN" : currentLanguage === "ta" ? "ta-IN" : "en-IN";
          speechRecognizer.continuous = true;
          speechRecognizer.interimResults = true;

          speechRecognizer.onresult = (event) => {
            let interim = "";
            let final = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) final += event.results[i][0].transcript;
              else interim += event.results[i][0].transcript;
            }
            const transcript = final || interim;
            if (transcript) {
              if (final) {
                appendTranscript("user", final);
                setOrbState("PROCESSING");
                sendVoiceTurnToBackend(final);
              }
            }
          };

          speechRecognizer.onerror = (e) => {
            if (e.error === "no-speech" || e.error === "aborted") return;
            console.warn("[SpeechRecognition]:", e.error);
            setOrbState("LISTENING");
          };

          speechRecognizer.start();
          setOrbState("LISTENING");
        } catch (recErr) {
          console.warn("SpeechRec start:", recErr);
          setOrbState("ERROR");
        }
      }

      async function unlockBrowserAudio() {
        try {
          const Ctx = window.AudioContext || window.webkitAudioContext;
          if (!Ctx) return;
          if (!window.__rakshaAudioCtx) window.__rakshaAudioCtx = new Ctx();
          if (window.__rakshaAudioCtx.state === "suspended") {
            await window.__rakshaAudioCtx.resume();
          }
          // Short silent buffer forces autoplay permission on this user gesture.
          const ctx = window.__rakshaAudioCtx;
          const buf = ctx.createBuffer(1, 1, 22050);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(ctx.destination);
          src.start(0);
        } catch (e) {
          console.warn("[Audio] unlock failed:", e);
        }
      }

      async function connectAndStartSpeaking() {
        if (sessionConnecting || elevenLabsSessionLive) {
          console.warn("[ElevenLabs] Session already starting/live — ignoring duplicate start");
          return;
        }
        sessionConnecting = true;
        elevenLabsAudioHeard = false;

        const btnStart = document.getElementById("btnStartSpeaking");
        const btnEnd = document.getElementById("btnEndConversation");
        if (btnStart) btnStart.style.display = "none";
        if (btnEnd) btnEnd.style.display = "inline-flex";

        showLanguageGate(false);
        setOrbState("CONNECTING");

        const agentId = await resolveElevenLabsAgentId();
        if (!agentId) {
          console.warn("[ElevenLabs] No ELEVENLABS_INTAKE_AGENT_ID configured — using mic fallback");
          sessionConnecting = false;
          await startFallbackVoicePath();
          return;
        }

        const firstMessage = greetingForLanguage(currentLanguage);
        appendTranscript("agent", firstMessage);

        let micStream = null;
        try {
          // User-gesture unlock: mic + AudioContext (needed for EL playback).
          await unlockBrowserAudio();
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          permissionMicStream = micStream;

          const Conversation = await loadElevenLabsConversation();
          if (!Conversation) throw new Error("Conversation SDK unavailable");

          if (activeConversation) {
            try { await activeConversation.endSession(); } catch (_) {}
            activeConversation = null;
          }

          let greetingDone = false;
          let lastAgentSpoken = "";
          const sessionOpts = {
            overrides: buildLanguageOverrides(currentLanguage, firstMessage),
            onConnect: () => {
              console.log("[ElevenLabs] Connected to", agentId, "lang=", currentLanguage);
              elevenLabsSessionLive = true;
              sessionConnecting = false;
              startIncidentPoll();
              if (currentOrbState === "CONNECTING") setOrbState("SPEAKING");
              // Mute LiveKit/WebRTC remote audio — playback is via Core /v1/tts (reliable).
              try {
                if (activeConversation && typeof activeConversation.setVolume === "function") {
                  activeConversation.setVolume({ volume: 0 });
                }
              } catch (_) {}
              try {
                if (activeConversation && typeof activeConversation.sendContextualUpdate === "function") {
                  activeConversation.sendContextualUpdate(languagePromptAddon(currentLanguage));
                }
              } catch (_) {}
              // Speak greeting via Core TTS so the citizen always hears it.
              playRakshaSpeech(firstMessage);
            },
            onDisconnect: (details) => {
              console.warn("[ElevenLabs] Disconnected", details || "");
              elevenLabsSessionLive = false;
              sessionConnecting = false;
              stopIncidentPoll();
              if (currentOrbState !== "IDLE" && currentOrbState !== "ERROR") {
                setOrbState("IDLE");
                const badge = document.getElementById("callStatusBadge");
                if (badge) badge.innerText = "Session ended — Exit and try again";
              }
            },
            onError: (err) => {
              console.warn("[ElevenLabs] session error:", err);
              setOrbState("ERROR");
            },
            onModeChange: ({ mode }) => {
              if (mode === "speaking") {
                elevenLabsAudioHeard = true;
                setOrbState("SPEAKING");
              } else if (mode === "listening") {
                setOrbState("LISTENING");
                if (!greetingDone && activeConversation) {
                  greetingDone = true;
                  try {
                    if (typeof activeConversation.sendContextualUpdate === "function") {
                      activeConversation.sendContextualUpdate(languagePromptAddon(currentLanguage));
                    }
                  } catch (_) {}
                }
              }
            },
            onMessage: ({ message, source }) => {
              if (source === "user") {
                appendTranscript("user", message);
                setOrbState("PROCESSING");
                sendVoiceTurnToBackend(message);
              } else if (message) {
                // Drop premature idle nudges while Core TTS is still playing the last question,
                // or when the citizen spoke recently (turn_timeout races with TTS playback).
                if (isIdleNudgeMessage(message)) {
                  const ttsBusy = currentAudio && !currentAudio.paused;
                  const spokeRecently = Date.now() - lastVoiceTurnAt < 25000;
                  if (ttsBusy || spokeRecently) {
                    console.log("[ElevenLabs] Suppressed early idle nudge:", message);
                    return;
                  }
                }
                appendTranscript("agent", message);
                // Play agent turns through Core TTS (WebRTC agent audio is muted).
                if (message !== firstMessage && message !== lastAgentSpoken) {
                  lastAgentSpoken = message;
                  playRakshaSpeech(message);
                }
              }
            }
          };

          // WebRTC first — browser playback is reliable here; earlier disconnects were
          // from blocked first_message overrides (now enabled), not WebRTC itself.
          let mode = "webrtc";
          try {
            sessionOpts.conversationToken = await fetchElevenLabsConversationToken(agentId);
            sessionOpts.connectionType = "webrtc";
            console.log("[ElevenLabs] Starting WebRTC session", agentId, "lang=", currentLanguage);
            activeConversation = await Conversation.startSession(sessionOpts);
          } catch (webrtcErr) {
            console.warn("[ElevenLabs] WebRTC failed, trying signed-url:", webrtcErr);
            delete sessionOpts.conversationToken;
            delete sessionOpts.connectionType;
            mode = "signed-url";
            sessionOpts.signedUrl = await fetchElevenLabsSignedUrl(agentId);
            activeConversation = await Conversation.startSession(sessionOpts);
          }

          elevenLabsSessionLive = true;
          sessionConnecting = false;

          // Keep LiveKit silent; citizen hears Core /v1/tts of agent text (language-locked).
          try {
            if (typeof activeConversation.setVolume === "function") {
              activeConversation.setVolume({ volume: 0 });
            }
          } catch (_) {}

          console.log("[ElevenLabs] Session live via", mode, "lang=", currentLanguage, "— Core TTS for agent speech");
        } catch (err) {
          console.warn("[ElevenLabs] session failed, falling back to mic path:", err);
          elevenLabsSessionLive = false;
          sessionConnecting = false;
          await startFallbackVoicePath();
        }
      }

      async function confirmFromLiveCall() {
        if (!currentIncidentId || !currentIncident) return;
        const state = currentIncident.state;
        if (state !== "READY" && state !== "USER_CONFIRMATION") return;

        // Step 1: confirm dossier facts — do NOT CAP-file yet.
        try {
          const res = await protocolFetch(CORE_URL + "/v1/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              incidentId: currentIncidentId,
              source: "web",
              modality: "text",
              content: "Citizen confirmed the gathered details.",
              confirmFacts: true,
              language: currentLanguage,
              reporter: { mobile: currentReporterMobile }
            })
          });
          if (res.ok) {
            const data = await res.json();
            currentIncident = data.incident || currentIncident;
          }
        } catch (_) {}

        const spokenUtr = String(currentIncident.transaction?.transactionId || "").replace(/\D/g, "");
        const spokenAmount = Number(currentIncident.transaction?.amount || 0);
        const hasSpokenProof = spokenAmount > 0 && spokenUtr.length === 12;

        if (currentIncident) {
          currentIncident = {
            ...currentIncident,
            validation: {
              ...(currentIncident.validation || { status: "READY", missingFields: [], conflicts: [] }),
              factsConfirmed: true,
              proofVerified: !!(currentIncident.validation?.proofVerified || hasSpokenProof)
            }
          };
        }
        updateIncidentUI(currentIncident, currentIncident.state, currentIncident.handoff?.externalReference);

        if (hasSpokenProof) {
          proofPending = false;
          appendTranscript(
            "agent",
            "Thank you. I have the amount and 12-digit UTR as confirmation. Filing the emergency freeze now."
          );
          playRakshaSpeech(
            "Thank you. I have the amount and UTR as confirmation. Filing the emergency freeze now."
          );
          const badge = document.getElementById("callStatusBadge");
          if (badge) badge.innerText = "Filing with 1930 and the bank…";
          await dispatchEmergencyReport({ stayInCall: true, showOutcome: true });
          return;
        }

        proofPending = true;
        appendTranscript(
          "agent",
          "I still need the 12-digit UTR from your bank SMS or receipt before I can file. Please say it now."
        );
        playRakshaSpeech(
          "I still need the 12-digit UTR from your bank SMS or receipt before I can file. Please say it now."
        );
        const badge = document.getElementById("callStatusBadge");
        if (badge) badge.innerText = "Say the 12-digit UTR to file";
      }

      async function handleCallProofUpload(e) {
        const file = e.target && e.target.files && e.target.files[0];
        if (!file || !currentIncidentId) return;
        setOrbState("PROCESSING");
        const badge = document.getElementById("callStatusBadge");
        if (badge) badge.innerText = "Verifying proof…";

        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = String(reader.result || "").split(",")[1] || "";
            const res = await protocolFetch(CORE_URL + "/v1/process", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                incidentId: currentIncidentId,
                source: "web",
                modality: "image",
                content: base64,
                language: currentLanguage,
                reporter: { mobile: currentReporterMobile }
              })
            });
            if (!res.ok) {
              if (badge) badge.innerText = "Could not read proof — try another image";
              setOrbState("LISTENING");
              return;
            }
            const data = await res.json();
            currentIncident = data.incident || currentIncident;
            updateIncidentUI(
              currentIncident,
              data.state || currentIncident.state,
              currentIncident.handoff?.externalReference
            );

            const verified =
              currentIncident?.validation?.proofVerified ||
              !!(currentIncident?.transaction?.amount && currentIncident?.transaction?.transactionId);

            if (!verified) {
              appendTranscript(
                "agent",
                "I could not fully verify that image. Please upload a clearer payment receipt showing amount and UTR."
              );
              playRakshaSpeech(
                "I could not fully verify that image. Please upload a clearer payment receipt showing amount and UTR."
              );
              if (badge) badge.innerText = "Need a clearer proof image";
              setCallProofVisible(true);
              setOrbState("LISTENING");
              return;
            }

            // Mark proof locally if Core set it; then CAP-file and show outcome.
            proofPending = false;
            appendTranscript("agent", "Proof verified. Filing your emergency freeze request now.");
            await dispatchEmergencyReport({ stayInCall: true, showOutcome: true });
          } catch (err) {
            console.warn("[Proof upload]", err);
            if (badge) badge.innerText = "Proof upload failed — try again";
            setOrbState("ERROR");
          }
        };
        reader.readAsDataURL(file);
      }

      async function endLiveVoiceCall() {
        setOrbState("IDLE");
        elevenLabsSessionLive = false;
        sessionConnecting = false;
        if (permissionMicStream) {
          try { permissionMicStream.getTracks().forEach(function (t) { t.stop(); }); } catch (_) {}
          permissionMicStream = null;
        }
        if (currentAudio) {
          try { currentAudio.pause(); } catch {}
          currentAudio = null;
        }
        if (speechRecognizer) {
          try { speechRecognizer.stop(); } catch {}
          speechRecognizer = null;
        }
        if (activeConversation) {
          try { await activeConversation.endSession(); } catch {}
          activeConversation = null;
        }
        stopIncidentPoll();
        document.getElementById("rakshaCallModal").classList.remove("active");

        // Surface Core facts on the main card only after they exist.
        if (currentIncidentId && currentIncident) {
          const st = currentIncident.state;
          if (st === "READY" || st === "USER_CONFIRMATION") {
            syncReadyPanelFromIncident(currentIncident);
            showWsView("READY");
          } else if (st === "SUBMITTED" || st === "ACKNOWLEDGED") {
            const ref = currentIncident.handoff?.externalReference;
            if (ref) {
              const refEl = document.getElementById("repRefNum");
              if (refEl) refEl.innerText = ref;
            }
            showWsView("SUBMITTED");
          } else if (st === "QUESTION_PENDING") {
            handleServerResponse({ state: st, question: currentIncident.clarification?.question, incident: currentIncident });
          }
        }
        await fetchLatestIncidentSync();
      }

      function startIncidentPoll() {
        stopIncidentPoll();
        conversationPollInterval = setInterval(fetchLatestIncidentSync, 2000);
      }

      function stopIncidentPoll() {
        if (conversationPollInterval) {
          clearInterval(conversationPollInterval);
          conversationPollInterval = null;
        }
      }

      async function fetchLatestIncidentSync() {
        if (!currentIncidentId) return;
        try {
          const res = await protocolFetch(CORE_URL + "/v1/incidents/" + currentIncidentId);
          if (res.ok) {
            const data = await res.json();
            currentIncident = data;
            updateIncidentUI(data, data.state, data.handoff?.externalReference);
            fetchDevEvents();
          }
        } catch {}
      }

      function toggleTypeArea() {
        const area = document.getElementById("typeArea");
        area.style.display = area.style.display === "none" ? "block" : "none";
      }

      async function handleImageAction(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result.split(",")[1];
          showWsView("PROCESSING");

          try {
            const res = await protocolFetch(CORE_URL + "/v1/process", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                incidentId: startFreshCase ? undefined : (currentIncidentId || undefined),
                forceNew: startFreshCase || !currentIncidentId,
                source: "web",
                modality: "image",
                content: base64,
                mimeType: file.type,
                language: currentLanguage,
                reporter: { mobile: currentReporterMobile }
              })
            });
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              showError(
                "Could not process that evidence",
                errData.error || "Try another image or confirm the details manually.",
                () => showWsView("IDLE")
              );
              return;
            }
            const data = await res.json();
            currentIncidentId = data.incidentId;
            currentIncident = data.incident;
            startFreshCase = false;
            handleServerResponse(data);
          } catch (err) {
            showError(
              "Could not process that evidence",
              "Try another image or confirm the details manually.",
              () => showWsView("IDLE")
            );
          }
        };
        reader.readAsDataURL(file);
      }

      async function submitTypedNarrative() {
        const text = document.getElementById("narrativeText").value;
        if (!text) return;

        showWsView("PROCESSING");
        try {
          const res = await protocolFetch(CORE_URL + "/v1/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              incidentId: startFreshCase ? undefined : (currentIncidentId || undefined),
              forceNew: startFreshCase || !currentIncidentId,
              source: "web",
              modality: "text",
              content: text,
              language: currentLanguage,
              reporter: { mobile: currentReporterMobile }
            })
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            showError("Could not process your description", errData.error || "Please try again.", () => showWsView("IDLE"));
            return;
          }
          const data = await res.json();
          currentIncidentId = data.incidentId;
          currentIncident = data.incident;
          startFreshCase = false;
          handleServerResponse(data);
        } catch (err) {
          showError("Connection error", "Could not reach the Raksha server. Please check your connection and try again.", () => showWsView("IDLE"));
        }
      }

      async function submitQuestionAnswer() {
        const val = document.getElementById("qInputVal").value;
        if (!val) return;

        showWsView("PROCESSING");
        try {
          const res = await protocolFetch(CORE_URL + "/v1/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              incidentId: currentIncidentId,
              source: "web",
              modality: "text",
              content: val,
              language: currentLanguage,
              reporter: { mobile: currentReporterMobile }
            })
          });
          const data = await res.json();
          currentIncident = data.incident;
          handleServerResponse(data);
        } catch (err) {
          alert("Error: " + err.message);
          showWsView("IDLE");
        }
      }

      async function resolveConflict(chosenValue) {
        showWsView("PROCESSING");
        try {
          const res = await protocolFetch(CORE_URL + "/v1/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              incidentId: currentIncidentId,
              source: "web",
              modality: "text",
              content: "I confirm the amount is " + chosenValue,
              language: currentLanguage,
              reporter: { mobile: currentReporterMobile }
            })
          });
          const data = await res.json();
          currentIncident = data.incident;
          handleServerResponse(data);
        } catch (err) {
          alert("Error: " + err.message);
          showWsView("IDLE");
        }
      }

      async function dispatchEmergencyReport(opts) {
        if (!currentIncidentId || !currentIncident) return;
        const stayInCall = !!(opts && opts.stayInCall);
        const showOutcome = !!(opts && opts.showOutcome);

        // Prevent duplicate submissions — use deterministic idempotency key
        const idemKey = "web-cap-" + currentIncidentId;
        if (!stayInCall) showWsView("PROCESSING");

        try {
          const res = await protocolFetch(CAP_URL + "/cap/actions/execute", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": idemKey
            },
            body: JSON.stringify({
              action: "report_financial_fraud",
              payload: currentIncident,
              idempotencyKey: idemKey
            })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            if (stayInCall) {
              const badge = document.getElementById("callStatusBadge");
              if (badge) badge.innerText = "Dispatch failed — try again";
              setCallProofVisible(false);
            } else {
              showError(
                "Report could not be dispatched",
                errData.error || "The action could not be completed. Your incident has not been lost.",
                () => showWsView("READY")
              );
            }
            return;
          }

          const data = await res.json();
          // Only use actual reference from server — never guess a fallback
          const refNumber = data.externalReference || data.data?.externalReference || "Pending";
          document.getElementById("repRefNum").innerText = refNumber;
          if (currentIncident) {
            currentIncident = {
              ...currentIncident,
              state: "SUBMITTED",
              handoff: {
                ...(currentIncident.handoff || {}),
                status: "ACCEPTED",
                externalReference: refNumber,
                target: (currentIncident.handoff && currentIncident.handoff.target) || "portal-a"
              }
            };
          }
          renderWsFilingLinks(currentIncident, refNumber);
          updateIncidentUI(currentIncident, "SUBMITTED", refNumber);
          fetchTimeline();
          fetchDevEvents();

          if (activeConversation) {
            try { await activeConversation.endSession(); } catch (_) {}
            activeConversation = null;
          }
          elevenLabsSessionLive = false;
          stopIncidentPoll();
          proofPending = false;
          setCallProofVisible(false);
          setCallConfirmVisible(false);

          if (showOutcome || stayInCall) {
            showCallOutcome(currentIncident, refNumber);
          } else {
            showWsView("SUBMITTED");
          }
        } catch (err) {
          if (stayInCall) {
            const badge = document.getElementById("callStatusBadge");
            if (badge) badge.innerText = "Dispatch failed — try again";
            setCallProofVisible(false);
          } else {
            showError(
              "Report could not be dispatched",
              "The action could not be completed. Your incident has not been lost. Retry when ready.",
              () => showWsView("READY")
            );
          }
        }
      }

      function handleServerResponse(data) {
        fetchDevEvents();
        const state = data.state;

        if (state === "QUESTION_PENDING") {
          document.getElementById("qPromptText").innerText =
            data.question || data.nextAction?.prompt || "Please provide the missing details:";
          document.getElementById("qInputVal").value = "";
          showWsView("QUESTION");
        } else if (state === "CONFLICT_RESOLUTION") {
          document.getElementById("conflictHead").innerText = data.question || "Discrepancy detected:";
          const btnBox = document.getElementById("conflictBtnBox");
          btnBox.innerHTML = "";
          if (data.conflictOptions) {
            data.conflictOptions.forEach(opt => {
              const b = document.createElement("button");
              b.className = "btn-secondary";
              b.style.padding = "0.75rem";
              b.innerText = opt.label || opt.value;
              b.onclick = () => resolveConflict(opt.value);
              btnBox.appendChild(b);
            });
          }
          showWsView("CONFLICT");
        } else if (state === "READY" || state === "USER_CONFIRMATION") {
          syncReadyPanelFromIncident(data.incident);
          showWsView("READY");
        } else if (state === "SUBMITTED" || state === "ACKNOWLEDGED") {
          const ref =
            data.incident?.handoff?.externalReference ||
            data.externalReference ||
            "";
          if (ref) {
            const refEl = document.getElementById("repRefNum");
            if (refEl) refEl.innerText = ref;
          }
          renderWsFilingLinks(data.incident || currentIncident, ref);
          showWsView("SUBMITTED");
        } else {
          showWsView("IDLE");
        }
      }

      function showError(title, message, retryFn) {
        document.getElementById("errorTitle").innerText = title || "Something went wrong";
        document.getElementById("errorMessage").innerText = message || "Your incident has not been lost.";
        const retryBtn = document.getElementById("errorRetryBtn");
        if (retryBtn && retryFn) {
          retryBtn.onclick = retryFn;
          retryBtn.style.display = "inline-block";
        } else if (retryBtn) {
          retryBtn.style.display = "none";
        }
        showWsView("ERROR");
      }

      function showWsView(state) {
        const views = {
          IDLE: "wsIdle",
          PROCESSING: "wsProcessing",
          QUESTION: "wsQuestion",
          CONFLICT: "wsConflict",
          READY: "wsReady",
          ERROR: "wsError",
          SUBMITTED: "wsSubmitted"
        };
        Object.values(views).forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = "none";
        });
        const active = views[state];
        if (active) {
          const el = document.getElementById(active);
          if (el) el.style.display = "block";
        }
      }

      function humanStatusSteps(events) {
        const steps = [];
        const seen = new Set();
        (events || []).forEach(function (evt) {
          const evType = String(evt.type || "");
          const evState = evt.payload && evt.payload.state;
          const evEvidence = evt.payload && evt.payload.type;
          let label = "";
          if (evType === "incident.created") label = "Report started";
          else if (evType === "evidence.sealed" && evEvidence === "VOICE_STATEMENT") label = "Voice statement recorded";
          else if (evType === "evidence.sealed" && evEvidence === "TRANSACTION_SCREENSHOT") label = "Payment proof attached";
          else if (evType === "evidence.sealed") label = "Evidence sealed";
          else if (evType === "incident.accepted" || evState === "SUBMITTED" || evState === "ACKNOWLEDGED") label = "Filed with 1930 and bank";
          else if (evState === "READY") label = "Details ready to confirm";
          else if (evState === "QUESTION_PENDING") label = "Asking for a missing detail";
          else if (evState === "USER_CONFIRMATION") label = "Waiting for your confirmation";
          else return;
          if (seen.has(label)) return;
          seen.add(label);
          steps.push({
            label: label,
            time: evt.timestamp ? String(evt.timestamp).slice(11, 19) : ""
          });
        });
        return steps.slice(-6);
      }

      function renderStatusList(el, events, emptyText) {
        if (!el) return;
        const steps = humanStatusSteps(events);
        if (!steps.length) {
          el.innerHTML = '<div class="status-step"><span class="status-step-label">' + (emptyText || "No updates yet.") + "</span></div>";
          return;
        }
        el.innerHTML = steps.map(function (s) {
          return (
            '<div class="status-step">' +
              '<span class="status-step-label">' + escapeHtml(s.label) + "</span>" +
              (s.time ? '<span class="status-step-time">' + escapeHtml(s.time) + "</span>" : "") +
            "</div>"
          );
        }).join("");
      }

      async function fetchTimeline() {
        if (!currentIncidentId) return;
        try {
          const res = await protocolFetch(CORE_URL + "/v1/incidents/" + currentIncidentId + "/events");
          const data = await res.json();
          renderStatusList(document.getElementById("liveTimeline"), data.events || [], "No status yet.");
        } catch {}
      }

      async function fetchDevEvents() {
        if (!currentIncidentId) return;
        try {
          const res = await protocolFetch(CORE_URL + "/v1/incidents/" + currentIncidentId + "/events");
          const data = await res.json();
          renderStatusList(
            document.getElementById("devJsonDump"),
            data.events || [],
            "No case yet. Start a report to see progress here."
          );
        } catch {}
      }

      function resetToHome() {
        currentIncidentId = null;
        currentIncident = null;
        startFreshCase = true;
        lastVoiceTurnText = "";
        lastVoiceTurnAt = 0;
        document.getElementById("narrativeText").value = "";
        document.getElementById("repAmount").innerText = "—";
        document.getElementById("repChannel").innerText = "—";
        document.getElementById("repUtr").innerText = "—";
        document.getElementById("repBank").innerText = "—";
        const refEl = document.getElementById("repRefNum");
        if (refEl) refEl.innerText = "—";
        const capsule = document.getElementById("callCaseCapsule");
        if (capsule) capsule.style.display = "none";
        const devIncId = document.getElementById("devIncId");
        if (devIncId) devIncId.innerText = "None";
        showWsView("IDLE");
      }

      function toggleDevDrawer() {
        isDevOpen = !isDevOpen;
        const drawer = document.getElementById("devDrawer");
        if (drawer) drawer.classList.toggle("open", isDevOpen);
        if (isDevOpen) fetchDevEvents();
      }

      window.switchLang = function(lang) {
        currentLanguage = lang === "hi" || lang === "ta" ? lang : "en";
        const head = document.getElementById("wsHead");
        const sub = document.getElementById("wsSub");
        const voice = document.getElementById("lblVoice");
        const image = document.getElementById("lblImage");
        const waKicker = document.getElementById("waPathKicker");
        const waTitle = document.getElementById("waPathTitle");
        const waCopy = document.getElementById("waPathCopy");
        const waNumLbl = document.getElementById("waFactNumLbl");
        const waJoinLbl = document.getElementById("waFactJoinLbl");
        const waSteps = document.getElementById("waPathSteps");
        const waCta = document.getElementById("waPathCta");
        const waNote = document.getElementById("waPathNote");
        const joinPhrase = ${JSON.stringify(whatsappJoin)};
        if (currentLanguage === "hi") {
          if (head) head.innerText = "साइबर धोखाधड़ी की रिपोर्ट करें";
          if (sub) sub.innerText = "अपनी भाषा में बोलें, रसीद दिखाएं, या व्हाट्सऐप पर लिखें।";
          if (voice) voice.innerText = "रक्षा से बोलें";
          if (image) image.innerText = "लेन-देन दिखाएं";
          if (waKicker) waKicker.innerText = "व्हाट्सऐप पायलट";
          if (waTitle) waTitle.innerText = "रक्षा को व्हाट्सऐप पर लिखें";
          if (waCopy) waCopy.innerText = "यही केस व्हाट्सऐप पर भी चलता है। एक बार जॉइन वाक्य भेजें, फिर बताएं क्या हुआ।";
          if (waNumLbl) waNumLbl.innerText = "व्हाट्सऐप नंबर";
          if (waJoinLbl) waJoinLbl.innerText = "जॉइन वाक्य";
          if (waSteps) waSteps.innerHTML = "<li>व्हाट्सऐप में यह नंबर खोलें।</li><li>एक बार <strong>" + joinPhrase + "</strong> भेजें।</li><li>फिर बताएं क्या हुआ — भाषा, घटना, UTR, YES।</li>";
          if (waCta) waCta.innerText = "व्हाट्सऐप खोलें";
          if (waNote) waNote.innerText = "लाइव Twilio सैंडबॉक्स — आधिकारिक 1930 नहीं। यहाँ नंबर छोड़ने की ज़रूरत नहीं। जॉइन न हो तो यहाँ बोलें, रसीद दिखाएं, या लिखें।";
        } else if (currentLanguage === "ta") {
          if (head) head.innerText = "நிதி சைபர் மோசடியை புகாரளிக்கவும்";
          if (sub) sub.innerText = "உங்கள் மொழியில் பேசுங்கள், ரசீதைக் காட்டுங்கள், அல்லது வாட்ஸ்அப்பில் எழுதுங்கள்.";
          if (voice) voice.innerText = "ரக்ஷாவிடம் சொல்லுங்கள்";
          if (image) image.innerText = "பரிவர்த்தனையைக் காட்டு";
          if (waKicker) waKicker.innerText = "வாட்ஸ்அப் பைலட்";
          if (waTitle) waTitle.innerText = "வாட்ஸ்அப்பில் ரக்ஷாவிடம் எழுதுங்கள்";
          if (waCopy) waCopy.innerText = "இதே வழக்கு வாட்ஸ்அப்பிலும் தொடரும். ஒருமுறை சேர் வாக்கியத்தை அனுப்பி, பிறகு நடந்ததைச் சொல்லுங்கள்.";
          if (waNumLbl) waNumLbl.innerText = "வாட்ஸ்அப் எண்";
          if (waJoinLbl) waJoinLbl.innerText = "சேர் வாக்கியம்";
          if (waSteps) waSteps.innerHTML = "<li>வாட்ஸ்அப்பில் இந்த எண்ணைத் திறக்கவும்.</li><li>ஒருமுறை <strong>" + joinPhrase + "</strong> அனுப்பவும்.</li><li>பிறகு நடந்ததை எழுதுங்கள் — மொழி, கதை, UTR, YES.</li>";
          if (waCta) waCta.innerText = "வாட்ஸ்அப்பைத் திற";
          if (waNote) waNote.innerText = "நேரடி Twilio sandbox — அதிகாரப்பூர்வ 1930 அல்ல. இங்கே எண்ணை விட வேண்டாம். சேர முடியாவிட்டால் இங்கே பேசவும், ரசீதைக் காட்டவும், அல்லது எழுதவும்.";
        } else {
          if (head) head.innerText = "Report Financial Cyber-Fraud";
          if (sub) sub.innerText = "Speak in your language, show your payment receipt, message on WhatsApp, or describe what happened.";
          if (voice) voice.innerText = "Tell Raksha";
          if (image) image.innerText = "Show Transaction";
          if (waKicker) waKicker.innerText = "WhatsApp pilot";
          if (waTitle) waTitle.innerText = "Message Raksha on WhatsApp";
          if (waCopy) waCopy.innerText = "Same case as this page. Send the join phrase once, then tell Raksha what happened.";
          if (waNumLbl) waNumLbl.innerText = "WhatsApp number";
          if (waJoinLbl) waJoinLbl.innerText = "Join phrase";
          if (waSteps) waSteps.innerHTML = "<li>Open the number in WhatsApp.</li><li>Send <strong>" + joinPhrase + "</strong> once.</li><li>Then write what happened — language, story, UTR, YES.</li>";
          if (waCta) waCta.innerText = "Open WhatsApp";
          if (waNote) waNote.innerText = "Live Twilio sandbox — not official 1930. No need to leave your number here. If you cannot join, use Talk, Show Transaction, or type on this page.";
        }
      };

      // Export globally on window immediately
      window.startLiveVoiceCall = startLiveVoiceCall;
      window.selectCallLanguage = selectCallLanguage;
      window.connectAndStartSpeaking = connectAndStartSpeaking;
      window.endLiveVoiceCall = endLiveVoiceCall;
      window.confirmFromLiveCall = confirmFromLiveCall;
      window.handleCallProofUpload = handleCallProofUpload;
      window.toggleDevDrawer = toggleDevDrawer;
      window.toggleTypeArea = toggleTypeArea;
      window.handleImageAction = handleImageAction;
      window.submitTypedNarrative = submitTypedNarrative;
      window.submitQuestionAnswer = submitQuestionAnswer;
      window.dispatchEmergencyReport = dispatchEmergencyReport;
      window.resetToHome = resetToHome;

      // Intentionally no load-time open-incident recovery.
      // Fresh /app must render with empty incident facts; Core populates only after live turns.
      // Cross-channel resume still works via mobile on process / open APIs when the citizen speaks.
    </script>
  `;

  return renderPageLayout({
    title: "Citizen Emergency Console",
    activeNav: "demo",
    bodyContent,
    extraStyles,
    extraScripts,
  });
}
