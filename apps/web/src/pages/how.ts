/**
 * /how — How Raksha Works
 * Technical and operational explanation of the 4-stage pipeline.
 */

import { renderPageLayout } from "./layout.js";

export function renderHowPageHtml(): string {
  const extraStyles = `
    .page-container {
      max-width: 980px;
      margin: 0 auto;
      padding: 4rem 2rem;
    }
    .page-tag {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--orange);
      margin-bottom: 0.5rem;
    }
    .page-title {
      font-size: 2.8rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 1rem;
    }
    .page-lead {
      font-size: 1.15rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 3.5rem;
      max-width: 700px;
    }

    .pipeline-grid {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .step-card {
      background: var(--bg-white);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2.2rem;
      box-shadow: var(--card-shadow);
      display: grid;
      grid-template-columns: 80px 1fr;
      gap: 1.5rem;
    }
    .step-num {
      font-family: var(--mono);
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--orange);
    }
    .step-content h3 {
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    .step-content p {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .step-tag-row {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .step-tag {
      background: var(--bg);
      border: 1px solid var(--border);
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      font-size: 0.76rem;
      font-family: var(--mono);
      color: var(--text);
    }
  `;

  const bodyContent = `
    <div class="page-container">
      <div class="page-tag">ARCHITECTURE & LIFECYCLE</div>
      <h1 class="page-title">You tell us what happened.<br>Raksha does the hard part.</h1>
      <p class="page-lead">
        Raksha turns messy, high-distress citizen communication across voice, screenshots, and chat into structured, verifiable civic actions executed across government and banking networks.
      </p>

      <div class="pipeline-grid">
        <div class="step-card">
          <div class="step-num">01</div>
          <div class="step-content">
            <h3>Understand</h3>
            <p>
              Multilingual speech (Hindi, Tamil, Kannada, Bengali, etc.), unstructured WhatsApp messages, and banking screenshots are ingested. The multimodal engine extracts core fraud parameters without forcing users into 20-field web forms.
            </p>
            <div class="step-tag-row">
              <span class="step-tag">Multilingual Whisper / ElevenLabs</span>
              <span class="step-tag">Vision OCR & NLP</span>
              <span class="step-tag">ExtractedFraudCandidate</span>
            </div>
          </div>
        </div>

        <div class="step-card">
          <div class="step-num">02</div>
          <div class="step-content">
            <h3>Verify & Reconcile</h3>
            <p>
              Deterministic reconciliation cross-checks all facts. If an amount contradicts between voice and screenshot (e.g. ₹50,000 vs ₹5,000) or a UTR is missing, Raksha asks exactly one simple clarification question rather than rejecting the case.
            </p>
            <div class="step-tag-row">
              <span class="step-tag">Deterministic Rules</span>
              <span class="step-tag">One-Question Recovery</span>
              <span class="step-tag">Zero-Hallucination Invariant</span>
            </div>
          </div>
        </div>

        <div class="step-card">
          <div class="step-num">03</div>
          <div class="step-content">
            <h3>Report via CAP</h3>
            <p>
              Once citizen confirmation is received, the verified incident packet is dispatched over the Civic Action Protocol (CAP v0.1). It reaches 1930 Cybercrime Intake (Portal A) and intermediary banks (Portal B) in under 2 seconds.
            </p>
            <div class="step-tag-row">
              <span class="step-tag">CAP RFC v0.1</span>
              <span class="step-tag">Idempotency-Key Header</span>
              <span class="step-tag">1930-SYN-XXXXXX</span>
            </div>
          </div>
        </div>

        <div class="step-card">
          <div class="step-num">04</div>
          <div class="step-content">
            <h3>Track Across All Channels</h3>
            <p>
              Every lifecycle event is recorded in a tamper-evident hashed audit ledger (SHA-256). Whether the citizen continues on WhatsApp, calls the helpline, or checks online, the exact case status is unified.
            </p>
            <div class="step-tag-row">
              <span class="step-tag">Quad-Channel Continuity</span>
              <span class="step-tag">SHA-256 Evidence Capsule</span>
              <span class="step-tag">Live State Stream</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return renderPageLayout({
    title: "How Raksha Works",
    activeNav: "how",
    bodyContent,
    extraStyles,
  });
}
