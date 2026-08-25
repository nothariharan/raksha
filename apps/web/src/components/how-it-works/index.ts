/**
 * How It Works — Main Orchestrator Component
 * Packages styles, HTML templates, and interaction scripts for the 6-step live case journey.
 */

import { HOW_IT_WORKS_STEPS, CASE_METADATA } from "./data.js";
import { renderStepArtifact } from "./artifacts.js";
import { renderChannelContinuityHtml } from "./channels.js";

// Step Icon Helpers
function getStepIconSvg(stepKey: string): string {
  switch (stepKey) {
    case "tell":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg>`;
    case "understand":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
    case "verify":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`;
    case "confirm":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    case "cap":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;
    case "update":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
    default:
      return "";
  }
}

export function renderHowItWorksStyles(): string {
  return `
    /* =========================================================
       HOW IT WORKS & CASE JOURNEY (RKS-000001) STYLES
       ========================================================= */
    .how-section {
      position: relative;
      background: #faf8f5;
      color: var(--text);
      padding: clamp(4rem, 8vw, 7.5rem) 1.5rem 3rem;
      border-top: 1px solid var(--border);
    }
    .how-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* 2-Column Desktop Grid */
    .how-grid {
      display: grid;
      grid-template-columns: minmax(320px, 420px) 1fr;
      gap: clamp(2.5rem, 5vw, 5.5rem);
      align-items: start;
      position: relative;
    }

    /* Left Editorial Intro (Sticky) */
    .how-intro {
      position: sticky;
      top: 100px;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .how-kicker {
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--orange);
    }
    .how-title {
      font-size: clamp(2.4rem, 4.5vw, 3.8rem);
      line-height: 1.04;
      font-weight: 800;
      letter-spacing: -0.055em;
      color: #0f172a;
      margin: 0;
    }
    .how-title .hl-motion {
      color: var(--orange);
      position: relative;
      display: inline-block;
    }
    .how-desc {
      font-size: 1.02rem;
      line-height: 1.62;
      color: #475569;
      margin: 0;
    }

    /* Watch Journey CTA */
    .how-watch-wrap {
      margin-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      align-items: flex-start;
    }
    .how-watch-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      background: #ffffff;
      color: #0f172a;
      border: 1px solid #cbd5e1;
      border-radius: 999px;
      padding: 0.72rem 1.35rem 0.72rem 1.1rem;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .how-watch-btn:hover {
      background: #0f172a;
      color: #ffffff;
      border-color: #0f172a;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }
    .how-watch-btn svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }
    .how-watch-sub {
      font-size: 0.76rem;
      color: #64748b;
    }

    /* Right Journey Stage Area */
    .how-stage-col {
      display: flex;
      flex-direction: column;
      gap: 2.2rem;
      position: relative;
    }

    /* Persistent Case Header Card */
    .case-header-card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.07);
      border-radius: 20px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.02);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      position: relative;
    }
    .case-col-meta {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .case-meta-label {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #94a3b8;
    }
    .case-meta-id-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .case-id-text {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .case-fraud-tag {
      background: #fff7ed;
      color: #c2410c;
      border: 1px solid #ffedd5;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.18rem 0.55rem;
      border-radius: 6px;
    }
    .case-amount-text {
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
    }
    .case-sub-method {
      font-size: 0.74rem;
      font-weight: 600;
      color: #64748b;
    }
    .case-shield-badge {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: #fff7ed;
      border: 1px solid #ffedd5;
      display: grid;
      place-items: center;
      color: var(--orange);
      flex-shrink: 0;
    }
    .case-shield-badge svg {
      width: 22px;
      height: 22px;
    }

    /* Step Journey Stage (Rail + Content) */
    .journey-stage-container {
      display: flex;
      flex-direction: column;
      gap: 1.6rem;
      position: relative;
    }

    /* Step Item Card (Stacked) */
    .journey-step-row {
      display: grid;
      grid-template-columns: 84px 1fr 1.15fr;
      gap: 1.4rem;
      align-items: center;
      padding: 1.4rem 1.5rem;
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 22px;
      box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.04);
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      cursor: pointer;
    }
    .journey-step-row:hover {
      border-color: rgba(234, 88, 12, 0.25);
      transform: translateY(-2px);
      box-shadow: 0 14px 32px -6px rgba(0, 0, 0, 0.08);
    }
    .journey-step-row.is-active {
      border-color: var(--orange);
      background: #ffffff;
      box-shadow: 0 16px 36px -6px rgba(234, 88, 12, 0.12), 0 0 0 1.5px var(--orange);
    }

    /* Left Group: Number Dot + Icon Badge */
    .journey-step-lead {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      flex-shrink: 0;
    }
    .journey-num-badge {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      color: #64748b;
      font-size: 0.8rem;
      font-weight: 800;
      display: grid;
      place-items: center;
      transition: all 0.25s ease;
      flex-shrink: 0;
    }
    .journey-step-row.is-active .journey-num-badge {
      background: var(--orange);
      border-color: var(--orange);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35);
    }

    .journey-icon-badge {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      transition: all 0.25s ease;
    }
    .journey-icon-badge svg {
      width: 18px;
      height: 18px;
    }
    .badge-step-tell { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
    .badge-step-understand { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
    .badge-step-verify { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .badge-step-confirm { background: #faf5ff; color: #8b5cf6; border: 1px solid #e9d5ff; }
    .badge-step-cap { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
    .badge-step-update { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }

    /* Middle Step Description */
    .journey-step-text {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .journey-step-title {
      font-size: 1.12rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .journey-step-desc {
      font-size: 0.84rem;
      line-height: 1.45;
      color: #64748b;
      margin: 0;
    }

    /* Right Artifact Display */
    .journey-step-artifact {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    /* Artifact Card Components */
    .artifact-card {
      width: 100%;
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 16px;
      padding: 0.85rem 1.1rem;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
    }

    /* 1. Voice Artifact */
    .artifact-voice {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .artifact-voice-player {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .artifact-play-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #0f172a;
      color: #ffffff;
      border: none;
      display: grid;
      place-items: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    .artifact-play-btn svg {
      width: 12px;
      height: 12px;
      margin-left: 2px;
    }
    .artifact-waveform {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 2.5px;
      height: 22px;
    }
    .artifact-waveform span {
      display: block;
      width: 2.8px;
      background: var(--orange);
      border-radius: 99px;
      transform-origin: center;
      animation: wavePulse 1.2s ease-in-out infinite alternate;
    }
    @keyframes wavePulse {
      0% { transform: scaleY(0.25); }
      100% { transform: scaleY(1); }
    }
    .artifact-timer {
      font-size: 0.75rem;
      font-weight: 700;
      color: #475569;
      font-family: var(--mono);
    }
    .artifact-submeta {
      font-size: 0.68rem;
      color: #94a3b8;
      font-weight: 500;
    }

    /* 2. Extracted Artifact */
    .artifact-extracted-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .artifact-kv-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4rem 1rem;
      flex: 1;
    }
    .artifact-kv-row {
      display: flex;
      flex-direction: column;
    }
    .artifact-k {
      font-size: 0.64rem;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .artifact-v {
      font-size: 0.8rem;
      font-weight: 700;
      color: #0f172a;
    }
    .artifact-ai-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.3rem;
      padding: 0.5rem 0.65rem;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      flex-shrink: 0;
    }
    .artifact-ai-icon {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #f59e0b;
      font-size: 0.7rem;
      font-weight: 800;
    }
    .artifact-ai-icon svg {
      width: 14px;
      height: 14px;
    }
    .artifact-ai-label {
      font-size: 0.62rem;
      color: #64748b;
      line-height: 1.25;
    }

    /* 3. Reconciled Artifact */
    .artifact-reconciled-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .artifact-checklist {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.35rem 1rem;
      flex: 1;
    }
    .artifact-check-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.4rem;
      font-size: 0.74rem;
      color: #334155;
      font-weight: 600;
    }
    .artifact-check-icon {
      color: #16a34a;
      font-weight: 800;
      font-size: 0.85rem;
    }
    .artifact-verified-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.3rem;
      padding: 0.5rem 0.75rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      flex-shrink: 0;
    }
    .artifact-shield-circle {
      width: 22px;
      height: 22px;
      color: #16a34a;
    }
    .artifact-shield-circle svg {
      width: 100%;
      height: 100%;
    }
    .artifact-verified-label {
      font-size: 0.62rem;
      color: #166534;
      line-height: 1.25;
    }

    /* 4. Confirm Artifact */
    .artifact-confirm {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .artifact-confirm-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: #0f172a;
    }
    .artifact-confirm-sub {
      font-size: 0.68rem;
      color: #64748b;
    }
    .artifact-confirm-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #0f172a;
      color: #ffffff;
      border: none;
      border-radius: 999px;
      padding: 0.45rem 0.95rem;
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s;
    }
    .artifact-confirm-btn:hover {
      background: var(--orange);
    }
    .artifact-confirm-btn svg {
      width: 12px;
      height: 12px;
    }

    /* 5. CAP Artifact */
    .artifact-cap-nodes {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .artifact-cap-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.45rem 0.65rem;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.72rem;
    }
    .artifact-cap-box.highlight {
      border-color: #bfdbfe;
      background: #eff6ff;
    }
    .artifact-cap-tag {
      font-size: 0.62rem;
      color: #64748b;
      font-weight: 600;
    }
    .artifact-cap-val {
      font-weight: 700;
      color: #2563eb;
    }
    .artifact-cap-icon {
      width: 16px;
      height: 16px;
      color: #2563eb;
    }
    .artifact-cap-icon svg {
      width: 100%;
      height: 100%;
    }
    .artifact-cap-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .artifact-cap-meta strong {
      font-size: 0.72rem;
      color: #0f172a;
    }
    .artifact-cap-meta span {
      font-size: 0.6rem;
      color: #64748b;
    }
    .artifact-cap-arrow {
      color: #94a3b8;
      font-size: 0.7rem;
    }

    /* 6. Live Timeline Artifact */
    .artifact-timeline-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.85rem;
    }
    .artifact-timeline-rail {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      flex: 1;
    }
    .artifact-step-dot {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.15rem;
      text-align: center;
    }
    .artifact-dot-circle {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #16a34a;
    }
    .artifact-step-dot.active .artifact-dot-circle {
      box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.25);
    }
    .artifact-dot-time {
      font-size: 0.58rem;
      color: #94a3b8;
      font-family: var(--mono);
    }
    .artifact-dot-label {
      font-size: 0.62rem;
      font-weight: 700;
      color: #0f172a;
    }
    .artifact-step-connector {
      flex: 1;
      height: 2px;
      background: #16a34a;
      margin-bottom: 1.2rem;
    }
    .artifact-live-badge {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.65rem;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 999px;
      flex-shrink: 0;
    }
    .artifact-live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #16a34a;
      box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.3);
      animation: pulseLive 2s infinite;
    }
    @keyframes pulseLive {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.3); }
    }
    .artifact-live-label {
      display: flex;
      flex-direction: column;
      font-size: 0.62rem;
      line-height: 1.1;
      color: #166534;
    }

    /* =========================================================
       CHANNELS CONTINUITY SECTION ("ONE CASE. EVERY CHANNEL.")
       ========================================================= */
    .channels-section {
      background: #ffffff;
      padding: clamp(4rem, 7vw, 6.5rem) 1.5rem 4rem;
      border-top: 1px solid var(--border);
    }
    .channels-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }
    .channels-header {
      text-align: center;
      max-width: 680px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .channels-kicker {
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--orange);
    }
    .channels-title {
      font-size: clamp(2rem, 3.8vw, 3rem);
      font-weight: 800;
      letter-spacing: -0.05em;
      color: #0f172a;
      margin: 0;
    }
    .channels-sub {
      font-size: 0.96rem;
      line-height: 1.55;
      color: #64748b;
      margin: 0;
    }

    /* Persistent Center Case Hub */
    .channels-hub {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .case-capsule {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 999px;
      padding: 0.45rem 1.1rem 0.45rem 0.55rem;
      box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.08);
      position: relative;
      z-index: 3;
    }
    .case-capsule-shield {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #fff7ed;
      color: var(--orange);
      display: grid;
      place-items: center;
    }
    .case-capsule-shield svg {
      width: 15px;
      height: 15px;
    }
    .case-capsule-id {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .case-capsule-status {
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
    }
    .channels-connectors {
      width: 100%;
      max-width: 980px;
      height: 48px;
      margin-top: -8px;
      position: relative;
      z-index: 1;
    }
    .channels-wire-svg {
      width: 100%;
      height: 100%;
    }

    /* 4 Channels Grid */
    .channels-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      position: relative;
      z-index: 2;
    }
    .channel-card {
      background: #faf8f5;
      border: 1px solid rgba(0, 0, 0, 0.07);
      border-radius: 24px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.03);
      position: relative;
    }
    .channel-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.1);
      border-color: rgba(234, 88, 12, 0.3);
    }

    /* Card Image Box with Mascot & Full-Opacity Background Brand Icon */
    .channel-img-box {
      height: 220px;
      position: relative;
      background: #ffffff;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      overflow: hidden;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    /* Full Opacity Brand Icon directly behind mascot characters */
    .channel-bg-icon {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 145px;
      height: 145px;
      z-index: 1;
      pointer-events: none;
      display: grid;
      place-items: center;
      transition: transform 0.4s ease;
    }
    .channel-bg-icon svg {
      width: 100%;
      height: 100%;
    }
    .icon-bg-orange {
      color: #ea580c;
      filter: drop-shadow(0 12px 28px rgba(234, 88, 12, 0.25));
    }
    .icon-bg-green {
      filter: drop-shadow(0 12px 28px rgba(37, 211, 102, 0.25));
    }
    .icon-bg-blue {
      filter: drop-shadow(0 12px 28px rgba(37, 99, 235, 0.25));
    }
    .channel-card:hover .channel-bg-icon {
      transform: scale(1.08) rotate(-3deg);
    }

    .channel-mascot-img {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center top;
      transition: transform 0.4s ease;
    }
    .channel-card:hover .channel-mascot-img {
      transform: scale(1.04);
    }

    /* AI Agents Spherical Constellation Box with Generous Spacing */
    .ai-agents-box {
      background: radial-gradient(circle at center, #ffffff 0%, #faf8f5 100%);
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 220px;
      overflow: hidden;
      position: relative;
    }
    .ai-sphere-cluster {
      position: relative;
      width: 230px;
      height: 210px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ai-sphere-node {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), filter 0.25s ease;
      cursor: pointer;
      flex-shrink: 0;
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.12));
    }
    .ai-sphere-node svg {
      width: 100%;
      height: 100%;
    }

    /* Spherical Radial Distribution (Clean Spacing) */
    .node-top {
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 38px;
      height: 38px;
      z-index: 5;
    }
    .node-top-right {
      top: 24px;
      right: 22px;
      width: 38px;
      height: 38px;
      z-index: 5;
    }
    .node-right {
      top: 50%;
      right: 6px;
      transform: translateY(-50%);
      width: 38px;
      height: 38px;
      z-index: 5;
    }
    .node-bot-right {
      bottom: 24px;
      right: 22px;
      width: 38px;
      height: 38px;
      z-index: 5;
    }
    .node-bot {
      bottom: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 38px;
      height: 38px;
      z-index: 5;
    }
    .node-bot-left {
      bottom: 24px;
      left: 22px;
      width: 38px;
      height: 38px;
      z-index: 5;
    }
    .node-left {
      top: 50%;
      left: 6px;
      transform: translateY(-50%);
      width: 38px;
      height: 38px;
      z-index: 5;
    }
    .node-top-left {
      top: 24px;
      left: 22px;
      width: 38px;
      height: 38px;
      z-index: 5;
    }

    /* Inner Core Trio (Generously spaced) */
    .node-inner-left {
      top: 50%;
      left: 56px;
      transform: translateY(-50%);
      width: 34px;
      height: 34px;
      z-index: 6;
    }
    .node-center {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 42px;
      height: 42px;
      z-index: 8;
      filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.18));
    }
    .node-inner-right {
      top: 50%;
      right: 56px;
      transform: translateY(-50%);
      width: 34px;
      height: 34px;
      z-index: 6;
    }

    .ai-sphere-node:hover {
      transform: scale(1.3) translateY(-3px) !important;
      z-index: 25 !important;
      filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.24)) !important;
    }

    /* Prominent Floating Overlay Badge (1930 Pill on Card 1) */
    .channel-floating-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 10;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #ffffff;
      border: 1.5px solid rgba(0, 0, 0, 0.08);
      border-radius: 999px;
      padding: 0.42rem 0.95rem;
      font-size: 0.92rem;
      font-weight: 800;
      color: #ea580c;
      box-shadow: 0 8px 22px rgba(0, 0, 0, 0.09);
    }
    .badge-dot-orange {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ea580c;
      animation: pulseLive 1.8s infinite;
    }

    /* Card Content */
    .channel-content {
      padding: 1.35rem 1.4rem 1.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      flex: 1;
      gap: 0.45rem;
    }
    .channel-content h3 {
      font-size: 1.18rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .channel-content p {
      font-size: 0.88rem;
      line-height: 1.45;
      color: #64748b;
      margin: 0;
    }

    /* Bottom Trust Props Bar */
    .trust-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      padding-top: 2.5rem;
      border-top: 1px solid var(--border);
    }
    .trust-item {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
    }
    .trust-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .trust-icon svg {
      width: 18px;
      height: 18px;
    }
    .icon-check { color: #ea580c; background: #fff7ed; border-color: #ffedd5; }
    .icon-lock { color: #d97706; background: #fffbeb; border-color: #fef3c7; }
    .icon-sparkle { color: #8b5cf6; background: #f5f3ff; border-color: #ede9fe; }
    .icon-people { color: #2563eb; background: #eff6ff; border-color: #dbeafe; }

    .trust-text h4 {
      font-size: 0.88rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.2rem;
    }
    .trust-text p {
      font-size: 0.78rem;
      line-height: 1.4;
      color: #64748b;
      margin: 0;
    }

    /* Responsive Breakpoints */
    @media (max-width: 1024px) {
      .how-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
      }
      .how-intro {
        position: static;
      }
      .channels-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .channels-connectors {
        display: none;
      }
      .trust-bar {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .journey-step-row {
        grid-template-columns: auto 1fr;
        gap: 1rem;
      }
      .journey-step-artifact {
        grid-column: 1 / -1;
        justify-content: stretch;
      }
      .case-header-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      .channels-grid {
        grid-template-columns: 1fr;
      }
      .trust-bar {
        grid-template-columns: 1fr;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
}

export function renderHowItWorksHtml(): string {
  const stepsRowsHtml = HOW_IT_WORKS_STEPS.map((s, idx) => `
    <div class="journey-step-row ${idx === 0 ? "is-active" : ""}" data-step-id="${s.id}" data-step-key="${s.key}" id="step-${s.key}">
      <div class="journey-step-lead">
        <div class="journey-num-badge">${s.num}</div>
        <div class="journey-icon-badge badge-step-${s.key}">
          ${getStepIconSvg(s.key)}
        </div>
      </div>
      <div class="journey-step-text">
        <h3 class="journey-step-title">${s.title}</h3>
        <p class="journey-step-desc">${s.description}</p>
      </div>
      <div class="journey-step-artifact">
        ${renderStepArtifact(s.key)}
      </div>
    </div>
  `).join("");

  return `
    <section class="how-section" id="how-it-works">
      <div class="how-container">
        <div class="how-grid">
          <!-- Left Editorial Intro -->
          <div class="how-intro">
            <span class="how-kicker">HOW RAKSHA WORKS</span>
            <h2 class="how-title">You bring the story.<br>We figure out the <span class="hl-motion">rest.</span></h2>
            <p class="how-desc">
              Raksha turns whatever you can share into a verified report and gets it to the right authorities. You stay in control at every step.
            </p>
            <div class="how-watch-wrap">
              <button class="how-watch-btn" id="watchJourneyBtn" type="button">
                <svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg>
                <span>Watch the journey</span>
              </button>
              <span class="how-watch-sub">See how a report moves through Raksha</span>
            </div>
          </div>

          <!-- Right Sticky Stage Column -->
          <div class="how-stage-col">
            <!-- Persistent Case Header -->
            <div class="case-header-card">
              <div class="case-col-meta">
                <span class="case-meta-label">CASE</span>
                <div class="case-meta-id-row">
                  <span class="case-id-text">${CASE_METADATA.caseId}</span>
                  <span class="case-fraud-tag">${CASE_METADATA.tag}</span>
                </div>
              </div>

              <div class="case-col-meta">
                <span class="case-meta-label">AMOUNT</span>
                <div class="case-amount-text">${CASE_METADATA.amount}</div>
                <span class="case-sub-method">${CASE_METADATA.method}</span>
              </div>

              <div class="case-shield-badge" title="Raksha Protocol Active">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-3.5-3.5 1.41-1.41L11 13.67l5.09-5.09 1.41 1.41L11 16.5z"/>
                </svg>
              </div>
            </div>

            <!-- 6-Step Journey Stage -->
            <div class="journey-stage-container" id="journeyStage">
              ${stepsRowsHtml}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Channel Continuity & Trust Props -->
    ${renderChannelContinuityHtml()}
  `;
}

export function renderHowItWorksScripts(): string {
  return `
    <script>
      (function() {
        const stepRows = document.querySelectorAll('.journey-step-row');
        const watchBtn = document.getElementById('watchJourneyBtn');
        let autoPlayTimer = null;
        let activeIdx = 0;

        function setActiveStep(idx) {
          activeIdx = idx % stepRows.length;
          stepRows.forEach((row, i) => {
            if (i === activeIdx) {
              row.classList.add('is-active');
            } else {
              row.classList.remove('is-active');
            }
          });
        }

        stepRows.forEach((row, idx) => {
          row.addEventListener('click', () => {
            if (autoPlayTimer) clearInterval(autoPlayTimer);
            setActiveStep(idx);
          });
        });

        if (watchBtn) {
          watchBtn.addEventListener('click', () => {
            if (autoPlayTimer) {
              clearInterval(autoPlayTimer);
              autoPlayTimer = null;
              watchBtn.querySelector('span').textContent = 'Watch the journey';
              return;
            }
            watchBtn.querySelector('span').textContent = 'Pause journey';
            autoPlayTimer = setInterval(() => {
              setActiveStep(activeIdx + 1);
            }, 2400);
          });
        }
      })();
    </script>
  `;
}
