/**
 * Shared HTML shell, header, and typography for Raksha Web
 */

export function renderPageLayout(options: {
  title: string;
  activeNav?: "how" | "cap" | "agents" | "demo";
  bodyContent: string;
  extraStyles?: string;
  extraScripts?: string;
  isSingleScreen?: boolean;
}): string {
  const { title, activeNav, bodyContent, extraStyles = "", extraScripts = "", isSingleScreen = false } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Raksha</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Geist:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@400;600&family=Noto+Serif+Tamil:wght@400;600&display=swap" rel="stylesheet">
  <link href="https://fonts.cdnfonts.com/css/samarkan" rel="stylesheet">
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
      --font-display: "Instrument Serif", Georgia, "Times New Roman", serif;
      --font: "Geist", ui-sans-serif, system-ui, sans-serif;
      --mono: "Geist Mono", ui-monospace, monospace;
    }
    html[lang="hi"] {
      --font-display: "Instrument Serif", "Noto Serif Devanagari", serif;
      --font: "Geist", "Noto Sans Devanagari", ui-sans-serif, sans-serif;
    }
    html[lang="ta"] {
      --font-display: "Instrument Serif", "Noto Serif Tamil", serif;
      --font: "Geist", "Noto Sans Tamil", ui-sans-serif, sans-serif;
    }
    html[lang="hi"] .hero-copy h1,
    html[lang="ta"] .hero-copy h1,
    html[lang="hi"] .mode-detail h2,
    html[lang="ta"] .mode-detail h2,
    html[lang="hi"] .how-title,
    html[lang="ta"] .how-title,
    html[lang="hi"] .channels-title,
    html[lang="ta"] .channels-title,
    html[lang="hi"] .agents h1,
    html[lang="ta"] .agents h1,
    html[lang="hi"] .agents-rule h2,
    html[lang="ta"] .agents-rule h2,
    html[lang="hi"] .type-display,
    html[lang="ta"] .type-display,
    html[lang="hi"] .cap-hero-title,
    html[lang="ta"] .cap-hero-title {
      letter-spacing: 0;
      line-height: 1.28;
      overflow-wrap: anywhere;
    }

    .has-side-rails {
      position: relative;
    }
    .side-rails {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }
    .side-rail {
      position: absolute;
      top: 50%;
      width: min(220px, 15vw);
      height: auto;
      max-height: 82%;
      object-fit: contain;
      object-position: left center;
      opacity: 0.7;
      user-select: none;
    }
    .side-rail-left {
      left: calc(50% - 50vw + 8px);
      transform: translateY(-50%);
    }
    .side-rail-right {
      right: calc(50% - 50vw + 8px);
      transform: translateY(-50%) scaleX(-1);
      object-position: left center;
    }
    @media (max-width: 1100px) {
      .side-rails { display: none; }
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html {
      scroll-behavior: smooth;
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }
    html, body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font);
      font-size: 16px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      overflow-x: clip;
      ${isSingleScreen ? "height: 100dvh; overflow: hidden;" : "min-height: 100dvh;"}
    }
    body {
      padding-left: env(safe-area-inset-left, 0px);
      padding-right: env(safe-area-inset-right, 0px);
    }
    :focus-visible {
      outline: 2px solid var(--orange);
      outline-offset: 3px;
    }

    /* Simulation Bar */
    .sim-bar {
      background: #fef3c7;
      border-bottom: 1px solid #fde68a;
      color: #92400e;
      font-size: 0.74rem;
      padding: 0.25rem 1rem;
      text-align: center;
      font-family: var(--mono);
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    /* Navbar */
    nav {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      padding: 0.75rem clamp(1.5rem, 3.5vw, 3.5rem);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .brand-link {
      display: flex;
      align-items: center;
      justify-self: start;
      text-decoration: none;
    }
    .brand-wordmark { color: var(--text); font-family: 'Samarkan', 'Palatino Linotype', serif; font-size: 2rem; line-height: 1; letter-spacing: .025em; }

    .nav-links {
      display: flex;
      align-items: center;
      justify-self: center;
      gap: 2.2rem;
      font-size: 0.88rem;
      font-weight: 500;
    }
    .nav-link {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s;
      padding: 0.4rem 0;
      position: relative;
    }
    .nav-link:hover { color: var(--text); }
    .nav-link.active {
      color: var(--text);
      font-weight: 700;
    }
    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 0;
      right: 0;
      height: 2.5px;
      background: var(--orange);
      border-radius: 99px;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      justify-self: end;
      gap: 1rem;
    }

    .lang-select {
      background: var(--bg);
      border: 1px solid var(--border);
      padding: 0.35rem 0.65rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--text);
      outline: none;
      cursor: pointer;
    }

    .btn-nav-demo {
      background: #1c1917;
      color: #ffffff;
      border: none;
      padding: 0.45rem 1.1rem;
      border-radius: 9999px;
      font-size: 0.84rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: background 0.15s;
    }
    .btn-nav-demo:hover { background: #292524; }

    .nav-toggle {
      display: none;
      width: 42px;
      height: 42px;
      padding: 0;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: #fff;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 5px;
    }
    .nav-toggle span {
      display: block;
      width: 16px;
      height: 1.5px;
      background: var(--text);
      border-radius: 99px;
    }
    nav.is-open .nav-toggle span:first-child { transform: translateY(3.25px) rotate(40deg); }
    nav.is-open .nav-toggle span:last-child { transform: translateY(-3.25px) rotate(-40deg); }

    @media (max-width: 860px) {
      .sim-bar {
        font-size: 0.62rem;
        padding: 0.35rem max(0.7rem, env(safe-area-inset-right, 0px)) 0.35rem max(0.7rem, env(safe-area-inset-left, 0px));
        line-height: 1.35;
      }
      nav {
        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
        column-gap: 0.5rem;
        row-gap: 0;
        padding: 0.45rem max(1rem, env(safe-area-inset-right, 0px)) 0.45rem max(1rem, env(safe-area-inset-left, 0px));
        min-height: 58px;
      }
      .nav-actions { display: contents; }
      .brand-link { grid-column: 1; grid-row: 1; }
      .btn-nav-demo {
        grid-column: 2;
        grid-row: 1;
        padding: 0.42rem 0.8rem;
        font-size: 0.76rem;
        white-space: nowrap;
        min-height: 38px;
      }
      .nav-toggle { display: inline-flex; grid-column: 3; grid-row: 1; }
      .nav-links,
      .lang-select { display: none; }
      nav.is-open .nav-links {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        grid-column: 1 / -1;
        grid-row: 2;
        gap: 0;
        width: 100%;
        padding: 0.35rem 0 0.15rem;
        white-space: normal;
        overflow: visible;
      }
      nav.is-open .lang-select {
        display: block;
        grid-column: 1 / -1;
        grid-row: 3;
        max-width: none;
        width: 100%;
        margin: 0.35rem 0 0.55rem;
        font-size: 0.86rem;
        padding: 0.55rem 0.7rem;
      }
      .nav-link {
        padding: 0.72rem 0;
        font-size: 0.95rem;
        border-bottom: 1px solid var(--border-subtle);
      }
      .nav-link.active::after { display: none; }
      .nav-link.active { color: var(--orange); }
      .brand-wordmark { font-size: 1.7rem; }
    }

    .type-display,
    .hero-copy h1,
    .cap-hero-title,
    .how-title,
    .channels-title,
    .agents h1,
    .mode-detail h2,
    .banner-heading {
      font-family: var(--font-display);
      font-weight: 400;
      font-style: normal;
      letter-spacing: -0.035em;
      line-height: 1.08;
      text-wrap: balance;
      overflow-wrap: break-word;
    }

    ${extraStyles}
  </style>
</head>
<body>
  <div class="sim-bar" id="simBar">
    SIMULATED DEMONSTRATION · NO REAL BANK ACCESS
  </div>

  <nav>
    <a href="/" class="brand-link" aria-label="Raksha home"><span class="brand-wordmark">Raksha</span></a>

    <div class="nav-links" id="navLinks">
      <a href="/how" class="nav-link ${activeNav === "how" ? "active" : ""}" id="navHow">How it Works</a>
      <a href="/cap" class="nav-link ${activeNav === "cap" ? "active" : ""}" id="navCap">CAP Protocol</a>
      <a href="/agents" class="nav-link ${activeNav === "agents" ? "active" : ""}" id="navAgents">For AI Agents</a>
    </div>

    <div class="nav-actions">
      <select class="lang-select" id="langSelect" onchange="window.switchLang && window.switchLang(this.value)">
        <option value="en">English (India)</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="ta">தமிழ் (Tamil)</option>
      </select>

      <a href="/app" class="btn-nav-demo">
        <span id="navDemoLabel">Launch Demo</span>
        <span>→</span>
      </a>
      <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="navLinks" aria-label="Open menu">
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>

  <main>
    ${bodyContent}
  </main>

  ${extraScripts}
  <script>
    (function () {
      // Wake protocol via same-origin /health (Vercel rewrite → Render).
      // Direct *.onrender.com fetches are often blocked by ad blockers (ERR_BLOCKED_BY_CLIENT).
      var host = location.hostname;
      if (host === "localhost" || host === "127.0.0.1") return;
      fetch("/health", { mode: "cors", cache: "no-store", keepalive: true }).catch(function () {});
    })();
  </script>
  <script>
    (function () {
      var chrome = {
        en: { sim: "SIMULATED DEMONSTRATION · NO REAL BANK ACCESS", how: "How it Works", cap: "CAP Protocol", agents: "For AI Agents", demo: "Launch Demo" },
        hi: { sim: "अनुकरण प्रदर्शन · कोई वास्तविक बैंक पहुँच नहीं", how: "यह कैसे काम करता है", cap: "CAP प्रोटोकॉल", agents: "AI एजेंटों के लिए", demo: "डेमो शुरू करें" },
        ta: { sim: "உருவக செயல்விளக்கம் · உண்மையான வங்கி அணுகல் இல்லை", how: "இது எப்படி வேலை செய்கிறது", cap: "CAP நெறிமுறை", agents: "AI முகவர்களுக்கு", demo: "டெமோவைத் தொடங்கு" }
      };
      window.applyDocumentLang = function (lang) {
        var code = lang === "hi" ? "hi" : lang === "ta" ? "ta" : "en";
        document.documentElement.lang = code;
        try { localStorage.setItem("raksha-lang", code); } catch (e) {}
        var t = chrome[code] || chrome.en;
        var sim = document.getElementById("simBar");
        var how = document.getElementById("navHow");
        var cap = document.getElementById("navCap");
        var agents = document.getElementById("navAgents");
        var demo = document.getElementById("navDemoLabel");
        if (sim) sim.textContent = t.sim;
        if (how) how.textContent = t.how;
        if (cap) cap.textContent = t.cap;
        if (agents) agents.textContent = t.agents;
        if (demo) demo.textContent = t.demo;
      };
      var pageSwitch = window.switchLang;
      window.switchLang = function (lang) {
        window.applyDocumentLang(lang);
        if (typeof pageSwitch === "function") pageSwitch(lang);
      };
      var lang = "en";
      try { lang = localStorage.getItem("raksha-lang") || "en"; } catch (e) {}
      var sel = document.getElementById("langSelect");
      if (sel) sel.value = lang;
      window.switchLang(lang);

      var nav = document.querySelector("nav");
      var toggle = document.getElementById("navToggle");
      if (nav && toggle) {
        toggle.addEventListener("click", function () {
          var open = nav.classList.toggle("is-open");
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
          toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        });
        nav.querySelectorAll(".nav-link").forEach(function (link) {
          link.addEventListener("click", function () {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open menu");
          });
        });
      }
    })();
  </script>
</body>
</html>`;
}
