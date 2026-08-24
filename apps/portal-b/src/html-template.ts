/**
 * Portal B — Operational Financial response console UI template.
 * Visual language: dark-mode SOC/SIEM style command center.
 */

export function renderPortalBHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FI Response Console — Portal B (Synthetic)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --panel: #111827;
      --panel-glass: rgba(17, 24, 39, 0.7);
      --border: rgba(255, 255, 255, 0.08);
      --border-glow: rgba(0, 242, 254, 0.15);
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      
      /* Neon Accents */
      --cyan: #00f2fe;
      --blue: #4f46e5;
      --emerald: #10b981;
      --amber: #f59e0b;
      --rose: #f43f5e;
    }
    
    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
    }
    
    body {
      font-family: 'Outfit', sans-serif;
      background-color: var(--bg);
      background-image: 
        radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(0, 242, 254, 0.12) 0px, transparent 50%);
      background-attachment: fixed;
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .glow-header {
      border-bottom: 1px solid var(--border);
      background: var(--panel-glass);
      backdrop-filter: blur(12px);
      padding: 1.25rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .logo-area {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .logo-badge {
      background: linear-gradient(135deg, var(--blue), var(--cyan));
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #fff;
      box-shadow: 0 0 15px rgba(0, 242, 254, 0.4);
    }
    
    .logo-text h1 {
      font-size: 1.15rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      background: linear-gradient(to right, #fff, #9ca3af);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .logo-text p {
      font-size: 0.7rem;
      color: var(--cyan);
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-top: 0.1rem;
    }
    
    nav {
      display: flex;
      gap: 1rem;
    }
    
    nav a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }
    
    nav a:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }
    
    nav a.active {
      color: var(--cyan);
      background: rgba(0, 242, 254, 0.05);
      border-color: rgba(0, 242, 254, 0.2);
      box-shadow: 0 0 10px rgba(0, 242, 254, 0.05);
    }
    
    main {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .banner {
      background: linear-gradient(90deg, rgba(79, 70, 229, 0.15), rgba(0, 242, 254, 0.15));
      border: 1px solid rgba(0, 242, 254, 0.25);
      border-radius: 8px;
      padding: 0.85rem 1.25rem;
      font-size: 0.85rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .banner-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--cyan);
      box-shadow: 0 0 8px var(--cyan);
      animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.5; }
      50% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.5; }
    }
    
    .card {
      background: var(--panel-glass);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }
    
    .card:hover {
      border-color: rgba(0, 242, 254, 0.2);
      box-shadow: 0 0 20px var(--border-glow);
    }
    
    h2 {
      font-size: 1.2rem;
      font-weight: 500;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .table-container {
      overflow-x: auto;
      margin-top: 1rem;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      text-align: left;
    }
    
    th, td {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
    }
    
    th {
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      background: rgba(255, 255, 255, 0.02);
    }
    
    tr:hover td {
      background: rgba(255, 255, 255, 0.01);
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.6rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .badge-new { background: rgba(0, 242, 254, 0.1); color: var(--cyan); border: 1px solid rgba(0, 242, 254, 0.2); }
    .badge-reviewing { background: rgba(245, 158, 11, 0.1); color: var(--amber); border: 1px solid rgba(245, 158, 11, 0.2); }
    .badge-verified { background: rgba(79, 70, 229, 0.1); color: #818cf8; border: 1px solid rgba(79, 70, 229, 0.2); }
    .badge-response { background: rgba(16, 185, 129, 0.1); color: var(--emerald); border: 1px solid rgba(16, 185, 129, 0.2); }
    .badge-acknowledged { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
    
    .status-badge {
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 500;
    }
    .status-pending { background: rgba(245, 158, 11, 0.1); color: var(--amber); }
    .status-lien { background: rgba(16, 185, 129, 0.1); color: var(--emerald); }
    .status-frozen { background: rgba(244, 63, 94, 0.1); color: var(--rose); }
    
    button {
      background: linear-gradient(135deg, var(--blue), var(--cyan));
      color: #fff;
      border: 0;
      border-radius: 6px;
      padding: 0.55rem 1.1rem;
      font-weight: 500;
      font-size: 0.85rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }
    
    button:hover {
      box-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
      transform: translateY(-1px);
    }
    
    button.secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
      color: var(--text);
    }
    
    button.secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      box-shadow: none;
    }
    
    button.action-btn {
      padding: 0.4rem 0.8rem;
      font-size: 0.75rem;
    }
    
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    
    @media (max-width: 800px) {
      .grid { grid-template-columns: 1fr; }
    }
    
    .dl {
      display: grid;
      grid-template-columns: 180px 1fr;
      gap: 0.75rem 1rem;
      font-size: 0.9rem;
    }
    
    .dl dt {
      color: var(--text-muted);
      font-weight: 400;
    }
    
    .dl dd {
      color: var(--text);
      font-weight: 500;
    }
    
    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
    }
    
    .sync-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .actions-panel {
      margin-top: 1.5rem;
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
  </style>
</head>
<body>
  <div class="glow-header">
    <div class="logo-area">
      <div class="logo-badge">FI</div>
      <div class="logo-text">
        <h1>FINANCIAL RESPONSE CONSOLE</h1>
        <p>Portal B · Operational Node · CAP Connected</p>
      </div>
    </div>
    <nav>
      <a href="/" data-nav>Alert Dashboard</a>
      <a href="/incidents" data-nav>Review Alerts</a>
    </nav>
  </div>
  <main>
    <div class="banner">
      <div class="banner-dot"></div>
      <div>
        <strong>System Active</strong> · Connected via CAP. Subscribed to <code>incident.accepted</code> events.
      </div>
    </div>
    <div id="app">Loading…</div>
  </main>
  
  <script>
    const app = document.getElementById("app");

    function navHighlight() {
      const path = location.pathname;
      document.querySelectorAll("[data-nav]").forEach((a) => {
        const href = a.getAttribute("href");
        a.classList.toggle("active", href === path || (href === "/" && path === "/"));
      });
    }

    async function api(path, options) {
      const res = await fetch(path, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      return data;
    }

    function getLifecycleBadge(lifecycle) {
      const normalized = String(lifecycle).toUpperCase();
      switch (normalized) {
        case 'NEW': return '<span class="badge badge-new">NEW</span>';
        case 'REVIEWING': return '<span class="badge badge-reviewing">REVIEWING</span>';
        case 'VERIFIED': return '<span class="badge badge-verified">VERIFIED</span>';
        case 'RESPONSE_INITIATED': return '<span class="badge badge-response">RESP_INIT</span>';
        case 'ACKNOWLEDGED': return '<span class="badge badge-acknowledged">ACKNOWLEDGED</span>';
        default: return '<span class="badge">' + lifecycle + '</span>';
      }
    }

    function getStatusBadge(status) {
      const normalized = String(status).toUpperCase();
      switch (normalized) {
        case 'PENDING_REVIEW': return '<span class="status-badge status-pending">PENDING REVIEW</span>';
        case 'LIEN_MARKED': return '<span class="status-badge status-lien">LIEN MARKED</span>';
        case 'ACCOUNT_FROZEN': return '<span class="status-badge status-frozen">ACCOUNT FROZEN</span>';
        default: return '<span class="status-badge">' + status + '</span>';
      }
    }

    function dashboard(alerts) {
      return \`
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h2>Operational Alert Center</h2>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Review and process incoming directives received via the CAP Event stream.</p>
            </div>
            <button id="pollBtn" class="secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              Sync CAP events
            </button>
          </div>
        </div>
        <div class="card">
          <h2>Active Directives</h2>
          \${alerts.length === 0 ? "<p style='color: var(--text-muted); font-size: 0.9rem;'>No active alerts. When Portal A emits incident.accepted, Portal B auto-populates here.</p>" : \`
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>CAP Case ID</th>
                    <th>Ext Reference</th>
                    <th>Received At</th>
                    <th>Category</th>
                    <th>Lifecycle</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  \${alerts.map((a) => \`
                    <tr>
                      <td class="mono"><a href="/incidents/\${a.caseId}" style="color: var(--cyan); text-decoration: none;">\${a.caseId}</a></td>
                      <td class="mono">\${a.externalReference}</td>
                      <td>\${new Date(a.receivedAt).toLocaleTimeString()}</td>
                      <td>Financial Cyber Fraud</td>
                      <td>\${getLifecycleBadge(a.lifecycle)}</td>
                      <td>\${getStatusBadge(a.status)}</td>
                      <td>
                        <button class="secondary action-btn" data-detail="\${a.caseId}">Inspect</button>
                      </td>
                    </tr>\`).join("")}
                </tbody>
              </table>
            </div>
          \`}
        </div>\`;
    }

    function caseDetail(alert) {
      return \`
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2>Case Acknowledgment & Response Console</h2>
            <button class="secondary" onclick="history.back()">Back to List</button>
          </div>
          
          <div class="grid">
            <div>
              <h3 style="font-size: 1rem; margin-bottom: 0.75rem; color: var(--cyan);">ALERT TELEMETRY</h3>
              <dl class="dl">
                <dt>CAP Case ID</dt>
                <dd class="mono">\${alert.caseId}</dd>
                
                <dt>Incident reference ID</dt>
                <dd class="mono">\${alert.incidentId}</dd>
                
                <dt>External Reference</dt>
                <dd class="mono">\${alert.externalReference}</dd>
                
                <dt>Ingestion Timestamp</dt>
                <dd>\${new Date(alert.receivedAt).toLocaleString()}</dd>
                
                <dt>Operational Status</dt>
                <dd>\${getStatusBadge(alert.status)}</dd>
                
                <dt>Lifecycle Stage</dt>
                <dd>\${getLifecycleBadge(alert.lifecycle)}</dd>
              </dl>
            </div>
            
            <div>
              <h3 style="font-size: 1rem; margin-bottom: 0.75rem; color: var(--cyan);">LIFECYCLE CONTROL</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">
                FI operators must verify the transaction record and log response actions to CAP.
              </p>
              
              <div class="actions-panel">
                <button id="advanceBtn" class="secondary" \${alert.lifecycle === 'ACKNOWLEDGED' ? 'disabled' : ''}>
                  Advance Lifecycle
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>Execute CAP Response Actions</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
            Submits the <code>acknowledge_response</code> action back to the CAP SDK core client.
          </p>
          
          <form id="actionForm">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-muted);">FI Operator Node</label>
                <input id="responderInstitution" style="background: rgba(0,0,0,0.2); border: 1px solid var(--border); color: #fff; padding: 0.5rem; width: 100%; border-radius: 4px;" value="State Bank of India (Internal Unit)" required />
              </div>
              
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-muted);">Action Directive</label>
                <select id="actionTaken" style="background: #1f2937; border: 1px solid var(--border); color: #fff; padding: 0.5rem; width: 100%; border-radius: 4px;">
                  <option value="LIEN_MARKED">LIEN_MARKED (Hold Funds)</option>
                  <option value="ACCOUNT_FROZEN">ACCOUNT_FROZEN (Block Account)</option>
                  <option value="TRANSACTION_TRACED">TRANSACTION_TRACED (Trace Outflow)</option>
                  <option value="FLAGGED_FOR_REVIEW">FLAGGED_FOR_REVIEW (Audit Queue)</option>
                </select>
              </div>
            </div>
            
            <div style="margin-top: 1rem;">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.4rem; color: var(--text-muted);">Audit Notes / Logs</label>
              <textarea id="operatorNotes" style="background: rgba(0,0,0,0.2); border: 1px solid var(--border); color: #fff; padding: 0.5rem; width: 100%; min-height: 80px; border-radius: 4px;" placeholder="Lien/Freeze response logged under cyber alert protocol."></textarea>
            </div>
            
            <div style="margin-top: 1rem;">
              <button type="submit">Submit CAP Acknowledgment</button>
            </div>
          </form>
          <div id="formResult" style="margin-top: 1rem;"></div>
        </div>\`;
    }

    async function render() {
      navHighlight();
      const path = location.pathname;
      try {
        if (path === "/" || path === "/incidents" || path === "") {
          const { alerts } = await api("/portal-b/alerts");
          app.innerHTML = dashboard(alerts);
          
          document.getElementById("pollBtn")?.addEventListener("click", async () => {
            const btn = document.getElementById("pollBtn");
            btn.disabled = true;
            btn.innerText = "Syncing...";
            try {
              const res = await api("/portal-b/alerts/poll", { method: "POST" });
              app.innerHTML = dashboard(res.alerts);
            } catch (err) {
              alert(err.message);
            } finally {
              render();
            }
          });

          document.querySelectorAll("[data-detail]").forEach((btn) => {
            btn.addEventListener("click", () => {
              const id = btn.getAttribute("data-detail");
              history.pushState({}, "", "/incidents/" + id);
              render();
            });
          });
          return;
        }

        const m = path.match(/^\\/incidents\\/([^/]+)$/);
        if (!m) {
          app.innerHTML = "<p>Not found.</p>";
          return;
        }
        
        const caseId = m[1];
        const data = await api("/portal-b/alerts/" + caseId);
        app.innerHTML = caseDetail(data.alert);

        document.getElementById("advanceBtn")?.addEventListener("click", async () => {
          try {
            const res = await api("/portal-b/alerts/" + caseId + "/advance", { method: "POST" });
            app.innerHTML = caseDetail(res.alert);
            render();
          } catch (err) {
            alert(err.message);
          }
        });

        document.getElementById("actionForm")?.addEventListener("submit", async (e) => {
          e.preventDefault();
          const responderInstitution = document.getElementById("responderInstitution").value;
          const actionTaken = document.getElementById("actionTaken").value;
          const operatorNotes = document.getElementById("operatorNotes").value;
          const resultEl = document.getElementById("formResult");
          
          try {
            const res = await api("/portal-b/alerts/" + caseId + "/acknowledge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ responderInstitution, actionTaken, operatorNotes }),
            });
            if (res.success) {
              resultEl.innerHTML = \`<div style="padding: 1rem; background: rgba(16,185,129,0.1); border: 1px solid var(--emerald); border-radius: 6px; color: var(--emerald);"><strong>Response logged successfully</strong><br/>Action: \${actionTaken}<br/>Status: Acknowledged</div>\`;
              setTimeout(() => {
                history.pushState({}, "", "/");
                render();
              }, 1500);
            } else {
              resultEl.innerHTML = \`<div style="padding: 1rem; background: rgba(244,63,94,0.1); border: 1px solid var(--rose); border-radius: 6px; color: var(--rose);">Execution failed: \${res.error || 'Unknown error'}</div>\`;
            }
          } catch (err) {
            resultEl.innerHTML = \`<div style="padding: 1rem; background: rgba(244,63,94,0.1); border: 1px solid var(--rose); border-radius: 6px; color: var(--rose);">\${err.message}</div>\`;
          }
        });

      } catch (err) {
        app.innerHTML = "<p style='color: var(--rose);'>" + err.message + "</p>";
      }
    }

    document.querySelectorAll("[data-nav]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        history.pushState({}, "", a.getAttribute("href"));
        render();
      });
    });
    window.addEventListener("popstate", render);
    
    // Auto-poll on load
    render();
  </script>
</body>
</html>`;
}
