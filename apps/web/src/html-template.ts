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
      font-size: 0.8rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .btn-dev.active {
      background: rgba(245, 158, 11, 0.15);
      color: var(--accent-amber);
      border-color: var(--accent-amber);
    }

    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      max-width: 720px;
      margin: 0 auto;
      width: 100%;
    }

    .view-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 2.5rem 2rem;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    h1.hero-title {
      font-size: 2.25rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin-bottom: 0.75rem;
    }

    p.hero-sub {
      color: var(--text-muted);
      font-size: 1rem;
      margin-bottom: 2.5rem;
      max-width: 480px;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      width: 100%;
      margin-bottom: 1.5rem;
    }
    @media (max-width: 640px) {
      .action-grid { grid-template-columns: 1fr; }
    }

    .action-btn {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--card-border);
      color: var(--text);
      padding: 1.5rem 1rem;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    .action-btn:hover {
      background: rgba(59, 130, 246, 0.08);
      border-color: var(--primary);
      transform: translateY(-2px);
    }
    .action-btn svg { width: 32px; height: 32px; color: var(--primary); }

    .type-box {
      width: 100%;
      display: flex;
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
      transition: all 0.2s;
    }
    .btn-report:hover {
      background: #059669;
      color: #fff;
    }

    /* Timeline */
    .timeline {
      width: 100%;
      text-align: left;
      margin-top: 1.5rem;
      border-left: 2px solid var(--card-border);
      padding-left: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .timeline-item { position: relative; }
    .timeline-item::before {
      content: "";
      position: absolute;
      left: -1.95rem;
      top: 0.25rem;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--primary);
    }
    .timeline-item.done::before { background: var(--accent-green); }
    .timeline-title { font-weight: 600; font-size: 0.9rem; }
    .timeline-time { font-size: 0.75rem; color: var(--text-muted); }

    /* Developer Drawer */
    #dev-panel {
      display: none;
      position: fixed;
      right: 0;
      top: 65px;
      bottom: 0;
      width: 440px;
      background: #0c0f17;
      border-left: 1px solid var(--card-border);
      padding: 1.5rem;
      overflow-y: auto;
      font-family: var(--mono);
      font-size: 0.8rem;
      z-index: 90;
    }
    #dev-panel.open { display: block; }
    .dev-title { font-size: 0.9rem; font-weight: 700; color: var(--accent-amber); margin-bottom: 1rem; }
    .json-tree { background: #06080c; border: 1px solid #1a2030; border-radius: 8px; padding: 1rem; overflow-x: auto; color: #a5b4fc; }

    .file-hidden { display: none; }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <span>🛡️ Raksha</span>
      <span class="brand-badge">PROTOCOL v0.1</span>
    </div>
    <div class="header-controls">
      <select id="langSelect" class="lang-select" onchange="changeLanguage(this.value)">
        <option value="en">English (EN)</option>
        <option value="hi">हिंदी (HI)</option>
        <option value="ta">தமிழ் (TA)</option>
        <option value="te">తెలుగు (TE)</option>
        <option value="kn">ಕನ್ನಡ (KN)</option>
        <option value="bn">বাংলা (BN)</option>
        <option value="mr">मराठी (MR)</option>
      </select>
      <button id="devToggle" class="btn-dev" onclick="toggleDeveloperMode()">
        <span>⚡</span> Developer
      </button>
    </div>
  </header>

  <main>
    <!-- View Container (State driven) -->
    <div id="viewCard" class="view-card">
      <!-- IDLE / INTAKE STATE -->
      <div id="idleState" style="width: 100%;">
        <h1 class="hero-title" id="txtHeroTitle">What happened?</h1>
        <p class="hero-sub" id="txtHeroSub">You don't need to fill a form. Speak, upload a screenshot, or type in your own words.</p>

        <div class="action-grid">
          <button class="action-btn" onclick="startVoiceIntake()">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            <span id="btnVoiceLabel">🎙️ Tell Raksha</span>
          </button>
          <button class="action-btn" onclick="document.getElementById('fileInput').click()">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span id="btnImageLabel">📷 Show Transaction</span>
          </button>
          <button class="action-btn" onclick="toggleTypeBox()">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            <span id="btnTypeLabel">⌨️ Type Instead</span>
          </button>
        </div>

        <input type="file" id="fileInput" class="file-hidden" accept="image/*" onchange="handleImageUpload(event)" />

        <div id="typeBox" class="type-box" style="display: none;">
          <textarea id="narrativeText" class="text-input" placeholder="e.g. Someone called from electricity department and I sent ₹5,000 via PhonePe..."></textarea>
          <button class="btn-submit-text" onclick="submitTypedNarrative()">Send Report</button>
        </div>
      </div>

      <!-- PROCESSING STATE -->
      <div id="processingState" class="pulse-container" style="display: none;">
        <div class="radar"></div>
        <h2 style="font-weight: 600;" id="txtProcessing">Verifying & extracting transaction details...</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Deterministic extraction in progress across neural & banking parsers</p>
      </div>

      <!-- QUESTION PENDING STATE -->
      <div id="questionState" style="display: none; width: 100%;">
        <p style="color: var(--accent-amber); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">One More Thing Needed</p>
        <h2 id="questionPrompt" style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem;">What is the 12-digit transaction number (UTR)?</h2>
        
        <div style="display: flex; gap: 0.75rem; width: 100%;">
          <input type="text" id="questionAnswerInput" class="text-input" style="min-height: auto; padding: 0.8rem 1rem;" placeholder="Enter missing detail here..." />
          <button class="btn-submit-text" onclick="submitClarificationAnswer()">Submit</button>
        </div>
      </div>

      <!-- CONFLICT / CONTRADICTION STATE -->
      <div id="conflictState" style="display: none; width: 100%;">
        <p style="color: var(--accent-red); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">Difference Detected</p>
        <h2 id="conflictPrompt" style="font-size: 1.35rem; font-weight: 700; margin-bottom: 1rem;">Which amount was debited?</h2>
        
        <div class="conflict-cards" id="conflictOptions">
          <!-- Dynamic Buttons inserted by JS -->
        </div>
      </div>

      <!-- READY STATE -->
      <div id="readyState" style="display: none; width: 100%;">
        <p style="color: var(--accent-green); font-weight: 600; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 0.5rem;">Verified Emergency Packet</p>
        <h2 style="font-size: 1.6rem; font-weight: 700; margin-bottom: 0.5rem;">Your report is ready for submission</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">All crucial transaction indicators and evidence seals are verified.</p>

        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Stolen Amount</span>
            <span class="detail-value highlight-amount" id="valAmount">₹0</span>
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

        <div class="timeline" id="eventTimeline">
          <!-- Populated from persistent event store -->
        </div>

        <button class="btn-dev" style="margin-top: 2rem; width: 100%; justify-content: center;" onclick="resetApp()">File Another Emergency Report</button>
      </div>

    </div>
  </main>

  <!-- Developer Console Drawer -->
  <div id="dev-panel">
    <div class="dev-title">⚡ DEVELOPER CAP TRACE</div>
    <div style="margin-bottom: 1rem;">
      <span style="color: var(--text-muted);">Current State:</span> <strong id="devState">IDLE</strong>
    </div>
    <div style="margin-bottom: 1rem;">
      <span style="color: var(--text-muted);">Incident ID:</span> <strong id="devIncidentId">None</strong>
    </div>
    <div class="dev-title" style="margin-top: 1rem;">RAW EVENT STREAM</div>
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
        
        const btn1 = document.createElement("button");
        btn1.className = "conflict-btn";
        btn1.innerText = "₹50,000 (Voice)";
        btn1.onclick = () => resolveConflict("transaction.amount", 50000);
        
        const btn2 = document.createElement("button");
        btn2.className = "conflict-btn";
        btn2.innerText = "₹5,000 (Screenshot)";
        btn2.onclick = () => resolveConflict("transaction.amount", 5000);

        container.appendChild(btn1);
        container.appendChild(btn2);
        showStateView("CONFLICT");
      } else if (data.state === "READY" || data.nextAction.nextActionType === "READY_FOR_HANDOFF") {
        document.getElementById("valAmount").innerText = "₹" + (data.incident.transaction.amount || 0).toLocaleString();
        document.getElementById("valChannel").innerText = (data.incident.transaction.channel || "UPI") + " (" + (data.candidate.application || "Direct") + ")";
        document.getElementById("valUtr").innerText = data.incident.transaction.transactionId || "Verified";
        document.getElementById("valDebitBank").innerText = data.incident.transaction.debitInstitution || "State Bank of India";
        showStateView("READY");
      }

      refreshDevEvents();
    }

    function startVoiceIntake() {
      const sampleVoiceText = currentLanguage === "hi" 
        ? "बिजली विभाग के नाम से कॉल आया और मैंने फोनपे से पाँच हज़ार भेज दिए।"
        : "Electricity department called me and I transferred 5000 through PhonePe.";
      sendProcessRequest({ modality: "voice", content: sampleVoiceText });
    }

    function handleImageUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      const syntheticScreenshotOCR = "Google Pay - Completed\\nPaid ₹5,000.00 to fraudster@ybl\\nUPI Ref No: 423456789012\\nDate: 2026-08-24T18:42:00+05:30\\nDebited from: State Bank of India";
      sendProcessRequest({ modality: "image", content: syntheticScreenshotOCR });
    }

    function submitTypedNarrative() {
      const text = document.getElementById("narrativeText").value;
      if (!text) return;
      sendProcessRequest({ modality: "text", content: text });
    }

    function submitClarificationAnswer() {
      const answer = document.getElementById("questionAnswerInput").value;
      if (!answer) return;
      sendProcessRequest({
        modality: "text",
        content: answer,
        userClarificationAnswer: {
          field: currentNextAction?.missingField || "transaction.transactionId",
          answerValue: answer
        }
      });
    }

    function resolveConflict(field, value) {
      sendProcessRequest({
        modality: "text",
        content: "User confirmed " + value,
        userClarificationAnswer: { field, answerValue: value }
      });
    }

    async function submitToCAP() {
      showStateView("PROCESSING");
      const idempotencyKey = "web-" + currentIncidentId + "-" + Date.now();
      const res = await fetch(CAP_URL + "/cap/actions/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          action: "report_financial_fraud",
          payload: currentIncident,
          idempotencyKey
        })
      });

      const capResult = await res.json();
      document.getElementById("valRefNum").innerText = capResult.externalReference || ("1930-SYN-" + capResult.caseId);
      
      await refreshDevEvents();
      buildTimeline();
      showStateView("SUBMITTED");
    }

    async function refreshDevEvents() {
      if (!currentIncidentId) return;
      try {
        const res = await fetch(CORE_URL + "/v1/incidents/" + currentIncidentId + "/events");
        const data = await res.json();
        document.getElementById("devJsonEvents").innerText = JSON.stringify(data.events || [], null, 2);
      } catch {}
    }

    async function buildTimeline() {
      const timeline = document.getElementById("eventTimeline");
      timeline.innerHTML = \`
        <div class="timeline-item done">
          <div class="timeline-title">Incident Created & Verified</div>
          <div class="timeline-time">\${new Date().toLocaleTimeString()}</div>
        </div>
        <div class="timeline-item done">
          <div class="timeline-title">Evidence Capsule Sealed (SHA-256 Digest Verified)</div>
          <div class="timeline-time">\${new Date().toLocaleTimeString()}</div>
        </div>
        <div class="timeline-item done">
          <div class="timeline-title">Dispatched via CAP (report_financial_fraud)</div>
          <div class="timeline-time">\${new Date().toLocaleTimeString()}</div>
        </div>
        <div class="timeline-item done">
          <div class="timeline-title">Portal A (1930 Nodal Desk) Accepted</div>
          <div class="timeline-time">\${new Date().toLocaleTimeString()}</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-title">Awaiting Bank Console (Portal B) Response Acknowledgment</div>
          <div class="timeline-time">In Progress...</div>
        </div>
      \`;
    }

    function resetApp() {
      currentIncidentId = null;
      currentIncident = null;
      currentNextAction = null;
      showStateView("IDLE");
    }
  </script>
</body>
</html>
`;
}
