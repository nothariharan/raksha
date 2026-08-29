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
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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
      --font-display: 'Instrument Serif', Georgia, 'Times New Roman', serif;
      --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --mono: 'IBM Plex Mono', ui-monospace, monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html {
      scroll-behavior: smooth;
    }
    html, body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      ${isSingleScreen ? "height: 100vh; overflow: hidden;" : "min-height: 100vh;"}
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

    @media (max-width: 760px) {
      nav {
        display: flex;
        justify-content: space-between;
        padding: 0.7rem 1.15rem;
      }
      .nav-links { display: none; }
      .nav-actions { gap: 0.55rem; }
      .lang-select { max-width: 116px; }
      .btn-nav-demo { padding: 0.45rem 0.8rem; }
    }

    ${extraStyles}
  </style>
</head>
<body>
  <div class="sim-bar">
    SIMULATED DEMONSTRATION · NO REAL BANK ACCESS
  </div>

  <nav>
    <a href="/" class="brand-link" aria-label="Raksha home"><span class="brand-wordmark">Raksha</span></a>

    <div class="nav-links">
      <a href="/how" class="nav-link ${activeNav === "how" ? "active" : ""}">How it Works</a>
      <a href="/cap" class="nav-link ${activeNav === "cap" ? "active" : ""}">CAP Protocol</a>
      <a href="/agents" class="nav-link ${activeNav === "agents" ? "active" : ""}">For AI Agents</a>
    </div>

    <div class="nav-actions">
      <select class="lang-select" id="langSelect" onchange="window.switchLang && window.switchLang(this.value)">
        <option value="en">English (India)</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="ta">தமிழ் (Tamil)</option>
      </select>

      <a href="/app" class="btn-nav-demo">
        <span>Launch Demo</span>
        <span>→</span>
      </a>
    </div>
  </nav>

  <main>
    ${bodyContent}
  </main>

  ${extraScripts}
</body>
</html>`;
}
