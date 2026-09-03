import { renderPageLayout } from "./layout.js";
import {
  renderHowItWorksStyles,
  renderHowItWorksHtml,
  renderHowItWorksScripts,
} from "../components/how-it-works/index.js";

export function renderHomePageHtml(): string {
  const extraStyles = `
    /* Landing Layout */
    .landing {
      min-height: calc(100dvh - 96px);
      display: grid;
      place-items: center;
      padding: 1.5rem 2rem 2.5rem;
      overflow: hidden;
      position: relative;
    }
    .hero {
      width: min(1360px, 100%);
      display: grid;
      grid-template-columns: minmax(320px, 1.18fr) minmax(400px, 1.28fr) minmax(220px, 0.62fr);
      gap: clamp(1.2rem, 2.8vw, 3.5rem);
      align-items: center;
    }

    /* Left Copy */
    .hero-copy {
      position: relative;
      z-index: 5;
    }
    .hero-copy h1 {
      max-width: 20ch;
      font-size: clamp(3.15rem, 5vw, 5rem);
    }
    .hero-copy h1 em {
      color: var(--mode, var(--orange));
      font-style: normal;
      font-family: inherit;
      transition: color 0.3s ease;
    }
    .hero-copy p {
      max-width: 360px;
      margin: 1.35rem 0 1.65rem;
      color: var(--text-muted);
      font-size: 1rem;
      line-height: 1.6;
    }
    .hero-cta {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      border-radius: 999px;
      padding: 0.83rem 1.25rem;
      background: var(--text);
      color: #fff;
      font-size: 0.9rem;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 10px 24px rgba(28, 25, 23, 0.14);
      transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    }
    .hero-cta:hover {
      background: #3b3733;
      transform: translateY(-2px);
      box-shadow: 0 14px 28px rgba(28, 25, 23, 0.2);
    }

    /* Center Stage */
    .hero-stage {
      position: relative;
      height: min(620px, calc(100dvh - 140px));
      min-height: 500px;
      isolation: isolate;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Background Ambient Orb */
    .stage-orb {
      position: absolute;
      width: 86%;
      aspect-ratio: 1;
      left: 50%;
      top: 46%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: radial-gradient(circle, var(--mode-bg, #fff1e8) 0%, rgba(255,255,255,0) 72%);
      z-index: -2;
      transition: background 0.4s ease;
    }
    .stage-orb:after {
      content: '';
      position: absolute;
      inset: 6%;
      border: 1.5px dashed var(--mode-border, #f2c6ad);
      border-radius: inherit;
      opacity: 0.75;
      animation: orbSpin 60s linear infinite;
    }
    @keyframes orbSpin {
      to { transform: rotate(360deg); }
    }

    /* Mascot Person in Foreground */
    .hero-person {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 20px 28px rgba(85, 57, 38, 0.14));
      z-index: 3;
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), object-position 0.38s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Directional Alignment */
    .hero-stage[data-align="left"] .hero-person {
      object-position: 22% 50%;
    }
    .hero-stage[data-align="right"] .hero-person {
      object-position: 78% 50%;
    }

    /* Mode-Specific Fine Adjustments */
    /* Web mode: Character lower down and shifted left, Card higher up with top z-index */
    .hero-stage[data-current-mode="web"] .hero-person {
      object-position: 2% 66%;
      transform: translate(-48px, 26px);
    }
    .hero-stage[data-current-mode="web"] .companion-wrap {
      bottom: 31%;
      z-index: 5;
    }

    /* Call mode: Shifted further to the left */
    .hero-stage[data-current-mode="call"] .hero-person {
      object-position: 4% 48%;
      transform: translateX(-56px);
    }
    .hero-stage[data-current-mode="call"] .companion-wrap {
      bottom: 12%;
    }

    /* WhatsApp mode: Baseline vertical alignment */
    .hero-stage[data-current-mode="whatsapp"] .hero-person {
      object-position: 78% 50%;
      transform: translateY(0px);
    }
    .hero-stage[data-current-mode="whatsapp"] .companion-wrap {
      bottom: 12%;
    }

    /* Animated Ambient Accent Badges */
    .stage-accent {
      position: absolute;
      z-index: 4;
      top: 8%;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(10px);
      border: 1px solid var(--border);
      padding: 0.45rem 0.85rem;
      border-radius: 999px;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.07);
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text);
      transition: left 0.35s ease, right 0.35s ease;
      animation: floatBadge 4s ease-in-out infinite alternate;
    }
    .hero-stage[data-align="left"] .stage-accent {
      left: 2%;
      right: auto;
    }
    .hero-stage[data-align="right"] .stage-accent {
      right: 2%;
      left: auto;
    }

    .stage-accent-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--mode, var(--orange));
      box-shadow: 0 0 0 3px var(--mode-bg, rgba(234, 88, 12, 0.2));
      animation: pulseDot 2s ease-in-out infinite;
    }
    @keyframes floatBadge {
      0% { transform: translateY(0px); }
      100% { transform: translateY(-8px); }
    }
    @keyframes pulseDot {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.25); opacity: 0.7; }
    }

    /* Companion Interactive Animated Card */
    .companion-wrap {
      position: absolute;
      z-index: 2;
      transition: opacity 0.26s cubic-bezier(0.16, 1, 0.3, 1), transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), left 0.35s cubic-bezier(0.16, 1, 0.3, 1), right 0.35s cubic-bezier(0.16, 1, 0.3, 1), bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      animation: floatCard 6s ease-in-out infinite alternate;
    }
    /* Opposite side positioning */
    .hero-stage[data-align="left"] .companion-wrap {
      left: auto;
      right: -8px;
    }
    .hero-stage[data-align="right"] .companion-wrap {
      left: -8px;
      right: auto;
    }

    @keyframes floatCard {
      0% { transform: translateY(0px); }
      100% { transform: translateY(-6px); }
    }

    /* =========================================
       1. CALL RAKSHA UI CARD (Image 0 Reference)
       ========================================= */
    .call-card {
      width: clamp(285px, 23vw, 320px);
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 24px;
      padding: 1.4rem 1.3rem 1.25rem;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.13), 0 2px 8px rgba(0, 0, 0, 0.04);
      text-align: center;
      user-select: none;
    }
    .call-card-kicker {
      font-size: 0.85rem;
      font-weight: 500;
      color: #4b5563;
      letter-spacing: -0.01em;
    }
    .call-card-number {
      font-size: 2.25rem;
      font-weight: 800;
      color: #111827;
      letter-spacing: -0.04em;
      line-height: 1.05;
      margin: 0.25rem 0 0.4rem;
    }
    .call-card-sub {
      font-size: 0.76rem;
      color: #6b7280;
      line-height: 1.4;
      max-width: 220px;
      margin: 0 auto 1.1rem;
    }

    /* Authentic Dynamic Voice Waveform */
    .call-waveform {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      height: 42px;
      margin: 0.5rem 0 0.85rem;
    }
    .call-waveform span {
      display: block;
      width: 3.2px;
      height: 100%;
      background: #ff5f38;
      border-radius: 99px;
      transform-origin: center center;
      animation: callWave 1.1s ease-in-out infinite alternate;
    }
    @keyframes callWave {
      0% { transform: scaleY(0.18); opacity: 0.7; }
      50% { transform: scaleY(0.95); opacity: 1; }
      100% { transform: scaleY(0.35); opacity: 0.8; }
    }

    .call-timer {
      font-size: 0.78rem;
      font-weight: 600;
      color: #6b7280;
      font-family: var(--mono);
      letter-spacing: 0.02em;
      margin-bottom: 1.1rem;
    }

    /* Call Action Buttons */
    .call-actions-row {
      display: flex;
      justify-content: space-around;
      align-items: flex-start;
      padding: 0 0.4rem;
    }
    .call-action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
    }
    .call-action-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #f3f4f6;
      display: grid;
      place-items: center;
      color: #4b5563;
      transition: background 0.15s, transform 0.15s;
    }
    .call-action-circle svg {
      width: 20px;
      height: 20px;
    }
    .call-action-circle.end-btn {
      width: 48px;
      height: 48px;
      background: #ef4444;
      color: #ffffff;
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.35);
      animation: pulseEnd 2.5s ease-in-out infinite;
    }
    @keyframes pulseEnd {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    .call-action-label {
      font-size: 0.7rem;
      font-weight: 500;
      color: #6b7280;
    }
    .call-action-btn:hover .call-action-circle:not(.end-btn) {
      background: #e5e7eb;
    }

    /* =========================================
       2. WHATSAPP UI CARD (Image 1 Reference)
       ========================================= */
    .wa-card {
      width: clamp(295px, 24vw, 335px);
      background: #efeae2;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 22px;
      overflow: hidden;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.13), 0 2px 8px rgba(0, 0, 0, 0.04);
      user-select: none;
      text-align: left;
    }
    .wa-header {
      background: #008069;
      color: #ffffff;
      padding: 0.65rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.55rem;
    }
    .wa-header-back {
      font-size: 0.95rem;
      line-height: 1;
      opacity: 0.9;
      cursor: pointer;
    }
    .wa-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #ffffff;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .wa-avatar svg {
      width: 17px;
      height: 17px;
      color: var(--orange);
    }
    .wa-header-info {
      flex: 1;
      min-width: 0;
    }
    .wa-header-name {
      font-size: 0.78rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      line-height: 1.2;
    }
    .wa-verified {
      width: 13px;
      height: 13px;
      color: #22c55e;
      fill: currentColor;
    }
    .wa-header-status {
      font-size: 0.64rem;
      opacity: 0.88;
    }
    .wa-header-more {
      font-size: 1rem;
      opacity: 0.8;
      letter-spacing: -0.05em;
    }

    /* WhatsApp Chat Body */
    .wa-chat-body {
      padding: 0.75rem 0.7rem;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      background: #efeae2;
    }
    .wa-msg {
      max-width: 88%;
      padding: 0.5rem 0.65rem 0.4rem;
      border-radius: 9px;
      font-size: 0.74rem;
      line-height: 1.38;
      box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.12);
      position: relative;
    }
    .wa-msg-meta {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.2rem;
      font-size: 0.59rem;
      color: #667781;
      margin-top: 0.18rem;
    }
    .wa-ticks {
      color: #53bdeb;
      font-weight: 700;
      font-size: 0.68rem;
      line-height: 1;
    }

    /* Voice Note Bubble */
    .wa-msg.wa-voice {
      background: #d9fdd3;
      align-self: flex-end;
      border-top-right-radius: 2px;
      width: 88%;
    }
    .wa-voice-player {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .wa-play-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #252d31;
      display: grid;
      place-items: center;
      color: #ffffff;
      flex-shrink: 0;
      cursor: pointer;
    }
    .wa-play-btn svg {
      width: 11px;
      height: 11px;
      margin-left: 2px;
    }
    .wa-voice-waves {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 2px;
      height: 22px;
    }
    .wa-voice-waves i {
      display: block;
      width: 2.5px;
      height: 100%;
      border-radius: 99px;
      background: #00a884;
      transform-origin: center center;
      animation: voicePulse 0.9s ease-in-out infinite alternate;
    }
    .wa-voice-waves i.played {
      background: #00a884;
    }
    .wa-voice-waves i.unplayed {
      background: #a2dbcd;
    }
    @keyframes voicePulse {
      0% { transform: scaleY(0.2); }
      100% { transform: scaleY(1); }
    }

    /* Received Message Bubble */
    .wa-msg.wa-them {
      background: #ffffff;
      align-self: flex-start;
      border-top-left-radius: 2px;
      color: #111827;
    }

    /* User Text Bubble */
    .wa-msg.wa-us {
      background: #d9fdd3;
      align-self: flex-end;
      border-top-right-radius: 2px;
      color: #111827;
    }

    /* WhatsApp Input Bar */
    .wa-input-bar {
      background: #f0f2f5;
      padding: 0.45rem 0.6rem;
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .wa-input-pill {
      background: #ffffff;
      border-radius: 20px;
      padding: 0.4rem 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      font-size: 0.72rem;
      color: #8696a0;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
    }
    .wa-input-pill svg {
      width: 15px;
      height: 15px;
      color: #8696a0;
      transform: rotate(45deg);
    }
    .wa-mic-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #008069;
      display: grid;
      place-items: center;
      color: #ffffff;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 128, 105, 0.35);
      animation: pulseMic 2s ease-in-out infinite;
    }
    .wa-mic-btn svg {
      width: 16px;
      height: 16px;
    }
    @keyframes pulseMic {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }

    /* =========================================
       3. RAKSHA WEB UI CARD (Image 2 Reference)
       ========================================= */
    .web-card {
      width: clamp(310px, 26vw, 360px);
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 22px;
      padding: 1.1rem 1.15rem 1.15rem;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.13), 0 2px 8px rgba(0, 0, 0, 0.04);
      user-select: none;
      text-align: left;
    }
    .web-header {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #f1f5f9;
    }
    .web-header-icon {
      width: 22px;
      height: 22px;
      color: var(--orange);
    }
    .web-header-title {
      font-size: 0.88rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    /* Step Progression */
    .web-stepper {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.2rem;
      margin: 0.85rem 0 1rem;
      position: relative;
    }
    .web-stepper:before {
      content: '';
      position: absolute;
      top: 10px;
      left: 12%;
      right: 12%;
      height: 2px;
      background: #e2e8f0;
      z-index: 1;
    }
    .web-step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      z-index: 2;
    }
    .web-step-circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #94a3b8;
      display: grid;
      place-items: center;
      font-size: 0.62rem;
      font-weight: 700;
      transition: all 0.2s ease;
    }
    .web-step-item.active .web-step-circle {
      background: #2563eb;
      color: #ffffff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
    }
    .web-step-label {
      font-size: 0.62rem;
      font-weight: 600;
      color: #94a3b8;
      margin-top: 0.3rem;
    }
    .web-step-item.active .web-step-label {
      color: #2563eb;
      font-weight: 700;
    }

    /* 2 Columns: Evidence Dropzone & Case Preview */
    .web-panels-grid {
      display: grid;
      grid-template-columns: 1.12fr 1fr;
      gap: 0.65rem;
    }
    .web-panel-box {
      display: flex;
      flex-direction: column;
    }
    .web-panel-title {
      font-size: 0.68rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.35rem;
    }
    
    /* Evidence Upload Dropzone */
    .web-dropzone {
      border: 1.5px dashed #cbd5e1;
      border-radius: 10px;
      background: #f8fafc;
      padding: 0.75rem 0.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      position: relative;
      overflow: hidden;
      flex: 1;
    }
    .web-dropzone-text {
      font-size: 0.6rem;
      color: #64748b;
      line-height: 1.35;
    }
    .web-dropzone-btn {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #2563eb;
      font-size: 0.64rem;
      font-weight: 700;
      padding: 0.28rem 0.75rem;
      border-radius: 999px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .web-dropzone-btn:hover {
      background: #dbeafe;
    }

    /* Scanning beam effect inside dropzone */
    .web-dropzone:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #2563eb, transparent);
      box-shadow: 0 0 6px #2563eb;
      animation: scanBeam 2.5s ease-in-out infinite;
    }
    @keyframes scanBeam {
      0% { top: 0%; opacity: 0; }
      15% { opacity: 1; }
      85% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }

    /* Case Preview Spec */
    .web-preview-box {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 10px;
      padding: 0.65rem 0.6rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      flex: 1;
    }
    .web-preview-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.62rem;
    }
    .web-preview-key {
      color: #64748b;
    }
    .web-preview-val {
      font-weight: 700;
      color: #1e293b;
    }
    .web-status-pill {
      background: #eff6ff;
      color: #2563eb;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-size: 0.58rem;
      font-weight: 700;
    }

    /* Mode Switch Bottom Bar */
    .mode-switch {
      position: absolute;
      z-index: 10;
      bottom: 2%;
      left: 50%;
      transform: translateX(-50%);
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      width: min(540px, 94%);
      padding: 0.35rem;
      background: rgba(255, 255, 255, 0.94);
      border: 1px solid var(--border);
      border-radius: 999px;
      box-shadow: 0 14px 32px rgba(70, 47, 30, 0.12);
      backdrop-filter: blur(12px);
    }
    .mode-switch button {
      appearance: none;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: var(--text-muted);
      font: inherit;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.72rem 0.6rem;
      cursor: pointer;
      transition: color 0.2s ease, background 0.2s ease, transform 0.15s ease;
    }
    .mode-switch button:hover {
      color: var(--text);
    }
    .mode-switch button.active {
      color: #fff;
      background: var(--mode, var(--orange));
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    /* Right Details Column */
    .mode-detail {
      align-self: center;
      border-left: 1px solid var(--border);
      padding-left: clamp(1.4rem, 2.2vw, 2.5rem);
      position: relative;
      z-index: 5;
    }
    .mode-kicker {
      font-family: var(--font);
      color: var(--mode, var(--orange));
      font-size: 0.74rem;
      font-weight: 600;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      transition: color 0.3s ease;
    }
    .mode-detail h2,
    .mode-heading {
      margin: 0.6rem 0 0.8rem;
      font-size: clamp(2.4rem, 3.2vw, 3.4rem);
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.45rem 0.6rem;
    }
    .mode-heading-icon {
      width: 0.78em;
      height: 0.78em;
      object-fit: contain;
      flex-shrink: 0;
      transform: translateY(0.04em);
    }
    .mode-detail p {
      color: var(--text-muted);
      font-size: 0.94rem;
      line-height: 1.58;
    }
    .mode-detail ul {
      list-style: none;
      margin-top: 1.4rem;
      display: grid;
      gap: 0.85rem;
    }
    .mode-detail li {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      font-size: 0.86rem;
      font-weight: 650;
    }
    .mode-bullet-icon {
      width: 22px;
      height: 22px;
      object-fit: contain;
      flex-shrink: 0;
    }

    /* Responsive Adjustments */
    @media (max-width: 1100px) {
      .landing { padding: 1.8rem 1.5rem 2.8rem; }
      .hero {
        grid-template-columns: 0.85fr 1.25fr;
      }
      .mode-detail {
        grid-column: 1 / -1;
        border-left: 0;
        border-top: 1px solid var(--border);
        padding: 1.4rem 0 0;
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 2rem;
      }
      .mode-detail .mode-kicker, .mode-detail h2, .mode-detail .mode-heading { grid-column: 1; }
      .mode-detail p, .mode-detail ul { grid-column: 2; grid-row: 1; }
      .mode-detail h2 { margin-bottom: 0; }
      .mode-detail ul { grid-row: 2; margin-top: 0.8rem; }
    }

    @media (max-width: 760px) {
      .landing { display: block; padding: 1.35rem 1rem 2.4rem; min-height: 0; overflow: visible; }
      .hero { display: flex; flex-direction: column; gap: 1.35rem; }
      .hero-copy { width: 100%; }
      .hero-copy h1 { font-size: clamp(2.25rem, 10.5vw, 3.15rem); max-width: none; line-height: 1.02; }
      .hero-copy p { margin: 0.95rem 0 1.15rem; font-size: 0.92rem; max-width: none; }
      .hero-cta { width: 100%; justify-content: center; }
      .hero-stage { width: 100%; height: min(400px, 78vw); min-height: 300px; }
      .mode-switch {
        width: calc(100% - 8px);
        bottom: 6px;
        padding: 0.28rem;
      }
      .mode-switch button {
        font-size: 0.7rem;
        padding: 0.58rem 0.3rem;
      }
      .mode-detail { width: 100%; display: block; padding-top: 1.1rem; }
      .mode-detail h2, .mode-heading { margin-bottom: 0.55rem; font-size: clamp(2rem, 8.4vw, 2.55rem); }
      .mode-heading-icon { width: 0.72em; height: 0.72em; }
      .mode-detail ul { margin-top: 1rem; gap: 0.7rem; }
      .mode-bullet-icon { width: 20px; height: 20px; }
      .hero-stage[data-align="left"] .hero-person,
      .hero-stage[data-align="right"] .hero-person,
      .hero-stage[data-current-mode="call"] .hero-person,
      .hero-stage[data-current-mode="web"] .hero-person,
      .hero-stage[data-current-mode="whatsapp"] .hero-person {
        object-position: 50% 36%;
        transform: none !important;
      }
      .companion-wrap,
      .hero-stage[data-align="left"] .companion-wrap,
      .hero-stage[data-align="right"] .companion-wrap,
      .hero-stage[data-current-mode="call"] .companion-wrap,
      .hero-stage[data-current-mode="whatsapp"] .companion-wrap,
      .hero-stage[data-current-mode="web"] .companion-wrap {
        left: 50% !important;
        right: auto !important;
        bottom: 18% !important;
        transform: translateX(-50%) scale(0.68);
        transform-origin: center bottom;
      }
      .call-card, .wa-card { width: min(270px, 78vw); }
      .stage-accent,
      .hero-stage[data-align="left"] .stage-accent,
      .hero-stage[data-align="right"] .stage-accent {
        top: 3%;
        right: 4% !important;
        left: auto !important;
        font-size: 0.64rem;
        padding: 0.35rem 0.65rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *:before, *:after {
        transition-duration: 0.01ms !important;
        animation: none !important;
      }
    }
  `;

  // SVG helper definitions
  const shieldSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-3.5-3.5 1.41-1.41L11 13.67l5.09-5.09 1.41 1.41L11 16.5z"/></svg>`;
  const micSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`;
  const muteSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
  const phoneEndSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>`;
  const speakerSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
  const playSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>`;
  const checkSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  const paperclipSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`;

  // Generate 32 waveform bars with distinct natural speech heights & delays
  const callWaveHeights = [10, 16, 22, 32, 45, 60, 75, 90, 100, 85, 65, 80, 95, 100, 88, 70, 55, 75, 92, 100, 80, 60, 70, 85, 95, 75, 50, 38, 26, 18, 12, 8];
  const callWaveHtml = callWaveHeights.map((h, i) => {
    const delay = (i * 0.05).toFixed(2);
    const duration = (0.75 + (i % 5) * 0.12).toFixed(2);
    return `<span style="height:${h}%; animation-delay:${delay}s; animation-duration:${duration}s;"></span>`;
  }).join('');

  // Generate WhatsApp voice message bars
  const waWaveHeights = [20, 35, 60, 85, 45, 70, 95, 100, 65, 40, 80, 90, 55, 30, 60, 75, 90, 45, 25, 15];
  const waWaveHtml = waWaveHeights.map((h, i) => {
    const isPlayed = i < 11;
    const delay = (i * 0.06).toFixed(2);
    return `<i class="${isPlayed ? 'played' : 'unplayed'}" style="height:${h}%; animation-delay:${delay}s;"></i>`;
  }).join('');

  const bodyContent = `
    <section class="landing" style="--mode:var(--orange); --mode-bg:#fff1e8; --mode-border:#f2c6ad;">
      <div class="hero">
        
        <!-- Column 1: Editorial Heading & CTA -->
        <div class="hero-copy">
          <h1 id="heroTitle">Tell us what happened.<br><em>We handle the rest.</em></h1>
          <p id="heroSub">Call, send a voice note, or upload a receipt. Raksha turns the details into a verified emergency report.</p>
          <a class="hero-cta" href="/app">
            <span id="heroCta">Start a report</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <!-- Column 2: Center Stage with Mascot + Floating Animated Illustration Reference UI -->
        <div class="hero-stage" id="heroStage" data-align="left" data-current-mode="call">
          <!-- Atmospheric Radial Orb -->
          <div class="stage-orb"></div>

          <!-- Foreground Mascot Person (Left-aligned for Call mode) -->
          <img id="heroPerson" class="hero-person" src="/images/raksha/hero-call.png" alt="Young person calling Raksha for help" />

          <!-- Floating Ambient Security Badge -->
          <div class="stage-accent" id="stageAccent">
            <span class="stage-accent-dot"></span>
            <span id="stageAccentText">Toll-Free 24/7 Helpline</span>
          </div>

          <!-- Interactive Companion Illustration Card (Right-aligned for Call mode) -->
          <div class="companion-wrap" id="companionWrap">
            <!-- Calling Interface Card (Image 0) -->
            <div class="call-card" id="activeCard">
              <div class="call-card-kicker">Calling Raksha</div>
              <div class="call-card-number">1930</div>
              <div class="call-card-sub">Connecting you to a trained support specialist...</div>
              
              <!-- Coded Live Moving Audio Waveform -->
              <div class="call-waveform">
                ${callWaveHtml}
              </div>

              <div class="call-timer" id="callTimer">00:06</div>

              <!-- Action Controls -->
              <div class="call-actions-row">
                <button class="call-action-btn" type="button" aria-label="Mute">
                  <span class="call-action-circle">${muteSvg}</span>
                  <span class="call-action-label">Mute</span>
                </button>
                <button class="call-action-btn" type="button" aria-label="End call">
                  <span class="call-action-circle end-btn">${phoneEndSvg}</span>
                  <span class="call-action-label">End</span>
                </button>
                <button class="call-action-btn" type="button" aria-label="Speaker">
                  <span class="call-action-circle">${speakerSvg}</span>
                  <span class="call-action-label">Speaker</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Mode Selector Tabs -->
          <div class="mode-switch" role="tablist" aria-label="Choose a reporting method">
            <button class="active" role="tab" aria-selected="true" data-mode="call">Call Raksha</button>
            <button role="tab" aria-selected="false" data-mode="whatsapp">WhatsApp</button>
            <button role="tab" aria-selected="false" data-mode="web">Use the web</button>
          </div>
        </div>

        <!-- Column 3: Mode Narrative Details -->
        <aside class="mode-detail" id="modeDetail">
          <div class="mode-kicker">CALL RAKSHA</div>
          <h2 class="mode-heading">Just call.<img class="mode-heading-icon" src="/images/line/channel-phone.png" alt="" /></h2>
          <p>Talk in the language you are comfortable with. We ask one clear question at a time.</p>
          <ul>
            <li><img class="mode-bullet-icon" src="/images/line/mode-no-forms.png" alt="" />No forms to navigate</li>
            <li><img class="mode-bullet-icon" src="/images/line/mode-languages.png" alt="" />Multilingual support</li>
            <li><img class="mode-bullet-icon" src="/images/line/mode-next-step.png" alt="" />A guided next step</li>
          </ul>
        </aside>

      </div>
    </section>
  `;

  const homeI18n = {
    en: {
      heroTitle: "Tell us what happened.<br><em>We handle the rest.</em>",
      heroSub: "Call, send a voice note, or upload a receipt. Raksha turns the details into a verified emergency report.",
      heroCta: "Start a report",
      tabs: { call: "Call Raksha", whatsapp: "WhatsApp", web: "Use the web" },
      howKicker: "HOW RAKSHA WORKS",
      howTitle: 'You bring <br>the story.<br>We handle <br>the <span class="hl-motion">rest.</span>',
      howDesc: "Raksha turns what you share into a verified report and gets it to the right authorities. You stay in control at every step.",
      howWatch: "Watch the journey",
      howWatchSub: "See how a report moves through Raksha",
      modes: {
        call: {
          accent: "Toll-Free 24/7 Helpline",
          kicker: "CALL RAKSHA",
          heading: "Just call.",
          copy: "Talk in the language you are comfortable with. We ask one clear question at a time.",
          bullets: ["No forms to navigate", "Multilingual support", "A guided next step"],
          alt: "Young person calling Raksha for help",
        },
        whatsapp: {
          accent: "Verified WhatsApp Assistant",
          kicker: "WHATSAPP RAKSHA",
          heading: "Just message.",
          copy: "Send a voice note, a screenshot, or a message. Your case can continue right where you left it.",
          bullets: ["Voice notes and photos", "One case across channels", "No portal to learn"],
          alt: "Elderly woman sending a Raksha WhatsApp voice message",
        },
        web: {
          accent: "Citizen Intake Portal",
          kicker: "RAKSHA ON THE WEB",
          heading: "Just show us.",
          copy: "Upload a receipt or type what happened. Raksha extracts the important details before you send.",
          bullets: ["Receipt extraction", "Review before sending", "Evidence stays linked"],
          alt: "Young adult using Raksha on a laptop",
        },
      },
      call: { kicker: "Calling Raksha", sub: "Connecting you to a trained support specialist...", mute: "Mute", end: "End", speaker: "Speaker" },
      wa: { name: "Raksha Support", status: "Online", reply: "Thank you. We've received your message. How can we help you today?", user: "I got scammed on a fake website...", placeholder: "Type a message" },
      web: { title: "Raksha Web", describe: "Describe", details: "Add Details", review: "Review", submit: "Submit", evidence: "Add Evidence", drop: "Upload receipt, screenshot, or file", browse: "Browse Files", preview: "Case Preview", category: "Category", catVal: "Financial Fraud", channel: "Channel", channelVal: "Web", status: "Status", statusVal: "Draft" },
    },
    hi: {
      heroTitle: "बताइए क्या हुआ।<br><em>बाकी हम संभाल लेंगे।</em>",
      heroSub: "कॉल करें, वॉइस नोट भेजें या रसीद अपलोड करें। रक्षा आपके लिए सत्यापित रिपोर्ट तैयार करती है।",
      heroCta: "रिपोर्ट शुरू करें",
      tabs: { call: "रक्षा को कॉल करें", whatsapp: "व्हाट्सऐप", web: "वेब इस्तेमाल करें" },
      howKicker: "रक्षा कैसे काम करती है",
      howTitle: 'आप कहानी<br>लाते हैं।<br>बाकी <span class="hl-motion">हम संभालते हैं।</span>',
      howDesc: "रक्षा जो भी आप साझा कर सकते हैं उसे सत्यापित रिपोर्ट बनाती है और सही अधिकारियों तक पहुँचाती है। हर कदम पर नियंत्रण आपके पास रहता है।",
      howWatch: "पूरा सफ़र देखें",
      howWatchSub: "देखें कि रिपोर्ट रक्षा में कैसे आगे बढ़ती है",
      modes: {
        call: {
          accent: "टोल-फ़्री 24/7 हेल्पलाइन",
          kicker: "रक्षा को कॉल करें",
          heading: "बस कॉल करें।",
          copy: "जिस भाषा में सहज हों, उसी में बात करें। हम एक समय में एक साफ़ सवाल पूछते हैं।",
          bullets: ["कोई फ़ॉर्म नहीं भरना", "बहुभाषी सहायता", "एक स्पष्ट अगला कदम"],
          alt: "युवा व्यक्ति सहायता के लिए रक्षा को कॉल कर रहा है",
        },
        whatsapp: {
          accent: "सत्यापित व्हाट्सऐप सहायक",
          kicker: "व्हाट्सऐप पर रक्षा",
          heading: "बस संदेश भेजें।",
          copy: "वॉइस नोट, स्क्रीनशॉट या संदेश भेजें। आपका केस वहीं से जारी रह सकता है।",
          bullets: ["वॉइस नोट और फ़ोटो", "सभी माध्यमों पर एक केस", "कोई पोर्टल नहीं सीखना"],
          alt: "बुज़ुर्ग महिला रक्षा को व्हाट्सऐप वॉइस संदेश भेज रही हैं",
        },
        web: {
          accent: "नागरिक रिपोर्ट पोर्टल",
          kicker: "वेब पर रक्षा",
          heading: "बस दिखा दीजिए।",
          copy: "रसीद अपलोड करें या लिखें क्या हुआ। भेजने से पहले रक्षा ज़रूरी विवरण निकालती है।",
          bullets: ["रसीद से विवरण", "भेजने से पहले समीक्षा", "सबूत जुड़ा रहता है"],
          alt: "युवा वयस्क लैपटॉप पर रक्षा का उपयोग कर रहा है",
        },
      },
      call: { kicker: "रक्षा से कॉल", sub: "आपको प्रशिक्षित सहायता से जोड़ रहे हैं...", mute: "म्यूट", end: "समाप्त", speaker: "स्पीकर" },
      wa: { name: "रक्षा सहायता", status: "ऑनलाइन", reply: "धन्यवाद। आपका संदेश मिल गया है। हम आपकी कैसे मदद कर सकते हैं?", user: "मुझे एक नकली वेबसाइट पर धोखा हुआ...", placeholder: "संदेश लिखें" },
      web: { title: "रक्षा वेब", describe: "वर्णन", details: "विवरण जोड़ें", review: "समीक्षा", submit: "भेजें", evidence: "सबूत जोड़ें", drop: "रसीद, स्क्रीनशॉट या फ़ाइल अपलोड करें", browse: "फ़ाइल चुनें", preview: "केस पूर्वावलोकन", category: "श्रेणी", catVal: "वित्तीय धोखाधड़ी", channel: "माध्यम", channelVal: "वेब", status: "स्थिति", statusVal: "ड्राफ़्ट" },
    },
    ta: {
      heroTitle: "என்ன நடந்தது என்று சொல்லுங்கள்.<br><em>மீதியை நாங்கள் பார்த்துக்கொள்கிறோம்.</em>",
      heroSub: "அழைக்கவும், குரல் பதிவு அனுப்பவும் அல்லது ரசீதை பதிவேற்றவும். ரக்ஷா சரிபார்க்கப்பட்ட புகாரை உருவாக்குகிறது.",
      heroCta: "புகாரைத் தொடங்கு",
      tabs: { call: "ரக்ஷாவை அழை", whatsapp: "வாட்ஸ்அப்", web: "இணையம்" },
      howKicker: "ரக்ஷா எப்படி வேலை செய்கிறது",
      howTitle: 'நீங்கள் கதையைக்<br>கொண்டு வாருங்கள்.<br>மீதியை <span class="hl-motion">நாங்கள் கையாளுகிறோம்.</span>',
      howDesc: "நீங்கள் பகிரக்கூடியதை ரக்ஷா சரிபார்க்கப்பட்ட புகாராக மாற்றி சரியான அதிகாரிகளிடம் கொண்டு செல்கிறது. ஒவ்வொரு அடியிலும் கட்டுப்பாடு உங்களிடமே.",
      howWatch: "பயணத்தைப் பாருங்கள்",
      howWatchSub: "ஒரு புகார் ரக்ஷாவில் எப்படி நகர்கிறது என்று பாருங்கள்",
      modes: {
        call: {
          accent: "கட்டணமில்லா 24/7 உதவி",
          kicker: "ரக்ஷாவை அழைக்கவும்",
          heading: "அழையுங்கள்.",
          copy: "உங்களுக்கு வசதியான மொழியில் பேசுங்கள். நாங்கள் ஒரு நேரத்தில் ஒரு தெளிவான கேள்வி கேட்கிறோம்.",
          bullets: ["படிவங்கள் இல்லை", "பலமொழி ஆதரவு", "அடுத்த வழிகாட்டல்"],
          alt: "உதவிக்காக ரக்ஷாவை அழைக்கும் இளைஞர்",
        },
        whatsapp: {
          accent: "சரிபார்க்கப்பட்ட வாட்ஸ்அப் உதவியாளர்",
          kicker: "வாட்ஸ்அப்பில் ரக்ஷா",
          heading: "செய்தி அனுப்புங்கள்.",
          copy: "குரல் குறிப்பு, திரைப்பிடிப்பு அல்லது செய்தி அனுப்புங்கள். உங்கள் வழக்கு அங்கேயே தொடரலாம்.",
          bullets: ["குரல் குறிப்புகளும் புகைப்படங்களும்", "அனைத்து வழிகளிலும் ஒரே வழக்கு", "போர்டல் கற்க வேண்டாம்"],
          alt: "ரக்ஷாவுக்கு வாட்ஸ்அப் குரல் செய்தி அனுப்பும் மூத்த பெண்",
        },
        web: {
          accent: "குடிமக்கள் புகார் வாயில்",
          kicker: "இணையத்தில் ரக்ஷா",
          heading: "காட்டுங்கள்.",
          copy: "ரசீதை பதிவேற்றவும் அல்லது என்ன நடந்தது என்று எழுதவும். அனுப்பும் முன் ரக்ஷா முக்கிய விவரங்களை எடுக்கும்.",
          bullets: ["ரசீதிலிருந்து விவரம்", "அனுப்பும் முன் சரிபார்ப்பு", "ஆதாரம் இணைந்தே இருக்கும்"],
          alt: "மடிக்கணினியில் ரக்ஷாவைப் பயன்படுத்தும் இளைஞர்",
        },
      },
      call: { kicker: "ரக்ஷாவை அழைக்கிறோம்", sub: "பயிற்சி பெற்ற உதவியாளருடன் இணைக்கிறோம்...", mute: "அமைதி", end: "முடி", speaker: "ஸ்பீக்கர்" },
      wa: { name: "ரக்ஷா உதவி", status: "ஆன்லைன்", reply: "நன்றி. உங்கள் செய்தி கிடைத்தது. இன்று எப்படி உதவலாம்?", user: "போலி இணையதளத்தில் ஏமாற்றப்பட்டேன்...", placeholder: "செய்தியை எழுதுங்கள்" },
      web: { title: "ரக்ஷா வலை", describe: "விவரம்", details: "விவரங்கள்", review: "சரிபார்", submit: "அனுப்பு", evidence: "ஆதாரம் சேர்", drop: "ரசீது, திரைப்பிடிப்பு அல்லது கோப்பை பதிவேற்று", browse: "கோப்புகளைப் பார்", preview: "வழக்கு முன்னோட்டம்", category: "வகை", catVal: "நிதி மோசடி", channel: "வழி", channelVal: "வலை", status: "நிலை", statusVal: "வரைவு" },
    },
  } as const;

  const extraScripts = `
    <script>
      (function() {
        const shieldSvg = '${shieldSvg}';
        const muteSvg = '${muteSvg}';
        const phoneEndSvg = '${phoneEndSvg}';
        const speakerSvg = '${speakerSvg}';
        const playSvg = '${playSvg}';
        const checkSvg = '${checkSvg}';
        const paperclipSvg = '${paperclipSvg}';
        const micSvg = '${micSvg}';

        const callWaveHtml = '${callWaveHtml}';
        const waWaveHtml = '${waWaveHtml}';

        const HOME_I18N = ${JSON.stringify(homeI18n)};
        let currentLang = 'en';
        let currentMode = 'call';

        const skins = {
          call: { align: 'left', color: '#e85d17', bg: '#fff1e8', border: '#f2c6ad', image: '/images/raksha/hero-call.png' },
          whatsapp: { align: 'right', color: '#008069', bg: '#e6f7f2', border: '#a2e3d3', image: '/images/raksha/hero-whatsapp.png' },
          web: { align: 'left', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', image: '/images/raksha/hero-web.png' }
        };
        const MODE_ICONS = {
          call: { heading: 'channel-phone', bullets: ['mode-no-forms', 'mode-languages', 'mode-next-step'] },
          whatsapp: { heading: 'channel-whatsapp', bullets: ['mode-voice-photo', 'hub-lotus', 'mode-no-portal'] },
          web: { heading: 'channel-web', bullets: ['step-request', 'step-confirm', 'mode-evidence-link'] }
        };

        function pack() {
          return HOME_I18N[currentLang] || HOME_I18N.en;
        }

        function cardHtml(name) {
          const t = pack();
          if (name === 'call') {
            const c = t.call;
            return '<div class="call-card"><div class="call-card-kicker">' + c.kicker + '</div><div class="call-card-number">1930</div><div class="call-card-sub">' + c.sub + '</div><div class="call-waveform">' + callWaveHtml + '</div><div class="call-timer" id="callTimer">00:06</div><div class="call-actions-row"><button class="call-action-btn" type="button" aria-label="' + c.mute + '"><span class="call-action-circle">' + muteSvg + '</span><span class="call-action-label">' + c.mute + '</span></button><button class="call-action-btn" type="button" aria-label="' + c.end + '"><span class="call-action-circle end-btn">' + phoneEndSvg + '</span><span class="call-action-label">' + c.end + '</span></button><button class="call-action-btn" type="button" aria-label="' + c.speaker + '"><span class="call-action-circle">' + speakerSvg + '</span><span class="call-action-label">' + c.speaker + '</span></button></div></div>';
          }
          if (name === 'whatsapp') {
            var w = t.wa;
            return '<div class="wa-card"><div class="wa-header"><span class="wa-header-back">‹</span><div class="wa-avatar">' + shieldSvg + '</div><div class="wa-header-info"><div class="wa-header-name">' + w.name + '<svg class="wa-verified" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div><div class="wa-header-status">' + w.status + '</div></div><span class="wa-header-more">⋮</span></div><div class="wa-chat-body"><div class="wa-msg wa-voice"><div class="wa-voice-player"><span class="wa-play-btn">' + playSvg + '</span><div class="wa-voice-waves">' + waWaveHtml + '</div></div><div class="wa-msg-meta"><span>0:18</span><span>10:30 AM</span><span class="wa-ticks">✓✓</span></div></div><div class="wa-msg wa-them">' + w.reply + '<div class="wa-msg-meta"><span>10:31 AM</span></div></div><div class="wa-msg wa-us">' + w.user + '<div class="wa-msg-meta"><span>10:31 AM</span><span class="wa-ticks">✓✓</span></div></div></div><div class="wa-input-bar"><div class="wa-input-pill"><span>' + w.placeholder + '</span><span>' + paperclipSvg + '</span></div><div class="wa-mic-btn" aria-label="' + w.placeholder + '">' + micSvg + '</div></div></div>';
          }
          var b = t.web;
          return '<div class="web-card"><div class="web-header"><div class="web-header-icon">' + shieldSvg + '</div><div class="web-header-title">' + b.title + '</div></div><div class="web-stepper"><div class="web-step-item active"><div class="web-step-circle">' + checkSvg + '</div><div class="web-step-label">' + b.describe + '</div></div><div class="web-step-item"><div class="web-step-circle">2</div><div class="web-step-label">' + b.details + '</div></div><div class="web-step-item"><div class="web-step-circle">3</div><div class="web-step-label">' + b.review + '</div></div><div class="web-step-item"><div class="web-step-circle">4</div><div class="web-step-label">' + b.submit + '</div></div></div><div class="web-panels-grid"><div class="web-panel-box"><div class="web-panel-title">' + b.evidence + '</div><div class="web-dropzone"><div class="web-dropzone-text">' + b.drop + '</div><button type="button" class="web-dropzone-btn">' + b.browse + '</button></div></div><div class="web-panel-box"><div class="web-panel-title">' + b.preview + '</div><div class="web-preview-box"><div class="web-preview-row"><span class="web-preview-key">' + b.category + '</span><span class="web-preview-val">' + b.catVal + '</span></div><div class="web-preview-row"><span class="web-preview-key">' + b.channel + '</span><span class="web-preview-val">' + b.channelVal + '</span></div><div class="web-preview-row"><span class="web-preview-key">' + b.status + '</span><span class="web-status-pill">' + b.statusVal + '</span></div></div></div></div></div>';
        }

        const stage = document.getElementById('heroStage');
        const person = document.getElementById('heroPerson');
        const detail = document.getElementById('modeDetail');
        const wrap = document.getElementById('companionWrap');
        const accentText = document.getElementById('stageAccentText');

        // Dynamic timer increment for phone call card
        let callSeconds = 6;
        setInterval(() => {
          const timerEl = document.getElementById('callTimer');
          if (timerEl) {
            callSeconds++;
            const mins = String(Math.floor(callSeconds / 60)).padStart(2, '0');
            const secs = String(callSeconds % 60).padStart(2, '0');
            timerEl.textContent = mins + ':' + secs;
          }
        }, 1000);

        function selectMode(name, instant) {
          currentMode = name;
          const skin = skins[name];
          const copy = pack().modes[name];
          const section = stage.closest('.landing');
          section.style.setProperty('--mode', skin.color);
          section.style.setProperty('--mode-bg', skin.bg);
          section.style.setProperty('--mode-border', skin.border);

          if (accentText) accentText.textContent = copy.accent;
          var icons = MODE_ICONS[name];
          detail.innerHTML = '<div class="mode-kicker">' + copy.kicker + '</div><h2 class="mode-heading">' + copy.heading + '<img class="mode-heading-icon" src="/images/line/' + icons.heading + '.png" alt="" /></h2><p>' + copy.copy + '</p><ul>' + copy.bullets.map(function(x, i) { return '<li><img class="mode-bullet-icon" src="/images/line/' + icons.bullets[i] + '.png" alt="" />' + x + '</li>'; }).join('') + '</ul>';

          document.querySelectorAll('[data-mode]').forEach(function(btn) {
            const active = btn.dataset.mode === name;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', String(active));
            btn.textContent = pack().tabs[btn.dataset.mode];
          });

          function paintCard() {
            stage.dataset.align = skin.align;
            stage.dataset.currentMode = name;
            person.src = skin.image;
            person.alt = copy.alt;
            wrap.innerHTML = cardHtml(name);
            person.style.opacity = '1';
            person.style.transform = '';
            wrap.style.opacity = '1';
            wrap.style.transform = '';
          }

          if (instant) {
            paintCard();
            return;
          }

          person.style.opacity = '0';
          person.style.transform = 'translateY(10px)';
          wrap.style.opacity = '0';
          wrap.style.transform = 'translateY(8px) scale(0.96)';
          setTimeout(paintCard, 180);
        }

        document.querySelectorAll('[data-mode]').forEach(function(btn) {
          btn.addEventListener('click', function() { selectMode(btn.dataset.mode); });
        });

        window.switchLang = function(lang) {
          currentLang = (lang === 'hi' || lang === 'ta') ? lang : 'en';
          const t = pack();
          const title = document.getElementById('heroTitle');
          const sub = document.getElementById('heroSub');
          const cta = document.getElementById('heroCta');
          if (title) title.innerHTML = t.heroTitle;
          if (sub) sub.textContent = t.heroSub;
          if (cta) cta.textContent = t.heroCta;
          const howKicker = document.getElementById('howKicker');
          const howTitle = document.getElementById('howTitle');
          const howDesc = document.getElementById('howDesc');
          const howWatch = document.getElementById('howWatch');
          const howWatchSub = document.getElementById('howWatchSub');
          if (howKicker) howKicker.textContent = t.howKicker;
          if (howTitle) howTitle.innerHTML = t.howTitle;
          if (howDesc) howDesc.textContent = t.howDesc;
          if (howWatch) howWatch.textContent = t.howWatch;
          if (howWatchSub) howWatchSub.textContent = t.howWatchSub;
          selectMode(currentMode, true);
          if (typeof window.applyHowLang === "function") window.applyHowLang(currentLang);
        };
      })();
    </script>
    ${renderHowItWorksScripts()}
  `;

  return renderPageLayout({
    title: "Financial cyber-fraud help",
    bodyContent: bodyContent + renderHowItWorksHtml(),
    extraStyles: extraStyles + renderHowItWorksStyles(),
    extraScripts,
    isSingleScreen: false,
  });
}
