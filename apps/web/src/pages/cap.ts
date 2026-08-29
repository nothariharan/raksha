/**
 * /cap — Civic Action Protocol (CAP v0.1) Visual Protocol Page
 * Trust-first public-sector explainer: editorial type, hollow line-art, restrained motion.
 */

import { renderPageLayout } from "./layout.js";

export function renderCapPageHtml(): string {
  const extraStyles = `
    html { scroll-behavior: smooth; }
    #pipeline { scroll-margin-top: 96px; }

    .cap-page {
      max-width: 1240px;
      margin: 0 auto;
      padding: clamp(2.5rem, 5vw, 4.5rem) 1.5rem 5rem;
      display: flex;
      flex-direction: column;
      gap: clamp(3.5rem, 6vw, 5.5rem);
    }

    .line-icon {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
      pointer-events: none;
      user-select: none;
    }

    .js-reveal {
      opacity: 0;
      transform: translateY(18px);
    }
    .js-reveal.is-inview {
      opacity: 1;
      transform: none;
      transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .cap-section-kicker {
      font-size: 0.76rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--orange);
      margin-bottom: 1.25rem;
      display: block;
    }

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
      font-family: var(--font-display);
      font-size: clamp(2.8rem, 4.5vw, 4.2rem);
      font-weight: 400;
      line-height: 1.04;
      letter-spacing: -0.03em;
      color: #0f172a;
      margin: 0;
    }
    .cap-hero-tagline {
      font-size: clamp(1.45rem, 2.2vw, 1.95rem);
      font-weight: 600;
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
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, box-shadow 0.2s ease;
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
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease;
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
    .arch-connectors-svg path {
      stroke-dasharray: 4 6;
      animation: capDashFlow 1.35s linear infinite;
    }

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
      filter: drop-shadow(0 6px 18px rgba(234, 88, 12, 0.18));
      animation: capHubBreathe 3.6s ease-in-out infinite;
    }
    .arch-cap-hub:hover .arch-mandala-emblem {
      transform: scale(1.05) rotate(4deg);
    }
    .arch-cap-title {
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: #0f172a;
      margin-top: 0.2rem;
    }
    .arch-cap-sub {
      font-size: 0.74rem;
      font-weight: 600;
      color: #64748b;
    }

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
      background-image: repeating-linear-gradient(
        to bottom,
        #cbd5e1 0 3px,
        transparent 3px 8px
      );
      background-size: 2px 11px;
      animation: capDashFlowY 1.2s linear infinite;
    }
    .arch-services-tag {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #64748b;
      margin-top: 0.35rem;
    }

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
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
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
      font-weight: 600;
      color: #0f172a;
      line-height: 1.25;
    }
    .arch-service-sub {
      font-size: 0.68rem;
      color: #64748b;
      line-height: 1.3;
    }

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
      opacity: 1;
    }
    .pipeline-flow-card.is-inview .pipeline-step-node {
      animation: capStepLift 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .pipeline-flow-card.is-inview .pipeline-step-node:nth-child(1) { animation-delay: 0.04s; }
    .pipeline-flow-card.is-inview .pipeline-step-node:nth-child(3) { animation-delay: 0.12s; }
    .pipeline-flow-card.is-inview .pipeline-step-node:nth-child(5) { animation-delay: 0.2s; }
    .pipeline-flow-card.is-inview .pipeline-step-node:nth-child(7) { animation-delay: 0.28s; }
    .pipeline-flow-card.is-inview .pipeline-step-node:nth-child(9) { animation-delay: 0.36s; }
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
      font-weight: 600;
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
      white-space: normal;
      overflow-wrap: anywhere;
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
      margin-top: 3.2rem;
      user-select: none;
      flex-shrink: 0;
      display: grid;
      place-items: center;
    }
    .pipeline-arrow-dash path.flow {
      stroke-dasharray: 3 5;
      animation: capDashFlow 1.2s linear infinite;
    }

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
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
    }
    .pipeline-case-box:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 32px -6px rgba(0, 0, 0, 0.08);
    }
    .case-id-strong {
      font-size: 1.18rem;
      font-weight: 600;
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
      animation: capChipPulse 2.2s ease-out infinite;
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
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease;
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
      font-weight: 600;
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
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
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
      font-weight: 600;
      color: #0f172a;
      white-space: nowrap;
    }
    .action-row-arrow {
      color: #94a3b8;
      font-size: 1.2rem;
      padding-left: 0.4rem;
      transition: transform 0.15s ease, color 0.15s ease;
    }
    .action-row-card:hover .action-row-arrow {
      transform: translateX(3px);
      color: var(--orange);
    }

    .cap-banner-card {
      background:
        radial-gradient(120% 90% at 8% 0%, #fff4ea 0%, transparent 55%),
        linear-gradient(160deg, #fff4ea 0%, #ffe8d6 46%, #ffd9be 100%);
      border: 1px solid rgba(234, 88, 12, 0.16);
      border-radius: 24px;
      padding: 2.2rem 2.4rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.8rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 12px 32px -8px rgba(234, 88, 12, 0.1);
    }
    .banner-text-col {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      position: relative;
      z-index: 2;
      max-width: 640px;
    }
    .banner-heading {
      font-family: var(--font-display);
      font-size: clamp(1.4rem, 2.2vw, 1.85rem);
      font-weight: 400;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
      line-height: 1.25;
    }
    .banner-sub {
      font-family: var(--font);
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
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, box-shadow 0.2s ease;
      position: relative;
      z-index: 2;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      flex-shrink: 0;
    }
    .btn-banner-agent:hover {
      background: var(--orange-hover);
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(234, 88, 12, 0.32);
    }

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
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .prop-item:hover {
      transform: translateY(-3px);
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
      font-weight: 600;
      color: #0f172a;
      margin: 0;
    }
    .prop-sub {
      font-size: 0.78rem;
      line-height: 1.35;
      color: #64748b;
      margin: 0;
    }

    @keyframes capDashFlow {
      to { stroke-dashoffset: -18; }
    }
    @keyframes capDashFlowY {
      to { background-position: 0 11px; }
    }
    @keyframes capHubBreathe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.045); }
    }
    @keyframes capChipPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.32); }
      70% { box-shadow: 0 0 0 8px rgba(22, 163, 74, 0); }
    }
    @keyframes capStepLift {
      from { transform: translateY(8px); }
      to { transform: none; }
    }

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
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
      }
      .cap-props-strip {
        grid-template-columns: 1fr;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .arch-connectors-svg path,
      .arch-down-line,
      .pipeline-arrow-dash path.flow,
      .arch-mandala-emblem,
      .case-status-chip,
      .pipeline-flow-card.is-inview .pipeline-step-node {
        animation: none;
      }
    }
  `;

  const githubSvg = `<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`;

  const lineArt = (alt: string, color: string, inner: string) =>
    `<svg class="line-icon" viewBox="0 0 64 64" fill="none" role="img" aria-label="${alt}" stroke="${color}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

  const webIcon = lineArt("Web", "#2563EB", `<rect x="10" y="14" width="44" height="36" rx="6"/><path d="M10 24h44"/><circle cx="18" cy="19" r="1.5"/><circle cx="24" cy="19" r="1.5"/><path d="M18 32h16M18 38h26M18 44h20"/>`);
  const waIcon = lineArt("WhatsApp", "#16A34A", `<path d="M32 14a18 18 0 0 1 12.6 30.8L32 50l-3.4-6.2A18 18 0 1 1 32 14z"/><circle cx="24" cy="32" r="1.6"/><circle cx="32" cy="32" r="1.6"/><circle cx="40" cy="32" r="1.6"/>`);
  const phoneIcon = lineArt("Phone / IVR", "#FF8A00", `<path d="M22 24c0 8 6 14 14 14l3.4-3.4c.5-.5 1.2-.6 1.8-.3 1.8.7 3.7 1 5.8 1 .8 0 1.5.7 1.5 1.5V42c0 .8-.7 1.5-1.5 1.5C31 43.5 20.5 33 20.5 18c0-.8.7-1.5 1.5-1.5H27c.8 0 1.5.7 1.5 1.5 0 2 .3 4 .9 5.8.2.6.1 1.2-.3 1.7L22 24z"/><path d="M40 22c1.6 2 2.6 4.6 2.6 7.2s-1 5.2-2.6 7.2"/><path d="M45 17c3 3.6 4.6 8 4.6 12.6s-1.6 9-4.6 12.6" stroke-dasharray="2 3"/>`);
  const mcpIcon = lineArt("AI / MCP Agent", "#8B5CF6", `<circle cx="32" cy="32" r="5"/><circle cx="16" cy="20" r="3.4"/><circle cx="48" cy="20" r="3.4"/><circle cx="16" cy="44" r="3.4"/><circle cx="48" cy="44" r="3.4"/><path d="M28 29 19 22M36 29l9-7M28 35l-9 7M36 35l9 7"/>`);
  const lotusIcon = lineArt("CAP lotus hub", "#FF8A00", `<ellipse cx="32" cy="16" rx="5" ry="10"/><ellipse cx="32" cy="48" rx="5" ry="10"/><ellipse cx="16" cy="32" rx="10" ry="5"/><ellipse cx="48" cy="32" rx="10" ry="5"/><ellipse cx="21" cy="21" rx="5" ry="10" transform="rotate(-45 21 21)"/><ellipse cx="43" cy="21" rx="5" ry="10" transform="rotate(45 43 21)"/><ellipse cx="21" cy="43" rx="5" ry="10" transform="rotate(45 21 43)"/><ellipse cx="43" cy="43" rx="5" ry="10" transform="rotate(-45 43 43)"/><circle cx="32" cy="32" r="6"/><circle cx="32" cy="32" r="2.2"/>`);
  const cyberIcon = lineArt("Cybercrime Intake", "#2563EB", `<path d="M32 12 12 24h40L32 12z"/><path d="M16 24v20M24 24v20M32 24v20M40 24v20M48 24v20"/><path d="M12 44h40M10 50h44"/>`);
  const bankIcon = lineArt("Bank / FIU Response", "#16A34A", `<path d="M32 10c-3.5 0-5 6-5 6h10s-1.5-6-5-6z"/><path d="M32 16 14 26h36L32 16z"/><path d="M18 26v18M26 26v18M32 26v18M38 26v18M46 26v18"/><path d="M12 44h40"/>`);
  const futureIcon = lineArt("Future Services", "#8B5CF6", `<path d="M22 54Q32 38 44 14"/><path d="M32 38c4-4 12-6 16-8M28 44c4-4 12-6 16-8M24 50c4-4 12-6 16-8"/><ellipse cx="44" cy="18" rx="10" ry="13" transform="rotate(28 44 18)"/><circle cx="43" cy="17" r="2.2"/>`);
  const stepRequest = lineArt("Request", "#EA580C", `<rect x="16" y="10" width="28" height="40" rx="3"/><path d="M22 20h12M22 26h16M22 32h14M22 38h8"/><circle cx="42" cy="44" r="8"/><circle cx="42" cy="44" r="3.4"/>`);
  const stepValidate = lineArt("Validate", "#2563EB", `<path d="M32 12 16 18v12c0 10 7 18 16 20 9-2 16-10 16-20V18L32 12z"/><path d="m24 32 6 6 12-12"/>`);
  const stepConfirm = lineArt("Confirm", "#16A34A", `<path d="M32 18c-6 0-10 5-10 11 0 9 6 16 10 19"/><path d="M26 28c0-3 3-6 6-6s6 3 6 6c0 6-4 11-7 15"/><path d="M32 14c-9 0-15 7-15 15 0 11 8 20 15 23"/><path d="M38 20c3 2 5 6 5 10 0 7-4 13-7 17"/><circle cx="44" cy="44" r="7"/><path d="m41 44 2 2 4-5"/>`);
  const stepExecute = lineArt("Execute", "#FF8A00", `<polygon points="32,18 44,25 44,39 32,46 20,39 20,25"/><circle cx="32" cy="32" r="3"/><path d="m44 25 10-6M44 32h12m-12 7 10 6"/><circle cx="54" cy="19" r="2.4"/><circle cx="56" cy="32" r="2.4"/><circle cx="54" cy="45" r="2.4"/>`);
  const stepTrack = lineArt("Track", "#8B5CF6", `<path d="M14 20h36M14 32h36M14 44h36"/><circle cx="24" cy="20" r="3.4"/><circle cx="38" cy="32" r="3.4"/><circle cx="28" cy="44" r="3.4"/>`);
  const ruleIdempotent = lineArt("Idempotent", "#FF8A00", `<ellipse cx="32" cy="16" rx="4" ry="8"/><ellipse cx="32" cy="48" rx="4" ry="8"/><ellipse cx="16" cy="32" rx="8" ry="4"/><ellipse cx="48" cy="32" rx="8" ry="4"/><ellipse cx="21" cy="21" rx="4" ry="8" transform="rotate(-45 21 21)"/><ellipse cx="43" cy="21" rx="4" ry="8" transform="rotate(45 43 21)"/><ellipse cx="21" cy="43" rx="4" ry="8" transform="rotate(45 21 43)"/><ellipse cx="43" cy="43" rx="4" ry="8" transform="rotate(-45 43 43)"/><circle cx="32" cy="32" r="5"/><path d="M50 14a8 8 0 0 1 0 12"/>`);
  const ruleControlled = lineArt("Controlled", "#16A34A", `<polygon points="32,10 36,22 48,18 42,28 54,32 42,36 48,46 36,42 32,54 28,42 16,46 22,36 10,32 22,28 16,18 28,22"/><rect x="27" y="31" width="10" height="8" rx="1.5"/><path d="M29 31v-3a3 3 0 0 1 6 0v3"/>`);
  const ruleAuditable = lineArt("Auditable", "#8B5CF6", `<circle cx="32" cy="32" r="16"/><path d="M32 16v32M16 32h32M21 21l22 22M21 43 43 21"/><circle cx="32" cy="32" r="4"/>`);
  const ruleIsolated = lineArt("Isolated", "#2563EB", `<rect x="14" y="14" width="36" height="36" rx="4" stroke-dasharray="4 3"/><path d="M22 32h6m8 0h6"/><circle cx="32" cy="32" r="4"/>`);
  const actionReport = lineArt("report_financial_fraud", "#EA580C", `<polygon points="32,14 46,22 46,40 32,48 18,40 18,22"/><polygon points="32,22 40,27 40,37 32,42 24,37 24,27"/><circle cx="32" cy="32" r="2.4"/>`);
  const actionAck = lineArt("acknowledge_response", "#16A34A", `<polygon points="32,12 36,24 48,22 42,32 50,40 38,40 36,52 32,42 28,52 26,40 14,40 22,32 16,22 28,24"/><circle cx="32" cy="32" r="3"/>`);
  const propOpen = lineArt("Open", "#FF8A00", `<path d="M30 12 36 14l3 5-5 5 5 5 7 3 5 5-5 7-3 7-7 7-5 7-5-7-7-7-5-7 3-7 5-5-3-7 5-7 5-5z" stroke-dasharray="2 3"/><circle cx="32" cy="24" r="1.8"/><circle cx="38" cy="32" r="1.8"/><circle cx="28" cy="36" r="1.8"/><circle cx="32" cy="44" r="1.8"/>`);
  const propTyped = lineArt("Typed", "#16A34A", `<rect x="14" y="14" width="36" height="36" rx="6" stroke-dasharray="3 2"/><path d="m26 26-5 6 5 6M38 26l5 6-5 6M34 24 30 40"/>`);
  const propSecure = lineArt("Secure", "#8B5CF6", `<path d="M32 14 20 20v10c0 9 5 15 12 18 7-3 12-9 12-18V20L32 14z"/><rect x="29" y="30" width="6" height="6" rx="1"/><path d="M30 30v-2a2 2 0 0 1 4 0v2"/>`);
  const propExtensible = lineArt("Extensible", "#2563EB", `<polygon points="32,12 36,22 46,18 42,28 52,32 42,36 46,46 36,42 32,52 28,42 18,46 22,36 12,32 22,28 18,18 28,22"/><circle cx="32" cy="32" r="4"/>`);

  const pipelineArrow = `
    <div class="pipeline-arrow-divider" aria-hidden="true">
      <svg class="pipeline-arrow-dash" viewBox="0 0 28 12" width="28" height="12" fill="none">
        <path class="flow" d="M1 6h20" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round"/>
        <path d="m18 2 5 4-5 4" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `;

  const bodyContent = `
    <noscript><style>.js-reveal{opacity:1;transform:none}</style></noscript>
    <div class="cap-page">

      <section class="cap-hero-section">
        <div class="cap-hero-grid">
          <div class="cap-hero-copy js-reveal is-inview">
            <span class="cap-hero-badge">OPEN PROTOCOL</span>
            <h1 class="cap-hero-title">Civic Action<br>Protocol</h1>
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

          <div class="cap-arch-stage js-reveal">
            <div class="arch-channels-grid">
              <div class="arch-channel-node">
                <div class="arch-channel-icon-box">${webIcon}</div>
                <span class="arch-channel-label">Web</span>
              </div>
              <div class="arch-channel-node">
                <div class="arch-channel-icon-box">${waIcon}</div>
                <span class="arch-channel-label">WhatsApp</span>
              </div>
              <div class="arch-channel-node">
                <div class="arch-channel-icon-box">${phoneIcon}</div>
                <span class="arch-channel-label">Phone / IVR</span>
              </div>
              <div class="arch-channel-node">
                <div class="arch-channel-icon-box">${mcpIcon}</div>
                <span class="arch-channel-label">AI / MCP Agent</span>
              </div>
            </div>

            <div class="arch-connectors-svg-wrap" aria-hidden="true">
              <svg class="arch-connectors-svg" viewBox="0 0 480 60" preserveAspectRatio="none">
                <path d="M 60 4 C 60 30, 240 20, 240 56" fill="none" stroke="#cbd5e1" stroke-width="1.6" />
                <path d="M 180 4 C 180 30, 240 25, 240 56" fill="none" stroke="#cbd5e1" stroke-width="1.6" />
                <path d="M 300 4 C 300 30, 240 25, 240 56" fill="none" stroke="#cbd5e1" stroke-width="1.6" />
                <path d="M 420 4 C 420 30, 240 20, 240 56" fill="none" stroke="#cbd5e1" stroke-width="1.6" />
              </svg>
            </div>

            <div class="arch-cap-hub">
              <div class="arch-mandala-emblem">${lotusIcon}</div>
              <span class="arch-cap-title">CAP</span>
              <span class="arch-cap-sub">Civic Action Protocol</span>
            </div>

            <div class="arch-down-connector" aria-hidden="true">
              <div class="arch-down-line"></div>
              <span class="arch-services-tag">Services</span>
            </div>

            <div class="arch-services-grid">
              <div class="arch-service-card">
                <div class="arch-service-icon">${cyberIcon}</div>
                <span class="arch-service-title">Cybercrime<br>Intake (1930)</span>
              </div>
              <div class="arch-service-card">
                <div class="arch-service-icon">${bankIcon}</div>
                <span class="arch-service-title">Bank / FIU<br>Response</span>
              </div>
              <div class="arch-service-card">
                <div class="arch-service-icon">${futureIcon}</div>
                <span class="arch-service-title">Future Services</span>
                <span class="arch-service-sub">(Pension, Certificates,<br>Benefits, etc.)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="cap-pipeline-section" id="pipeline">
        <span class="cap-section-kicker">ONE ACTION. END TO END.</span>

        <div class="pipeline-stage-grid">
          <div class="pipeline-flow-card">
            <div class="pipeline-step-node">
              <div class="pipeline-step-num">01</div>
              <div class="pipeline-step-icon-box">${stepRequest}</div>
              <h3 class="pipeline-step-title">Request</h3>
              <span class="pipeline-step-pill code-font">report_financial_fraud</span>
              <p class="pipeline-step-desc">Action is requested by a caller.</p>
            </div>

            ${pipelineArrow}

            <div class="pipeline-step-node">
              <div class="pipeline-step-num">02</div>
              <div class="pipeline-step-icon-box">${stepValidate}</div>
              <h3 class="pipeline-step-title">Validate</h3>
              <span class="pipeline-step-pill">Schema · Fields · Policy</span>
              <p class="pipeline-step-desc">CAP validates data, schema and policy.</p>
            </div>

            ${pipelineArrow}

            <div class="pipeline-step-node">
              <div class="pipeline-step-num">03</div>
              <div class="pipeline-step-icon-box">${stepConfirm}</div>
              <h3 class="pipeline-step-title">Confirm</h3>
              <span class="pipeline-step-pill">Citizen approval</span>
              <p class="pipeline-step-desc">High-impact actions need explicit citizen confirmation.</p>
            </div>

            ${pipelineArrow}

            <div class="pipeline-step-node">
              <div class="pipeline-step-num">04</div>
              <div class="pipeline-step-icon-box">${stepExecute}</div>
              <h3 class="pipeline-step-title">Execute</h3>
              <span class="pipeline-step-pill">Route to service</span>
              <p class="pipeline-step-desc">CAP routes the action to the right service.</p>
            </div>

            ${pipelineArrow}

            <div class="pipeline-step-node">
              <div class="pipeline-step-num">05</div>
              <div class="pipeline-step-icon-box">${stepTrack}</div>
              <h3 class="pipeline-step-title">Track</h3>
              <span class="pipeline-step-pill">Event + Status</span>
              <p class="pipeline-step-desc">Every transition is recorded and auditable.</p>
            </div>
          </div>

          <aside class="pipeline-case-card js-reveal">
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

      <section class="cap-rules-section js-reveal">
        <span class="cap-section-kicker">RULES CAP WON'T BREAK.</span>
        <div class="rules-cards-grid">
          <article class="rule-card">
            <div class="rule-icon-box">${ruleIdempotent}</div>
            <h3 class="rule-title">Idempotent</h3>
            <p class="rule-desc">Same request with the same key never creates duplicate actions.</p>
            <span class="rule-tag-pill">No duplicate side effects</span>
          </article>
          <article class="rule-card">
            <div class="rule-icon-box">${ruleControlled}</div>
            <h3 class="rule-title">Controlled</h3>
            <p class="rule-desc">High-impact actions require explicit citizen confirmation before execution.</p>
            <span class="rule-tag-pill">Confirmation required</span>
          </article>
          <article class="rule-card">
            <div class="rule-icon-box">${ruleAuditable}</div>
            <h3 class="rule-title">Auditable</h3>
            <p class="rule-desc">Every meaningful transition is cryptographically sealed with evidence hash.</p>
            <span class="rule-tag-pill">Tamper-proof audit trail</span>
          </article>
          <article class="rule-card">
            <div class="rule-icon-box">${ruleIsolated}</div>
            <h3 class="rule-title">Isolated</h3>
            <p class="rule-desc">Demo environments are separated from real service access.</p>
            <span class="rule-tag-pill">Clear simulation boundary</span>
          </article>
        </div>
      </section>

      <section class="cap-actions-section">
        <div class="actions-split-grid">
          <div class="actions-intro-col js-reveal">
            <span class="cap-section-kicker">TYPED ACTIONS, NOT PORTAL CLICKS.</span>
            <p class="actions-intro-text">
              CAP exposes a small set of typed actions that map to real public-service work.
            </p>
            <a href="/how" class="actions-view-all-link">
              <span>View all actions</span>
              <span>→</span>
            </a>
          </div>

          <div class="actions-cards-stack">
            <a href="/app" class="action-row-card js-reveal">
              <div class="action-row-icon">${actionReport}</div>
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

            <a href="/app" class="action-row-card js-reveal">
              <div class="action-row-icon">${actionAck}</div>
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

      <section class="cap-banner-card js-reveal">
        <div class="banner-text-col">
          <h2 class="banner-heading">CAP gives public services a common action surface.</h2>
          <p class="banner-sub">One protocol. Many services. Safer outcomes for citizens.</p>
        </div>
        <a href="/agents" class="btn-banner-agent">
          <span>Explore agent interface</span>
          <span>→</span>
        </a>
      </section>

      <footer class="cap-props-strip js-reveal">
        <div class="prop-item">
          <div class="prop-icon-box">${propOpen}</div>
          <div class="prop-text">
            <h4 class="prop-title">Open</h4>
            <span class="prop-sub">Built for public good.</span>
          </div>
        </div>
        <div class="prop-item">
          <div class="prop-icon-box">${propTyped}</div>
          <div class="prop-text">
            <h4 class="prop-title">Typed</h4>
            <span class="prop-sub">Explicit schemas and actions.</span>
          </div>
        </div>
        <div class="prop-item">
          <div class="prop-icon-box">${propSecure}</div>
          <div class="prop-text">
            <h4 class="prop-title">Secure</h4>
            <span class="prop-sub">Policy, confirmation and encryption built-in.</span>
          </div>
        </div>
        <div class="prop-item">
          <div class="prop-icon-box">${propExtensible}</div>
          <div class="prop-text">
            <h4 class="prop-title">Extensible</h4>
            <span class="prop-sub">Add new services without changing callers.</span>
          </div>
        </div>
      </footer>
    </div>
  `;

  const extraScripts = `
    <script>
      (function () {
        var targets = document.querySelectorAll(".js-reveal, .pipeline-flow-card");
        function revealAll() {
          for (var i = 0; i < targets.length; i++) {
            targets[i].classList.add("is-inview");
          }
        }
        if (typeof IntersectionObserver !== "function") {
          revealAll();
        } else {
          var io = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
              if (entries[i].isIntersecting) {
                entries[i].target.classList.add("is-inview");
                io.unobserve(entries[i].target);
              }
            }
          }, { threshold: 0.06, rootMargin: "0px 0px -8% 0px" });
          for (var j = 0; j < targets.length; j++) {
            io.observe(targets[j]);
          }
        }
        setTimeout(revealAll, 4000);
      })();
    </script>
  `;

  return renderPageLayout({
    title: "Civic Action Protocol (CAP)",
    activeNav: "cap",
    bodyContent,
    extraStyles,
    extraScripts,
    isSingleScreen: false,
  });
}
