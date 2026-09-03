import { renderPageLayout } from "./layout.js";

export function renderAgentsPageHtml(): string {
  const extraStyles = `
    .agents-shell {
      position: relative;
      background: #fff8f2;
      overflow: hidden;
      min-height: calc(100dvh - 148px);
    }
    .agents-flow-left,
    .agents-flow-right {
      position: absolute;
      pointer-events: none;
      user-select: none;
      z-index: 0;
      opacity: 0.8;
    }
    .agents-flow-left {
      left: 0;
      bottom: 0;
      top: 18%;
      width: min(440px, 34vw);
      height: auto;
      max-height: 82%;
      object-fit: contain;
      object-position: left bottom;
    }
    .agents-flow-right {
      right: 0;
      top: 0;
      width: min(380px, 30vw);
      height: auto;
      max-height: 78%;
      object-fit: contain;
      object-position: right top;
    }
    .agents {
      max-width: 1180px;
      margin: 0 auto;
      padding: clamp(2.6rem, 6vw, 5.5rem) 2rem 5.5rem;
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: clamp(4.5rem, 8vw, 7rem);
    }

    .agents-hero {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.92fr);
      gap: clamp(2.5rem, 5vw, 5rem);
      align-items: center;
    }
    .agents-kicker {
      color: #e8754f;
      font-weight: 600;
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .agents h1 {
      font-size: clamp(2.8rem, 5vw, 4.4rem);
      max-width: 640px;
      margin: 0.7rem 0 0;
      color: #1a1f2c;
    }
    .agents-accent {
      color: #c2410c;
    }
    .agents-diamond-rule {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 1.35rem 0 0.35rem;
      max-width: 420px;
    }
    .agents-diamond-rule::before,
    .agents-diamond-rule::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #e7e5e4;
    }
    .agents-diamond {
      width: 7px;
      height: 7px;
      rotate: 45deg;
      background: #e8754f;
      flex: none;
    }

    .flow-list {
      display: flex;
      flex-direction: column;
    }
    .flow-list article {
      padding: 1.05rem 0;
      border-bottom: 1px solid #efe8e1;
      display: grid;
      grid-template-columns: 42px 1fr;
      gap: 0.95rem;
      align-items: center;
    }
    .flow-list article:last-child { border-bottom: 0; }
    .flow-ico {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: grid;
      place-items: center;
    }
    .flow-ico svg { width: 16px; height: 16px; }
    .flow-ico-blue { background: #dbeafe; color: #2563eb; }
    .flow-ico-orange { background: #ffedd5; color: #ea580c; }
    .flow-ico-green { background: #dcfce7; color: #16a34a; }
    .flow-ico-purple { background: #ede9fe; color: #7c3aed; }
    .flow-list h2 {
      font-size: 0.98rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: #1c1917;
    }

    .agent-code {
      background: #ffffff;
      border: 1px solid #ece7e1;
      border-radius: 18px;
      padding: clamp(1.35rem, 3vw, 1.9rem);
      color: #44403c;
      box-shadow: 0 18px 40px -20px rgba(28, 25, 23, 0.18);
      font-family: var(--mono);
      font-size: 0.78rem;
      line-height: 1.85;
      overflow: auto;
    }
    .agent-code .dim { color: #a8a29e; }
    .agent-code .key { color: #2563eb; }
    .agent-code .str { color: #15803d; }
    .agent-code .bool { color: #c2410c; }

    .agents-rule {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr);
      gap: clamp(1.5rem, 3vw, 2.75rem);
      align-items: center;
      position: relative;
      overflow: hidden;
      padding: clamp(1.8rem, 3.4vw, 2.6rem) clamp(1.7rem, 3.2vw, 2.5rem);
      background:
        radial-gradient(120% 90% at 8% 0%, #fff4ea 0%, transparent 55%),
        linear-gradient(160deg, #fff4ea 0%, #ffe8d6 46%, #ffd9be 100%);
      border: 1px solid rgba(234, 88, 12, 0.16);
      border-radius: 24px;
      box-shadow: 0 12px 32px -8px rgba(234, 88, 12, 0.1);
    }
    .agents-rule-art {
      position: absolute;
      right: -2%;
      bottom: -10%;
      width: min(280px, 36%);
      height: auto;
      opacity: 0.28;
      pointer-events: none;
      user-select: none;
      z-index: 0;
    }
    .agents-rule > *:not(.agents-rule-art) {
      position: relative;
      z-index: 1;
    }
    .agents-rule-mark {
      width: 72px;
      height: 72px;
      display: grid;
      place-items: center;
      margin-bottom: 1rem;
    }
    .agents-rule-mark img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .agents-rule h2 {
      font-family: var(--font-display);
      font-weight: 400;
      letter-spacing: -0.035em;
      line-height: 0.96;
      font-size: clamp(2.2rem, 4vw, 3.2rem);
      color: #1a1f2c;
      max-width: 14ch;
    }
    .agents-rule-copy {
      color: #78716c;
      font-size: 1rem;
      line-height: 1.65;
      max-width: 42ch;
    }
    .agents-rule-spine {
      align-self: stretch;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
    }
    .agents-rule-spine::before,
    .agents-rule-spine::after {
      content: "";
      width: 1px;
      flex: 1;
      background: #f0d9c8;
    }
    .agents-rule-lock {
      margin-top: 1.4rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.95rem 1.1rem;
      border: 1px solid #e7e5e4;
      border-radius: 16px;
      background: #ffffff;
    }
    .agents-rule-lock-ico {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #fff7ed;
      color: #ea580c;
      display: grid;
      place-items: center;
      flex: none;
    }
    .agents-rule-lock-ico svg { width: 15px; height: 15px; }
    .agents-rule-lock strong {
      display: block;
      font-size: 0.92rem;
      color: #1c1917;
    }
    .agents-rule-lock span {
      display: block;
      margin-top: 0.15rem;
      font-size: 0.68rem;
      letter-spacing: 0.08em;
      font-weight: 600;
      color: #a8a29e;
    }
    .agents-rule-sun {
      margin-left: auto;
      width: 28px;
      height: 28px;
      opacity: 0.85;
      flex: none;
    }
    .agents-rule-sun img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    @media (max-width: 1100px) {
      .agents-flow-left,
      .agents-flow-right { display: none; }
    }
    @media (max-width: 860px) {
      .agents { padding: 2.4rem 1.2rem 3.5rem; gap: 3.2rem; }
      .agents-hero { grid-template-columns: 1fr; gap: 2rem; }
      .agents-rule { grid-template-columns: 1fr; gap: 1.6rem; padding: 1.5rem 1.25rem; }
      .agents-rule-spine { display: none; }
      .agents-rule-art { opacity: 0.16; }
    }
  `;

  const icoDiscover = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/></svg>`;
  const icoBuild = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="10" height="10" rx="1.5"/><rect x="11" y="11" width="10" height="10" rx="1.5"/></svg>`;
  const icoConfirm = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 5 6v6c0 4.2 2.8 8 7 9 4.2-1 7-4.8 7-9V6l-7-3z"/><path d="m9 12 2 2 4-4"/></svg>`;
  const icoAudit = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 4v16M12 8v12M16 6v14"/></svg>`;
  const icoLock = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;

  const bodyContent = `
    <div class="agents-shell">
      <img class="agents-flow-left" src="/images/line/agents-flow-veena.png" alt="" aria-hidden="true" />
      <img class="agents-flow-right" src="/images/line/agents-flow-shankha.png" alt="" aria-hidden="true" />

      <main class="agents">
        <header class="agents-hero">
          <div>
            <span class="agents-kicker">FOR AI AGENTS</span>
            <h1>Public service actions need a <span class="agents-accent">real interface.</span></h1>
            <div class="agents-diamond-rule" aria-hidden="true"><span class="agents-diamond"></span></div>
            <div class="flow-list">
              <article>
                <div class="flow-ico flow-ico-blue">${icoDiscover}</div>
                <h2>Discover capabilities</h2>
              </article>
              <article>
                <div class="flow-ico flow-ico-orange">${icoBuild}</div>
                <h2>Build a case carefully</h2>
              </article>
              <article>
                <div class="flow-ico flow-ico-green">${icoConfirm}</div>
                <h2>Require citizen confirmation</h2>
              </article>
              <article>
                <div class="flow-ico flow-ico-purple">${icoAudit}</div>
                <h2>Return an auditable result</h2>
              </article>
            </div>
          </div>

          <pre class="agent-code"><span class="dim">POST /mcp</span>
{
  <span class="key">"method"</span>: <span class="str">"tools/call"</span>,
  <span class="key">"params"</span>: {
    <span class="key">"name"</span>: <span class="str">"raksha_submit_incident"</span>,
    <span class="key">"arguments"</span>: { <span class="key">"confirmedByCitizen"</span>: <span class="bool">true</span> }
  }
}</pre>
        </header>

        <section class="agents-rule">
          <img class="agents-rule-art" src="/images/line/service-1930.png" alt="" aria-hidden="true" />
          <div>
            <div class="agents-rule-mark">
              <img src="/images/line/agents-shield-spiral.png" alt="" />
            </div>
            <h2>One safety rule is <span class="agents-accent">non-negotiable.</span></h2>
          </div>
          <div class="agents-rule-spine" aria-hidden="true"><span class="agents-diamond"></span></div>
          <div>
            <p class="agents-rule-copy">Agents can collect, clarify, and prepare. They may only submit when the citizen has explicitly confirmed the verified report.</p>
            <div class="agents-diamond-rule" aria-hidden="true"><span class="agents-diamond"></span></div>
            <div class="agents-rule-lock">
              <div class="agents-rule-lock-ico">${icoLock}</div>
              <div>
                <strong>Citizen confirmation required</strong>
                <span>HIGH-RISK ACTIONS ARE LOCKED</span>
              </div>
              <div class="agents-rule-sun">
                <img src="/images/line/how-kicker-sun.png" alt="" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;

  return renderPageLayout({
    title: "Raksha for AI agents",
    activeNav: "agents",
    bodyContent,
    extraStyles,
  });
}
