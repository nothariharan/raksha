/**
 * /agents — For AI Agents
 * Explanation and developer contract for Model Context Protocol (MCP) & autonomous tools.
 */

import { renderPageLayout } from "./layout.js";

export function renderAgentsPageHtml(): string {
  const extraStyles = `
    .page-container {
      max-width: 980px;
      margin: 0 auto;
      padding: 4rem 2rem;
    }
    .page-tag {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--blue);
      margin-bottom: 0.5rem;
    }
    .page-title {
      font-size: 2.8rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 1rem;
    }
    .page-lead {
      font-size: 1.15rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 3rem;
      max-width: 740px;
    }

    .code-box {
      background: #12151f;
      border: 1px solid #23293d;
      border-radius: 16px;
      padding: 1.75rem;
      color: #f0f3fa;
      font-family: var(--mono);
      font-size: 0.85rem;
      line-height: 1.6;
      margin-bottom: 2.5rem;
      box-shadow: var(--card-shadow-lg);
      overflow-x: auto;
    }
    .code-comment { color: #94a3b8; }
    .code-fn { color: #38bdf8; font-weight: 700; }
    .code-prop { color: #fde047; }
    .code-val { color: #4ade80; }

    .tool-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .tool-card {
      background: var(--bg-white);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.5rem;
      box-shadow: var(--card-shadow);
    }
    .tool-card h4 {
      font-family: var(--mono);
      font-size: 0.95rem;
      color: var(--blue);
      margin-bottom: 0.4rem;
    }
    .tool-card p {
      color: var(--text-muted);
      font-size: 0.88rem;
      line-height: 1.5;
    }
  `;

  const bodyContent = `
    <div class="page-container">
      <div class="page-tag">AGENT-NATIVE PUBLIC SERVICES</div>
      <h1 class="page-title">Government shouldn’t only be<br>built for human browsers.</h1>
      <p class="page-lead">
        When a citizen’s AI agent (running in Claude, ChatGPT, Siri, or an on-device assistant) notices fraudulent transactions or unauthorized debits, it shouldn’t try to fill out CAPTCHAs and forms. Raksha exposes typed Model Context Protocol (MCP) primitives to report and freeze incidents safely.
      </p>

      <div class="code-box">
        <div class="code-comment">// 1. Autonomous Agent discovers Raksha MCP Server at http://localhost:3007/mcp</div>
        <div>{</div>
        <div style="padding-left: 1.5rem;"><span class="code-prop">"jsonrpc"</span>: <span class="code-val">"2.0"</span>, <span class="code-prop">"id"</span>: 1,</div>
        <div style="padding-left: 1.5rem;"><span class="code-prop">"method"</span>: <span class="code-val">"tools/call"</span>,</div>
        <div style="padding-left: 1.5rem;"><span class="code-prop">"params"</span>: {</div>
        <div style="padding-left: 3rem;"><span class="code-prop">"name"</span>: <span class="code-val">"raksha_submit_incident"</span>,</div>
        <div style="padding-left: 3rem;"><span class="code-prop">"arguments"</span>: {</div>
        <div style="padding-left: 4.5rem;"><span class="code-prop">"incidentId"</span>: <span class="code-val">"RKS-000001"</span>,</div>
        <div style="padding-left: 4.5rem;"><span class="code-prop">"confirmedByCitizen"</span>: <span class="code-val">true</span></div>
        <div style="padding-left: 3rem;">}</div>
        <div style="padding-left: 1.5rem;">}</div>
        <div>}</div>
        <div class="code-comment" style="margin-top: 1rem;">// 2. Verified Response Handed Off to CAP Network</div>
        <div style="color: #4ade80;">// → Official Reference: 1930-SYN-XXXXXX (Lien Initiated)</div>
      </div>

      <div class="tool-grid">
        <div class="tool-card">
          <h4>raksha_process_intake</h4>
          <p>Feeds natural language distress messages, audio transcripts, or OCR text to create an incident candidate.</p>
        </div>
        <div class="tool-card">
          <h4>raksha_submit_incident</h4>
          <p>Dispatches a confirmed incident packet to 1930 and intermediary banks with full idempotency.</p>
        </div>
        <div class="tool-card">
          <h4>raksha_get_status</h4>
          <p>Inspects live downstream case status, lien status, and tamper-evident event logs.</p>
        </div>
        <div class="tool-card">
          <h4>raksha_answer_clarification</h4>
          <p>Provides single-field answers (e.g. missing 12-digit UTR) to advance a pending incident.</p>
        </div>
      </div>
    </div>
  `;

  return renderPageLayout({
    title: "For AI Agents (MCP)",
    activeNav: "agents",
    bodyContent,
    extraStyles,
  });
}
