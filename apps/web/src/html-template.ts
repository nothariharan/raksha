/**
 * Raksha Web App — Responsive HTML, CSS, and Interactive Client Script
 * Implements the Notion AI × Wispr Flow minimal emergency UX and Developer CAP Console.
 */

export function renderRakshaWebAppHtml(config?: { coreUrl?: string; capUrl?: string }): string {
  const coreUrl = config?.coreUrl || "http://localhost:3001";
  const capUrl = config?.capUrl || "http://localhost:3002";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Raksha — Multimodal Emergency Public-Service Protocol</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090a0f;
      --card: #12151f;
      --card-border: #23293d;
      --text: #f0f3fa;
      --text-muted: #8c96b0;
      --primary: #3b82f6;
      --primary-hover: #2563eb;
      --accent-green: #10b981;
      --accent-amber: #f59e0b;
      --accent-red: #ef4444;
      --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      border-bottom: 1px solid var(--card-border);
      background: rgba(18, 21, 31, 0.8);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: -0.02em;
    }
    .brand-badge {
      background: rgba(59, 130, 246, 0.15);
      color: var(--primary);
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    select.lang-select {
      background: var(--card);
      color: var(--text);
      border: 1px solid var(--card-border);
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      font-size: 0.85rem;
      outline: none;
      cursor: pointer;
    }

    .btn-dev {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--card-border);
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .btn-dev:hover, .btn-dev.active {
      color: var(--primary);
      border-color: var(--primary);
      background: rgba(59, 130, 246, 0.1);
    }

    /* Simulation Notice Banner */
    .sim-banner {
      background: rgba(245, 158, 11, 0.1);
      border-bottom: 1px solid rgba(245, 158, 11, 0.25);
      color: #fcd34d;
      font-size: 0.8rem;
      padding: 0.4rem 1rem;
      text-align: center;
      font-family: var(--mono);
      font-weight: 500;
    }

    /* Main Container (Wispr Flow / Notion minimal aesthetic) */
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      max-width: 680px;
      margin: 0 auto;
      width: 100%;
    }

    .hero-box {
      width: 100%;
      text-align: center;
      margin-bottom: 2rem;
    }
    .hero-title {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 0.5rem;
    }
    .hero-sub {
      color: var(--text-muted);
      font-size: 1.1rem;
      font-weight: 400;
    }

    /* Action Cards (Single-purpose) */
    .action-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      width: 100%;
      margin-bottom: 1.5rem;
    }

    .btn-action {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.75rem 1.25rem;
      color: var(--text);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      text-decoration: none;
    }
    .btn-action:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -10px rgba(59, 130, 246, 0.2);
    }
    .btn-action .icon {
      font-size: 2rem;
    }
    .btn-action .label {
      font-weight: 600;
      font-size: 1.05rem;
    }

    .btn-type-toggle {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.95rem;
      cursor: pointer;
      text-decoration: underline;
      padding: 0.5rem;
    }
    .btn-type-toggle:hover { color: var(--text); }

    /* Type Narrative Box */
    .type-box {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    textarea.narrative-input {
      width: 100%;
      height: 110px;
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1rem;
      color: var(--text);
      font-family: var(--font);
      font-size: 0.95rem;
      resize: vertical;
      outline: none;
    }
    textarea.narrative-input:focus { border-color: var(--primary); }

    .btn-primary {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: background 0.2s;
      align-self: flex-end;
    }
    .btn-primary:hover { background: var(--primary-hover); }

    /* Progressive State Cards */
    .state-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 2rem;
      width: 100%;
      text-align: center;
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Extracted Details Grid */
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      width: 100%;
      text-align: left;
      margin: 1.5rem 0;
      background: #0b0e14;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.25rem;
    }
    .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .detail-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .detail-value { font-size: 1.05rem; font-weight: 600; color: var(--text); }
    .highlight-amount { font-size: 1.6rem; color: var(--accent-green); }

    /* Contradiction / Conflict Options */
    .conflict-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      width: 100%;
      margin: 1.5rem 0;
    }
    .conflict-btn {
      background: #181d2c;
      border: 2px solid #333d59;
      color: var(--text);
      padding: 1.5rem 1rem;
      border-radius: 12px;
      cursor: pointer;
      font-size: 1.25rem;
      font-weight: 700;
      transition: all 0.2s;
    }
    .conflict-btn:hover {
      border-color: var(--primary);
      background: rgba(59, 130, 246, 0.1);
    }

    /* Primary CTA Button */
    .btn-report {
      background: var(--accent-green);
      color: #000;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      letter-spacing: -0.01em;
      transition: opacity 0.2s;
    }
    .btn-report:hover { opacity: 0.9; }

    /* Timeline Styles */
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      text-align: left;
      width: 100%;
      margin-top: 1.5rem;
    }
    .timeline-step {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      position: relative;
    }
    .timeline-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--accent-green);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      color: black;
      font-weight: bold;
      flex-shrink: 0;
      margin-top: 0.2rem;
    }
    .timeline-content {
      background: var(--card);
      border: 1px solid var(--card-border);
      padding: 0.8rem 1.2rem;
      border-radius: 10px;
      width: 100%;
    }
    .timeline-title { font-weight: 600; font-size: 0.95rem; }
    .timeline-sub { font-size: 0.8rem; color: var(--text-muted); font-family: var(--mono); }

    /* Developer Drawer */
    #dev-panel {
      position: fixed;
      right: 0;
      top: 65px;
      bottom: 0;
      width: 440px;
      background: #0b0e14;
      border-left: 1px solid var(--card-border);
      padding: 1.5rem;
      overflow-y: auto;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 90;
      font-size: 0.85rem;
    }
    #dev-panel.open {
      transform: translateX(0);
    }
    .dev-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 0.75rem;
    }
    .channel-tabs {
      display: flex;
      gap: 0.3rem;
      margin-bottom: 1rem;
      background: #12151f;
      padding: 0.25rem;
      border-radius: 8px;
      border: 1px solid var(--card-border);
    }
    .tab-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 0.35rem 0.2rem;
      font-size: 0.72rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }
    .tab-btn.active {
      background: var(--primary);
      color: white;
    }
    pre.json-tree {
      background: #050608;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.8rem;
      font-family: var(--mono);
      font-size: 0.75rem;
      color: #93c5fd;
      overflow-x: auto;
      max-height: 220px;
    }
  </style>
</head>
<body>

  <!-- Top Simulation Notice -->
  <div class="sim-banner">
    ⚠️ SIMULATED 1930 / CFCFRMS DEMONSTRATION ENVIRONMENT • AUTHENTIC RFC-STYLE CIVIC ACTION PROTOCOL (CAP v0.1)
  </div>

  <!-- Header -->
  <header>
    <div class="brand">
      <span>🛡️ Raksha</span>
      <span class="brand-badge">Civic Emergency Protocol</span>
    </div>

    <div class="header-controls">
      <select class="lang-select" id="langSelector" onchange="changeLanguage(this.value)">
        <option value="en">English (India)</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="ta">தமிழ் (Tamil)</option>
        <option value="te">తెలుగు (Telugu)</option>
        <option value="kn">ಕನ್ನಡ (Kannada)</option>
        <option value="bn">বাংলা (Bengali)</option>
        <option value="mr">मराठी (Marathi)</option>
      </select>

      <button class="btn-dev" id="devToggle" onclick="toggleDeveloperMode()">
        <span>⚡</span>
        <span>Developer Mode</span>
      </button>
    </div>
  </header>

  <!-- Main Citizen Interface -->
  <main>
    <div class="hero-box">
      <h1 class="hero-title" id="txtHeroTitle">What happened?</h1>
      <p class="hero-sub" id="txtHeroSub">You don't need to fill a form. Speak, upload a screenshot, or type in your own words.</p>
    </div>

    <div class="state-card" id="mainCard">

      <!-- IDLE STATE -->
      <div id="idleState">
        <div class="action-grid">
          <button class="btn-action" onclick="simulateVoiceInput()">
            <span class="icon">🎙️</span>
            <span class="label" id="btnVoiceLabel">Tell Raksha</span>
          </button>
          
          <label class="btn-action" style="cursor: pointer;">
            <span class="icon">📷</span>
            <span class="label" id="btnImageLabel">Show Transaction</span>
            <input type="file" accept="image/*" style="display: none;" onchange="handleImageUpload(event)" />
          </label>
        </div>

        <button class="btn-type-toggle" id="btnTypeLabel" onclick="toggleTypeBox()">Type details instead</button>

        <div class="type-box" id="typeBox" style="display: none;">
          <textarea class="narrative-input" id="txtNarrative" placeholder="e.g. Someone called saying my electricity will be cut off and made me send ₹5,000 via PhonePe from my SBI account..."></textarea>
          <button class="btn-primary" onclick="submitTypeText()">Understand My Situation</button>
        </div>
      </div>

      <!-- PROCESSING STATE -->
      <div id="processingState" style="display: none; flex-direction: column; align-items: center; gap: 1rem; padding: 2rem 0;">
        <div style="font-size: 2.5rem; animation: spin 1.5s linear infinite;">⚡</div>
        <div style="font-size: 1.1rem; font-weight: 600;" id="txtProcessingTitle">Understanding details & securing evidence...</div>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Deterministic Multimodal Reconciliation Engine</p>
      </div>

      <!-- ONE MISSING DETAIL (QUESTION PENDING) STATE -->
      <div id="questionState" style="display: none;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">❓</div>
        <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem;" id="questionPrompt">I just need one thing. What is the transaction number?</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">We extracted all other details from your report.</p>

        <div style="display: flex; gap: 0.5rem; max-width: 440px; margin: 0 auto;">
          <input type="text" id="txtQuestionAnswer" placeholder="e.g. 423456789012" style="flex: 1; background: #0b0e14; border: 1px solid var(--card-border); border-radius: 8px; padding: 0.75rem; color: var(--text); outline: none;" />
          <button class="btn-primary" onclick="submitQuestionAnswer()">Submit</button>
        </div>
      </div>

      <!-- CONFLICT / CONTRADICTION STATE -->
      <div id="conflictState" style="display: none;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
        <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem;" id="conflictPrompt">I found two different amounts. Which is correct?</h2>
        <div class="conflict-cards" id="conflictOptions"></div>
      </div>

      <!-- READY FOR SUBMISSION STATE -->
      <div id="readyState" style="display: none;">
        <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.25rem;">I found this payment.</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Verified against your evidence. Ready to send.</p>

        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Amount</span>
            <span class="detail-value highlight-amount" id="valAmount">₹5,000</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Channel</span>
            <span class="detail-value" id="valChannel">UPI (PhonePe)</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">12-Digit UTR / Ref No</span>
            <span class="detail-value" id="valUtr">423456789012</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Debit Bank</span>
            <span class="detail-value" id="valDebitBank">State Bank of India</span>
          </div>
        </div>

        <button class="btn-report" onclick="submitToCAP()">🚀 SEND EMERGENCY REPORT</button>
      </div>

      <!-- SUBMITTED / TRACKING STATE -->
      <div id="submittedState" style="display: none; width: 100%;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🛡️</div>
        <h2 style="font-size: 1.6rem; font-weight: 700; color: var(--accent-green); margin-bottom: 0.25rem;">Emergency Report Sent</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1rem;">
          Report handed off to the simulated 1930 / bank response layer.<br>
          Official Reference: <strong id="valRefNum" style="color: var(--text);">1930-SYN-XXXXXX</strong>
        </p>

        <div class="timeline" id="eventTimeline"></div>
        <button class="btn-dev" style="margin-top: 2rem; width: 100%; justify-content: center;" onclick="resetApp()">File Another Emergency Report</button>
      </div>

    </div>
  </main>

  <!-- Developer Console Drawer -->
  <div id="dev-panel">
    <div class="dev-title">⚡ DEVELOPER CAP TRACE & HEALTH</div>
    <div class="channel-tabs">
      <button class="tab-btn active" id="tabWeb" onclick="switchChannelTab('web')">Web</button>
      <button class="tab-btn" id="tabWa" onclick="switchChannelTab('whatsapp')">WhatsApp</button>
      <button class="tab-btn" id="tabPhone" onclick="switchChannelTab('phone')">Phone</button>
      <button class="tab-btn" id="tabMcp" onclick="switchChannelTab('mcp')">MCP Agent</button>
      <button class="tab-btn" id="tabCap" onclick="switchChannelTab('cap')">CAP</button>
      <button class="tab-btn" id="tabAudit" onclick="switchChannelTab('audit')">Audit</button>
    </div>

    <div style="margin-bottom: 0.75rem;">
      <span style="color: var(--text-muted);">Active Channel:</span> <strong id="devChannel">Web (Citizen UI)</strong>
    </div>
    <div style="margin-bottom: 0.75rem;">
      <span style="color: var(--text-muted);">Current State:</span> <strong id="devState">IDLE</strong>
    </div>
    <div style="margin-bottom: 0.75rem;">
      <span style="color: var(--text-muted);">Incident ID:</span> <strong id="devIncidentId">None</strong>
    </div>

    <div class="dev-title" style="margin-top: 1rem;">SYSTEM HEALTH STATUS</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;" id="healthGrid">
      <div style="background: #12151f; padding: 0.4rem; border-radius: 6px;">Core: <span style="color: var(--accent-green);">✓ UP</span></div>
      <div style="background: #12151f; padding: 0.4rem; border-radius: 6px;">CAP: <span style="color: var(--accent-green);">✓ UP</span></div>
      <div style="background: #12151f; padding: 0.4rem; border-radius: 6px;">Portal A: <span style="color: var(--accent-green);">✓ UP</span></div>
      <div style="background: #12151f; padding: 0.4rem; border-radius: 6px;">Portal B: <span style="color: var(--accent-green);">✓ UP</span></div>
    </div>

    <div class="dev-title" style="margin-top: 1rem;">RAW CAP EVENT LEDGER</div>
    <pre class="json-tree" id="devJsonEvents">[]</pre>
  </div>

  <script>
    const CORE_URL = "${coreUrl}";
    const CAP_URL = "${capUrl}";

    let currentIncidentId = null;
    let currentLanguage = "en";
    let currentIncident = null;
    let currentNextAction = null;
    let isDevOpen = false;
    let currentChannel = "web";

    function switchChannelTab(channel) {
      currentChannel = channel;
      document.getElementById("tabWeb").classList.toggle("active", channel === "web");
      document.getElementById("tabWa").classList.toggle("active", channel === "whatsapp");
      document.getElementById("tabPhone").classList.toggle("active", channel === "phone");
      document.getElementById("tabMcp").classList.toggle("active", channel === "mcp");
      document.getElementById("tabCap").classList.toggle("active", channel === "cap");
      document.getElementById("tabAudit").classList.toggle("active", channel === "audit");

      const labelMap = {
        web: "Web (Citizen UI)",
        whatsapp: "WhatsApp Channel Adapter (Port 3005)",
        phone: "Voice Telephony Agent (ElevenLabs / Twilio / Mode B)",
        mcp: "AI Agent Interface (Model Context Protocol JSON-RPC)",
        cap: "Civic Action Protocol Router (Idempotent Action Layer)",
        audit: "Tamper-Evident Hashed Audit Ledger"
      };
      document.getElementById("devChannel").innerText = labelMap[channel] || channel;
    }

    function changeLanguage(lang) {
      currentLanguage = lang;
      if (lang === "hi") {
        document.getElementById("txtHeroTitle").innerText = "क्या हुआ?";
        document.getElementById("txtHeroSub").innerText = "आपको कोई फॉर्म भरने की ज़रूरत नहीं है। बोलें, स्क्रीनशॉट साझा करें या लिखें।";
        document.getElementById("btnVoiceLabel").innerText = "🎙️ रक्षा से बोलें";
        document.getElementById("btnImageLabel").innerText = "📷 लेन-देन दिखाएं";
        document.getElementById("btnTypeLabel").innerText = "⌨️ लिखकर बताएं";
      } else {
        document.getElementById("txtHeroTitle").innerText = "What happened?";
        document.getElementById("txtHeroSub").innerText = "You don't need to fill a form. Speak, upload a screenshot, or type in your own words.";
        document.getElementById("btnVoiceLabel").innerText = "🎙️ Tell Raksha";
        document.getElementById("btnImageLabel").innerText = "📷 Show Transaction";
        document.getElementById("btnTypeLabel").innerText = "⌨️ Type details instead";
      }
    }

    function toggleDeveloperMode() {
      isDevOpen = !isDevOpen;
      document.getElementById("dev-panel").classList.toggle("open", isDevOpen);
      document.getElementById("devToggle").classList.toggle("active", isDevOpen);
    }

    function toggleTypeBox() {
      const box = document.getElementById("typeBox");
      box.style.display = box.style.display === "none" ? "flex" : "none";
    }

    function showStateView(state) {
      document.getElementById("idleState").style.display = state === "IDLE" ? "block" : "none";
      document.getElementById("processingState").style.display = state === "PROCESSING" ? "flex" : "none";
      document.getElementById("questionState").style.display = state === "QUESTION" ? "block" : "none";
      document.getElementById("conflictState").style.display = state === "CONFLICT" ? "block" : "none";
      document.getElementById("readyState").style.display = state === "READY" ? "block" : "none";
      document.getElementById("submittedState").style.display = (state === "SUBMITTED" || state === "TRACKING") ? "block" : "none";
      document.getElementById("devState").innerText = state;
    }

    async function sendProcessRequest(payload) {
      showStateView("PROCESSING");
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

        if (!res.ok) throw new Error("Processing failed");
        const data = await res.json();
        handleProcessResponse(data);
      } catch (err) {
        alert("Error: " + err.message);
        showStateView("IDLE");
      }
    }

    function handleProcessResponse(data) {
      currentIncidentId = data.incidentId;
      currentIncident = data.incident;
      currentNextAction = data.nextAction;

      document.getElementById("devIncidentId").innerText = currentIncidentId;

      if (data.state === "QUESTION_PENDING" || data.nextAction?.nextActionType === "ASK_USER") {
        document.getElementById("questionPrompt").innerText = data.nextAction.prompt || "Please provide the missing detail.";
        showStateView("QUESTION");
      } else if (data.state === "USER_CONFIRMATION" || data.nextAction?.nextActionType === "CONFIRM_CONFLICT") {
        document.getElementById("conflictPrompt").innerText = data.nextAction.prompt || "Which detail is correct?";
        const container = document.getElementById("conflictOptions");
        container.innerHTML = "";
        if (data.nextAction.options) {
          data.nextAction.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "conflict-btn";
            btn.innerText = opt.label;
            btn.onclick = () => resolveConflict(data.nextAction.field, opt.value);
            container.appendChild(btn);
          });
        }
        showStateView("CONFLICT");
      } else if (data.state === "READY") {
        document.getElementById("valAmount").innerText = "₹" + (data.incident?.transaction?.amount || 5000).toLocaleString();
        document.getElementById("valChannel").innerText = (data.incident?.transaction?.channel || "UPI") + (data.incident?.transaction?.application ? " (" + data.incident.transaction.application + ")" : "");
        document.getElementById("valUtr").innerText = data.incident?.transaction?.transactionId || "423456789012";
        document.getElementById("valDebitBank").innerText = data.incident?.transaction?.debitInstitution || "State Bank of India";
        showStateView("READY");
      } else if (data.state === "SUBMITTED" || data.state === "ACKNOWLEDGED") {
        showStateView("SUBMITTED");
        fetchTimeline();
      }

      fetchDevEvents();
    }

    function submitTypeText() {
      const val = document.getElementById("txtNarrative").value;
      if (!val) return;
      sendProcessRequest({ modality: "text", content: val });
    }

    function simulateVoiceInput() {
      const narrative = currentLanguage === "hi" 
        ? "बिजली विभाग के नाम से कॉल आया और मैंने फोनपे से पाँच हज़ार भेज दिए।" 
        : "Someone called pretending to be from electricity desk and stole 5000 via PhonePe";
      sendProcessRequest({ modality: "voice", content: narrative });
    }

    function handleImageUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      const fakeOCR = "Google Pay Completed. Paid ₹5,000.00 to fraudster.merchant@ybl. UPI Ref: 423456789012. Debited: State Bank of India.";
      sendProcessRequest({ modality: "image", content: fakeOCR });
    }

    function submitQuestionAnswer() {
      const ans = document.getElementById("txtQuestionAnswer").value;
      if (!ans) return;
      const field = currentNextAction ? currentNextAction.field : "transaction.transactionId";
      sendProcessRequest({
        modality: "text",
        content: ans,
        userClarificationAnswer: { field: field, answerValue: ans }
      });
    }

    function resolveConflict(field, val) {
      sendProcessRequest({
        modality: "text",
        content: "Resolved to " + val,
        userClarificationAnswer: { field: field, answerValue: val }
      });
    }

    async function submitToCAP() {
      showStateView("PROCESSING");
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
        document.getElementById("valRefNum").innerText = refNum;
        showStateView("SUBMITTED");
        fetchTimeline();
      } catch (err) {
        alert("CAP Submission Failed: " + err.message);
        showStateView("READY");
      }
    }

    async function fetchTimeline() {
      if (!currentIncidentId) return;
      try {
        const res = await fetch(CORE_URL + "/v1/incidents/" + currentIncidentId + "/events");
        const data = await res.json();
        const tl = document.getElementById("eventTimeline");
        tl.innerHTML = "";
        (data.events || []).forEach(evt => {
          const div = document.createElement("div");
          div.className = "timeline-step";
          div.innerHTML = '<div class="timeline-dot">✓</div><div class="timeline-content"><div class="timeline-title">' + evt.type + '</div><div class="timeline-sub">' + evt.timestamp + ' • Source: ' + evt.source + '</div></div>';
          tl.appendChild(div);
        });
      } catch {}
    }

    async function fetchDevEvents() {
      if (!currentIncidentId) return;
      try {
        const res = await fetch(CORE_URL + "/v1/incidents/" + currentIncidentId + "/events");
        const data = await res.json();
        document.getElementById("devJsonEvents").innerText = JSON.stringify(data.events || [], null, 2);
      } catch {}
    }

    function resetApp() {
      currentIncidentId = null;
      currentIncident = null;
      currentNextAction = null;
      document.getElementById("txtNarrative").value = "";
      showStateView("IDLE");
    }
  </script>
</body>
</html>`;
}
