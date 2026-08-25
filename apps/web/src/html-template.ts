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
  <title>Raksha — Multimodal Emergency Cyber-Fraud Reporting Protocol</title>
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
      color: var(--text);
      border-color: var(--primary);
      background: rgba(59, 130, 246, 0.1);
    }

    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
      text-align: center;
    }

    .sim-banner {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: var(--accent-amber);
      font-size: 0.75rem;
      font-family: var(--mono);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .hero-title {
      font-size: 2.25rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin-bottom: 0.5rem;
    }
    .hero-subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
      margin-bottom: 2.5rem;
    }

    .input-methods {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.25rem;
      width: 100%;
      margin-bottom: 2rem;
    }

    .method-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
    }
    .method-card:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -10px rgba(59, 130, 246, 0.2);
    }
    .method-icon {
      font-size: 2.5rem;
    }
    .method-label {
      font-weight: 600;
      font-size: 1rem;
    }

    .type-box {
      width: 100%;
      display: none;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    textarea.text-input {
      width: 100%;
      min-height: 100px;
      background: #0d1017;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      color: var(--text);
      font-family: inherit;
      padding: 1rem;
      font-size: 0.95rem;
      resize: vertical;
      outline: none;
    }
    textarea.text-input:focus { border-color: var(--primary); }

    .btn-submit-text {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      align-self: flex-end;
      transition: background 0.2s;
    }
    .btn-submit-text:hover { background: var(--primary-hover); }

    /* Pulsating Visualizer */
    .pulse-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      padding: 2rem 0;
    }
    .radar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.2);
      border: 2px solid var(--primary);
      animation: pulse 1.5s infinite;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    @keyframes pulse {
      0% { transform: scale(0.9); opacity: 0.8; box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6); }
      70% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
      100% { transform: scale(0.9); opacity: 0.8; }
    }

    /* Details Confirmation Table */
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
    .highlight-amount { font-size: 1.5rem; color: var(--accent-green); }

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
      width: 420px;
      background: #090c14;
      border-left: 1px solid var(--card-border);
      padding: 1.5rem;
      box-shadow: -10px 0 30px rgba(0,0,0,0.5);
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 90;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      font-family: var(--mono);
      font-size: 0.85rem;
    }
    #dev-panel.open {
      transform: translateX(0);
    }
    .dev-title {
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 1rem;
      font-size: 0.8rem;
      letter-spacing: 0.05em;
    }
    .channel-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 0.25rem;
      margin-bottom: 1rem;
    }
    .tab-btn {
      background: #121622;
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 0.3rem 0.2rem;
      font-size: 0.7rem;
      border-radius: 6px;
      cursor: pointer;
    }
    .tab-btn.active {
      color: var(--text);
      border-color: var(--primary);
      background: rgba(59, 130, 246, 0.15);
    }
    pre.json-tree {
      background: #06070a;
      border: 1px solid #1a2030;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.75rem;
      color: #a5b4fc;
      max-height: 250px;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>🛡️ Raksha</span>
      <span class="brand-badge">CAP v0.1</span>
    </div>
    <div class="header-controls">
      <select class="lang-select" id="langSelect" onchange="changeLanguage(this.value)">
        <option value="en">English</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="ta">தமிழ் (Tamil)</option>
        <option value="te">తెలుగు (Telugu)</option>
      </select>
      <button class="btn-dev" id="devToggle" onclick="toggleDeveloperMode()">
        <span>⚡</span> Developer Mode
      </button>
    </div>
  </header>

  <main>
    <div class="sim-banner">
      ⚙️ SIMULATED 1930/CFCFRMS HANDOFF → BANK RESPONSE
    </div>

    <!-- MAIN STATE CONTAINER -->
    <div id="appContainer" style="width: 100%;">

      <!-- IDLE / INTAKE STATE -->
      <div id="idleState">
        <h1 class="hero-title" id="txtHeroTitle">What happened?</h1>
        <p class="hero-subtitle" id="txtHeroSub">You don't need to fill a form. Speak, upload a screenshot, or type in your own words.</p>

        <div class="input-methods">
          <div class="method-card" onclick="simulateVoiceInput()">
            <div class="method-icon">🎙️</div>
            <div class="method-label" id="btnVoiceLabel">Tell Raksha</div>
          </div>
          <div class="method-card" onclick="document.getElementById('fileUpload').click()">
            <div class="method-icon">📷</div>
            <div class="method-label" id="btnImageLabel">Show Transaction</div>
            <input type="file" id="fileUpload" style="display: none;" accept="image/*" onchange="handleImageUpload(event)">
          </div>
          <div class="method-card" onclick="toggleTypeBox()">
            <div class="method-icon">⌨️</div>
            <div class="method-label" id="btnTypeLabel">Type Instead</div>
          </div>
        </div>

        <div class="type-box" id="typeBox">
          <textarea class="text-input" id="txtNarrative" placeholder="e.g. Someone called saying my electricity would be disconnected and stole ₹5,000 via PhonePe"></textarea>
          <button class="btn-submit-text" onclick="submitTypeText()">Process Incident</button>
        </div>
      </div>

      <!-- PROCESSING STATE -->
      <div id="processingState" class="pulse-container" style="display: none;">
        <div class="radar">⚡</div>
        <h2 style="font-size: 1.3rem; font-weight: 600;">Extracting & Reconciling Emergency Details...</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Deterministic multi-source candidate synthesis</p>
      </div>

      <!-- QUESTION PENDING STATE (Single Question) -->
      <div id="questionState" style="display: none;">
        <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;" id="questionPrompt">I only need one thing: please provide the 12-digit UTR number.</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">You can find this on your Google Pay, PhonePe, or Banking app receipt.</p>
        <div style="display: flex; gap: 0.5rem; max-width: 450px; margin: 0 auto;">
          <input type="text" id="txtQuestionAnswer" class="text-input" style="min-height: 48px; padding: 0.6rem 1rem;" placeholder="e.g. 423456789012">
          <button class="btn-submit-text" style="height: 48px;" onclick="submitQuestionAnswer()">Submit</button>
        </div>
      </div>

      <!-- USER CONFIRMATION / CONFLICT STATE -->
      <div id="conflictState" style="display: none;">
        <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;" id="conflictPrompt">Discrepancy Found. Which amount was stolen?</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem;">We found different values between your statement and description.</p>
        <div class="conflict-cards" id="conflictOptions"></div>
      </div>

      <!-- READY STATE (Confirmation View) -->
      <div id="readyState" style="display: none;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--accent-green);">Payment Identified & Verified</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Review the synthesized transaction capsule before emergency dispatch.</p>

        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Stolen Amount</span>
            <span class="detail-value highlight-amount" id="valAmount">₹5,000</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Payment Mode / App</span>
            <span class="detail-value" id="valChannel">UPI (PhonePe)</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">12-Digit UTR / Ref No</span>
            <span class="detail-value" id="valUtr">--------</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Debit Bank</span>
            <span class="detail-value" id="valDebitBank">SBI</span>
          </div>
        </div>

        <button class="btn-report" onclick="submitToCAP()">🚀 DISPATCH TO 1930 / CYBER PORTAL</button>
      </div>

      <!-- SUBMITTED / TRACKING STATE -->
      <div id="submittedState" style="display: none; width: 100%;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🛡️</div>
        <h2 style="font-size: 1.6rem; font-weight: 700; color: var(--accent-green); margin-bottom: 0.25rem;">Emergency Report Accepted</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1rem;">Official Tracking Reference: <strong id="valRefNum" style="color: var(--text);">1930-SYN-XXXXXX</strong></p>

        <div class="timeline" id="eventTimeline"></div>
        <button class="btn-dev" style="margin-top: 2rem; width: 100%; justify-content: center;" onclick="resetApp()">File Another Emergency Report</button>
      </div>

    </div>
  </main>

  <!-- Developer Console Drawer -->
  <div id="dev-panel">
    <div class="dev-title">⚡ DEVELOPER CAP TRACE</div>
    <div class="channel-tabs">
      <button class="tab-btn active" id="tabWeb" onclick="switchChannelTab('web')">Web</button>
      <button class="tab-btn" id="tabWa" onclick="switchChannelTab('whatsapp')">WhatsApp</button>
      <button class="tab-btn" id="tabPhone" onclick="switchChannelTab('phone')">Phone</button>
      <button class="tab-btn" id="tabMcp" onclick="switchChannelTab('mcp')">MCP Agent</button>
    </div>

    <div style="margin-bottom: 0.75rem;">
      <span style="color: var(--text-muted);">Active Channel:</span> <strong id="devChannel">Web (Citizen)</strong>
    </div>
    <div style="margin-bottom: 0.75rem;">
      <span style="color: var(--text-muted);">Current State:</span> <strong id="devState">IDLE</strong>
    </div>
    <div style="margin-bottom: 0.75rem;">
      <span style="color: var(--text-muted);">Incident ID:</span> <strong id="devIncidentId">None</strong>
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

      const labelMap = {
        web: "Web (Citizen UI)",
        whatsapp: "WhatsApp (+919876543210)",
        phone: "Phone (ElevenLabs Voicebot)",
        mcp: "AI Agent (Model Context Protocol)"
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
        document.getElementById("btnTypeLabel").innerText = "⌨️ Type Instead";
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

      if (data.state === "QUESTION_PENDING" || data.nextAction.nextActionType === "ASK_USER") {
        document.getElementById("questionPrompt").innerText = data.nextAction.prompt || "Please provide the missing detail.";
        showStateView("QUESTION");
      } else if (data.state === "USER_CONFIRMATION" || data.nextAction.nextActionType === "CONFIRM_CONFLICT") {
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
        document.getElementById("valAmount").innerText = "₹" + (data.incident.transaction.amount || 0).toLocaleString();
        document.getElementById("valChannel").innerText = (data.incident.transaction.channel || "UPI") + (data.incident.transaction.application ? " (" + data.incident.transaction.application + ")" : "");
        document.getElementById("valUtr").innerText = data.incident.transaction.transactionId || "Verified";
        document.getElementById("valDebitBank").innerText = data.incident.transaction.debitInstitution || "State Bank of India";
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
      const fakeOCR = "Google Pay Completed. Paid ₹5,000.00 to fraudster.merchant@ybl. UPI Ref: 423456789012. Debited: SBI.";
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
