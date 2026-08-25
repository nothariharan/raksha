/**
 * Raksha Web App — Editorial 3-Column Hero Landing Page & Interactive Citizen Emergency Console
 * Implements the authentic Indian brand identity (Samarkan wordmark), 3-mode interactive hero,
 * and live Civic Action Protocol (CAP v0.1) engine.
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
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #fafaf9;
      --bg-white: #ffffff;
      --border: #e7e5e4;
      --border-subtle: #f0eeec;
      --text: #1c1917;
      --text-muted: #78716c;
      --text-light: #a8a29e;
      
      --orange: #ea580c;
      --orange-hover: #c2410c;
      --orange-light: #fff7ed;
      --orange-border: #fed7aa;
      
      --green: #16a34a;
      --green-light: #f0fdf4;
      --green-border: #bbf7d0;
      
      --blue: #2563eb;
      --blue-light: #eff6ff;
      --blue-border: #bfdbfe;
      
      --card-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03);
      --card-shadow-lg: 0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04);
      --font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
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

    /* Top Simulation Disclaimer */
    .sim-bar {
      background: #fef3c7;
      border-bottom: 1px solid #fde68a;
      color: #92400e;
      font-size: 0.78rem;
      padding: 0.35rem 1rem;
      text-align: center;
      font-family: var(--mono);
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    /* Navbar */
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 3.5rem;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .brand-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      cursor: pointer;
    }
    .brand-shield {
      width: 28px;
      height: 28px;
      background: var(--orange);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1rem;
      font-weight: bold;
    }
    .brand-logo-img {
      height: 28px;
      object-fit: contain;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .nav-link {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s;
    }
    .nav-link:hover { color: var(--text); }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .lang-dropdown {
      background: var(--bg);
      border: 1px solid var(--border);
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text);
      outline: none;
      cursor: pointer;
    }

    .btn-dev-console {
      background: #1c1917;
      color: white;
      border: none;
      padding: 0.5rem 1.15rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: background 0.15s;
    }
    .btn-dev-console:hover { background: #292524; }

    /* ========================================================
       HERO SECTION (3-COLUMN EDITORIAL COMPOSITION)
       ======================================================== */
    .hero-section {
      max-width: 1320px;
      margin: 0 auto;
      padding: 3.5rem 2rem 2rem 2rem;
      width: 100%;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.1fr 1.5fr 1.1fr;
      gap: 2.5rem;
      align-items: center;
      min-height: 480px;
    }

    /* Left Column */
    .hero-left {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      text-align: left;
    }
    .hero-headline {
      font-size: 3.1rem;
      font-weight: 800;
      line-height: 1.12;
      letter-spacing: -0.035em;
      color: var(--text);
    }
    .hero-headline .orange-accent {
      color: var(--orange);
      display: block;
    }
    .hero-subtext {
      color: var(--text-muted);
      font-size: 1.05rem;
      line-height: 1.55;
      font-weight: 400;
      max-width: 360px;
    }

    /* Center Column */
    .hero-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      position: relative;
    }
    .hero-art-container {
      width: 100%;
      height: 310px;
      background: var(--bg-white);
      border: 1px solid var(--border);
      border-radius: 24px;
      overflow: hidden;
      position: relative;
      box-shadow: var(--card-shadow-lg);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero-art-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.35s ease-in-out, transform 0.35s ease-out;
    }

    /* Mode Pill Buttons (Bottom of Center Art) */
    .mode-pills-bar {
      display: flex;
      gap: 0.6rem;
      background: var(--bg-white);
      padding: 0.35rem;
      border-radius: 9999px;
      border: 1px solid var(--border);
      box-shadow: var(--card-shadow);
      z-index: 10;
    }
    .mode-pill {
      background: transparent;
      border: 1px solid transparent;
      padding: 0.6rem 1.15rem;
      border-radius: 9999px;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .mode-pill:hover {
      color: var(--text);
      background: #f5f5f4;
    }

    /* Active Mode Pill States */
    .mode-pill.active-call {
      background: var(--orange);
      color: white;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);
    }
    .mode-pill.active-whatsapp {
      background: var(--green);
      color: white;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
    }
    .mode-pill.active-web {
      background: var(--blue);
      color: white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    /* Right Column (Mode Details) */
    .hero-right {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      min-height: 280px;
      justify-content: center;
      animation: fadeIn 0.25s ease-out;
    }

    .mode-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      margin-bottom: 0.85rem;
    }
    .mode-badge.badge-call { background: var(--orange-light); color: var(--orange); border: 1px solid var(--orange-border); }
    .mode-badge.badge-whatsapp { background: var(--green-light); color: var(--green); border: 1px solid var(--green-border); }
    .mode-badge.badge-web { background: var(--blue-light); color: var(--blue); border: 1px solid var(--blue-border); }

    .mode-title-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .mode-icon {
      font-size: 1.8rem;
    }
    .mode-heading {
      font-size: 2.1rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text);
    }

    .mode-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 1.5rem;
      max-width: 320px;
    }

    .mode-features {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      list-style: none;
    }
    .mode-feature-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--text);
    }
    .feature-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: bold;
    }
    .dot-call { background: var(--orange-light); color: var(--orange); }
    .dot-whatsapp { background: var(--green-light); color: var(--green); }
    .dot-web { background: var(--blue-light); color: var(--blue); }

    /* ========================================================
       LIVE CITIZEN EMERGENCY WORKSPACE / ACTION AREA
       ======================================================== */
    .workspace-section {
      max-width: 840px;
      margin: 2.5rem auto 4rem auto;
      padding: 0 1.5rem;
      width: 100%;
    }

    .workspace-card {
      background: var(--bg-white);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: var(--card-shadow-lg);
      position: relative;
    }

    .ws-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .ws-title {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 0.35rem;
    }
    .ws-subtitle {
      color: var(--text-muted);
      font-size: 0.95rem;
    }

    /* Action Buttons in Workspace */
    .ws-action-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .btn-ws-action {
      background: #fafaf9;
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 1.75rem 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      color: var(--text);
    }
    .btn-ws-action:hover {
      border-color: var(--orange);
      background: var(--orange-light);
      transform: translateY(-2px);
    }
    .btn-ws-action .icon { font-size: 2rem; }
    .btn-ws-action .label { font-weight: 700; font-size: 1rem; }
    .btn-ws-action .sub { font-size: 0.8rem; color: var(--text-muted); }

    .btn-type-link {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.9rem;
      cursor: pointer;
      text-decoration: underline;
      display: block;
      margin: 0 auto;
    }
    .btn-type-link:hover { color: var(--text); }

    .type-container {
      margin-top: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    textarea.narrative-textarea {
      width: 100%;
      height: 100px;
      padding: 1rem;
      border: 1.5px solid var(--border);
      border-radius: 12px;
      font-family: var(--font);
      font-size: 0.95rem;
      outline: none;
      resize: vertical;
    }
    textarea.narrative-textarea:focus { border-color: var(--orange); }

    .btn-submit-narrative {
      background: #1c1917;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      align-self: flex-end;
    }

    /* Verification & Details Card */
    .details-box {
      background: #fafaf9;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      margin: 1.5rem 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      text-align: left;
    }
    .dt-label { font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .dt-val { font-size: 1.15rem; font-weight: 700; color: var(--text); }
    .dt-amount { font-size: 1.6rem; color: var(--orange); }

    .btn-send-report {
      background: var(--orange);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 700;
      width: 100%;
      cursor: pointer;
      letter-spacing: -0.01em;
      transition: background 0.15s;
    }
    .btn-send-report:hover { background: var(--orange-hover); }

    /* Timeline in Submitted State */
    .timeline-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin: 1.5rem 0;
      text-align: left;
    }
    .tl-node {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      background: #fafaf9;
      border: 1px solid var(--border);
      padding: 0.75rem 1rem;
      border-radius: 10px;
    }
    .tl-icon { color: var(--green); font-weight: bold; }
    .tl-title { font-weight: 700; font-size: 0.9rem; }
    .tl-time { font-size: 0.78rem; color: var(--text-muted); font-family: var(--mono); margin-left: auto; }

    /* ========================================================
       SECTIONS BELOW HERO: ARCHITECTURE & STORY
       ======================================================== */
    .story-section {
      border-top: 1px solid var(--border);
      background: var(--bg-white);
      padding: 4.5rem 2rem;
      text-align: center;
    }
    .story-container {
      max-width: 1100px;
      margin: 0 auto;
    }
    .section-tag {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--orange);
      margin-bottom: 0.5rem;
    }
    .section-heading {
      font-size: 2.4rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 1rem;
    }
    .section-sub {
      color: var(--text-muted);
      font-size: 1.05rem;
      max-width: 600px;
      margin: 0 auto 3rem auto;
    }

    .flow-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      text-align: left;
    }
    .flow-card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .flow-num {
      font-family: var(--mono);
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--orange);
    }
    .flow-title {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .flow-desc {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Developer Drawer */
    #devDrawer {
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      width: 450px;
      background: #12151f;
      color: #f0f3fa;
      border-left: 1px solid #23293d;
      padding: 1.5rem;
      overflow-y: auto;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 200;
      font-size: 0.85rem;
    }
    #devDrawer.open { transform: translateX(0); }

    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid #23293d;
      margin-bottom: 1.25rem;
    }
    .drawer-title { font-weight: 700; color: #38bdf8; font-size: 0.85rem; letter-spacing: 0.05em; }
    .btn-close-drawer { background: transparent; border: none; color: #94a3b8; font-size: 1.25rem; cursor: pointer; }

    pre.json-dump {
      background: #090a0f;
      border: 1px solid #23293d;
      padding: 0.75rem;
      border-radius: 8px;
      font-family: var(--mono);
      font-size: 0.74rem;
      color: #93c5fd;
      overflow-x: auto;
      max-height: 240px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>

  <!-- Top Simulation Banner -->
  <div class="sim-bar">
    ⚠️ SIMULATED DEMONSTRATION • AUTHENTIC RFC-STYLE CIVIC ACTION PROTOCOL (CAP v0.1) • NO REAL BANK ACCESS
  </div>

  <!-- Top Navigation -->
  <nav>
    <div class="brand-container" onclick="resetToHome()">
      <div class="brand-shield">🛡️</div>
      <img src="/images/raksha-wordmark.png" alt="raksha" class="brand-logo-img" onerror="this.outerHTML='<span style=\\'font-weight:800; font-size:1.3rem; letter-spacing:-0.03em;\\'>raksha</span>'" />
    </div>

    <div class="nav-links">
      <a href="#howItWorks" class="nav-link">How it Works</a>
      <a href="#architecture" class="nav-link">CAP Protocol</a>
      <a href="#agentSection" class="nav-link">For AI Agents</a>
    </div>

    <div class="nav-actions">
      <select class="lang-dropdown" id="langSelect" onchange="switchLanguage(this.value)">
        <option value="en">English (India)</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="ta">தமிழ் (Tamil)</option>
        <option value="te">తెలుగు (Telugu)</option>
        <option value="kn">ಕನ್ನಡ (Kannada)</option>
        <option value="bn">বাংলা (Bengali)</option>
        <option value="mr">मराठी (Marathi)</option>
      </select>

      <button class="btn-dev-console" onclick="toggleDevDrawer()">
        <span>⚡</span>
        <span>Developer Console</span>
      </button>
    </div>
  </nav>

  <!-- ========================================================
       HERO: 3-COLUMN EDITORIAL COMPOSITION
       ======================================================== -->
  <section class="hero-section">
    <div class="hero-grid">

      <!-- LEFT COLUMN: Problem / Narrative -->
      <div class="hero-left">
        <h1 class="hero-headline" id="txtHeroHead">
          Tell us what<br>happened.
          <span class="orange-accent">We’ll handle the rest.</span>
        </h1>
        <p class="hero-subtext" id="txtHeroSub">
          Speak, send a screenshot, or message us. Raksha turns it into an emergency report and carries it through the system for you.
        </p>
      </div>

      <!-- CENTER COLUMN: Dynamic Character Illustration & Mode Selector -->
      <div class="hero-center">
        <div class="hero-art-container" id="artFrame">
          <img src="/images/hero-illustration-call.png" alt="Raksha Call Mode" class="hero-art-img" id="heroArtImg" onerror="this.src='/images/hero-banner-call.png'" />
        </div>

        <div class="mode-pills-bar">
          <button class="mode-pill active-call" id="pillCall" onclick="selectMode('call')">
            <span>📞</span>
            <span>Call Raksha</span>
          </button>
          <button class="mode-pill" id="pillWhatsapp" onclick="selectMode('whatsapp')">
            <span>💬</span>
            <span>WhatsApp Raksha</span>
          </button>
          <button class="mode-pill" id="pillWeb" onclick="selectMode('web')">
            <span>🌐</span>
            <span>Use Raksha on Web</span>
          </button>
        </div>
      </div>

      <!-- RIGHT COLUMN: Mode Description & Value Props -->
      <div class="hero-right" id="heroRightContent">
        <!-- Injected via selectMode() -->
      </div>

    </div>
  </section>

  <!-- ========================================================
       LIVE CITIZEN EMERGENCY WORKSPACE
       ======================================================== -->
  <section class="workspace-section" id="workspaceSection">
    <div class="workspace-card">

      <!-- IDLE INTAKE -->
      <div id="wsIdle">
        <div class="ws-header">
          <h2 class="ws-title" id="wsHead">Report Financial Cyber-Fraud</h2>
          <p class="ws-subtitle" id="wsSub">No complex forms. Speak naturally, show your payment receipt, or describe the incident.</p>
        </div>

        <div class="ws-action-grid">
          <div class="btn-ws-action" onclick="handleVoiceAction()">
            <span class="icon">🎙️</span>
            <span class="label" id="lblVoice">Tell Raksha</span>
            <span class="sub">Speak in Hindi, Tamil, English, etc.</span>
          </div>

          <label class="btn-ws-action" style="cursor: pointer;">
            <span class="icon">📷</span>
            <span class="label" id="lblImage">Show Transaction</span>
            <span class="sub">Upload UPI payment screenshot</span>
            <input type="file" accept="image/*" style="display: none;" onchange="handleImageAction(event)" />
          </label>
        </div>

        <button class="btn-type-link" onclick="toggleTypeArea()">Type details instead</button>

        <div class="type-container" id="typeArea" style="display: none;">
          <textarea class="narrative-textarea" id="narrativeText" placeholder="e.g. Someone called from electricity desk and made me transfer ₹5,000 via PhonePe from my SBI account..."></textarea>
          <button class="btn-submit-narrative" onclick="submitTypedNarrative()">Understand Incident</button>
        </div>
      </div>

      <!-- PROCESSING -->
      <div id="wsProcessing" style="display: none; text-align: center; padding: 2.5rem 0;">
        <div style="font-size: 2.5rem; animation: spin 1.5s linear infinite; margin-bottom: 0.5rem;">⚡</div>
        <h3 style="font-size: 1.2rem; font-weight: 700;">Reconciling details & sealing evidence...</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Deterministic Multimodal Intake Engine</p>
      </div>

      <!-- MISSING FIELD QUESTION -->
      <div id="wsQuestion" style="display: none; text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">❓</div>
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.5rem;" id="qPromptText">I just need one detail. What is the 12-digit transaction number?</h3>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.25rem;">All other details have been extracted from your statement.</p>

        <div style="display: flex; gap: 0.5rem; max-width: 420px; margin: 0 auto;">
          <input type="text" id="qInputVal" placeholder="e.g. 423456789012" style="flex: 1; padding: 0.75rem; border: 1.5px solid var(--border); border-radius: 8px; outline: none;" />
          <button class="btn-submit-narrative" onclick="submitQuestionAnswer()">Submit</button>
        </div>
      </div>

      <!-- CONFLICT CLARIFICATION -->
      <div id="wsConflict" style="display: none; text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚠️</div>
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.5rem;" id="conflictHead">I found two different amounts. Which is correct?</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; max-width: 440px; margin: 1.5rem auto 0 auto;" id="conflictBtnBox"></div>
      </div>

      <!-- READY FOR REPORT -->
      <div id="wsReady" style="display: none; text-align: center;">
        <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.25rem;">I found this payment.</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Verified against your evidence. Ready to send.</p>

        <div class="details-box">
          <div>
            <div class="dt-label">Amount</div>
            <div class="dt-val dt-amount" id="repAmount">₹5,000</div>
          </div>
          <div>
            <div class="dt-label">Channel</div>
            <div class="dt-val" id="repChannel">UPI (PhonePe)</div>
          </div>
          <div>
            <div class="dt-label">12-Digit UTR / Ref No</div>
            <div class="dt-val" id="repUtr">423456789012</div>
          </div>
          <div>
            <div class="dt-label">Debit Bank</div>
            <div class="dt-val" id="repBank">State Bank of India</div>
          </div>
        </div>

        <button class="btn-send-report" onclick="dispatchEmergencyReport()">🚀 SEND EMERGENCY REPORT</button>
      </div>

      <!-- SUBMITTED & TRACKING -->
      <div id="wsSubmitted" style="display: none; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🛡️</div>
        <h3 style="font-size: 1.6rem; font-weight: 800; color: var(--green); margin-bottom: 0.25rem;">Report Handed Off</h3>
        <p style="color: var(--text-muted); font-size: 0.92rem; margin-bottom: 1.25rem;">
          Report handed off to the simulated 1930 / bank response layer.<br>
          Official Tracking Reference: <strong id="repRefNum" style="color: var(--text);">1930-SYN-XXXXXX</strong>
        </p>

        <div class="timeline-wrap" id="liveTimeline"></div>
        <button class="btn-type-link" style="margin-top: 1.5rem;" onclick="resetToHome()">File another report</button>
      </div>

    </div>
  </section>

  <!-- ========================================================
       HOW IT WORKS SECTION
       ======================================================== -->
  <section class="story-section" id="howItWorks">
    <div class="story-container">
      <div class="section-tag">THE PROTOCOL</div>
      <h2 class="section-heading">You tell us. Raksha does the hard part.</h2>
      <p class="section-sub">From unstructured human distress to cryptographic civic action in seconds.</p>

      <div class="flow-grid">
        <div class="flow-card">
          <div class="flow-num">01</div>
          <div class="flow-title">Understand</div>
          <div class="flow-desc">Voice, images, or text normalized into canonical structured fraud data without manual forms.</div>
        </div>
        <div class="flow-card">
          <div class="flow-num">02</div>
          <div class="flow-title">Verify</div>
          <div class="flow-desc">Deterministic cross-checking extracts UTR, amount, and bank. Contradictions resolved with one simple question.</div>
        </div>
        <div class="flow-card">
          <div class="flow-num">03</div>
          <div class="flow-title">Report</div>
          <div class="flow-desc">Civic Action Protocol (CAP) routes the verified packet to Portal A (1930) and Portal B (Intermediary Banks).</div>
        </div>
        <div class="flow-card">
          <div class="flow-num">04</div>
          <div class="flow-title">Track</div>
          <div class="flow-desc">Real-time status updates flow back across Web, WhatsApp, and Phone from the persistent audit ledger.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ========================================================
       AI AGENT (MCP) SECTION
       ======================================================== -->
  <section class="story-section" id="agentSection" style="background: #fafaf9;">
    <div class="story-container">
      <div class="section-tag">AI-AGENT NATIVE</div>
      <h2 class="section-heading">Government shouldn’t only be built for browsers.</h2>
      <p class="section-sub">Autonomous AI assistants discover and execute emergency civic freeze actions safely over the Model Context Protocol (MCP).</p>

      <div style="background: #1c1917; color: #f0f3fa; border-radius: 16px; padding: 2rem; text-align: left; font-family: var(--mono); font-size: 0.85rem; max-width: 720px; margin: 0 auto; box-shadow: var(--card-shadow-lg);">
        <div style="color: #94a3b8; margin-bottom: 0.5rem;">// Claude / GPT invokes Raksha MCP Tool</div>
        <div style="color: #38bdf8;">raksha_submit_incident({</div>
        <div style="padding-left: 1.5rem; color: #fde047;">incidentId: "RKS-000001",</div>
        <div style="padding-left: 1.5rem; color: #4ade80;">confirmedByCitizen: true</div>
        <div style="color: #38bdf8;">});</div>
        <div style="margin-top: 1rem; color: #94a3b8;">// Output: Dispatched via CAP -> 1930-SYN-XXXXXX</div>
      </div>
    </div>
  </section>

  <!-- DEVELOPER DRAWER -->
  <div id="devDrawer">
    <div class="drawer-header">
      <span class="drawer-title">⚡ RAKSHA DEVELOPER & CAP TRACE</span>
      <button class="btn-close-drawer" onclick="toggleDevDrawer()">×</button>
    </div>

    <div style="margin-bottom: 1rem;">
      <div style="color: #94a3b8; font-size: 0.75rem; text-transform: uppercase;">Active Incident ID</div>
      <div style="font-weight: 700; font-size: 1rem; color: #38bdf8;" id="devIncId">None</div>
    </div>

    <div style="margin-bottom: 1rem;">
      <div style="color: #94a3b8; font-size: 0.75rem; text-transform: uppercase;">Stack Health</div>
      <div style="color: #4ade80; font-weight: 600;">✓ All 8 Services Operational (0.7.0)</div>
    </div>

    <div style="margin-bottom: 1rem;">
      <div style="color: #94a3b8; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.35rem;">Tamper-Evident Event Ledger</div>
      <pre class="json-dump" id="devJsonDump">[]</pre>
    </div>
  </div>

  <script>
    const CORE_URL = "${coreUrl}";
    const CAP_URL = "${capUrl}";

    let currentMode = "call";
    let currentIncidentId = null;
    let currentIncident = null;
    let currentLanguage = "en";
    let isDevOpen = false;

    const MODE_CONFIG = {
      call: {
        badgeClass: "badge-call",
        badgeText: "CALL RAKSHA",
        icon: "📞",
        heading: "Just call.",
        desc: "Talk to Raksha in your language. No forms. No confusion. We’ll understand and guide you.",
        features: [
          { icon: "📞", dotClass: "dot-call", text: "Voice-first support" },
          { icon: "🗣️", dotClass: "dot-call", text: "Works in any language" },
          { icon: "💬", dotClass: "dot-call", text: "Human-like conversation" }
        ],
        artImg: "/images/hero-illustration-call.png"
      },
      whatsapp: {
        badgeClass: "badge-whatsapp",
        badgeText: "WHATSAPP RAKSHA",
        icon: "💬",
        heading: "Just message.",
        desc: "Send a text, photo, or voice note on WhatsApp. We’ll take care of the rest.",
        features: [
          { icon: "📱", dotClass: "dot-whatsapp", text: "Easy for everyone" },
          { icon: "🎙️", dotClass: "dot-whatsapp", text: "Send screenshots or voice" },
          { icon: "🔄", dotClass: "dot-whatsapp", text: "Continue the same case" }
        ],
        artImg: "/images/hero-illustration-whatsapp.png"
      },
      web: {
        badgeClass: "badge-web",
        badgeText: "USE RAKSHA ON WEB",
        icon: "🌐",
        heading: "Just upload.",
        desc: "Upload a screenshot or type what happened. We’ll extract, verify and report.",
        features: [
          { icon: "🔒", dotClass: "dot-web", text: "Secure evidence handling" },
          { icon: "⚡", dotClass: "dot-web", text: "Transaction auto-extraction" },
          { icon: "📄", dotClass: "dot-web", text: "Instant report generation" }
        ],
        artImg: "/images/hero-illustration-web.png"
      }
    };

    function selectMode(mode) {
      currentMode = mode;
      
      // Update Pill Classes
      document.getElementById("pillCall").className = "mode-pill" + (mode === "call" ? " active-call" : "");
      document.getElementById("pillWhatsapp").className = "mode-pill" + (mode === "whatsapp" ? " active-whatsapp" : "");
      document.getElementById("pillWeb").className = "mode-pill" + (mode === "web" ? " active-web" : "");

      // Update Center Art
      const artImg = document.getElementById("heroArtImg");
      artImg.style.opacity = "0";
      setTimeout(() => {
        artImg.src = MODE_CONFIG[mode].artImg;
        artImg.style.opacity = "1";
      }, 150);

      // Update Right Content
      const cfg = MODE_CONFIG[mode];
      const rightEl = document.getElementById("heroRightContent");
      let featsHtml = cfg.features.map(f => \`
        <li class="mode-feature-item">
          <span class="feature-dot \${f.dotClass}">\${f.icon}</span>
          <span>\${f.text}</span>
        </li>
      \`).join("");

      rightEl.innerHTML = \`
        <div class="mode-badge \${cfg.badgeClass}">\${cfg.badgeText}</div>
        <div class="mode-title-row">
          <span class="mode-heading">\${cfg.heading}</span>
        </div>
        <p class="mode-desc">\${cfg.desc}</p>
        <ul class="mode-features">\${featsHtml}</ul>
      \`;
    }

    function switchLanguage(lang) {
      currentLanguage = lang;
      if (lang === "hi") {
        document.getElementById("txtHeroHead").innerHTML = 'बताइए क्या हुआ।<br><span class="orange-accent">बाकी हम संभाल लेंगे।</span>';
        document.getElementById("txtHeroSub").innerText = 'बोलें, स्क्रीनशॉट भेजें या संदेश लिखें। रक्षा इसे तुरंत आपातकालीन रिपोर्ट में बदल देती है।';
        document.getElementById("wsHead").innerText = 'साइबर धोखाधड़ी की रिपोर्ट करें';
        document.getElementById("wsSub").innerText = 'कोई फॉर्म नहीं। अपनी भाषा में बोलें या भुगतान रसीद दिखाएं।';
        document.getElementById("lblVoice").innerText = 'रक्षा से बोलें';
        document.getElementById("lblImage").innerText = 'लेन-देन दिखाएं';
      } else {
        document.getElementById("txtHeroHead").innerHTML = 'Tell us what<br>happened.<br><span class="orange-accent">We’ll handle the rest.</span>';
        document.getElementById("txtHeroSub").innerText = 'Speak, send a screenshot, or message us. Raksha turns it into an emergency report and carries it through the system for you.';
        document.getElementById("wsHead").innerText = 'Report Financial Cyber-Fraud';
        document.getElementById("wsSub").innerText = 'No complex forms. Speak naturally, show your payment receipt, or describe the incident.';
        document.getElementById("lblVoice").innerText = 'Tell Raksha';
        document.getElementById("lblImage").innerText = 'Show Transaction';
      }
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
            source: currentMode === "whatsapp" ? "whatsapp" : (currentMode === "call" ? "phone" : "web"),
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
          btn.className = "btn-ws-action";
          btn.style.padding = "1rem";
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
          div.className = "tl-node";
          div.innerHTML = \`<span class="tl-icon">✓</span><span class="tl-title">\${evt.type}</span><span class="tl-time">\${evt.timestamp.slice(11, 19)}</span>\`;
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

    // Initialize Default Mode (Call)
    selectMode("call");
  </script>
</body>
</html>`;
}
