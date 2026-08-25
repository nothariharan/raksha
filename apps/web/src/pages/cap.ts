/**
 * /cap — Civic Action Protocol (CAP v0.1) Visual Protocol Page
 * Re-engineered to match the exact 1:1 editorial specification & indigenous design system.
 */

import { renderPageLayout } from "./layout.js";

export function renderCapPageHtml(): string {
  const extraStyles = `
    /* =========================================================
       CAP PROTOCOL SPECIFICATION & ARCHITECTURE DESIGN SYSTEM
       ========================================================= */
    .cap-page {
      max-width: 1240px;
      margin: 0 auto;
      padding: clamp(2.5rem, 5vw, 4.5rem) 1.5rem 5rem;
      display: flex;
      flex-direction: column;
      gap: clamp(3.5rem, 6vw, 5.5rem);
    }

    /* Section Kickers */
    .cap-section-kicker {
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--orange);
      margin-bottom: 1.25rem;
      display: block;
    }

    /* =========================================================
       1. HERO SECTION & CONVERGENT ARCHITECTURE DIAGRAM
       ========================================================= */
    .cap-hero-grid {
      display: grid;
      grid-template-columns: minmax(320px, 1fr) minmax(420px, 1.28fr);
      gap: clamp(2rem, 4.5vw, 4.5rem);
      align-items: center;
    }

    .cap-hero-copy {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .cap-hero-badge {
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--orange);
    }
    .cap-hero-title {
      font-size: clamp(2.8rem, 4.5vw, 4.2rem);
      font-weight: 800;
      line-height: 1.04;
      letter-spacing: -0.055em;
      color: #0f172a;
      margin: 0;
    }
    .cap-hero-tagline {
      font-size: clamp(1.45rem, 2.2vw, 1.95rem);
      font-weight: 700;
      line-height: 1.25;
      letter-spacing: -0.035em;
      color: #334155;
      margin: 0.6rem 0 0.4rem;
    }
    .cap-hero-desc {
      font-size: 1.02rem;
      line-height: 1.62;
      color: #64748b;
      margin: 0 0 1.25rem;
      max-width: 440px;
    }

    .cap-cta-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
    }
    .btn-cap-primary {
      background: var(--orange);
      color: #ffffff;
      padding: 0.78rem 1.45rem;
      border-radius: 12px;
      font-size: 0.92rem;
      font-weight: 700;
      text-decoration: none;
      box-shadow: 0 6px 18px rgba(234, 88, 12, 0.22);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-cap-primary:hover {
      background: var(--orange-hover);
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(234, 88, 12, 0.3);
    }
    .btn-cap-secondary {
      background: #ffffff;
      color: #0f172a;
      border: 1px solid #cbd5e1;
      padding: 0.78rem 1.45rem;
      border-radius: 12px;
      font-size: 0.92rem;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-cap-secondary:hover {
      border-color: #94a3b8;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    }
    .btn-cap-secondary svg {
      width: 17px;
      height: 17px;
      fill: currentColor;
    }

    /* Architecture Diagram Stage */
    .cap-arch-stage {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.07);
      border-radius: 24px;
      padding: 1.8rem 1.6rem;
      box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.06), 0 2px 10px rgba(0, 0, 0, 0.02);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    /* Top Channels */
    .arch-channels-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.85rem;
      width: 100%;
      position: relative;
      z-index: 2;
    }
    .arch-channel-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.45rem;
    }
    .arch-channel-icon-box {
      width: 54px;
      height: 54px;
      display: grid;
      place-items: center;
      transition: transform 0.2s ease;
    }
    .arch-channel-node:hover .arch-channel-icon-box {
      transform: translateY(-3px);
    }
    .arch-channel-label {
      font-size: 0.76rem;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
    }

    /* Curved Convergence Connectors */
    .arch-connectors-svg-wrap {
      width: 100%;
      height: 52px;
      margin: -4px 0 -6px;
      position: relative;
      z-index: 1;
    }
    .arch-connectors-svg {
      width: 100%;
      height: 100%;
    }

    /* Center CAP Mandala Hub */
    .arch-cap-hub {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      z-index: 3;
      margin: 0.2rem 0;
    }
    .arch-mandala-emblem {
      width: 84px;
      height: 84px;
      display: grid;
      place-items: center;
      filter: drop-shadow(0 6px 18px rgba(234, 88, 12, 0.25));
      transition: transform 0.3s ease;
    }
    .arch-cap-hub:hover .arch-mandala-emblem {
      transform: scale(1.05) rotate(4deg);
    }
    .arch-cap-title {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0f172a;
      margin-top: 0.2rem;
    }
    .arch-cap-sub {
      font-size: 0.74rem;
      font-weight: 600;
      color: #64748b;
    }

    /* Downward Vertical Connector */
    .arch-down-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0.35rem 0 0.85rem;
      position: relative;
    }
    .arch-down-line {
      width: 2px;
      height: 24px;
      border-left: 2px dashed #cbd5e1;
    }
    .arch-services-tag {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #64748b;
      margin-top: 0.35rem;
    }

    /* Bottom Target Services */
    .arch-services-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.85rem;
      width: 100%;
      position: relative;
      z-index: 2;
    }
    .arch-service-card {
      background: #faf8f5;
      border: 1px solid rgba(0, 0, 0, 0.07);
      border-radius: 16px;
      padding: 1.1rem 0.85rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.45rem;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .arch-service-card:hover {
      background: #ffffff;
      border-color: rgba(234, 88, 12, 0.3);
      transform: translateY(-3px);
      box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.08);
    }
    .arch-service-icon {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      margin-bottom: 0.2rem;
    }
    .arch-service-title {
      font-size: 0.84rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.25;
    }
    .arch-service-sub {
      font-size: 0.68rem;
      color: #64748b;
      line-height: 1.3;
    }

    /* =========================================================
       2. ONE ACTION. END TO END. (5-STEP PIPELINE + LIVE CASE)
       ========================================================= */
    .cap-pipeline-section {
      display: flex;
      flex-direction: column;
    }
    .pipeline-stage-grid {
      display: grid;
      grid-template-columns: 1fr 200px;
      gap: 1.8rem;
      align-items: stretch;
    }

    /* 5-Step Pipeline Card Stage */
    .pipeline-flow-card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.07);
      border-radius: 22px;
      padding: 1.6rem 1.4rem;
      box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.4rem;
      position: relative;
    }
    .pipeline-step-node {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.55rem;
      flex: 1;
      min-width: 0;
    }
    .pipeline-step-num {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--orange);
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 800;
      display: grid;
      place-items: center;
      box-shadow: 0 2px 8px rgba(234, 88, 12, 0.35);
    }
    .pipeline-step-icon-box {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      margin: 0.15rem 0;
    }
    .pipeline-step-title {
      font-size: 0.96rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
      margin: 0;
    }
    .pipeline-step-pill {
      font-size: 0.66rem;
      font-weight: 700;
      color: #334155;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 0.16rem 0.45rem;
      border-radius: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .pipeline-step-pill.code-font {
      font-family: var(--mono);
      color: #0f172a;
      background: #f8fafc;
    }
    .pipeline-step-desc {
      font-size: 0.76rem;
      line-height: 1.4;
      color: #64748b;
      margin: 0;
    }

    .pipeline-arrow-divider {
      color: #cbd5e1;
      font-size: 1.1rem;
      font-weight: 700;
      margin-top: 3.2rem;
      user-select: none;
      flex-shrink: 0;
    }

    /* Live Case Card */
    .pipeline-case-card {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .pipeline-case-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--orange);
    }
    .pipeline-case-box {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.07);
      border-radius: 20px;
      padding: 1.4rem 1.25rem;
      box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
      gap: 0.5rem;
    }
    .case-id-strong {
      font-size: 1.18rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .case-sub-meta {
      font-size: 0.78rem;
      font-weight: 600;
      color: #64748b;
    }
    .case-status-chip {
      background: #f0fdf4;
      color: #166534;
      border: 1px solid #bbf7d0;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.22rem 0.65rem;
      border-radius: 999px;
      align-self: flex-start;
      margin-top: 0.35rem;
    }
    .case-view-link {
      color: var(--orange);
      font-size: 0.84rem;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      margin-top: 0.8rem;
      transition: transform 0.15s ease;
    }
    .case-view-link:hover {
      transform: translateX(3px);
    }

    /* =========================================================
       3. RULES CAP WON'T BREAK. (4 INDIGENOUS MANDALA CARDS)
       ========================================================= */
    .cap-rules-section {
      display: flex;
      flex-direction: column;
    }
    .rules-cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.4rem;
    }
    .rule-card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.07);
      border-radius: 20px;
      padding: 1.6rem 1.4rem 1.4rem;
      box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.65rem;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .rule-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 32px -6px rgba(0, 0, 0, 0.08);
      border-color: rgba(234, 88, 12, 0.25);
    }
    .rule-icon-box {
      width: 52px;
      height: 52px;
      display: grid;
      place-items: center;
      margin-bottom: 0.25rem;
    }
    .rule-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .rule-desc {
      font-size: 0.84rem;
      line-height: 1.5;
      color: #64748b;
      margin: 0 0 auto;
      min-height: 52px;
    }
    .rule-tag-pill {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #475569;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      margin-top: 0.75rem;
    }

    /* =========================================================
       4. TYPED ACTIONS, NOT PORTAL CLICKS.
       ========================================================= */
    .cap-actions-section {
      display: flex;
      flex-direction: column;
    }
    .actions-split-grid {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: clamp(2rem, 4vw, 4rem);
      align-items: flex-start;
    }
    .actions-intro-col {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .actions-intro-text {
      font-size: 0.94rem;
      line-height: 1.58;
      color: #64748b;
      margin: 0 0 0.5rem;
    }
    .actions-view-all-link {
      color: var(--orange);
      font-size: 0.88rem;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: transform 0.15s ease;
    }
    .actions-view-all-link:hover {
      transform: translateX(3px);
    }

    .actions-cards-stack {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .action-row-card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.07);
      border-radius: 18px;
      padding: 1.35rem 1.6rem;
      box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.04);
      display: grid;
      grid-template-columns: 48px 1fr auto auto;
      gap: 1.25rem;
      align-items: center;
      text-decoration: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .action-row-card:hover {
      border-color: rgba(234, 88, 12, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 14px 30px -6px rgba(0, 0, 0, 0.08);
    }
    .action-row-icon {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
    }
    .action-row-main {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      min-width: 0;
    }
    .action-row-head {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-wrap: wrap;
    }
    .action-row-name {
      font-family: var(--mono);
      font-size: 0.96rem;
      font-weight: 700;
      color: #0f172a;
    }
    .badge-risk-high {
      background: #fff7ed;
      color: #c2410c;
      border: 1px solid #ffedd5;
      font-size: 0.64rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }
    .badge-risk-med {
      background: #fefce8;
      color: #a16207;
      border: 1px solid #fef08a;
      font-size: 0.64rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }
    .action-row-sub {
      font-size: 0.82rem;
      color: #64748b;
      line-height: 1.4;
      margin: 0;
    }
    .action-row-target {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      padding-left: 1rem;
      border-left: 1px solid #f1f5f9;
      text-align: left;
    }
    .target-label {
      font-size: 0.65rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .target-value {
      font-size: 0.88rem;
      font-weight: 800;
      color: #0f172a;
      white-space: nowrap;
    }
    .action-row-arrow {
      color: #94a3b8;
      font-size: 1.2rem;
      padding-left: 0.4rem;
      transition: transform 0.15s ease;
    }
    .action-row-card:hover .action-row-arrow {
      transform: translateX(3px);
      color: var(--orange);
    }

    /* =========================================================
       5. WARM INDIAN CIVIC ARCHITECTURE BANNER CALLOUT
       ========================================================= */
    .cap-banner-card {
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
      border: 1.5px solid #fed7aa;
      border-radius: 24px;
      padding: 2.2rem 2.4rem;
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      gap: 1.8rem;
      align-items: center;
      position: relative;
      overflow: hidden;
      box-shadow: 0 12px 32px -8px rgba(234, 88, 12, 0.12);
    }
    .banner-cap-emblem {
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .banner-text-col {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      position: relative;
      z-index: 2;
    }
    .banner-heading {
      font-size: clamp(1.4rem, 2.2vw, 1.85rem);
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.03em;
      margin: 0;
      line-height: 1.2;
    }
    .banner-sub {
      font-size: 0.94rem;
      color: #64748b;
      margin: 0;
    }
    .btn-banner-agent {
      background: var(--orange);
      color: #ffffff;
      padding: 0.85rem 1.65rem;
      border-radius: 999px;
      font-size: 0.92rem;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
      box-shadow: 0 6px 18px rgba(234, 88, 12, 0.25);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      z-index: 2;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-banner-agent:hover {
      background: var(--orange-hover);
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(234, 88, 12, 0.32);
    }
    .banner-monument-img {
      height: 110px;
      width: auto;
      max-width: 240px;
      object-fit: contain;
      opacity: 0.92;
      filter: drop-shadow(0 4px 12px rgba(234, 88, 12, 0.15));
      position: relative;
      z-index: 1;
      pointer-events: none;
    }

    /* =========================================================
       6. INDIGENOUS VALUE PROPS STRIP
       ========================================================= */
    .cap-props-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
    .prop-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .prop-icon-box {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .prop-text {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .prop-title {
      font-size: 0.94rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .prop-sub {
      font-size: 0.78rem;
      line-height: 1.35;
      color: #64748b;
      margin: 0;
    }

    /* =========================================================
       RESPONSIVE BREAKPOINTS
       ========================================================= */
    @media (max-width: 1080px) {
      .cap-hero-grid {
        grid-template-columns: 1fr;
      }
      .pipeline-stage-grid {
        grid-template-columns: 1fr;
      }
      .rules-cards-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .actions-split-grid {
        grid-template-columns: 1fr;
      }
      .cap-banner-card {
        grid-template-columns: auto 1fr auto;
      }
      .banner-monument-img {
        display: none;
      }
      .cap-props-strip {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 760px) {
      .arch-channels-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.2rem;
      }
      .arch-connectors-svg-wrap {
        display: none;
      }
      .arch-services-grid {
        grid-template-columns: 1fr;
      }
      .pipeline-flow-card {
        flex-direction: column;
        gap: 1.2rem;
      }
      .pipeline-arrow-divider {
        display: none;
      }
      .rules-cards-grid {
        grid-template-columns: 1fr;
      }
      .action-row-card {
        grid-template-columns: 1fr;
        gap: 0.85rem;
      }
      .action-row-target {
        border-left: 0;
        padding-left: 0;
        border-top: 1px solid #f1f5f9;
        padding-top: 0.65rem;
      }
      .cap-banner-card {
        grid-template-columns: 1fr;
        text-align: center;
        justify-items: center;
      }
      .cap-props-strip {
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

  // ==========================================
  // BESPOKE INDIGENOUS & ARCHITECTURAL SVGS
  // ==========================================
  const githubSvg = `<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;

  // 1. Architecture Channel Nodes
  const webChannelSvg = `<svg width="48" height="48" viewBox="0 0 64 64" fill="none"><rect x="8" y="12" width="48" height="38" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/><path d="M8 22H56" stroke="#e2e8f0" stroke-width="2"/><circle cx="15" cy="17" r="2.5" fill="#ea580c"/><circle cx="22" cy="17" r="2.5" fill="#cbd5e1"/><circle cx="29" cy="17" r="2.5" fill="#cbd5e1"/><rect x="14" y="28" width="22" height="4" rx="2" fill="#e2e8f0"/><rect x="14" y="36" width="36" height="3" rx="1.5" fill="#f1f5f9"/><rect x="14" y="42" width="26" height="3" rx="1.5" fill="#f1f5f9"/><rect x="42" y="28" width="8" height="8" rx="3" fill="#fff7ed" stroke="#fed7aa" stroke-width="1.5"/></svg>`;
  const waChannelSvg = `<svg width="48" height="48" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="2"/><path d="M32 16C23.16 16 16 23.16 16 32c0 3.08.87 5.96 2.38 8.42L16 48l7.82-2.31A15.9 15.9 0 0032 48c8.84 0 16-7.16 16-16s-7.16-16-16-16z" fill="#22c55e"/><circle cx="26" cy="32" r="2.2" fill="#ffffff"/><circle cx="32" cy="32" r="2.2" fill="#ffffff"/><circle cx="38" cy="32" r="2.2" fill="#ffffff"/></svg>`;
  const phoneChannelSvg = `<svg width="48" height="48" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" fill="#fff7ed" stroke="#fed7aa" stroke-width="2"/><path d="M22 24c0 7.73 6.27 14 14 14l3.5-3.5c.44-.44 1.08-.58 1.66-.36 1.82.68 3.8.96 5.84.96.83 0 1.5.67 1.5 1.5V42c0 .83-.67 1.5-1.5 1.5C31.5 43.5 20.5 32.5 20.5 17.5c0-.83.67-1.5 1.5-1.5H27c.83 0 1.5.67 1.5 1.5 0 2.04.28 4.02.96 5.84.22.58.08 1.22-.36 1.66L22 24z" fill="#ea580c"/><path d="M41 23c1.5 2 2.5 4.5 2.5 7s-1 5-2.5 7" stroke="#ea580c" stroke-width="2.5" stroke-linecap="round"/><path d="M46 18c2.8 3.5 4.5 7.8 4.5 12s-1.7 8.5-4.5 12" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 3"/></svg>`;
  const mcpChannelSvg = `<svg width="48" height="48" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" fill="#eff6ff" stroke="#bfdbfe" stroke-width="2"/><circle cx="32" cy="32" r="6" fill="#ea580c"/><circle cx="20" cy="22" r="4" fill="#3b82f6"/><circle cx="44" cy="22" r="4" fill="#3b82f6"/><circle cx="20" cy="42" r="4" fill="#3b82f6"/><circle cx="44" cy="42" r="4" fill="#3b82f6"/><line x1="32" y1="32" x2="20" y2="22" stroke="#93c5fd" stroke-width="2"/><line x1="32" y1="32" x2="44" y2="22" stroke="#93c5fd" stroke-width="2"/><line x1="32" y1="32" x2="20" y2="42" stroke="#93c5fd" stroke-width="2"/><line x1="32" y1="32" x2="44" y2="42" stroke="#93c5fd" stroke-width="2"/></svg>`;

  // 2. Central Hub Mandala Emblem
  const capMandalaSvg = `<svg width="84" height="84" viewBox="0 0 100 100" fill="none"><g stroke="#ea580c" stroke-width="1.2"><ellipse cx="50" cy="22" rx="6" ry="12" fill="#fff7ed"/><ellipse cx="50" cy="78" rx="6" ry="12" fill="#fff7ed"/><ellipse cx="22" cy="50" rx="12" ry="6" fill="#fff7ed"/><ellipse cx="78" cy="50" rx="12" ry="6" fill="#fff7ed"/><ellipse cx="30" cy="30" rx="7" ry="12" transform="rotate(-45 30 30)" fill="#fff7ed"/><ellipse cx="70" cy="30" rx="7" ry="12" transform="rotate(45 70 30)" fill="#fff7ed"/><ellipse cx="30" cy="70" rx="7" ry="12" transform="rotate(45 30 70)" fill="#fff7ed"/><ellipse cx="70" cy="70" rx="7" ry="12" transform="rotate(-45 70 70)" fill="#fff7ed"/></g><circle cx="50" cy="50" r="28" stroke="#ea580c" stroke-width="1.5" stroke-dasharray="2 3" fill="#ffffff"/><polygon points="50,32 64,40 64,60 50,68 36,60 36,40" fill="#ea580c"/><polygon points="50,36 60,42 60,58 50,64 40,58 40,42" fill="#ffffff"/><polygon points="50,40 56,44 56,56 50,60 44,56 44,44" fill="#ea580c"/></svg>`;

  // 3. Bottom Destination Services Icons
  const cybercrimeSvg = `<svg width="42" height="42" viewBox="0 0 64 64" fill="none"><path d="M32 10L12 22H52L32 10Z" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.2" stroke-linejoin="round"/><rect x="15" y="22" width="34" height="4" fill="#0284c7"/><rect x="18" y="26" width="4" height="20" fill="#0284c7"/><rect x="26" y="26" width="4" height="20" fill="#0284c7"/><rect x="34" y="26" width="4" height="20" fill="#0284c7"/><rect x="42" y="26" width="4" height="20" fill="#0284c7"/><rect x="12" y="46" width="40" height="6" rx="2" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/></svg>`;
  const bankFiuSvg = `<svg width="42" height="42" viewBox="0 0 64 64" fill="none"><path d="M32 8C27 8 26 14 26 14H38C38 14 37 8 32 8Z" fill="#16a34a"/><path d="M32 14L14 24H50L32 14Z" fill="#dcfce7" stroke="#16a34a" stroke-width="2" stroke-linejoin="round"/><rect x="16" y="24" width="32" height="3" fill="#16a34a"/><rect x="19" y="27" width="4" height="18" fill="#16a34a"/><rect x="27" y="27" width="4" height="18" fill="#16a34a"/><rect x="35" y="27" width="4" height="18" fill="#16a34a"/><rect x="43" y="27" width="4" height="18" fill="#16a34a"/><rect x="13" y="45" width="38" height="5" rx="1.5" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/></svg>`;
  const peacockFeatherSvg = `<svg width="42" height="42" viewBox="0 0 64 64" fill="none"><path d="M22 56Q32 40 44 14" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/><path d="M32 38C36 34 44 32 48 30" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round"/><path d="M28 44C32 40 40 38 44 36" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round"/><path d="M24 50C28 46 36 44 40 42" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round"/><path d="M34 32C30 30 24 28 20 28" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round"/><path d="M38 26C34 24 28 22 24 22" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="44" cy="18" rx="12" ry="16" transform="rotate(30 44 18)" fill="#ede9fe" stroke="#8b5cf6" stroke-width="1.5"/><ellipse cx="44" cy="18" rx="8" ry="11" transform="rotate(30 44 18)" fill="#06b6d4"/><ellipse cx="44" cy="18" rx="5" ry="7" transform="rotate(30 44 18)" fill="#3b0764"/><circle cx="43" cy="17" r="2.5" fill="#f59e0b"/></svg>`;

  // 4. Five Pipeline Steps SVGs
  const stepDocStampSvg = `<svg width="48" height="48" viewBox="0 0 64 64" fill="none"><rect x="16" y="10" width="32" height="42" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/><line x1="22" y1="18" x2="36" y2="18" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="24" x2="42" y2="24" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="30" x2="40" y2="30" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="36" x2="32" y2="36" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/><circle cx="42" cy="42" r="8" fill="#fff7ed" stroke="#ea580c" stroke-width="1.5"/><circle cx="42" cy="42" r="6" stroke="#ea580c" stroke-width="1" stroke-dasharray="1.5 1.5"/><circle cx="42" cy="42" r="2.5" fill="#ea580c"/></svg>`;
  const stepShieldValidateSvg = `<svg width="48" height="48" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="#bfdbfe" stroke-width="1.5" stroke-dasharray="3 3" fill="#f8fafc"/><path d="M32 16L18 22V32C18 41 24 48 32 50C40 48 46 41 46 32V22L32 16Z" fill="#eff6ff" stroke="#2563eb" stroke-width="2" stroke-linejoin="round"/><path d="M26 32L30 36L38 27" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const stepBiometricFingerprintSvg = `<svg width="48" height="48" viewBox="0 0 64 64" fill="none"><g stroke="#16a34a" stroke-width="1.8" stroke-linecap="round"><path d="M32 20C27 20 23 24 23 29C23 37 28 43 32 46"/><path d="M27 28C27 25 29 23 32 23C35 23 37 25 37 28C37 33 34 38 31 42"/><path d="M32 16C24 16 19 22 19 29C19 39 26 47 32 50"/><path d="M37 20C40 22 41 25 41 29C41 35 38 41 35 45"/><path d="M45 27C45 22 41 16 32 16"/></g><circle cx="44" cy="44" r="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/><path d="M40 44L43 47L48 41" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const stepRouterSvg = `<svg width="48" height="48" viewBox="0 0 64 64" fill="none"><polygon points="32,20 42,26 42,38 32,44 22,38 22,26" fill="#fff7ed" stroke="#ea580c" stroke-width="2"/><circle cx="32" cy="32" r="3" fill="#ea580c"/><path d="M42 26L52 20" stroke="#0284c7" stroke-width="2" stroke-linecap="round"/><circle cx="52" cy="20" r="3" fill="#0284c7"/><path d="M42 32L52 32" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/><circle cx="52" cy="32" r="3" fill="#16a34a"/><path d="M42 38L52 44" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round"/><circle cx="52" cy="44" r="3" fill="#8b5cf6"/></svg>`;
  const stepAuditRailSvg = `<svg width="48" height="48" viewBox="0 0 64 64" fill="none"><line x1="16" y1="20" x2="48" y2="20" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="32" x2="48" y2="32" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="44" x2="48" y2="44" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="20" r="4" fill="#8b5cf6"/><circle cx="38" cy="32" r="4" fill="#8b5cf6"/><circle cx="28" cy="44" r="4" fill="#8b5cf6"/><circle cx="46" cy="44" r="4" fill="#a78bfa" stroke="#8b5cf6" stroke-width="1.5"/></svg>`;

  // 5. Four Rules Mandala SVGs
  const ruleIdempotentSvg = `<svg width="52" height="52" viewBox="0 0 64 64" fill="none"><g stroke="#ea580c" stroke-width="1.5" fill="#fff7ed"><ellipse cx="32" cy="14" rx="4" ry="8"/><ellipse cx="32" cy="50" rx="4" ry="8"/><ellipse cx="14" cy="32" rx="8" ry="4"/><ellipse cx="50" cy="32" rx="8" ry="4"/><ellipse cx="19" cy="19" rx="5" ry="8" transform="rotate(-45 19 19)"/><ellipse cx="45" cy="19" rx="5" ry="8" transform="rotate(45 45 19)"/><ellipse cx="19" cy="45" rx="5" ry="8" transform="rotate(45 19 45)"/><ellipse cx="45" cy="45" rx="5" ry="8" transform="rotate(-45 45 45)"/></g><circle cx="32" cy="32" r="6" fill="#ea580c"/><circle cx="32" cy="32" r="2.5" fill="#ffffff"/></svg>`;
  const ruleControlledSvg = `<svg width="52" height="52" viewBox="0 0 64 64" fill="none"><g stroke="#16a34a" stroke-width="1.4" fill="#f0fdf4"><polygon points="32,10 38,20 48,16 44,26 54,32 44,38 48,48 38,44 32,54 26,44 16,48 20,38 10,32 20,26 16,16 26,20"/></g><circle cx="32" cy="32" r="12" fill="#ffffff" stroke="#16a34a" stroke-width="1.5"/><rect x="27" y="30" width="10" height="8" rx="1.5" fill="#16a34a"/><path d="M29 30V27C29 25.34 30.34 24 32 24C33.66 24 35 25.34 35 27V30" stroke="#16a34a" stroke-width="1.5" fill="none"/></svg>`;
  const ruleAuditableSvg = `<svg width="52" height="52" viewBox="0 0 64 64" fill="none"><g fill="#8b5cf6"><circle cx="32" cy="12" r="1.5"/><circle cx="32" cy="52" r="1.5"/><circle cx="12" cy="32" r="1.5"/><circle cx="52" cy="32" r="1.5"/><circle cx="18" cy="18" r="1.5"/><circle cx="46" cy="18" r="1.5"/><circle cx="18" cy="46" r="1.5"/><circle cx="46" cy="46" r="1.5"/><circle cx="23" cy="14" r="1.2"/><circle cx="41" cy="14" r="1.2"/><circle cx="23" cy="50" r="1.2"/><circle cx="41" cy="50" r="1.2"/><circle cx="14" cy="23" r="1.2"/><circle cx="14" cy="41" r="1.2"/><circle cx="50" cy="23" r="1.2"/><circle cx="50" cy="41" r="1.2"/></g><circle cx="32" cy="32" r="12" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="2 2" fill="#faf5ff"/><line x1="32" y1="20" x2="32" y2="44" stroke="#8b5cf6" stroke-width="1.2"/><line x1="20" y1="32" x2="44" y2="32" stroke="#8b5cf6" stroke-width="1.2"/><line x1="23.5" y1="23.5" x2="40.5" y2="40.5" stroke="#8b5cf6" stroke-width="1.2"/><line x1="23.5" y1="40.5" x2="40.5" y2="23.5" stroke="#8b5cf6" stroke-width="1.2"/><circle cx="32" cy="32" r="4" fill="#8b5cf6"/></svg>`;
  const ruleIsolatedSvg = `<svg width="52" height="52" viewBox="0 0 64 64" fill="none"><rect x="14" y="14" width="36" height="36" rx="4" stroke="#0284c7" stroke-width="2" stroke-dasharray="4 3" fill="#f0f9ff"/><line x1="22" y1="32" x2="28" y2="32" stroke="#0284c7" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="32" r="4" fill="#0284c7"/><line x1="36" y1="32" x2="42" y2="32" stroke="#0284c7" stroke-width="2" stroke-linecap="round"/><circle cx="14" cy="14" r="2" fill="#0284c7"/><circle cx="50" cy="14" r="2" fill="#0284c7"/><circle cx="14" cy="50" r="2" fill="#0284c7"/><circle cx="50" cy="50" r="2" fill="#0284c7"/></svg>`;

  // 6. Action Rows Mandalas
  const actionReportMandala = `<svg width="44" height="44" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" fill="#fff7ed" stroke="#fed7aa" stroke-width="1.5"/><polygon points="32,20 42,26 42,38 32,44 22,38 22,26" fill="#ea580c"/><polygon points="32,24 38,28 38,36 32,40 26,36 26,28" fill="#ffffff"/><circle cx="32" cy="32" r="2.5" fill="#ea580c"/></svg>`;
  const actionAckMandala = `<svg width="44" height="44" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.5"/><polygon points="32,18 36,24 44,22 42,30 48,34 42,38 44,46 36,44 32,50 28,44 20,46 22,38 16,34 22,30 20,22 28,24" fill="#16a34a"/><circle cx="32" cy="32" r="4" fill="#ffffff"/></svg>`;

  // 7. Value Props Strip Icons
  const propOpenMapSvg = `<svg width="44" height="44" viewBox="0 0 64 64" fill="none"><path d="M30 10L36 12L38 16L34 20L38 24L44 26L48 30L44 36L42 42L36 48L32 54L28 48L22 42L18 36L20 30L24 26L22 20L26 14L30 10Z" stroke="#ea580c" stroke-width="1.6" stroke-dasharray="2 3" fill="#fff7ed"/><circle cx="32" cy="24" r="2" fill="#ea580c"/><circle cx="38" cy="32" r="2" fill="#ea580c"/><circle cx="28" cy="36" r="2" fill="#ea580c"/><circle cx="32" cy="44" r="2" fill="#ea580c"/></svg>`;
  const propTypedCodeSvg = `<svg width="44" height="44" viewBox="0 0 64 64" fill="none"><rect x="14" y="14" width="36" height="36" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3 2"/><path d="M26 26L21 32L26 38" stroke="#16a34a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 26L43 32L38 38" stroke="#16a34a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><line x1="34" y1="24" x2="30" y2="40" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/></svg>`;
  const propSecureShieldSvg = `<svg width="44" height="44" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" fill="#faf5ff" stroke="#8b5cf6" stroke-width="1.5"/><path d="M32 18L22 23V31C22 38 26 43 32 45C38 43 42 38 42 31V23L32 18Z" fill="#ede9fe" stroke="#8b5cf6" stroke-width="1.8" stroke-linejoin="round"/><rect x="29" y="30" width="6" height="6" rx="1" fill="#8b5cf6"/><path d="M30 30V28C30 26.9 30.9 26 32 26C33.1 26 34 26.9 34 28V30" stroke="#8b5cf6" stroke-width="1.4" fill="none"/></svg>`;
  const propExtensibleMandalaSvg = `<svg width="44" height="44" viewBox="0 0 64 64" fill="none"><g stroke="#0284c7" stroke-width="1.5" fill="#f0f9ff"><polygon points="32,12 36,22 46,18 42,28 52,32 42,36 46,46 36,42 32,52 28,42 18,46 22,36 12,32 22,28 18,18 28,22"/></g><circle cx="32" cy="32" r="5" fill="#0284c7"/><circle cx="32" cy="32" r="2" fill="#ffffff"/></svg>`;

  const bodyContent = `
    <div class="cap-page">

      <!-- =========================================================
           1. HERO SECTION & CONVERGENT ARCHITECTURE DIAGRAM
           ========================================================= -->
      <section class="cap-hero-section">
        <div class="cap-hero-grid">
          
          <!-- Left Column: Copy & Actions -->
          <div class="cap-hero-copy">
            <span class="cap-hero-badge">OPEN PROTOCOL</span>
            <h1 class="cap-title">Civic Action<br>Protocol</h1>
            <h2 class="cap-hero-tagline">The layer between intent and action.</h2>
            <p class="cap-hero-desc">
              A typed protocol for discovering, validating, executing and tracking public-service actions.
            </p>
            <div class="cap-cta-row">
              <a href="#pipeline" class="btn-cap-primary">
                <span>See it in action</span>
                <span>↓</span>
              </a>
              <a href="https://github.com/nothariharan/raksha" target="_blank" rel="noopener noreferrer" class="btn-cap-secondary">
                <span>View on GitHub</span>
                ${githubSvg}
              </a>
            </div>
          </div>

          <!-- Right Column: Interactive Convergent Architecture Diagram -->
          <div class="cap-arch-stage">
            
            <!-- Top Channel Origin Nodes -->
            <div class="arch-channels-grid">
              <div class="arch-channel-node">
                <div class="arch-channel-icon-box">${webChannelSvg}</div>
                <span class="arch-channel-label">Web</span>
              </div>
              <div class="arch-channel-node">
                <div class="arch-channel-icon-box">${waChannelSvg}</div>
                <span class="arch-channel-label">WhatsApp</span>
              </div>
              <div class="arch-channel-node">
                <div class="arch-channel-icon-box">${phoneChannelSvg}</div>
                <span class="arch-channel-label">Phone / IVR</span>
              </div>
              <div class="arch-channel-node">
                <div class="arch-channel-icon-box">${mcpChannelSvg}</div>
                <span class="arch-channel-label">AI / MCP Agent</span>
              </div>
            </div>

            <!-- Flowing Curved Dotted Connectors -->
            <div class="arch-connectors-svg-wrap" aria-hidden="true">
              <svg class="arch-connectors-svg" viewBox="0 0 480 60" preserveAspectRatio="none">
                <path d="M 60 4 C 60 30, 240 20, 240 56" fill="none" stroke="#cbd5e1" stroke-width="1.6" stroke-dasharray="3 3" />
                <path d="M 180 4 C 180 30, 240 25, 240 56" fill="none" stroke="#cbd5e1" stroke-width="1.6" stroke-dasharray="3 3" />
                <path d="M 300 4 C 300 30, 240 25, 240 56" fill="none" stroke="#cbd5e1" stroke-width="1.6" stroke-dasharray="3 3" />
                <path d="M 420 4 C 420 30, 240 20, 240 56" fill="none" stroke="#cbd5e1" stroke-width="1.6" stroke-dasharray="3 3" />
              </svg>
            </div>

            <!-- Central CAP Mandala Hub -->
            <div class="arch-cap-hub">
              <div class="arch-mandala-emblem">${capMandalaSvg}</div>
              <span class="arch-cap-title">CAP</span>
              <span class="arch-cap-sub">Civic Action Protocol</span>
            </div>

            <!-- Downward Vertical Connector -->
            <div class="arch-down-connector" aria-hidden="true">
              <div class="arch-down-line"></div>
              <span class="arch-services-tag">Services</span>
            </div>

            <!-- Bottom Target Services Nodes -->
            <div class="arch-services-grid">
              <div class="arch-service-card">
                <div class="arch-service-icon">${cybercrimeSvg}</div>
                <span class="arch-service-title">Cybercrime<br>Intake (1930)</span>
              </div>

              <div class="arch-service-card">
                <div class="arch-service-icon">${bankFiuSvg}</div>
                <span class="arch-service-title">Bank / FIU<br>Response</span>
              </div>

              <div class="arch-service-card">
                <div class="arch-service-icon">${peacockFeatherSvg}</div>
                <span class="arch-service-title">Future Services</span>
                <span class="arch-service-sub">(Pension, Certificates,<br>Benefits, etc.)</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- =========================================================
           2. ONE ACTION. END TO END. (5-STEP PIPELINE + LIVE CASE)
           ========================================================= -->
      <section class="cap-pipeline-section" id="pipeline">
        <span class="cap-section-kicker">ONE ACTION. END TO END.</span>
        
        <div class="pipeline-stage-grid">
          
          <!-- 5-Step Connected Pipeline Card -->
          <div class="pipeline-flow-card">
            
            <!-- Step 01 -->
            <div class="pipeline-step-node">
              <div class="pipeline-step-num">01</div>
              <div class="pipeline-step-icon-box">${stepDocStampSvg}</div>
              <h3 class="pipeline-step-title">Request</h3>
              <span class="pipeline-step-pill code-font">report_financial_fraud</span>
              <p class="pipeline-step-desc">Action is requested by a caller.</p>
            </div>

            <div class="pipeline-arrow-divider">···›</div>

            <!-- Step 02 -->
            <div class="pipeline-step-node">
              <div class="pipeline-step-num">02</div>
              <div class="pipeline-step-icon-box">${stepShieldValidateSvg}</div>
              <h3 class="pipeline-step-title">Validate</h3>
              <span class="pipeline-step-pill">Schema · Fields · Policy</span>
              <p class="pipeline-step-desc">CAP validates data, schema and policy.</p>
            </div>

            <div class="pipeline-arrow-divider">···›</div>

            <!-- Step 03 -->
            <div class="pipeline-step-node">
              <div class="pipeline-step-num">03</div>
              <div class="pipeline-step-icon-box">${stepBiometricFingerprintSvg}</div>
              <h3 class="pipeline-step-title">Confirm</h3>
              <span class="pipeline-step-pill">Citizen approval</span>
              <p class="pipeline-step-desc">High-impact actions need explicit citizen confirmation.</p>
            </div>

            <div class="pipeline-arrow-divider">···›</div>

            <!-- Step 04 -->
            <div class="pipeline-step-node">
              <div class="pipeline-step-num">04</div>
              <div class="pipeline-step-icon-box">${stepRouterSvg}</div>
              <h3 class="pipeline-step-title">Execute</h3>
              <span class="pipeline-step-pill">Route to service</span>
              <p class="pipeline-step-desc">CAP routes the action to the right service.</p>
            </div>

            <div class="pipeline-arrow-divider">···›</div>

            <!-- Step 05 -->
            <div class="pipeline-step-node">
              <div class="pipeline-step-num">05</div>
              <div class="pipeline-step-icon-box">${stepAuditRailSvg}</div>
              <h3 class="pipeline-step-title">Track</h3>
              <span class="pipeline-step-pill">Event + Status</span>
              <p class="pipeline-step-desc">Every transition is recorded and auditable.</p>
            </div>

          </div>

          <!-- Floating Live Case Box -->
          <aside class="pipeline-case-card">
            <span class="pipeline-case-label">Live case</span>
            <div class="pipeline-case-box">
              <div>
                <div class="case-id-strong">RKS-000001</div>
                <div class="case-sub-meta">₹5,000 · UPI · SBI</div>
                <div class="case-status-chip">In progress</div>
              </div>
              <a href="/how" class="case-view-link">
                <span>View events</span>
                <span>→</span>
              </a>
            </div>
          </aside>

        </div>
      </section>

      <!-- =========================================================
           3. RULES CAP WON'T BREAK. (4 INDIGENOUS MANDALA CARDS)
           ========================================================= -->
      <section class="cap-rules-section">
        <span class="cap-section-kicker">RULES CAP WON'T BREAK.</span>

        <div class="rules-cards-grid">
          
          <!-- Card 1: Idempotent -->
          <article class="rule-card">
            <div class="rule-icon-box">${ruleIdempotentSvg}</div>
            <h3 class="rule-title">Idempotent</h3>
            <p class="rule-desc">Same request with the same key never creates duplicate actions.</p>
            <span class="rule-tag-pill">No duplicate side effects</span>
          </article>

          <!-- Card 2: Controlled -->
          <article class="rule-card">
            <div class="rule-icon-box">${ruleControlledSvg}</div>
            <h3 class="rule-title">Controlled</h3>
            <p class="rule-desc">High-impact actions require explicit citizen confirmation before execution.</p>
            <span class="rule-tag-pill">Confirmation required</span>
          </article>

          <!-- Card 3: Auditable -->
          <article class="rule-card">
            <div class="rule-icon-box">${ruleAuditableSvg}</div>
            <h3 class="rule-title">Auditable</h3>
            <p class="rule-desc">Every meaningful transition is cryptographically sealed with evidence hash.</p>
            <span class="rule-tag-pill">Tamper-proof audit trail</span>
          </article>

          <!-- Card 4: Isolated -->
          <article class="rule-card">
            <div class="rule-icon-box">${ruleIsolatedSvg}</div>
            <h3 class="rule-title">Isolated</h3>
            <p class="rule-desc">Demo environments are separated from real service access.</p>
            <span class="rule-tag-pill">Clear simulation boundary</span>
          </article>

        </div>
      </section>

      <!-- =========================================================
           4. TYPED ACTIONS, NOT PORTAL CLICKS.
           ========================================================= -->
      <section class="cap-actions-section">
        <div class="actions-split-grid">
          
          <!-- Left Column -->
          <div class="actions-intro-col">
            <span class="cap-section-kicker">TYPED ACTIONS, NOT PORTAL CLICKS.</span>
            <p class="actions-intro-text">
              CAP exposes a small set of typed actions that map to real public-service work.
            </p>
            <a href="/how" class="actions-view-all-link">
              <span>View all actions</span>
              <span>→</span>
            </a>
          </div>

          <!-- Right Column (2 Horizontal Cards) -->
          <div class="actions-cards-stack">
            
            <!-- Action Card 1 -->
            <a href="/app" class="action-row-card">
              <div class="action-row-icon">${actionReportMandala}</div>
              <div class="action-row-main">
                <div class="action-row-head">
                  <span class="action-row-name">report_financial_fraud</span>
                  <span class="badge-risk-high">HIGH RISK</span>
                </div>
                <p class="action-row-sub">Create a structured cyber-fraud report and submit it to the cybercrime intake.</p>
              </div>
              <div class="action-row-target">
                <span class="target-label">Target service</span>
                <span class="target-value">1930 Cybercrime Intake</span>
              </div>
              <div class="action-row-arrow">›</div>
            </a>

            <!-- Action Card 2 -->
            <a href="/app" class="action-row-card">
              <div class="action-row-icon">${actionAckMandala}</div>
              <div class="action-row-main">
                <div class="action-row-head">
                  <span class="action-row-name">acknowledge_response</span>
                  <span class="badge-risk-med">MEDIUM RISK</span>
                </div>
                <p class="action-row-sub">Acknowledge and record response from the financial institution.</p>
              </div>
              <div class="action-row-target">
                <span class="target-label">Target service</span>
                <span class="target-value">Bank / FIU Financial Response</span>
              </div>
              <div class="action-row-arrow">›</div>
            </a>

          </div>

        </div>
      </section>

      <!-- =========================================================
           5. WARM INDIAN CIVIC ARCHITECTURE BANNER CALLOUT
           ========================================================= -->
      <section class="cap-banner-card">
        <div class="banner-cap-emblem">
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <polygon points="32,8 52,18 52,46 32,56 12,46 12,18" fill="#ea580c"/>
            <polygon points="32,14 46,21 46,43 32,50 18,43 18,21" fill="#ffffff"/>
            <polygon points="32,20 40,24 40,40 32,44 24,40 24,24" fill="#ea580c"/>
          </svg>
        </div>

        <div class="banner-text-col">
          <h2 class="banner-heading">CAP gives public services a common action surface.</h2>
          <p class="banner-sub">One protocol. Many services. Safer outcomes for citizens.</p>
        </div>

        <a href="/agents" class="btn-banner-agent">
          <span>Explore agent interface</span>
          <span>→</span>
        </a>

        <img class="banner-monument-img" src="/images/raksha/cap-heritage-monument.png" alt="Indian Civic Heritage Edifice Architecture" loading="lazy" />
      </section>

      <!-- =========================================================
           6. INDIGENOUS VALUE PROPS STRIP
           ========================================================= -->
      <footer class="cap-props-strip">
        <div class="prop-item">
          <div class="prop-icon-box">${propOpenMapSvg}</div>
          <div class="prop-text">
            <h4 class="prop-title">Open</h4>
            <span class="prop-sub">Built for public good.</span>
          </div>
        </div>

        <div class="prop-item">
          <div class="prop-icon-box">${propTypedCodeSvg}</div>
          <div class="prop-text">
            <h4 class="prop-title">Typed</h4>
            <span class="prop-sub">Explicit schemas and actions.</span>
          </div>
        </div>

        <div class="prop-item">
          <div class="prop-icon-box">${propSecureShieldSvg}</div>
          <div class="prop-text">
            <h4 class="prop-title">Secure</h4>
            <span class="prop-sub">Policy, confirmation and encryption built-in.</span>
          </div>
        </div>

        <div class="prop-item">
          <div class="prop-icon-box">${propExtensibleMandalaSvg}</div>
          <div class="prop-text">
            <h4 class="prop-title">Extensible</h4>
            <span class="prop-sub">Add new services without changing callers.</span>
          </div>
        </div>
      </footer>

    </div>
  `;

  return renderPageLayout({
    title: "Civic Action Protocol (CAP)",
    activeNav: "cap",
    bodyContent,
    extraStyles,
    isSingleScreen: false,
  });
}
