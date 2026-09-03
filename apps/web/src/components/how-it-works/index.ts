/**
 * How It Works — Main Orchestrator Component
 * Packages styles, HTML templates, and interaction scripts for the 6-step live case journey.
 */

import { HOW_IT_WORKS_STEPS, CASE_METADATA } from "./data.js";
import { renderStepArtifact } from "./artifacts.js";
import { renderChannelContinuityHtml } from "./channels.js";

const STEP_LINE_ICONS: Record<string, string> = {
  tell: "voice-shankha",
  understand: "intake-camera",
  verify: "step-validate",
  confirm: "step-confirm",
  cap: "step-execute",
  update: "step-track",
};

function getStepIcon(stepKey: string): string {
  const file = STEP_LINE_ICONS[stepKey];
  if (!file) return "";
  return `<img class="journey-icon-img" src="/images/line/${file}.png" alt="" />`;
}

export function renderHowItWorksStyles(): string {
  return `
    /* =========================================================
       HOW IT WORKS & CASE JOURNEY (RKS-000001) STYLES
       ========================================================= */
    .how-section {
      position: relative;
      background: #fff8f2;
      color: var(--text);
      padding: clamp(2rem, 3.4vw, 2.75rem) 1.5rem 3.5rem;
      border-top: 1px solid rgba(28, 25, 23, 0.06);
      overflow: hidden;
    }
    .how-section.is-page {
      padding-top: clamp(1.35rem, 2.4vw, 1.85rem);
      border-top: 0;
    }
    .how-section-watermark {
      position: absolute;
      left: 50%;
      bottom: -4%;
      width: min(1180px, 118%);
      max-width: none;
      transform: translateX(-50%);
      pointer-events: none;
      opacity: 0.32;
      filter: saturate(1.2) brightness(1.12);
      z-index: 0;
    }
    .how-container {
      max-width: 1240px;
      margin: 0 auto;
      position: relative;
      z-index: 1;
    }

    .how-grid {
      display: grid;
      grid-template-columns: minmax(260px, 0.42fr) 1fr;
      gap: clamp(2.5rem, 5vw, 6rem);
      align-items: start;
      position: relative;
    }

    .how-intro {
      position: sticky;
      top: 0;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      padding-bottom: 1.25rem;
    }
    .how-kicker-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .how-kicker-sun {
      width: 22px;
      height: 22px;
      object-fit: contain;
    }
    .how-kicker {
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #e8754f;
    }
    .how-title {
      font-size: clamp(2.6rem, 3.8vw, 3.55rem);
      max-width: 11ch;
      color: #1a1f2c;
      margin: 0;
    }
    html[lang="hi"] .how-title,
    html[lang="ta"] .how-title {
      max-width: none;
      font-size: clamp(1.85rem, 2.6vw, 2.45rem);
      line-height: 1.12;
      overflow-wrap: anywhere;
    }
    .how-title .hl-motion {
      color: #e8754f;
    }
    .how-desc {
      font-size: 0.98rem;
      line-height: 1.65;
      color: #78716c;
      margin: 0;
      max-width: 32ch;
    }
    .how-watch-wrap {
      margin-top: 0.35rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      align-items: flex-start;
    }
    .how-watch-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      background: none;
      color: #e8754f;
      border: 0;
      padding: 0;
      font-size: 0.92rem;
      font-weight: 500;
      cursor: pointer;
      box-shadow: none;
      transition: opacity 0.2s ease;
    }
    .how-watch-btn:hover {
      background: none;
      color: #c2410c;
      border: 0;
      transform: none;
      box-shadow: none;
      opacity: 0.82;
    }
    .how-watch-play {
      width: 22px;
      height: 22px;
      border: 1.4px solid #e8754f;
      border-radius: 50%;
      display: grid;
      place-items: center;
    }
    .how-watch-btn.is-playing .how-watch-play {
      animation: watchPlayPulse 1.5s ease-in-out infinite;
    }
    @keyframes watchPlayPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(232, 117, 79, 0.28); }
      50% { box-shadow: 0 0 0 6px rgba(232, 117, 79, 0); }
    }
    .how-watch-play svg {
      width: 8px;
      height: 8px;
      fill: currentColor;
      margin-left: 1px;
    }
    .how-watch-sub {
      display: none;
    }

    /* Right Journey Stage Area */
    .how-stage-col {
      display: flex;
      flex-direction: column;
      gap: 2.2rem;
      position: relative;
      min-width: 0;
    }

    /* Persistent Case Header Card */
    .case-header-card {
      background: #ffffff;
      border: 1px solid rgba(28, 25, 23, 0.06);
      border-radius: 18px;
      padding: 1.05rem 1.35rem;
      box-shadow: 0 10px 24px -8px rgba(28, 25, 23, 0.06);
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
      font-family: var(--mono);
      font-size: 0.62rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #a8a29e;
    }
    .case-meta-id-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .case-id-text {
      font-family: var(--mono);
      font-size: 1.05rem;
      font-weight: 500;
      color: #1a1f2c;
      letter-spacing: -0.02em;
    }
    .case-fraud-tag {
      background: #fff7ed;
      color: #c2410c;
      border: 1px solid #ffedd5;
      font-size: 0.68rem;
      font-weight: 500;
      padding: 0.18rem 0.55rem;
      border-radius: 6px;
    }
    .case-amount-text {
      font-size: 1.2rem;
      font-weight: 600;
      color: #1a1f2c;
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
      gap: 0.55rem;
      position: relative;
    }
    .journey-rail {
      position: absolute;
      left: 25px;
      top: 0;
      bottom: 0;
      width: 2px;
      pointer-events: none;
      z-index: 0;
    }
    .journey-rail-track {
      position: absolute;
      left: 0;
      right: 0;
      top: 26px;
      bottom: 26px;
      background: #f3e6a8;
      border-radius: 99px;
      transform: scaleY(0);
      transform-origin: top center;
    }
    .journey-stage-container.is-inview .journey-rail-track {
      transform: scaleY(1);
      transition: transform 1.15s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .journey-rail-progress {
      position: absolute;
      left: 0;
      width: 2px;
      top: 26px;
      height: 0;
      background: linear-gradient(180deg, #f8e38a 0%, #e4b008 100%);
      border-radius: 99px;
      box-shadow: 0 0 10px rgba(234, 179, 8, 0.35);
      transition: height 0.7s cubic-bezier(0.22, 1, 0.36, 1), top 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .journey-rail-head {
      position: absolute;
      left: 50%;
      top: 26px;
      width: 8px;
      height: 8px;
      margin-left: -4px;
      margin-top: -4px;
      border-radius: 50%;
      background: #f5d76e;
      box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.22), 0 0 16px rgba(234, 179, 8, 0.45);
      opacity: 0;
      transition: top 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
    }
    .journey-stage-container.is-inview .journey-rail-head {
      opacity: 1;
    }

    /* Step Item Card (Non-overflowing Responsive Grid) */
    .journey-step-row {
      display: grid;
      grid-template-columns: 56px minmax(180px, 1fr) minmax(280px, 1.25fr);
      gap: 1.1rem;
      align-items: center;
      padding: 1.05rem 0.35rem 1.05rem 0;
      background: transparent;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      transition: opacity 0.45s ease;
      position: relative;
      z-index: 1;
      cursor: pointer;
      min-width: 0;
    }
    .journey-step-row:hover {
      border: 0;
      transform: none;
      box-shadow: none;
      opacity: 1;
    }
    .journey-step-row.is-active {
      border: 0;
      background: transparent;
      box-shadow: none;
      opacity: 1;
    }
    .journey-step-row.is-passed {
      opacity: 0.88;
    }
    .journey-step-row:not(.is-active):not(.is-passed) {
      opacity: 0.42;
    }

    .journey-step-lead {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .journey-icon-badge {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
      background: #fcf9f6;
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, background 0.35s ease, border-color 0.35s ease;
    }
    .journey-step-row:hover .journey-icon-badge {
      transform: scale(1.06);
    }
    .journey-step-row.is-active .journey-icon-badge {
      transform: scale(1.08);
    }
    .journey-icon-badge::after {
      content: "";
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 1.5px solid rgba(234, 179, 8, 0.42);
      opacity: 0;
      transform: scale(0.82);
      pointer-events: none;
    }
    .journey-step-row.is-active .journey-icon-badge::after {
      animation: journeyIconRing 1.9s ease-out infinite;
    }
    @keyframes journeyIconRing {
      0% { opacity: 0.55; transform: scale(0.86); }
      100% { opacity: 0; transform: scale(1.22); }
    }
    .journey-icon-badge svg,
    .journey-icon-img {
      width: 30px;
      height: 30px;
      object-fit: contain;
      transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .journey-step-row.is-active .journey-icon-img {
      transform: scale(1.06);
    }
    .badge-step-tell { background: #fff4e5; color: #ea580c; border: 1px solid #fdba74; }
    .badge-step-understand { background: #fff8dc; color: #d97706; border: 1px solid #fcd34d; }
    .badge-step-verify { background: #ecfdf3; color: #16a34a; border: 1px solid #86efac; }
    .badge-step-confirm { background: #f5f0ff; color: #8b5cf6; border: 1px solid #d8b4fe; }
    .badge-step-cap { background: #eef6ff; color: #2563eb; border: 1px solid #93c5fd; }
    .badge-step-update { background: #ecfdf5; color: #059669; border: 1px solid #6ee7b7; }
    .journey-step-row.is-active .badge-step-tell { box-shadow: 0 0 0 5px rgba(251, 191, 36, 0.22), 0 8px 18px rgba(234, 88, 12, 0.16); }
    .journey-step-row.is-active .badge-step-understand { box-shadow: 0 0 0 5px rgba(251, 191, 36, 0.2), 0 8px 18px rgba(217, 119, 6, 0.14); }
    .journey-step-row.is-active .badge-step-verify { box-shadow: 0 0 0 5px rgba(250, 204, 21, 0.2), 0 8px 18px rgba(22, 163, 74, 0.14); }
    .journey-step-row.is-active .badge-step-confirm { box-shadow: 0 0 0 5px rgba(250, 204, 21, 0.18), 0 8px 18px rgba(139, 92, 246, 0.14); }
    .journey-step-row.is-active .badge-step-cap { box-shadow: 0 0 0 5px rgba(250, 204, 21, 0.18), 0 8px 18px rgba(37, 99, 235, 0.14); }
    .journey-step-row.is-active .badge-step-update { box-shadow: 0 0 0 5px rgba(250, 204, 21, 0.18), 0 8px 18px rgba(5, 150, 105, 0.14); }

    /* Middle Step Description */
    .journey-step-text {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 0;
    }
    .journey-step-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: #1a1f2c;
      letter-spacing: -0.02em;
      margin: 0;
      white-space: nowrap;
      transition: color 0.35s ease;
    }
    .journey-step-row.is-active .journey-step-title {
      color: #111827;
    }
    .journey-step-desc {
      font-size: 0.85rem;
      line-height: 1.45;
      color: #64748b;
      margin: 0;
    }

    /* Right Artifact Display */
    .journey-step-artifact {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      min-width: 0;
    }

    /* Artifact Card Components */
    .artifact-card {
      width: 100%;
      background: #ffffff;
      border: 1px solid rgba(28, 25, 23, 0.06);
      border-radius: 16px;
      padding: 0.85rem 1.1rem;
      box-shadow: 0 8px 20px -10px rgba(28, 25, 23, 0.08);
      min-width: 0;
      overflow: hidden;
      opacity: 0.62;
      transform: translateY(6px);
      transition: opacity 0.45s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.35s ease;
    }
    .journey-step-row.is-passed .artifact-card {
      opacity: 0.82;
      transform: translateY(0);
    }
    .journey-step-row.is-active .artifact-card {
      opacity: 1;
      transform: translateY(0);
      border-color: rgba(234, 179, 8, 0.32);
      box-shadow: 0 14px 30px -12px rgba(202, 138, 4, 0.22);
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
      animation-play-state: paused;
    }
    .journey-step-row.is-active .artifact-waveform span {
      animation-play-state: running;
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
      transform: scale(0.85);
      opacity: 0.4;
    }
    .journey-step-row.is-active .artifact-check-row:nth-child(1) .artifact-check-icon { animation: checkPop 0.35s ease forwards 0.05s; }
    .journey-step-row.is-active .artifact-check-row:nth-child(2) .artifact-check-icon { animation: checkPop 0.35s ease forwards 0.14s; }
    .journey-step-row.is-active .artifact-check-row:nth-child(3) .artifact-check-icon { animation: checkPop 0.35s ease forwards 0.23s; }
    .journey-step-row.is-active .artifact-check-row:nth-child(4) .artifact-check-icon { animation: checkPop 0.35s ease forwards 0.32s; }
    @keyframes checkPop {
      0% { opacity: 0.3; transform: scale(0.7); }
      60% { opacity: 1; transform: scale(1.18); }
      100% { opacity: 1; transform: scale(1); }
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
      font-size: 0.82rem;
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
      transition: background 0.15s, transform 0.35s ease;
      flex-shrink: 0;
    }
    .journey-step-row.is-active .artifact-confirm-btn {
      transform: translateX(2px);
    }
    .artifact-confirm-btn:hover {
      background: var(--orange);
    }
    .artifact-confirm-btn svg {
      width: 12px;
      height: 12px;
    }

    /* 5. CAP Artifact (Clean Non-overflowing Flex Grid) */
    .artifact-cap-nodes {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.35rem;
      width: 100%;
    }
    .artifact-cap-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.38rem 0.55rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.7rem;
      flex: 1;
      min-width: 0;
    }
    .artifact-cap-box.highlight {
      border-color: #bfdbfe;
      background: #eff6ff;
    }
    .artifact-cap-box.cap-action {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.1rem;
    }
    .artifact-cap-tag {
      font-size: 0.56rem;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .artifact-cap-val {
      font-weight: 600;
      color: #2563eb;
      font-size: 0.6rem;
      white-space: normal;
      line-height: 1.2;
    }
    .artifact-cap-icon {
      width: 15px;
      height: 15px;
      color: #2563eb;
      flex-shrink: 0;
    }
    .artifact-cap-icon svg {
      width: 100%;
      height: 100%;
    }
    .artifact-cap-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
      min-width: 0;
    }
    .artifact-cap-meta strong {
      font-size: 0.72rem;
      color: #0f172a;
      white-space: nowrap;
    }
    .artifact-cap-meta span {
      font-size: 0.56rem;
      color: #64748b;
      white-space: nowrap;
    }
    .artifact-cap-arrow {
      width: 14px;
      height: 14px;
      color: #94a3b8;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .artifact-cap-arrow svg {
      width: 100%;
      height: 100%;
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
    .journey-step-row.is-active .artifact-step-dot .artifact-dot-circle {
      animation: timelineDot 0.45s ease both;
    }
    .journey-step-row.is-active .artifact-step-dot:nth-child(1) .artifact-dot-circle { animation-delay: 0.05s; }
    .journey-step-row.is-active .artifact-step-dot:nth-child(3) .artifact-dot-circle { animation-delay: 0.16s; }
    .journey-step-row.is-active .artifact-step-dot:nth-child(5) .artifact-dot-circle { animation-delay: 0.27s; }
    .journey-step-row.is-active .artifact-step-dot:nth-child(7) .artifact-dot-circle { animation-delay: 0.38s; }
    @keyframes timelineDot {
      0% { transform: scale(0.4); opacity: 0.4; }
      100% { transform: scale(1); opacity: 1; }
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
      position: relative;
      background: #fffaf4;
      padding: clamp(4rem, 7vw, 6.5rem) clamp(1.5rem, 7vw, 6.5rem) clamp(7rem, 14vw, 11rem);
      border-top: 1px solid var(--border);
      overflow: hidden;
    }
    .channels-section .side-rail {
      top: clamp(14.75rem, 18vw, 16.5rem);
      max-height: 46%;
    }
    .channels-section .side-rail-left {
      transform: translateY(-50%);
    }
    .channels-section .side-rail-right {
      transform: translateY(-50%) scaleX(-1);
    }
    .channels-section-watermark {
      position: absolute;
      left: 50%;
      bottom: -8%;
      width: min(980px, 108%);
      transform: translateX(-50%);
      pointer-events: none;
      opacity: 0.4;
      filter: saturate(1.22) brightness(1.12);
      z-index: 0;
    }
    .channels-container {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 3rem;
      position: relative;
      z-index: 1;
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
      font-size: 0.7rem;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #e8754f;
    }
    .channels-title {
      font-family: var(--font-display);
      font-weight: 400;
      font-style: normal;
      letter-spacing: -0.035em;
      line-height: 0.96;
      font-size: clamp(2.4rem, 4vw, 3.4rem);
      color: #1a1f2c;
      margin: 0;
    }
    .channels-sub {
      font-size: 0.98rem;
      line-height: 1.65;
      color: #78716c;
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
    
    /* Full Opacity Brand Icon positioned high in top corner behind mascot characters */
    .channel-bg-icon {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 165px;
      height: 165px;
      z-index: 1;
      pointer-events: none;
      display: grid;
      place-items: center;
      transition: transform 0.4s ease;
    }
    .icon-bg-orange {
      color: #ea580c;
      filter: drop-shadow(0 14px 30px rgba(234, 88, 12, 0.28));
    }
    .icon-bg-green {
      filter: drop-shadow(0 14px 30px rgba(37, 211, 102, 0.28));
    }
    .icon-bg-blue {
      filter: drop-shadow(0 14px 30px rgba(37, 99, 235, 0.28));
    }
    .channel-card:hover .channel-bg-icon {
      transform: scale(1.06) translate(2px, -2px) rotate(-3deg);
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

    /* Responsive Breakpoints */
    @media (max-width: 1080px) {
      .how-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
      }
      .how-intro {
        position: relative;
        top: auto;
        min-height: 0;
        padding-bottom: 1.5rem;
      }
      .how-section-watermark {
        width: 140%;
        opacity: 0.26;
      }
      .channels-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .channels-connectors {
        display: none;
      }
    }

    @media (max-width: 900px) {
      .how-section {
        padding: 1.6rem 1rem 2.4rem;
      }
      .how-section.is-page {
        padding-top: 1.15rem;
      }
      .how-title {
        font-size: clamp(2.15rem, 9vw, 2.8rem);
      }
      .journey-step-row {
        grid-template-columns: 56px 1fr;
        gap: 1rem;
      }
      .journey-step-artifact {
        grid-column: 1 / -1;
        width: 100%;
        margin-top: 0.35rem;
      }
      .journey-step-title {
        white-space: normal;
      }
      .case-header-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      .channels-title {
        font-size: clamp(2rem, 8vw, 2.6rem);
      }
      .channels-section-watermark {
        width: 130%;
        bottom: -4%;
        opacity: 0.36;
      }
      .channels-grid {
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

export function renderHowItWorksHtml(options?: { page?: boolean }): string {
  const stepsRowsHtml = HOW_IT_WORKS_STEPS.map((s, idx) => `
    <div class="journey-step-row ${idx === 0 ? "is-active" : ""}" data-step-id="${s.id}" data-step-key="${s.key}" id="step-${s.key}">
      <div class="journey-step-lead">
        <div class="journey-icon-badge badge-step-${s.key}">
          ${getStepIcon(s.key)}
        </div>
      </div>
      <div class="journey-step-text">
        <h3 class="journey-step-title" data-i18n="step.${s.key}.title">${s.title}</h3>
        <p class="journey-step-desc" data-i18n="step.${s.key}.desc">${s.description}</p>
      </div>
      <div class="journey-step-artifact">
        ${renderStepArtifact(s.key)}
      </div>
    </div>
  `).join("");

  return `
    <section class="how-section${options?.page ? " is-page" : ""}" id="how-it-works">
      <img class="how-section-watermark" src="/images/line/how-temple-watermark.png" alt="" aria-hidden="true" />
      <div class="how-container">
        <div class="how-grid">
          <!-- Left Editorial Intro -->
          <div class="how-intro">
            <div class="how-kicker-row">
              <img class="how-kicker-sun" src="/images/line/how-kicker-sun.png" alt="" />
              <span class="how-kicker" id="howKicker">HOW RAKSHA WORKS</span>
            </div>
            <h2 class="how-title" id="howTitle">You bring <br>the story.<br>We handle <br>the <span class="hl-motion">rest.</span></h2>
            <p class="how-desc" id="howDesc">
              Raksha turns what you share into a verified report and gets it to the right authorities. You stay in control at every step.
            </p>
            <div class="how-watch-wrap">
              <button class="how-watch-btn" id="watchJourneyBtn" type="button">
                <span class="how-watch-play" aria-hidden="true"><svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg></span>
                <span id="howWatch">Watch the journey</span>
              </button>
              <span class="how-watch-sub" id="howWatchSub">See how a report moves through Raksha</span>
            </div>
          </div>

          <!-- Right Sticky Stage Column -->
          <div class="how-stage-col">
            <!-- Persistent Case Header -->
            <div class="case-header-card">
              <div class="case-col-meta">
                <span class="case-meta-label">CASE ID</span>
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
              <div class="journey-rail" aria-hidden="true">
                <span class="journey-rail-track"></span>
                <span class="journey-rail-progress" id="journeyRailProgress"></span>
                <span class="journey-rail-head" id="journeyRailHead"></span>
              </div>
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
        var HOW_I18N = {
          en: {
            "step.tell.title": "You tell us", "step.tell.desc": "Call, send a voice note, message, or upload a screenshot.",
            "step.understand.title": "We understand", "step.understand.desc": "Raksha extracts the important details and organizes them clearly.",
            "step.verify.title": "We verify", "step.verify.desc": "We cross-check information and evidence across multiple sources.",
            "step.confirm.title": "You confirm", "step.confirm.desc": "You review the details and confirm before we submit anything.",
            "step.cap.title": "CAP takes over", "step.cap.desc": "Raksha uses the Civic Action Protocol to file the right report with the right service.",
            "step.update.title": "You stay updated", "step.update.desc": "Track the status. Get notified. Respond when it matters.",
            "ch.kicker": "ONE CASE. EVERY CHANNEL.", "ch.title": "Start anywhere. Same case, always.", "ch.sub": "Begin on one channel, continue on another. Your case stays intact.",
            "ch.call.title": "Call Raksha", "ch.call.p": "Speak to us in your language.",
            "ch.wa.title": "WhatsApp Raksha", "ch.wa.p": "Send voice notes, photos or messages.",
            "ch.web.title": "Raksha on the Web", "ch.web.p": "Upload receipts, add details and review.",
            "ch.ai.title": "AI Agents", "ch.ai.p": "Let AI agents assist and continue for you.",
            "tr.secure.t": "Secure & Private", "tr.secure.p": "Your data is protected end to end.",
            "tr.verified.t": "Verified & Trusted", "tr.verified.p": "Government-grade security and process.",
            "tr.with.t": "Always with You", "tr.with.p": "One case. Any channel. Real human support.",
            "tr.all.t": "For Everyone", "tr.all.p": "Built for India. Built for every person."
          },
          hi: {
            "step.tell.title": "आप हमें बताते हैं", "step.tell.desc": "कॉल करें, वॉइस नोट, संदेश या स्क्रीनशॉट भेजें।",
            "step.understand.title": "हम समझते हैं", "step.understand.desc": "रक्षा ज़रूरी विवरण निकालकर उन्हें साफ़ तरीके से जमा करती है।",
            "step.verify.title": "हम सत्यापित करते हैं", "step.verify.desc": "हम जानकारी और सबूत कई स्रोतों से मिलाते हैं।",
            "step.confirm.title": "आप पुष्टि करते हैं", "step.confirm.desc": "भेजने से पहले आप विवरण देखकर पुष्टि करते हैं।",
            "step.cap.title": "CAP आगे बढ़ता है", "step.cap.desc": "रक्षा Civic Action Protocol से सही सेवा पर सही रिपोर्ट दाखिल करती है।",
            "step.update.title": "आप अपडेट रहते हैं", "step.update.desc": "स्थिति देखें। सूचना पाएँ। जब ज़रूरत हो जवाब दें।",
            "ch.kicker": "एक केस। हर माध्यम।", "ch.title": "कहीं से शुरू करें। केस वही रहता है।", "ch.sub": "एक माध्यम से शुरू करें, दूसरे पर जारी रखें। आपका केस जुड़ा रहता है।",
            "ch.call.title": "रक्षा को कॉल करें", "ch.call.p": "अपनी भाषा में बात करें।",
            "ch.wa.title": "व्हाट्सऐप रक्षा", "ch.wa.p": "वॉइस नोट, फ़ोटो या संदेश भेजें।",
            "ch.web.title": "वेब पर रक्षा", "ch.web.p": "रसीद अपलोड करें, विवरण जोड़ें और समीक्षा करें।",
            "ch.ai.title": "AI एजेंट", "ch.ai.p": "AI एजेंट मदद करें और केस आगे बढ़ाएँ।",
            "tr.secure.t": "सुरक्षित और निजी", "tr.secure.p": "आपका डेटा शुरू से अंत तक सुरक्षित है।",
            "tr.verified.t": "सत्यापित और विश्वसनीय", "tr.verified.p": "सरकारी स्तर की सुरक्षा और प्रक्रिया।",
            "tr.with.t": "हमेशा आपके साथ", "tr.with.p": "एक केस। कोई भी माध्यम। असली सहायता।",
            "tr.all.t": "सबके लिए", "tr.all.p": "भारत के लिए। हर व्यक्ति के लिए।"
          },
          ta: {
            "step.tell.title": "நீங்கள் சொல்கிறீர்கள்", "step.tell.desc": "அழைக்கவும், குரல் குறிப்பு, செய்தி அல்லது திரைப்பிடிப்பு அனுப்பவும்.",
            "step.understand.title": "நாங்கள் புரிந்துகொள்கிறோம்", "step.understand.desc": "ரக்ஷா முக்கிய விவரங்களை எடுத்து தெளிவாக அமைக்கிறது.",
            "step.verify.title": "நாங்கள் சரிபார்க்கிறோம்", "step.verify.desc": "தகவலையும் ஆதாரத்தையும் பல மூலங்களில் சரிபார்க்கிறோம்.",
            "step.confirm.title": "நீங்கள் உறுதிசெய்கிறீர்கள்", "step.confirm.desc": "அனுப்பும் முன் விவரங்களைப் பார்த்து உறுதிசெய்கிறீர்கள்.",
            "step.cap.title": "CAP தொடர்கிறது", "step.cap.desc": "ரக்ஷா Civic Action Protocol மூலம் சரியான சேவைக்கு சரியான புகாரை தாக்கல் செய்கிறது.",
            "step.update.title": "நீங்கள் அறிந்துகொள்கிறீர்கள்", "step.update.desc": "நிலையைப் பாருங்கள். அறிவிப்பு பெறுங்கள். தேவைப்படும்போது பதிலளியுங்கள்.",
            "ch.kicker": "ஒரே வழக்கு. அனைத்து வழிகளும்.", "ch.title": "எங்கிருந்தும் தொடங்குங்கள். வழக்கு ஒன்றே.", "ch.sub": "ஒரு வழியில் தொடங்கி மற்றொன்றில் தொடருங்கள். உங்கள் வழக்கு அப்படியே இருக்கும்.",
            "ch.call.title": "ரக்ஷாவை அழை", "ch.call.p": "உங்கள் மொழியில் பேசுங்கள்.",
            "ch.wa.title": "வாட்ஸ்அப் ரக்ஷா", "ch.wa.p": "குரல் குறிப்பு, புகைப்படம் அல்லது செய்தி அனுப்புங்கள்.",
            "ch.web.title": "இணையத்தில் ரக்ஷா", "ch.web.p": "ரசீதை பதிவேற்றி விவரம் சேர்த்து சரிபாருங்கள்.",
            "ch.ai.title": "AI முகவர்கள்", "ch.ai.p": "AI முகவர்கள் உதவி செய்து வழக்கைத் தொடரட்டும்.",
            "tr.secure.t": "பாதுகாப்பும் தனிமையும்", "tr.secure.p": "உங்கள் தரவு முதல் முதல் இறுதி வரை பாதுகாக்கப்படும்.",
            "tr.verified.t": "சரிபார்க்கப்பட்டது", "tr.verified.p": "அரசு தர பாதுகாப்பும் செயல்முறையும்.",
            "tr.with.t": "எப்போதும் உங்களுடன்", "tr.with.p": "ஒரே வழக்கு. எந்த வழியும். உண்மையான உதவி.",
            "tr.all.t": "அனைவருக்கும்", "tr.all.p": "இந்தியாவுக்காக. ஒவ்வொருவருக்கும்."
          }
        };
        window.applyHowLang = function(lang) {
          var pack = HOW_I18N[lang] || HOW_I18N.en;
          document.querySelectorAll("[data-i18n]").forEach(function(el) {
            var key = el.getAttribute("data-i18n");
            if (key && pack[key]) el.textContent = pack[key];
          });
        };

        const stepRows = document.querySelectorAll('.journey-step-row');
        const watchBtn = document.getElementById('watchJourneyBtn');
        const journeyStage = document.getElementById('journeyStage');
        const railProgress = document.getElementById('journeyRailProgress');
        const railHead = document.getElementById('journeyRailHead');
        let autoPlayTimer = null;
        let activeIdx = 0;

        function updateRail(idx) {
          if (!journeyStage || !railProgress || !railHead || !stepRows.length) return;
          var icons = journeyStage.querySelectorAll('.journey-icon-badge');
          if (!icons.length) return;
          var stageRect = journeyStage.getBoundingClientRect();
          var first = icons[0].getBoundingClientRect();
          var last = icons[icons.length - 1].getBoundingClientRect();
          var active = icons[idx].getBoundingClientRect();
          var start = first.top + first.height / 2 - stageRect.top;
          var end = last.top + last.height / 2 - stageRect.top;
          var current = active.top + active.height / 2 - stageRect.top;
          railProgress.style.top = start + 'px';
          railProgress.style.height = Math.max(0, current - start) + 'px';
          railHead.style.top = current + 'px';
        }

        function setActiveStep(idx) {
          activeIdx = ((idx % stepRows.length) + stepRows.length) % stepRows.length;
          stepRows.forEach((row, i) => {
            row.classList.toggle('is-active', i === activeIdx);
            row.classList.toggle('is-passed', i < activeIdx);
          });
          updateRail(activeIdx);
        }

        stepRows.forEach((row, idx) => {
          row.addEventListener('click', () => {
            if (autoPlayTimer) {
              clearInterval(autoPlayTimer);
              autoPlayTimer = null;
              if (watchBtn) watchBtn.classList.remove('is-playing');
              var watchLabel = document.getElementById('howWatch');
              if (watchLabel) watchLabel.textContent = watchLabel.getAttribute('data-idle') || 'Watch the journey';
            }
            setActiveStep(idx);
          });
        });

        if (watchBtn) {
          var watchLabel = document.getElementById('howWatch');
          watchBtn.addEventListener('click', () => {
            if (autoPlayTimer) {
              clearInterval(autoPlayTimer);
              autoPlayTimer = null;
              watchBtn.classList.remove('is-playing');
              if (watchLabel) watchLabel.textContent = watchLabel.getAttribute('data-idle') || 'Watch the journey';
              return;
            }
            if (watchLabel) {
              watchLabel.setAttribute('data-idle', watchLabel.textContent || 'Watch the journey');
              watchLabel.textContent = 'Pause journey';
            }
            watchBtn.classList.add('is-playing');
            setActiveStep(0);
            autoPlayTimer = setInterval(() => {
              if (activeIdx >= stepRows.length - 1) {
                setActiveStep(0);
                return;
              }
              setActiveStep(activeIdx + 1);
            }, 2200);
          });
        }

        if (journeyStage && 'IntersectionObserver' in window) {
          var seen = false;
          var io = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
              if (!entry.isIntersecting) return;
              journeyStage.classList.add('is-inview');
              if (!seen) {
                seen = true;
                requestAnimationFrame(function() { setActiveStep(activeIdx); });
              }
            });
          }, { threshold: 0.18 });
          io.observe(journeyStage);
        } else {
          if (journeyStage) journeyStage.classList.add('is-inview');
          setActiveStep(0);
        }

        window.addEventListener('resize', function() {
          updateRail(activeIdx);
        });
      })();
    </script>
  `;
}
