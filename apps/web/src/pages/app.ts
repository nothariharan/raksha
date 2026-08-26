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

    /* ElevenLabs Live Voice Call Modal */
    .call-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 12, 18, 0.85);
      backdrop-filter: blur(14px);
      z-index: 9999;
      display: none;
      place-items: center;
      padding: 1.5rem;
      animation: fadeIn 0.25s ease;
    }
    .call-modal-overlay.active { display: grid; }

    .call-modal-box {
      width: min(740px, 100%);
      background: #11141d;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 28px;
      padding: 2rem 2.2rem;
      color: #ffffff;
      box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(249, 115, 22, 0.2);
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 1.8rem;
      position: relative;
    }
    @media (max-width: 680px) {
      .call-modal-box { grid-template-columns: 1fr; }
    }

    .call-modal-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .call-modal-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      background: rgba(249, 115, 22, 0.15);
      border: 1px solid rgba(249, 115, 22, 0.3);
      color: #fb923c;
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 1.25rem;
    }
    .call-modal-badge .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f97316;
      box-shadow: 0 0 8px #f97316;
      animation: pulseDot 1.5s infinite;
    }
    @keyframes pulseDot {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.6; }
    }

    .call-avatar-glow {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      background: radial-gradient(circle, #f97316 0%, #ea580c 50%, rgba(17, 20, 29, 0) 75%);
      display: grid;
      place-items: center;
      font-size: 2.2rem;
      margin-bottom: 0.75rem;
      position: relative;
      box-shadow: 0 0 30px rgba(249, 115, 22, 0.35);
      animation: floatGlow 3s ease-in-out infinite;
    }
    @keyframes floatGlow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .call-caption-box {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 0.85rem 1rem;
      margin: 0.75rem 0;
      min-height: 80px;
      max-height: 120px;
      overflow-y: auto;
      text-align: left;
      font-size: 0.88rem;
      line-height: 1.5;
      color: #e2e8f0;
    }

    .modal-waveform {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      height: 32px;
      margin: 0.5rem 0;
      width: 100%;
    }
    .modal-waveform span {
      width: 3.5px;
      background: #f97316;
      border-radius: 99px;
      transition: height 0.15s ease;
      animation: waveActive 1s ease-in-out infinite alternate;
    }
    @keyframes waveActive {
      0% { height: 15%; opacity: 0.4; }
      100% { height: 100%; opacity: 1; }
    }
    .modal-waveform.listening span {
      background: #38bdf8;
      animation-duration: 1.4s;
    }

    .call-modal-right {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .sync-title {
      font-size: 0.76rem;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #94a3b8;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .sync-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.85rem;
    }
    .sync-lbl { color: #94a3b8; }
    .sync-val { font-weight: 700; color: #f8fafc; }
    .sync-amount { color: #f97316; font-size: 1.15rem; }

    .call-btn-row {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      width: 100%;
    }
    .btn-end-call {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.75rem 1.2rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background 0.2s;
    }
    .btn-end-call:hover { background: #dc2626; }
  `;

  const bodyContent = `
    <!-- Custom ElevenLabs Real Voice Call Modal -->
    <div class="call-modal-overlay" id="rakshaCallModal">
      <div class="call-modal-box">
        
        <!-- Left: Realtime Voice & Waveform -->
        <div class="call-modal-left">
          <div class="call-modal-badge">
            <span class="dot"></span>
            <span id="callStatusBadge">CONNECTING...</span>
          </div>

          <div class="call-avatar-glow">🛡️</div>
          <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 0.2rem;">Raksha Emergency Helpline</h3>
          <p style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.5rem;">Official Indian Cybercrime & Bank Protocol</p>

          <!-- Waveform Visualizer -->
          <div class="modal-waveform" id="modalWaveform">
            ${Array.from({ length: 24 }).map((_, i) => `<span style="animation-delay: ${(i * 0.06).toFixed(2)}s; height: ${20 + (i % 6) * 15}%;"></span>`).join('')}
          </div>

          <!-- Live Captions -->
          <div class="call-caption-box" id="liveTranscriptBox">
            <span style="color: #94a3b8; font-style: italic;">Connecting to ElevenLabs Agent (GPT-4o-mini)...</span>
          </div>

          <div class="call-btn-row">
            <button class="btn-end-call" onclick="endLiveVoiceCall()">
              <span>End Call</span>
            </button>
          </div>
        </div>

        <!-- Right: Real-time Incident Sync -->
        <div class="call-modal-right">
          <div>
            <div class="sync-title">🛡️ Real-Time Incident Sync</div>
            <div class="sync-row">
              <span class="sync-lbl">Case ID</span>
              <span class="sync-val" id="syncCaseId">RKS-000001</span>
            </div>
            <div class="sync-row">
              <span class="sync-lbl">Amount</span>
              <span class="sync-val sync-amount" id="syncAmount">₹5,000</span>
            </div>
            <div class="sync-row">
              <span class="sync-lbl">App & Bank</span>
              <span class="sync-val" id="syncAppBank">PhonePe · SBI</span>
            </div>
            <div class="sync-row">
              <span class="sync-lbl">UTR / Ref</span>
              <span class="sync-val" id="syncUtr">423456789012</span>
            </div>
            <div class="sync-row">
              <span class="sync-lbl">Protocol State</span>
              <span class="sync-val" style="color: #38bdf8;" id="syncState">READY</span>
            </div>
          </div>

          <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.75rem;">
            ⚡ Verified by Civic Action Protocol (CAP). Ready for simulated 1930 / bank freeze.
          </div>
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
              <div class="dt-val dt-amount" id="repAmount">₹5,000</div>
            </div>
            <div>
              <div class="dt-lbl">Channel</div>
              <div class="dt-val" id="repChannel">UPI (PhonePe)</div>
            </div>
            <div>
              <div class="dt-lbl">12-Digit UTR</div>
              <div class="dt-val" id="repUtr">423456789012</div>
            </div>
            <div>
              <div class="dt-lbl">Debit Bank</div>
              <div class="dt-val" id="repBank">State Bank of India</div>
            </div>
          </div>

          <button class="btn-dispatch" onclick="dispatchEmergencyReport()">🚀 SEND EMERGENCY REPORT</button>
        </div>

        <!-- SUBMITTED -->
        <div id="wsSubmitted" style="display: none; text-align: center;">
          <div style="font-size: 2.8rem; margin-bottom: 0.5rem;">🛡️</div>
          <h3 style="font-size: 1.5rem; font-weight: 800; color: var(--green); margin-bottom: 0.25rem;">Report Handed Off</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">
            Report handed off to the simulated 1930 / bank response layer.<br>
            Official Reference: <strong id="repRefNum" style="color: var(--text);">1930-SYN-XXXXXX</strong>
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

      async function startLiveVoiceCall() {
        const modal = document.getElementById("rakshaCallModal");
        modal.classList.add("active");
        
        const badge = document.getElementById("callStatusBadge");
        const transcriptBox = document.getElementById("liveTranscriptBox");
        const waveform = document.getElementById("modalWaveform");

        badge.innerText = "CONNECTING MIC & AI...";
        transcriptBox.innerHTML = '<span style="color:#94a3b8;font-style:italic;">Requesting microphone access & connecting to ElevenLabs Agent (GPT-4o-mini)...</span>';

        try {
          const { Conversation } = await import("https://cdn.jsdelivr.net/npm/@elevenlabs/client@0.0.10/+esm");
          
          activeConversation = await Conversation.startSession({
            agentId: "agent_1201kxw5b2fvearadb4p3brmtya9",
            onConnect: () => {
              badge.innerText = "LIVE CALL (ELEVENLABS · GPT-4O-MINI)";
              transcriptBox.innerHTML = '<div style="color:#38bdf8;font-weight:700;margin-bottom:0.25rem;">Raksha Emergency Helpline Connected</div><div>नमस्ते! आप बिल्कुल चिंता मत कीजिए। मुझे बताइए क्या हुआ?</div>';
              startIncidentPoll();
            },
            onDisconnect: () => {
              badge.innerText = "CALL ENDED";
              stopIncidentPoll();
            },
            onError: (err) => {
              console.error("[ElevenLabs Error]:", err);
              badge.innerText = "VOICE HELPLINE ACTIVE";
            },
            onModeChange: ({ mode }) => {
              if (mode === "speaking") {
                badge.innerText = "🔊 RAKSHA SPEAKING...";
                waveform.classList.remove("listening");
              } else {
                badge.innerText = "🎙️ LISTENING TO YOU...";
                waveform.classList.add("listening");
              }
            },
            onMessage: ({ message, source }) => {
              const p = document.createElement("div");
              p.style.marginTop = "0.35rem";
              if (source === "user") {
                p.innerHTML = '<strong style="color:#fb923c;">You:</strong> ' + message;
              } else {
                p.innerHTML = '<strong style="color:#38bdf8;">Raksha:</strong> ' + message;
              }
              transcriptBox.appendChild(p);
              transcriptBox.scrollTop = transcriptBox.scrollHeight;
              fetchLatestIncidentSync();
            }
          });
        } catch (err) {
          console.warn("Direct WebRTC fallback:", err);
          badge.innerText = "VOICE HELPLINE ACTIVE";
          transcriptBox.innerHTML = '<div style="color:#fb923c;font-weight:700;margin-bottom:0.25rem;">Raksha Emergency Helpline Connected</div><div>नमस्ते! रक्षा आपातकालीन साइबर हेल्पलाइन में आपका स्वागत है। आप बिल्कुल चिंता मत कीजिए। मुझे बताइए क्या हुआ?</div>';
          startIncidentPoll();
        }
      }

      async function endLiveVoiceCall() {
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
        fetchLatestIncidentSync();
      }

      function stopIncidentPoll() {
        if (conversationPollInterval) {
          clearInterval(conversationPollInterval);
          conversationPollInterval = null;
        }
      }

      async function fetchLatestIncidentSync() {
        try {
          const res = await fetch(CORE_URL + "/v1/incidents/RKS-DEMO-001");
          if (!res.ok) return;
          const data = await res.json();
          currentIncidentId = data.id;
          currentIncident = data;
          document.getElementById("syncCaseId").innerText = data.id || "RKS-000001";
          document.getElementById("syncAmount").innerText = "₹" + (data.transaction?.amount || 5000).toLocaleString();
          document.getElementById("syncAppBank").innerText = (data.transaction?.application || "PhonePe") + " · " + (data.transaction?.debitInstitution || "SBI");
          document.getElementById("syncUtr").innerText = data.transaction?.transactionId || "423456789012";
          document.getElementById("syncState").innerText = data.state || "READY";
          document.getElementById("devIncId").innerText = data.id;
        } catch {}
      }

      function toggleDevDrawer() {
        isDevOpen = !isDevOpen;
        document.getElementById("devDrawer").classList.toggle("open", isDevOpen);
      }

      function toggleTypeArea() {
        const area = document.getElementById("typeArea");
        area.style.display = area.style.display === "none" ? "flex" : "none";
      }

      function showWsView(view) {
        document.getElementById("wsIdle").style.display = view === "IDLE" ? "block" : "none";
        document.getElementById("wsProcessing").style.display = view === "PROCESSING" ? "block" : "none";
        document.getElementById("wsQuestion").style.display = view === "QUESTION" ? "block" : "none";
        document.getElementById("wsConflict").style.display = view === "CONFLICT" ? "block" : "none";
        document.getElementById("wsReady").style.display = view === "READY" ? "block" : "none";
        document.getElementById("wsSubmitted").style.display = view === "SUBMITTED" ? "block" : "none";
      }

      async function processIntake(payload) {
        showWsView("PROCESSING");
        try {
          const res = await fetch(CORE_URL + "/v1/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              incidentId: currentIncidentId || undefined,
              source: "web",
              language: currentLanguage,
              ...payload
            })
          });

          if (!res.ok) throw new Error("Intake processing failed");
          const data = await res.json();
          handleIntakeResult(data);
        } catch (err) {
          alert("Error: " + err.message);
          showWsView("IDLE");
        }
      }

      function handleIntakeResult(data) {
        currentIncidentId = data.incidentId;
        currentIncident = data.incident;
        document.getElementById("devIncId").innerText = currentIncidentId;

        if (data.state === "QUESTION_PENDING" || data.nextAction?.nextActionType === "ASK_USER") {
          document.getElementById("qPromptText").innerText = data.nextAction.prompt || "Please provide the missing detail.";
          showWsView("QUESTION");
        } else if (data.state === "USER_CONFIRMATION" || data.nextAction?.nextActionType === "CONFIRM_CONFLICT") {
          document.getElementById("conflictHead").innerText = data.nextAction.prompt || "Which detail is correct?";
          const box = document.getElementById("conflictBtnBox");
          box.innerHTML = "";
          (data.nextAction.options || []).forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "action-btn";
            btn.style.padding = "0.85rem";
            btn.innerText = opt.label;
            btn.onclick = () => resolveConflict(data.nextAction.field, opt.value);
            box.appendChild(btn);
          });
          showWsView("CONFLICT");
        } else if (data.state === "READY") {
          document.getElementById("repAmount").innerText = "₹" + (data.incident?.transaction?.amount || 5000).toLocaleString();
          document.getElementById("repChannel").innerText = (data.incident?.transaction?.channel || "UPI") + (data.incident?.transaction?.application ? " (" + data.incident.transaction.application + ")" : "");
          document.getElementById("repUtr").innerText = data.incident?.transaction?.transactionId || "423456789012";
          document.getElementById("repBank").innerText = data.incident?.transaction?.debitInstitution || "State Bank of India";
          showWsView("READY");
        } else if (data.state === "SUBMITTED" || data.state === "ACKNOWLEDGED") {
          showWsView("SUBMITTED");
          fetchTimeline();
        }

        fetchDevEvents();
      }

      function handleVoiceAction() {
        const narrative = currentLanguage === "hi" 
          ? "बिजली विभाग के नाम से कॉल आया और मैंने फोनपे से पाँच हज़ार भेज दिए।" 
          : "Someone called pretending to be from electricity desk and stole 5000 via PhonePe";
        processIntake({ modality: "voice", content: narrative });
      }

      function handleImageAction(e) {
        const file = e.target.files[0];
        if (!file) return;
        const fakeOCR = "Google Pay Completed. Paid ₹5,000.00 to fraudster.merchant@ybl. UPI Ref: 423456789012. Debited: State Bank of India.";
        processIntake({ modality: "image", content: fakeOCR });
      }

      function submitTypedNarrative() {
        const txt = document.getElementById("narrativeText").value;
        if (!txt) return;
        processIntake({ modality: "text", content: txt });
      }

      function submitQuestionAnswer() {
        const val = document.getElementById("qInputVal").value;
        if (!val) return;
        processIntake({
          modality: "text",
          content: val,
          userClarificationAnswer: { field: "transaction.transactionId", answerValue: val }
        });
      }

      function resolveConflict(field, val) {
        processIntake({
          modality: "text",
          content: "Resolved: " + val,
          userClarificationAnswer: { field: field, answerValue: val }
        });
      }

      async function dispatchEmergencyReport() {
        showWsView("PROCESSING");
        try {
          const idempKey = "web-cap-" + currentIncidentId;
          const res = await fetch(CAP_URL + "/cap/actions/execute", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Idempotency-Key": idempKey
            },
            body: JSON.stringify({
              action: "report_financial_fraud",
              payload: currentIncident,
              idempotencyKey: idempKey
            })
          });

          const capData = await res.json();
          const refNum = capData.externalReference || ("1930-SYN-" + capData.caseId);
          document.getElementById("repRefNum").innerText = refNum;
          showWsView("SUBMITTED");
          fetchTimeline();
          fetchDevEvents();
        } catch (err) {
          alert("CAP Dispatch failed: " + err.message);
          showWsView("READY");
        }
      }

      async function fetchTimeline() {
        if (!currentIncidentId) return;
        try {
          const res = await fetch(CORE_URL + "/v1/incidents/" + currentIncidentId + "/events");
          const data = await res.json();
          const tl = document.getElementById("liveTimeline");
          tl.innerHTML = "";
          (data.events || []).forEach(evt => {
            const div = document.createElement("div");
            div.style.background = "#fafaf9";
            div.style.border = "1px solid var(--border)";
            div.style.padding = "0.6rem 0.85rem";
            div.style.borderRadius = "8px";
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.innerHTML = \`<span style="color:var(--green);font-weight:700;">✓ \${evt.type}</span><span style="font-family:var(--mono);font-size:0.75rem;color:var(--text-muted);">\${evt.timestamp.slice(11, 19)}</span>\`;
            tl.appendChild(div);
          });
        } catch {}
      }

      async function fetchDevEvents() {
        if (!currentIncidentId) return;
        try {
          const res = await fetch(CORE_URL + "/v1/incidents/" + currentIncidentId + "/events");
          const data = await res.json();
          document.getElementById("devJsonDump").innerText = JSON.stringify(data.events || [], null, 2);
        } catch {}
      }

      function resetToHome() {
        currentIncidentId = null;
        currentIncident = null;
        document.getElementById("narrativeText").value = "";
        showWsView("IDLE");
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
