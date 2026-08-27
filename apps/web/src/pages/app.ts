/**
 * /app & /demo — Interactive Citizen Emergency Console & Developer CAP Drawer
 */

import { renderPageLayout } from "./layout.js";

export function renderAppPageHtml(config?: { coreUrl?: string; capUrl?: string }): string {
  const coreUrl = config?.coreUrl || "http://localhost:3001";
  const capUrl = config?.capUrl || "http://localhost:3002";

  const extraStyles = `
    .app-container {
      max-width: 800px;
      margin: 3rem auto;
      padding: 0 1.5rem;
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
      font-size: 1.8rem;
      font-weight: 800;
      letter-spacing: -0.025em;
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
      font-size: 1.8rem;
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

    .fluid-orb-container {
      width: 240px;
      height: 240px;
      margin: 1.5rem auto 1.6rem auto;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .fluid-orb-canvas {
      width: 240px;
      height: 240px;
      border-radius: 50%;
      display: block;
      box-shadow: 0 16px 40px -10px rgba(234, 88, 12, 0.22), 0 0 0 1px rgba(234, 88, 12, 0.12);
    }
    @media (max-width: 500px) {
      .fluid-orb-container, .fluid-orb-canvas {
        width: 180px;
        height: 180px;
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
  `;
const bodyContent = `
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
          
          <!-- 240px FluidOrb Canvas -->
          <div class="fluid-orb-container">
            <div id="callOrbContainer" class="fluid-orb-canvas"></div>
          </div>

          <!-- Realtime State Indicator -->
          <div class="call-state-pill" id="callStatePillWrap" aria-live="polite">
            <span class="dot"></span>
            <span id="callStatusBadge">Connecting to Raksha…</span>
          </div>

          <!-- Minimal Focused Conversation Turns -->
          <div class="call-transcript-focus" id="liveTranscriptBox" aria-live="polite">
            <div class="turn-prompt" id="agentTurnPrompt">“नमस्ते, रक्षा आपातकालीन साइबर हेल्पलाइन में आपका स्वागत है। बताइए क्या हुआ?”</div>
            <div class="turn-user" id="userTurnSpeech"></div>
          </div>

          <!-- Dynamic Progressive Incident Capsule (Hidden until facts exist) -->
          <div class="call-case-capsule" id="callCaseCapsule" style="display: none;">
            <span class="capsule-id" id="capsuleCaseId">—</span>
            <span id="capsuleFacts" class="capsule-facts">Gathering details…</span>
            <span id="capsuleState" class="capsule-state"></span>
          </div>

          <!-- Call Controls -->
          <div class="call-controls">
            <button class="btn-start-speaking" id="btnStartSpeaking" onclick="connectAndStartSpeaking()">
              <span style="font-size: 1.1rem;">🎙️</span>
              <span id="lblStartBtn">Start speaking</span>
            </button>

            <button class="btn-end-conversation" id="btnEndConversation" style="display: none;" onclick="endLiveVoiceCall()">
              <span class="end-dot"></span>
              <span>End conversation</span>
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

    <div class="app-container">
      <div class="app-card">

        <!-- IDLE -->
        <div id="wsIdle">
          <div class="app-header">
            <h1 class="app-title" id="wsHead">Report Financial Cyber-Fraud</h1>
            <p class="app-subtitle" id="wsSub">Speak in your language, show your payment receipt, or describe what happened.</p>
          </div>

          <div class="action-grid">
            <div class="action-btn" onclick="startLiveVoiceCall()">
              <span class="btn-icon">🎙️</span>
              <span class="btn-label" id="lblVoice">Talk to Raksha (Live Voice)</span>
              <span class="btn-sub">ElevenLabs Agent in Hindi / English</span>
            </div>

            <label class="action-btn" style="cursor: pointer;">
              <span class="btn-icon">📷</span>
              <span class="btn-label" id="lblImage">Show Transaction</span>
              <span class="btn-sub">Upload UPI screenshot</span>
              <input type="file" accept="image/*" style="display: none;" onchange="handleImageAction(event)" />
            </label>
          </div>

          <button class="btn-link-type" onclick="toggleTypeArea()">Type details instead</button>

          <div class="type-box" id="typeArea" style="display: none;">
            <textarea class="narrative-input" id="narrativeText" placeholder="e.g. Someone called pretending to be electricity department and made me transfer ₹5,000 via PhonePe..."></textarea>
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
            Reference: <strong id="repRefNum" style="color: var(--text);">1930-SYN-XXXXXX</strong>
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
  `;

  const extraScripts = `
    <script>
      const CORE_URL = "${coreUrl}";
      const CAP_URL = "${capUrl}";

      let currentIncidentId = null;
      let currentIncident = null;
      let currentLanguage = "en";
      let isDevOpen = false;
      let activeConversation = null;
      let conversationPollInterval = null;
      let currentOrbState = "IDLE";
      let orbAnimFrame = null;

      const speedFactors = {
        CONNECTING: 0.20,
        LISTENING: 0.50,
        SPEAKING: 0.85,
        PROCESSING: 0.35,
        IDLE: 0.15
      };

      function setOrbState(state) {
        currentOrbState = state;
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
          case "IDLE":
            badge.innerText = "Call ended";
            break;
          default:
            badge.innerText = "Raksha is active";
        }
      }

      function initFluidOrbCanvas() {
        const container = document.getElementById("callOrbContainer");
        if (!container) return;
        if (orbAnimFrame) {
          cancelAnimationFrame(orbAnimFrame);
          orbAnimFrame = null;
        }
        container.innerHTML = "";
        
        const canvas = document.createElement("canvas");
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const size = (container.clientWidth && container.clientWidth > 0) ? container.clientWidth : 240;
        canvas.width = Math.round(size * dpr);
        canvas.height = Math.round(size * dpr);
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.borderRadius = "50%";
        canvas.style.display = "block";
        container.appendChild(canvas);

        const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false });
        if (!gl) {
          console.warn("WebGL not supported, using CSS fallback");
          container.style.background = "radial-gradient(circle at 35% 35%, #ffffff 0%, #fed7aa 50%, #ea580c 100%)";
          return;
        }

        const vs = "attribute vec2 a_pos; void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }";
        const fs = "precision highp float; uniform vec2 u_resolution; uniform float u_time; uniform vec3 u_color; float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); } float noise(vec2 p) { vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); } float fbm(vec2 p) { float v = 0.0; float a = 0.6; for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; } return v; } void main() { vec2 uv = gl_FragCoord.xy / u_resolution.xy; float t = u_time * 0.22; vec2 drift = vec2(sin(t) + 0.6 * sin(t * 1.7 + 1.3), cos(t * 0.8) + 0.6 * cos(t * 1.3 + 2.1)); vec2 p = vec2(uv.x * 1.8, uv.y * 1.0) + drift * 0.7; vec2 q = vec2(fbm(p + drift), fbm(p + vec2(3.2, 1.5) - drift)); float f = fbm(p + 1.2 * q); float g = clamp(1.0 - uv.y, 0.0, 1.0); float anchor = smoothstep(0.0, 0.3, uv.y); float shade = clamp(g + (f - 0.5) * 0.8 * anchor, 0.0, 1.0); vec3 white = vec3(0.99, 1.0, 1.0); vec3 light = mix(white, u_color, 0.5); vec3 dark = u_color; vec3 col = white; col = mix(col, light, smoothstep(0.28, 0.52, shade)); col = mix(col, dark, smoothstep(0.58, 0.88, shade)); float edge = smoothstep(0.5, 0.49, distance(uv, vec2(0.5))); gl_FragColor = vec4(col * edge, edge); }";

        const compile = (type, src) => {
          const s = gl.createShader(type);
          if (!s) return null;
          gl.shaderSource(s, src);
          gl.compileShader(s);
          if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error("Shader compile error:", gl.getShaderInfoLog(s));
            gl.deleteShader(s);
            return null;
          }
          return s;
        };

        const prog = gl.createProgram();
        const vShader = compile(gl.VERTEX_SHADER, vs);
        const fShader = compile(gl.FRAGMENT_SHADER, fs);
        if (!prog || !vShader || !fShader) {
          console.error("Could not compile FluidOrb shaders");
          return;
        }
        gl.attachShader(prog, vShader);
        gl.attachShader(prog, fShader);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          console.error("Program link error:", gl.getProgramInfoLog(prog));
          return;
        }
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
          gl.STATIC_DRAW
        );

        const aPos = gl.getAttribLocation(prog, "a_pos");
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(prog, "u_resolution");
        const uTime = gl.getUniformLocation(prog, "u_time");
        const uColor = gl.getUniformLocation(prog, "u_color");

        // Warm Raksha Orange RGB [0.918, 0.345, 0.047] (#ea580c)
        gl.uniform3f(uColor, 0.918, 0.345, 0.047);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.viewport(0, 0, canvas.width, canvas.height);

        let accumulatedTime = 0;
        let lastTime = performance.now();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        function render(now) {
          const dt = (now - lastTime) * 0.001;
          lastTime = now;

          if (!reduceMotion) {
            const factor = speedFactors[currentOrbState] || 0.5;
            accumulatedTime += dt * factor;
            gl.uniform1f(uTime, accumulatedTime);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
          }

          orbAnimFrame = requestAnimationFrame(render);
        }
        orbAnimFrame = requestAnimationFrame(render);
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
          const res = await fetch(CORE_URL + "/v1/tts", {
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

        const prompt = document.getElementById("agentTurnPrompt");
        if (prompt) prompt.innerText = "“नमस्ते, रक्षा आपातकालीन हेल्पलाइन में आपका स्वागत है। बोलना शुरू करने के लिए नीचे दिए गए बटन पर क्लिक करें।”";
        
        const userSpeech = document.getElementById("userTurnSpeech");
        if (userSpeech) userSpeech.innerText = "";

        const btnStart = document.getElementById("btnStartSpeaking");
        const btnEnd = document.getElementById("btnEndConversation");
        if (btnStart) btnStart.style.display = "inline-flex";
        if (btnEnd) btnEnd.style.display = "none";

        setOrbState("IDLE");
        const badge = document.getElementById("callStatusBadge");
        if (badge) badge.innerText = "Tap below to start speaking";
      }

      function updateIncidentUI(inc, state, externalRef) {
        if (!inc && !currentIncidentId) return;

        const effectiveId = inc?.id || currentIncidentId;
        const capsule = document.getElementById("callCaseCapsule");
        const capsuleId = document.getElementById("capsuleCaseId");
        const capsuleFacts = document.getElementById("capsuleFacts");
        const capsuleState = document.getElementById("capsuleState");

        if (effectiveId && capsule) {
          capsule.style.display = "inline-flex";
          if (capsuleId) capsuleId.innerText = effectiveId;

          const facts = [];
          if (inc?.transaction?.amount) {
            facts.push("₹" + inc.transaction.amount.toLocaleString());
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
            capsuleFacts.innerText = facts.length > 0 ? facts.join(" · ") : "Preparing your report…";
          }

          const effectiveState = state || inc?.state || "INTAKE";
          const badge = document.getElementById("callStatusBadge");
          if (capsuleState) {
            if (effectiveState === "READY" || effectiveState === "USER_CONFIRMATION") {
              capsuleState.innerHTML = " · <span style='color:#d97706;font-weight:700;'>Ready for confirmation</span>";
              if (badge) badge.innerText = "Awaiting citizen confirmation";
            } else if (effectiveState === "SUBMITTED" || effectiveState === "ACKNOWLEDGED") {
              const ref = externalRef || (effectiveId ? "1930-SYN-" + effectiveId.replace("RKS-", "") : "Pending");
              capsuleState.innerHTML = " · <span style='color:#16a34a;font-weight:700;'>Submitted (" + ref + ")</span>";
              if (badge) badge.innerText = "✓ CAP action dispatched";
            } else if (effectiveState === "QUESTION_PENDING") {
              capsuleState.innerHTML = " · <span style='color:#3b82f6;font-weight:700;'>Gathering info</span>";
              if (badge) badge.innerText = "Gathering missing information";
            } else {
              capsuleState.innerText = "";
              if (badge) badge.innerText = "Listening for details…";
            }
          }
        }

        // Sync to Developer Drawer
        const devIncId = document.getElementById("devIncId");
        if (devIncId && effectiveId) devIncId.innerText = effectiveId;
      }

      async function sendVoiceTurnToBackend(speechText) {
        try {
          const res = await fetch(CORE_URL + "/v1/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              incidentId: currentIncidentId || undefined,
              source: "phone",
              modality: "voice",
              content: speechText,
              language: "hi"
            })
          });
          if (res.ok) {
            const data = await res.json();
            currentIncidentId = data.incidentId;
            currentIncident = data.incident;
            updateIncidentUI(data.incident, data.state);
            fetchDevEvents();

            const prompt = document.getElementById("agentTurnPrompt");
            if (data.question) {
              if (prompt) prompt.innerText = "“" + data.question + "”";
              playRakshaSpeech(data.question);
            } else if (data.state === "READY" || data.state === "USER_CONFIRMATION") {
              const isHi = currentLanguage === "hi";
              const amt = data.incident.transaction.amount || "—";
              const bank = data.incident.transaction.debitInstitution || "—";
              const utr = data.incident.transaction.transactionId || "—";
              const reply = isHi
                ? "मैंने विवरण दर्ज कर लिया है: ₹" + amt + " " + bank + " UTR " + utr + "। क्या मैं इसे 1930 और बैंक को भेज दूँ?"
                : "I have recorded the details: ₹" + amt + " " + bank + " UTR " + utr + ". Shall I dispatch this to 1930 and the bank?";
              if (prompt) prompt.innerText = "“" + reply + "”";
              playRakshaSpeech(reply);
            } else if (data.state === "SUBMITTED" || data.state === "ACKNOWLEDGED") {
              const trackingRef = data.incident?.handoff?.externalReference || "";
              const refDisplay = trackingRef ? trackingRef : "";
              const reply = refDisplay
                ? "आपकी आपातकालीन रिपोर्ट स्वीकार कर ली गई है! ट्रैकिंग नंबर " + refDisplay + " है।"
                : "आपकी आपातकालीन रिपोर्ट स्वीकार कर ली गई है।";
              if (prompt) prompt.innerText = "“" + reply + "”";
              playRakshaSpeech(reply);
            }
          }
        } catch (e) {
          console.warn("[Voice] Backend sync failed:", e);
          const badge = document.getElementById("callStatusBadge");
          if (badge) badge.innerText = "Connection issue — try again";
        }
      }

      function startLiveVoiceCall() {
        const modal = document.getElementById("rakshaCallModal");
        modal.classList.add("active");
        resetLiveCallDisplay();
        initFluidOrbCanvas();
      }

      async function connectAndStartSpeaking() {
        const btnStart = document.getElementById("btnStartSpeaking");
        const btnEnd = document.getElementById("btnEndConversation");
        if (btnStart) btnStart.style.display = "none";
        if (btnEnd) btnEnd.style.display = "inline-flex";

        setOrbState("SPEAKING");

        // 1. Play immediate ElevenLabs studio audio greeting
        const greeting = "नमस्ते, रक्षा आपातकालीन साइबर हेल्पलाइन में आपका स्वागत है। आप बिल्कुल चिंता मत कीजिए। मुझे बताइए क्या हुआ?";
        const prompt = document.getElementById("agentTurnPrompt");
        if (prompt) prompt.innerText = "“" + greeting + "”";
        await playRakshaSpeech(greeting);

        // 2. Start Speech Recognition listener
        try {
          const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRec) {
            speechRecognizer = new SpeechRec();
            speechRecognizer.lang = 'hi-IN';
            speechRecognizer.continuous = true;
            speechRecognizer.interimResults = true;

            speechRecognizer.onresult = (event) => {
              let interim = '';
              let final = '';
              for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                  final += event.results[i][0].transcript;
                } else {
                  interim += event.results[i][0].transcript;
                }
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
              if (e.error === 'no-speech' || e.error === 'aborted') return;
              console.warn("[SpeechRecognition info]:", e.error);
              setOrbState("LISTENING");
            };

            speechRecognizer.start();
          }
        } catch (recErr) {
          console.warn("SpeechRec start:", recErr);
        }

        // 3. Connect ElevenLabs WebRTC session in parallel
        try {
          let Conversation;
          try {
            const mod = await import("https://esm.sh/@11labs/client");
            Conversation = mod.Conversation;
          } catch (e1) {
            const mod2 = await import("https://cdn.jsdelivr.net/npm/@11labs/client/+esm");
            Conversation = mod2.Conversation;
          }

          if (Conversation) {
            activeConversation = await Conversation.startSession({
              agentId: "agent_1201kxw5b2fvearadb4p3brmtya9",
              onConnect: () => {
                console.log("[ElevenLabs] Connected successfully");
                startIncidentPoll();
              },
              onDisconnect: () => {
                console.log("[ElevenLabs] Disconnected");
                stopIncidentPoll();
              },
              onModeChange: ({ mode }) => {
                if (mode === "speaking") {
                  setOrbState("SPEAKING");
                } else {
                  setOrbState("LISTENING");
                }
              },
              onMessage: ({ message, source }) => {
                if (source === "user") {
                  const u = document.getElementById("userTurnSpeech");
                  if (u) u.innerText = "“" + message + "”";
                  setOrbState("PROCESSING");
                  sendVoiceTurnToBackend(message);
                } else {
                  const a = document.getElementById("agentTurnPrompt");
                  if (a) a.innerText = "“" + message + "”";
                  playRakshaSpeech(message);
                }
              }
            });
          }
        } catch (err) {
          console.warn("ElevenLabs WebRTC direct session fallback:", err);
        }
      }

      async function endLiveVoiceCall() {
        setOrbState("IDLE");
        if (currentAudio) {
          try { currentAudio.pause(); } catch {}
          currentAudio = null;
        }
        if (speechRecognizer) {
          try { speechRecognizer.stop(); } catch {}
          speechRecognizer = null;
        }
        if (orbAnimFrame) {
          cancelAnimationFrame(orbAnimFrame);
          orbAnimFrame = null;
        }
        if (activeConversation) {
          try { await activeConversation.endSession(); } catch {}
          activeConversation = null;
        }
        stopIncidentPoll();
        document.getElementById("rakshaCallModal").classList.remove("active");
        fetchLatestIncidentSync();
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
          const res = await fetch(CORE_URL + "/v1/incidents/" + currentIncidentId);
          if (res.ok) {
            const data = await res.json();
            currentIncident = data;
            updateIncidentUI(data, data.state);
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
            const res = await fetch(CORE_URL + "/v1/process", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                incidentId: currentIncidentId || undefined,
                source: "web",
                modality: "image",
                content: base64,
                mimeType: file.type,
                language: currentLanguage
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
          const res = await fetch(CORE_URL + "/v1/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              incidentId: currentIncidentId || undefined,
              source: "web",
              modality: "text",
              content: text,
              language: currentLanguage
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
          const res = await fetch(CORE_URL + "/v1/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              incidentId: currentIncidentId,
              source: "web",
              modality: "text",
              content: val,
              language: currentLanguage
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
          const res = await fetch(CORE_URL + "/v1/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              incidentId: currentIncidentId,
              source: "web",
              modality: "text",
              content: "I confirm the amount is " + chosenValue,
              language: currentLanguage
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
          const res = await fetch(CAP_URL + "/cap/actions/execute", {
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
          const inc = data.incident;
          if (inc && inc.transaction) {
            document.getElementById("repAmount").innerText = inc.transaction.amount ? "₹" + inc.transaction.amount.toLocaleString() : "—";
            document.getElementById("repChannel").innerText = inc.transaction.application || inc.transaction.channel || "—";
            document.getElementById("repUtr").innerText = inc.transaction.transactionId || "—";
            document.getElementById("repBank").innerText = inc.transaction.debitInstitution || "—";
          }
          showWsView("READY");
        } else if (state === "SUBMITTED" || state === "ACKNOWLEDGED") {
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
          const res = await fetch(CORE_URL + "/v1/incidents/" + currentIncidentId + "/events");
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
          const res = await fetch(CORE_URL + "/v1/incidents/" + currentIncidentId + "/events");
          const data = await res.json();
          const dump = document.getElementById("devJsonDump");
          if (dump) dump.innerText = JSON.stringify(data.events || [], null, 2);
        } catch {}
      }

      function resetToHome() {
        currentIncidentId = null;
        currentIncident = null;
        document.getElementById("narrativeText").value = "";
        document.getElementById("repAmount").innerText = "—";
        document.getElementById("repChannel").innerText = "—";
        document.getElementById("repUtr").innerText = "—";
        document.getElementById("repBank").innerText = "—";
        showWsView("IDLE");
      }

      function toggleDevDrawer() {
        isDevOpen = !isDevOpen;
        const drawer = document.getElementById("devDrawer");
        if (drawer) drawer.classList.toggle("open", isDevOpen);
        if (isDevOpen) fetchDevEvents();
      }

      window.switchLang = function(lang) {
        currentLanguage = lang;
        if (lang === "hi") {
          document.getElementById("wsHead").innerText = 'साइबर धोखाधड़ी की रिपोर्ट करें';
          document.getElementById("wsSub").innerText = 'अपनी भाषा में बोलें या लेन-देन का स्क्रीनशॉट दिखाएं।';
          document.getElementById("lblVoice").innerText = 'रक्षा से बोलें';
          document.getElementById("lblImage").innerText = 'लेन-देन दिखाएं';
        } else {
          document.getElementById("wsHead").innerText = 'Report Financial Cyber-Fraud';
          document.getElementById("wsSub").innerText = 'Speak in your language, show your payment receipt, or describe what happened.';
          document.getElementById("lblVoice").innerText = 'Tell Raksha';
          document.getElementById("lblImage").innerText = 'Show Transaction';
        }
      };

      // Export globally on window immediately
      window.startLiveVoiceCall = startLiveVoiceCall;
      window.connectAndStartSpeaking = connectAndStartSpeaking;
      window.endLiveVoiceCall = endLiveVoiceCall;
      window.toggleDevDrawer = toggleDevDrawer;
      window.toggleTypeArea = toggleTypeArea;
      window.handleImageAction = handleImageAction;
      window.submitTypedNarrative = submitTypedNarrative;
      window.submitQuestionAnswer = submitQuestionAnswer;
      window.dispatchEmergencyReport = dispatchEmergencyReport;
      window.resetToHome = resetToHome;
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
