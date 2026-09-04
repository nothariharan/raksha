/**
 * /app & /demo — Interactive Citizen Emergency Console & Developer CAP Drawer
 */

import { renderPageLayout } from "./layout.js";

export function renderAppPageHtml(config?: {
  coreUrl?: string;
  capUrl?: string;
  elevenLabsAgentId?: string;
}): string {
  const coreUrl = config?.coreUrl ?? "http://localhost:3001";
  const capUrl = config?.capUrl ?? "http://localhost:3002";
  const elevenLabsAgentId = config?.elevenLabsAgentId ?? "";

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

    .details-grid {
      background: #fafaf9;
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.5rem;
      margin: 1.5rem 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.2rem;
      text-align: left;
    }
    .dt-lbl { font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .dt-val { font-size: 1.1rem; font-weight: 700; color: var(--text); }
    .dt-amount { font-size: 1.6rem; color: var(--orange); }

    .btn-dispatch {
      background: var(--orange);
      color: white;
      border: none;
      padding: 0.95rem 1.8rem;
      border-radius: 10px;
      font-size: 1.05rem;
      font-weight: 700;
      width: 100%;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-dispatch:hover { background: var(--orange-hover); }

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
    .call-modal-overlay.active { display: flex; justify-content: center; align-items: center; }

    .call-space {
      width: min(620px, 100%);
      min-height: 85vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 2rem 1.5rem;
      position: relative;
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
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin: auto 0;
    }

    .voice-fluid-orb {
      width: 240px;
      height: 240px;
      margin: 0.85rem auto 1.2rem auto;
      display: grid;
      place-items: center;
      position: relative;
      background: transparent;
    }
    .voice-fluid-orb canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    @media (max-width: 500px) {
      .voice-fluid-orb {
        width: 168px;
        height: 168px;
      }
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
      margin-bottom: 1.3rem;
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

    .call-transcript-focus {
      width: 100%;
      max-width: 520px;
      min-height: 90px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0 1rem;
      margin-bottom: 1.3rem;
    }
    .turn-prompt {
      font-size: 1.22rem;
      font-weight: 700;
      color: #1c1917;
      line-height: 1.55;
      letter-spacing: -0.015em;
      transition: opacity 0.3s;
    }
    .turn-user {
      font-size: 1.05rem;
      color: #ea580c;
      font-weight: 600;
      line-height: 1.45;
      font-style: italic;
      transition: opacity 0.3s;
    }

    .call-case-capsule {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 999px;
      padding: 0.45rem 1.1rem;
      font-size: 0.84rem;
      color: #78716c;
      margin-bottom: 1.4rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      transition: all 0.3s ease;
      animation: fadeIn 0.4s ease;
    }
    .capsule-id {
      font-weight: 700;
      color: #0284c7;
    }
    .capsule-facts {
      color: #1c1917;
      font-weight: 600;
    }
    .capsule-state {
      font-weight: 700;
      color: #d97706;
      margin-left: 0.25rem;
    }

    .call-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.85rem;
      width: 100%;
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

    /* Developer Drawer */
    #devDrawer {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background: #0f172a;
      color: #f8fafc;
      box-shadow: -4px 0 25px rgba(0, 0, 0, 0.3);
      padding: 1.5rem;
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
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .json-view {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 0.85rem;
      font-family: var(--mono);
      font-size: 0.76rem;
      color: #38bdf8;
      max-height: 400px;
      overflow-y: auto;
      white-space: pre-wrap;
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
          <div class="call-lang-indicator">English / हिंदी</div>
        </div>

        <!-- Central Focused Living Experience -->
        <div class="call-center-stage">
          
          <div class="voice-fluid-orb" id="callDiyaOrb" data-state="IDLE">
            <canvas id="callFluidOrb" aria-hidden="true"></canvas>
          </div>

          <!-- Realtime State Indicator -->
          <div class="call-state-pill" id="callStatePillWrap" aria-live="polite">
            <span class="dot"></span>
            <span id="callStatusBadge">Tap below to start speaking</span>
          </div>

          <!-- Minimal Focused Conversation Turns -->
          <div class="call-transcript-focus" id="liveTranscriptBox" aria-live="polite">
            <div class="turn-prompt" id="agentTurnPrompt">“Tap Start speaking to begin a live Raksha session.”</div>
            <div class="turn-user" id="userTurnSpeech"></div>
          </div>

          <!-- Dynamic Progressive Incident Capsule (Hidden until Core returns facts) -->
          <div class="call-case-capsule" id="callCaseCapsule" style="display: none;">
            <span class="capsule-id" id="capsuleCaseId">—</span>
            <span id="capsuleFacts" class="capsule-facts"></span>
            <span id="capsuleState" class="capsule-state"></span>
          </div>

          <!-- Call Controls -->
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
              Confirm &amp; dispatch to 1930 / bank
            </button>

            <button class="btn-view-technical" onclick="toggleDevDrawer()">
              View technical case details →
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
            <p class="app-subtitle" id="wsSub">Speak in your language, show your payment receipt, or describe what happened.</p>
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

          <button class="btn-link-type" onclick="toggleTypeArea()">Type details instead</button>

          <div class="type-box" id="typeArea" style="display: none;">
            <textarea class="narrative-input" id="narrativeText" placeholder="Describe what happened in your own words…"></textarea>
            <button class="btn-submit-narrative" onclick="submitTypedNarrative()">Understand Incident</button>
          </div>
        </div>

        <!-- PROCESSING -->
        <div id="wsProcessing" style="display: none; text-align: center; padding: 2.5rem 0;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚡</div>
          <h3 style="font-size: 1.15rem; font-weight: 700;">Reconciling details & sealing evidence...</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Deterministic Multimodal Intake Engine</p>
        </div>

        <!-- MISSING FIELD QUESTION -->
        <div id="wsQuestion" style="display: none; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">❓</div>
          <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem;" id="qPromptText">What is the 12-digit UTR or reference number?</h3>
          <div style="display: flex; gap: 0.5rem; max-width: 400px; margin: 1.25rem auto 0 auto;">
            <input type="text" id="qInputVal" placeholder="e.g. 423456789012" style="flex: 1; padding: 0.7rem; border: 1.5px solid var(--border); border-radius: 8px; outline: none;" />
            <button class="btn-submit-narrative" onclick="submitQuestionAnswer()">Submit</button>
          </div>
        </div>

        <!-- CONFLICT -->
        <div id="wsConflict" style="display: none; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
          <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem;" id="conflictHead">Which amount is correct?</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; max-width: 400px; margin: 1.5rem auto 0 auto;" id="conflictBtnBox"></div>
        </div>

        <!-- READY -->
        <div id="wsReady" style="display: none; text-align: center;">
          <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.25rem;">Payment Identified</h3>
          <p style="color: var(--text-muted); font-size: 0.88rem;">Verified against your evidence. Ready to send.</p>

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
              <div class="dt-lbl">12-Digit UTR</div>
              <div class="dt-val" id="repUtr">—</div>
            </div>
            <div>
              <div class="dt-lbl">Debit Bank</div>
              <div class="dt-val" id="repBank">—</div>
            </div>
          </div>

          <button class="btn-dispatch" onclick="dispatchEmergencyReport()">🚀 SEND EMERGENCY REPORT</button>
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
        <div id="wsSubmitted" style="display: none; text-align: center;">
          <div style="font-size: 2.8rem; margin-bottom: 0.5rem;">🛡️</div>
          <h3 style="font-size: 1.5rem; font-weight: 800; color: var(--green); margin-bottom: 0.25rem;">Report Handed Off</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">
            Report handed off to the simulated 1930 / bank response layer.<br>
            <span style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-top: 0.35rem;">SIMULATED DEMONSTRATION — not a real government filing</span>
            Reference: <strong id="repRefNum" style="color: var(--text);">—</strong>
          </p>
          <div id="liveTimeline" style="text-align: left; display: flex; flex-direction: column; gap: 0.5rem;"></div>
          <button class="btn-link-type" style="margin-top: 1.5rem;" onclick="resetToHome()">File another report</button>
        </div>

      </div>
    </div>

    <!-- Developer Drawer -->
    <div id="devDrawer">
      <div class="drawer-top">
        <span style="color: #38bdf8; font-weight: 700; font-size: 0.85rem;">⚡ DEVELOPER CAP TRACE</span>
        <button style="background:none;border:none;color:#94a3b8;font-size:1.2rem;cursor:pointer;" onclick="toggleDevDrawer()">×</button>
      </div>
      <div style="margin-bottom: 1rem;">
        <div style="color: #94a3b8; font-size: 0.72rem; text-transform: uppercase;">Active Incident ID</div>
        <div style="font-weight: 700; font-size: 0.95rem; color: #38bdf8;" id="devIncId">None</div>
      </div>
      <div style="margin-bottom: 1rem;">
        <div style="color: #94a3b8; font-size: 0.72rem; text-transform: uppercase; margin-bottom: 0.35rem;">Live Event Ledger</div>
        <pre class="json-view" id="devJsonDump">[]</pre>
      </div>
    </div>
    </div>
  `;

  const extraScripts = `
    <script>
      const CORE_URL = "${coreUrl}";
      const CAP_URL = "${capUrl}";
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

      (function initFluidOrb() {
        var canvas = document.getElementById("callFluidOrb");
        var host = document.getElementById("callDiyaOrb");
        if (!canvas || !host) return;
        var gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false });
        if (!gl) return;

        var VERT = "attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}";
        var FRAG = [
          "precision highp float;",
          "uniform vec2 u_resolution;",
          "uniform float u_time;",
          "uniform float u_hue;",
          "uniform float u_hover;",
          "uniform float u_rot;",
          "uniform float u_hoverIntensity;",
          "vec3 rgb2yiq(vec3 c){float y=dot(c,vec3(0.299,0.587,0.114));float i=dot(c,vec3(0.596,-0.274,-0.322));float q=dot(c,vec3(0.211,-0.523,0.312));return vec3(y,i,q);}",
          "vec3 yiq2rgb(vec3 c){float r=c.x+0.956*c.y+0.621*c.z;float g=c.x-0.272*c.y-0.647*c.z;float b=c.x-1.106*c.y+1.703*c.z;return vec3(r,g,b);}",
          "vec3 adjustHue(vec3 color,float hueDeg){float hueRad=hueDeg*3.14159265/180.0;vec3 yiq=rgb2yiq(color);float cosA=cos(hueRad);float sinA=sin(hueRad);float ii=yiq.y*cosA-yiq.z*sinA;float qq=yiq.y*sinA+yiq.z*cosA;yiq.y=ii;yiq.z=qq;return yiq2rgb(yiq);}",
          "vec3 hash33(vec3 p3){p3=fract(p3*vec3(0.1031,0.11369,0.13787));p3+=dot(p3,p3.yxz+19.19);return -1.0+2.0*fract(vec3(p3.x+p3.y,p3.x+p3.z,p3.y+p3.z)*p3.zyx);}",
          "float snoise3(vec3 p){const float K1=0.333333333;const float K2=0.166666667;vec3 i=floor(p+(p.x+p.y+p.z)*K1);vec3 d0=p-(i-(i.x+i.y+i.z)*K2);vec3 e=step(vec3(0.0),d0-d0.yzx);vec3 i1=e*(1.0-e.zxy);vec3 i2=1.0-e.zxy*(1.0-e);vec3 d1=d0-(i1-K2);vec3 d2=d0-(i2-K1);vec3 d3=d0-0.5;vec4 h=max(0.6-vec4(dot(d0,d0),dot(d1,d1),dot(d2,d2),dot(d3,d3)),0.0);vec4 n=h*h*h*h*vec4(dot(d0,hash33(i)),dot(d1,hash33(i+i1)),dot(d2,hash33(i+i2)),dot(d3,hash33(i+1.0)));return dot(vec4(31.316),n);}",
          "vec4 extractAlpha(vec3 colorIn){float a=max(max(colorIn.r,colorIn.g),colorIn.b);return vec4(colorIn.rgb/(a+1e-5),a);}",
          "float light1(float intensity,float attenuation,float dist){return intensity/(1.0+dist*attenuation);}",
          "float light2(float intensity,float attenuation,float dist){return intensity/(1.0+dist*dist*attenuation);}",
          "vec4 draw(vec2 uv){",
          "vec3 color1=adjustHue(vec3(0.611765,0.262745,0.996078),u_hue);",
          "vec3 color2=adjustHue(vec3(0.298039,0.760784,0.913725),u_hue);",
          "vec3 color3=adjustHue(vec3(0.062745,0.078431,0.600000),u_hue);",
          "float ang=atan(uv.y,uv.x);float len=length(uv);float invLen=len>0.0?1.0/len:0.0;",
          "float n0=snoise3(vec3(uv*0.65,u_time*0.5))*0.5+0.5;",
          "float r0=mix(mix(0.6,1.0,0.4),mix(0.6,1.0,0.6),n0);",
          "float d0=distance(uv,(r0*invLen)*uv);",
          "float v0=light1(1.0,10.0,d0);v0*=smoothstep(r0*1.05,r0,len);",
          "float cl=cos(ang+u_time*2.0)*0.5+0.5;",
          "float a=u_time*-1.0;vec2 pos=vec2(cos(a),sin(a))*r0;",
          "float d=distance(uv,pos);float v1=light2(1.5,5.0,d);v1*=light1(1.0,50.0,d0);",
          "float v2=smoothstep(1.0,mix(0.6,1.0,n0*0.5),len);",
          "float v3=smoothstep(0.6,mix(0.6,1.0,0.5),len);",
          "vec3 col=mix(color1,color2,cl);col=mix(color3,col,v0);col=(col+v1)*v2*v3;col=clamp(col,0.0,1.0);",
          "return extractAlpha(col);}",
          "void main(){",
          "vec2 center=u_resolution*0.5;float size=min(u_resolution.x,u_resolution.y);",
          "vec2 uv=(gl_FragCoord.xy-center)/size*2.0;",
          "float s=sin(u_rot);float c=cos(u_rot);",
          "uv=vec2(c*uv.x-s*uv.y,s*uv.x+c*uv.y);",
          "uv.x+=u_hover*u_hoverIntensity*0.1*sin(uv.y*10.0+u_time);",
          "uv.y+=u_hover*u_hoverIntensity*0.1*sin(uv.x*10.0+u_time);",
          "vec4 col=draw(uv);",
          "gl_FragColor=vec4(col.rgb*col.a,col.a);",
          "}"
        ].join("\\n");

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
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        var locRes = gl.getUniformLocation(program, "u_resolution");
        var locTime = gl.getUniformLocation(program, "u_time");
        var locHue = gl.getUniformLocation(program, "u_hue");
        var locHover = gl.getUniformLocation(program, "u_hover");
        var locRot = gl.getUniformLocation(program, "u_rot");
        var locHoverI = gl.getUniformLocation(program, "u_hoverIntensity");
        gl.uniform1f(locHue, 0.0);

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

        var rotSpeeds = { IDLE: 0.18, CONNECTING: 0.35, LISTENING: 0.55, SPEAKING: 0.95, PROCESSING: 0.42, ERROR: 0.12 };
        var hoverAmt = { IDLE: 0.12, CONNECTING: 0.28, LISTENING: 0.45, SPEAKING: 0.72, PROCESSING: 0.38, ERROR: 0.08 };
        var currentRot = 0;
        var last = performance.now();
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        function render(now) {
          var dt = (now - last) * 0.001;
          last = now;
          if (document.visibilityState === "visible" && canvas.width) {
            var state = host.getAttribute("data-state") || "IDLE";
            if (!reduce) currentRot += dt * (rotSpeeds[state] || 0.35);
            var pulse = reduce ? 0.2 : 0.18 + Math.sin(now * 0.002) * 0.08;
            var hover = Math.min(1, (hoverAmt[state] || 0.25) + pulse);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniform1f(locTime, now * 0.001);
            gl.uniform1f(locHover, hover);
            gl.uniform1f(locRot, currentRot);
            gl.uniform1f(locHoverI, 0.55);
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
          u.lang = 'hi-IN';
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
        lastVoiceTurnText = "";
        lastVoiceTurnAt = 0;
        elevenLabsSessionLive = false;
        
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

        const prompt = document.getElementById("agentTurnPrompt");
        if (prompt) prompt.innerText = "“Tap Start speaking to begin a live Raksha session.”";
        
        const userSpeech = document.getElementById("userTurnSpeech");
        if (userSpeech) userSpeech.innerText = "";

        const btnStart = document.getElementById("btnStartSpeaking");
        const btnEnd = document.getElementById("btnEndConversation");
        const btnConfirm = document.getElementById("btnCallConfirm");
        if (btnStart) btnStart.style.display = "inline-flex";
        if (btnEnd) btnEnd.style.display = "none";
        if (btnConfirm) btnConfirm.style.display = "none";

        setOrbState("IDLE");
      }

      function syncReadyPanelFromIncident(inc) {
        if (!inc || !inc.transaction) return;
        const amt = document.getElementById("repAmount");
        const ch = document.getElementById("repChannel");
        const utr = document.getElementById("repUtr");
        const bank = document.getElementById("repBank");
        if (amt) amt.innerText = inc.transaction.amount ? "₹" + Number(inc.transaction.amount).toLocaleString() : "—";
        if (ch) ch.innerText = inc.transaction.application || inc.transaction.channel || "—";
        if (utr) utr.innerText = inc.transaction.transactionId || "—";
        if (bank) bank.innerText = inc.transaction.debitInstitution || "—";
      }

      function setCallConfirmVisible(visible) {
        const btnConfirm = document.getElementById("btnCallConfirm");
        if (btnConfirm) btnConfirm.style.display = visible ? "inline-flex" : "none";
      }

      function updateIncidentUI(inc, state, externalRef) {
        if (!inc && !currentIncidentId) return;

        const effectiveId = inc?.id || currentIncidentId;
        const capsule = document.getElementById("callCaseCapsule");
        const capsuleId = document.getElementById("capsuleCaseId");
        const capsuleFacts = document.getElementById("capsuleFacts");
        const capsuleState = document.getElementById("capsuleState");

        // Never show a capsule until Core has actually assigned an RKS-* id.
        if (!effectiveId || !String(effectiveId).startsWith("RKS-")) {
          if (capsule) capsule.style.display = "none";
          setCallConfirmVisible(false);
          return;
        }

        if (capsule) {
          capsule.style.display = "inline-flex";
          if (capsuleId) capsuleId.innerText = effectiveId;

          const facts = [];
          if (inc?.transaction?.amount != null && inc.transaction.amount !== "") {
            facts.push("₹" + Number(inc.transaction.amount).toLocaleString());
          }
          if (inc?.transaction?.application) {
            facts.push(inc.transaction.application);
          }
          if (inc?.transaction?.debitInstitution) {
            facts.push(inc.transaction.debitInstitution);
          }
          if (inc?.transaction?.transactionId) {
            facts.push("UTR " + inc.transaction.transactionId);
          }

          if (capsuleFacts) {
            capsuleFacts.innerText = facts.length > 0 ? facts.join(" · ") : "Gathering details…";
          }

          const effectiveState = state || inc?.state || "INTAKE";
          const badge = document.getElementById("callStatusBadge");
          const handoffRef =
            externalRef ||
            inc?.handoff?.externalReference ||
            "";

          if (capsuleState) {
            if (effectiveState === "READY" || effectiveState === "USER_CONFIRMATION") {
              capsuleState.innerHTML = " · <span style='color:#d97706;font-weight:700;'>Ready for confirmation</span>";
              if (badge && currentOrbState !== "SPEAKING" && currentOrbState !== "PROCESSING") {
                badge.innerText = "Awaiting citizen confirmation";
              }
              setCallConfirmVisible(true);
              syncReadyPanelFromIncident(inc);
            } else if (effectiveState === "SUBMITTED" || effectiveState === "ACKNOWLEDGED") {
              const refLabel = handoffRef ? handoffRef : "Pending reference";
              capsuleState.innerHTML = " · <span style='color:#16a34a;font-weight:700;'>Submitted (" + refLabel + ")</span>";
              if (badge) badge.innerText = "✓ CAP action dispatched";
              setCallConfirmVisible(false);
              if (handoffRef) {
                const refEl = document.getElementById("repRefNum");
                if (refEl) refEl.innerText = handoffRef;
              }
            } else if (effectiveState === "QUESTION_PENDING") {
              capsuleState.innerHTML = " · <span style='color:#3b82f6;font-weight:700;'>Gathering info</span>";
              if (badge && currentOrbState !== "SPEAKING" && currentOrbState !== "PROCESSING") {
                badge.innerText = "Gathering missing information";
              }
              setCallConfirmVisible(false);
            } else {
              capsuleState.innerText = "";
              setCallConfirmVisible(false);
            }
          }
        }

        const devIncId = document.getElementById("devIncId");
        if (devIncId && effectiveId) devIncId.innerText = effectiveId;
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
          const res = await protocolFetch(CORE_URL + "/v1/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              incidentId: currentIncidentId || undefined,
              source: "web",
              modality: "voice",
              content: text,
              language: currentLanguage === "hi" ? "hi" : currentLanguage === "ta" ? "ta" : "en",
              reporter: { mobile: currentReporterMobile }
            })
          });
          if (res.ok) {
            const data = await res.json();
            currentIncidentId = data.incidentId;
            currentIncident = data.incident;
            updateIncidentUI(
              data.incident,
              data.state,
              data.incident?.handoff?.externalReference
            );
            fetchDevEvents();

            const prompt = document.getElementById("agentTurnPrompt");
            // ElevenLabs owns spoken audio when live — UI text only; Core owns facts.
            if (data.question) {
              if (prompt) prompt.innerText = "“" + data.question + "”";
              if (elevenLabsSessionLive && activeConversation && typeof activeConversation.sendContextualUpdate === "function") {
                try {
                  activeConversation.sendContextualUpdate(
                    "Raksha Core needs this clarification from the citizen: " + data.question
                  );
                } catch (_) {}
              } else if (!elevenLabsSessionLive) {
                playRakshaSpeech(data.question);
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
              const reply = isHi
                ? "मैंने विवरण दर्ज कर लिया है: " + detail + "। क्या मैं इसे 1930 और बैंक को भेज दूँ?"
                : "I have recorded " + detail + ". Shall I dispatch this to 1930 and the bank?";
              if (prompt) prompt.innerText = "“" + reply + "”";
              if (!elevenLabsSessionLive) playRakshaSpeech(reply);
              else if (activeConversation && typeof activeConversation.sendContextualUpdate === "function") {
                try {
                  activeConversation.sendContextualUpdate(
                    "Raksha Core marked the incident READY for citizen confirmation. Ask them to confirm dispatch."
                  );
                } catch (_) {}
              }
            } else if (data.state === "SUBMITTED" || data.state === "ACKNOWLEDGED") {
              const trackingRef = data.incident?.handoff?.externalReference || "";
              const reply = trackingRef
                ? "आपकी आपातकालीन रिपोर्ट स्वीकार कर ली गई है! ट्रैकिंग नंबर " + trackingRef + " है।"
                : "आपकी आपातकालीन रिपोर्ट स्वीकार कर ली गई है।";
              if (prompt) prompt.innerText = "“" + reply + "”";
              if (!elevenLabsSessionLive) playRakshaSpeech(reply);
            }

            if (!elevenLabsSessionLive && currentOrbState === "PROCESSING") {
              setOrbState("LISTENING");
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
        resetLiveCallDisplay();
        setOrbState("IDLE");
        if (typeof fluidOrbResize === "function") {
          requestAnimationFrame(function () {
            requestAnimationFrame(fluidOrbResize);
          });
        }
      }

      async function loadElevenLabsConversation() {
        try {
          const mod = await import("https://esm.sh/@11labs/client");
          return mod.Conversation;
        } catch (_) {
          const mod2 = await import("https://cdn.jsdelivr.net/npm/@11labs/client/+esm");
          return mod2.Conversation;
        }
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

      async function startFallbackVoicePath() {
        elevenLabsSessionLive = false;
        const greeting = currentLanguage === "hi"
          ? "नमस्ते, रक्षा आपातकालीन साइबर हेल्पलाइन में आपका स्वागत है। आप बिल्कुल चिंता मत कीजिए। मुझे बताइए क्या हुआ?"
          : "Hello, welcome to the Raksha emergency cyber helpline. Please tell me what happened.";
        const prompt = document.getElementById("agentTurnPrompt");
        if (prompt) prompt.innerText = "“" + greeting + "”";
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
              const u = document.getElementById("userTurnSpeech");
              if (u) u.innerText = "“" + transcript + "”";
              if (final) {
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

      async function connectAndStartSpeaking() {
        const btnStart = document.getElementById("btnStartSpeaking");
        const btnEnd = document.getElementById("btnEndConversation");
        if (btnStart) btnStart.style.display = "none";
        if (btnEnd) btnEnd.style.display = "inline-flex";

        setOrbState("CONNECTING");

        const agentId = ELEVENLABS_AGENT_ID;
        if (!agentId) {
          console.warn("[ElevenLabs] No agent id configured — using mic fallback");
          await startFallbackVoicePath();
          return;
        }

        try {
          const Conversation = await loadElevenLabsConversation();
          if (!Conversation) throw new Error("Conversation SDK unavailable");

          const signedUrl = await fetchElevenLabsSignedUrl(agentId);

          activeConversation = await Conversation.startSession({
            signedUrl,
            onConnect: () => {
              console.log("[ElevenLabs] Connected");
              elevenLabsSessionLive = true;
              startIncidentPoll();
              // Agent greeting is owned by the ElevenLabs session (speaking → listening).
              if (currentOrbState === "CONNECTING") setOrbState("LISTENING");
            },
            onDisconnect: () => {
              console.log("[ElevenLabs] Disconnected");
              elevenLabsSessionLive = false;
              stopIncidentPoll();
            },
            onError: (err) => {
              console.warn("[ElevenLabs] session error:", err);
              setOrbState("ERROR");
            },
            onModeChange: ({ mode }) => {
              if (mode === "speaking") setOrbState("SPEAKING");
              else if (mode === "listening") setOrbState("LISTENING");
            },
            onMessage: ({ message, source }) => {
              if (source === "user") {
                const u = document.getElementById("userTurnSpeech");
                if (u) u.innerText = "“" + message + "”";
                setOrbState("PROCESSING");
                sendVoiceTurnToBackend(message);
              } else {
                const a = document.getElementById("agentTurnPrompt");
                if (a && message) a.innerText = "“" + message + "”";
                // Do not re-TTS — ElevenLabs already speaks agent turns.
              }
            }
          });
        } catch (err) {
          console.warn("[ElevenLabs] session failed, falling back to mic path:", err);
          elevenLabsSessionLive = false;
          await startFallbackVoicePath();
        }
      }

      async function confirmFromLiveCall() {
        if (!currentIncidentId || !currentIncident) return;
        const state = currentIncident.state;
        if (state !== "READY" && state !== "USER_CONFIRMATION") return;
        await dispatchEmergencyReport();
        if (activeConversation) {
          try { await activeConversation.endSession(); } catch (_) {}
          activeConversation = null;
        }
        elevenLabsSessionLive = false;
        stopIncidentPoll();
        document.getElementById("rakshaCallModal").classList.remove("active");
      }

      async function endLiveVoiceCall() {
        setOrbState("IDLE");
        elevenLabsSessionLive = false;
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
                incidentId: currentIncidentId || undefined,
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
              incidentId: currentIncidentId || undefined,
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

      async function dispatchEmergencyReport() {
        if (!currentIncidentId || !currentIncident) return;

        // Prevent duplicate submissions — use deterministic idempotency key
        const idemKey = "web-cap-" + currentIncidentId;
        showWsView("PROCESSING");

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
            showError(
              "Report could not be dispatched",
              errData.error || "The action could not be completed. Your incident has not been lost.",
              () => showWsView("READY")
            );
            return;
          }

          const data = await res.json();
          // Only use actual reference from server — never guess a fallback
          const refNumber = data.externalReference || data.data?.externalReference || "Pending";
          document.getElementById("repRefNum").innerText = refNumber;
          fetchTimeline();
          showWsView("SUBMITTED");
          fetchDevEvents();
        } catch (err) {
          showError(
            "Report could not be dispatched",
            "The action could not be completed. Your incident has not been lost. Retry when ready.",
            () => showWsView("READY")
          );
        }
      }

      function handleServerResponse(data) {
        fetchDevEvents();
        const state = data.state;

        if (state === "QUESTION_PENDING") {
          document.getElementById("qPromptText").innerText = data.question || "Please provide the missing details:";
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

      async function fetchTimeline() {
        if (!currentIncidentId) return;
        try {
          const res = await protocolFetch(CORE_URL + "/v1/incidents/" + currentIncidentId + "/events");
          const data = await res.json();
          const tl = document.getElementById("liveTimeline");
          if (!tl) return;
          tl.innerHTML = "";
          (data.events || []).forEach(evt => {
            const div = document.createElement("div");
            div.style.background = "#fafaf9";
            div.style.border = "1px solid var(--border)";
            div.style.padding = "0.6rem 0.85rem";
            div.style.borderRadius = "8px";
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.innerHTML = '<span style="color:var(--green);font-weight:700;">✓ ' + evt.type + '</span><span style="font-family:var(--mono);font-size:0.75rem;color:var(--text-muted);">' + evt.timestamp.slice(11, 19) + '</span>';
            tl.appendChild(div);
          });
        } catch {}
      }

      async function fetchDevEvents() {
        if (!currentIncidentId) return;
        try {
          const res = await protocolFetch(CORE_URL + "/v1/incidents/" + currentIncidentId + "/events");
          const data = await res.json();
          const dump = document.getElementById("devJsonDump");
          if (dump) dump.innerText = JSON.stringify(data.events || [], null, 2);
        } catch {}
      }

      function resetToHome() {
        currentIncidentId = null;
        currentIncident = null;
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
        if (currentLanguage === "hi") {
          if (head) head.innerText = "साइबर धोखाधड़ी की रिपोर्ट करें";
          if (sub) sub.innerText = "अपनी भाषा में बोलें या लेन-देन का स्क्रीनशॉट दिखाएं।";
          if (voice) voice.innerText = "रक्षा से बोलें";
          if (image) image.innerText = "लेन-देन दिखाएं";
        } else if (currentLanguage === "ta") {
          if (head) head.innerText = "நிதி சைபர் மோசடியை புகாரளிக்கவும்";
          if (sub) sub.innerText = "உங்கள் மொழியில் பேசுங்கள் அல்லது பரிவர்த்தனை திரைப்பிடிப்பைக் காட்டுங்கள்.";
          if (voice) voice.innerText = "ரக்ஷாவிடம் சொல்லுங்கள்";
          if (image) image.innerText = "பரிவர்த்தனையைக் காட்டு";
        } else {
          if (head) head.innerText = "Report Financial Cyber-Fraud";
          if (sub) sub.innerText = "Speak in your language, show your payment receipt, or describe what happened.";
          if (voice) voice.innerText = "Tell Raksha";
          if (image) image.innerText = "Show Transaction";
        }
      };

      // Export globally on window immediately
      window.startLiveVoiceCall = startLiveVoiceCall;
      window.connectAndStartSpeaking = connectAndStartSpeaking;
      window.endLiveVoiceCall = endLiveVoiceCall;
      window.confirmFromLiveCall = confirmFromLiveCall;
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
