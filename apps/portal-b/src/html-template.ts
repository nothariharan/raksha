/**
 * Portal B — Financial Intermediary (Bank) Response Console
 * Clean, minimal Banking Blue design system.
 * Table now dynamically renders from /portal-b/alerts API (no hardcoded demo rows).
 */

export function renderPortalBHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bank Fraud Risk Console — Portal B (Simulated)</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏦</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --navy: #002b49;
      --navy-light: #003a63;
      --bank-blue: #0284c7;
      --bank-blue-light: #e0f2fe;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --border-subtle: #f1f5f9;
      --green: #16a34a;
      --green-light: #dcfce7;
      --amber: #d97706;
      --amber-light: #fef3c7;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .bank-header {
      background: var(--navy);
      color: #ffffff;
      padding: 1.1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .bank-brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .bank-emblem {
      background: #ffffff;
      color: var(--navy);
      font-weight: 800;
      font-size: 1rem;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bank-title h1 {
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: -0.01em;
    }
    .bank-title p {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    
    .bank-status-pill {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      background: #4ade80;
      border-radius: 50%;
    }
    
    main {
      flex: 1;
      max-width: 1140px;
      width: 100%;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }
    
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem 1.4rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }
    .stat-lbl {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.35rem;
    }
    .stat-val {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--text);
    }
    .stat-val.highlight {
      color: var(--bank-blue);
    }
    
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.75rem;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      margin-bottom: 1.5rem;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .card-header h2 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text);
    }
    
    .table-responsive {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    th, td {
      padding: 0.95rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      background: #f8fafc;
    }
    tbody tr:hover {
      background: #f8fafc;
    }
    
    .tag-case {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      color: var(--bank-blue);
    }
    .tag-utr {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.84rem;
      color: #334155;
    }
    
    .badge-lien {
      background: var(--green-light);
      color: var(--green);
      font-weight: 700;
      font-size: 0.76rem;
      padding: 0.3rem 0.65rem;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .badge-pending {
      background: var(--amber-light);
      color: var(--amber);
      font-weight: 700;
      font-size: 0.76rem;
      padding: 0.3rem 0.65rem;
      border-radius: 999px;
    }

    .btn-lien {
      background: var(--navy);
      color: #fff;
      border: none;
      padding: 0.4rem 0.85rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-lien:hover { background: var(--navy-light); }
    
    .footer {
      text-align: center;
      padding: 1.5rem;
      font-size: 0.78rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      background: #ffffff;
      margin-top: auto;
    }

    .sim-banner {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 0.65rem 1rem;
      font-size: 0.82rem;
      color: #92400e;
      font-weight: 600;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  </style>
</head>
<body>

  <header class="bank-header">
    <div class="bank-brand">
      <div class="bank-emblem">🏦</div>
      <div class="bank-title">
        <h1>Financial Institution CAP Node · Cyber Fraud Response Console</h1>
        <p>CAP Protocol v0.1 · Automated Beneficiary Lien &amp; Freeze Desk · Portal B</p>
      </div>
    </div>
    <div class="bank-status-pill">
      <span class="status-dot"></span>
      <span>CAP Gateway: Connected (Port 3002)</span>
    </div>
  </header>

  <main>
    <div class="sim-banner">
      ⚠️ SIMULATED DEMONSTRATION ENVIRONMENT — This portal does not connect to real banking systems or government infrastructure.
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-lbl">Active Fraud Alerts</div>
        <div class="stat-val highlight" id="statActiveAlerts">—</div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl">Containment Actions</div>
        <div class="stat-val" style="color: var(--green);" id="statLienCount">—</div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl">Avg Containment Latency</div>
        <div class="stat-val">38 ms</div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl">Nodal Officer Status</div>
        <div class="stat-val" style="font-size: 0.9rem; margin-top: 0.35rem;" id="statNodal">Awaiting alerts</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Live Financial Cyber-Fraud Ingest Queue</h2>
        <span style="font-size: 0.82rem; color: var(--text-muted);">Real-time CAP event bus · auto-refreshes every 5s</span>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Govt Reference (1930)</th>
              <th>Canonical Incident</th>
              <th>Status</th>
              <th>Lifecycle</th>
              <th>Received</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="alertsTableBody">
            <tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 2rem;">Loading alerts…</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="card" style="background: #f0fdf4; border-color: #bbf7d0;">
      <div style="display: flex; gap: 0.85rem; align-items: flex-start;">
        <span style="font-size: 1.5rem;">🛡️</span>
        <div>
          <h3 style="font-size: 0.95rem; font-weight: 700; color: #166534; margin-bottom: 0.2rem;">Automated Golden Hour Intermediary Containment</h3>
          <p style="font-size: 0.84rem; color: #15803d; line-height: 1.45;">
            Upon citizen confirmation, Raksha's CAP layer issues an idempotent <code>report_financial_fraud</code> action.
            This portal subscribes to <code>incident.accepted</code> events and can mark administrative lien actions against the beneficiary account.
          </p>
        </div>
      </div>
    </div>
  </main>

  <footer class="footer">
    Financial Institution CAP Node · Simulated Demonstration Environment · Not connected to real banking systems
  </footer>

<script>
  function formatTime(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch { return iso; }
  }

  async function loadAlerts() {
    try {
      const res = await fetch('/portal-b/alerts');
      if (!res.ok) return;
      const data = await res.json();
      const alerts = data.alerts || [];

      // Update stats
      document.getElementById('statActiveAlerts').innerText = alerts.length || '0';
      const actionCount = alerts.filter(a => a.status === 'LIEN_MARKED' || a.status === 'ACCOUNT_FROZEN').length;
      document.getElementById('statLienCount').innerText = actionCount > 0 ? actionCount + ' action(s)' : '—';
      const nodalEl = document.getElementById('statNodal');
      if (actionCount > 0) {
        nodalEl.innerText = '✓ AUTO-ACKNOWLEDGED';
        nodalEl.style.color = 'var(--green)';
      } else if (alerts.length > 0) {
        nodalEl.innerText = 'Review required';
        nodalEl.style.color = 'var(--amber)';
      } else {
        nodalEl.innerText = 'Awaiting alerts';
        nodalEl.style.color = '';
      }

      // Render table
      const tbody = document.getElementById('alertsTableBody');
      if (alerts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: #94a3b8; padding: 2rem;">No active alerts. Waiting for CAP incident.accepted events…</td></tr>';
        return;
      }

      tbody.innerHTML = alerts.map(a => {
        const isActioned = a.lifecycle === 'ACKNOWLEDGED' || a.status === 'LIEN_MARKED' || a.status === 'ACCOUNT_FROZEN';
        return \`<tr>
          <td><span class="tag-case">\${a.externalReference || '—'}</span></td>
          <td><strong>\${a.incidentId || '—'}</strong></td>
          <td>\${a.status || '—'}</td>
          <td><strong>\${a.lifecycle || '—'}</strong></td>
          <td>\${formatTime(a.receivedAt)}</td>
          <td>
            \${isActioned
              ? '<span class="badge-lien">● LIEN / FREEZE ACTION TAKEN</span>'
              : \`<button class="btn-lien" onclick="markLien('\${a.caseId}', '\${a.incidentId}')">Mark Lien</button>\`
            }
          </td>
        </tr>\`;
      }).join('');
    } catch (e) {
      console.warn('[Portal B] Could not load alerts:', e);
      const tbody = document.getElementById('alertsTableBody');
      if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: #dc2626; padding: 1rem;">Could not reach CAP gateway. Retrying…</td></tr>';
    }
  }

  async function markLien(caseId, incidentId) {
    try {
      await fetch('/portal-b/alerts/' + caseId + '/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responderInstitution: 'Financial Institution',
          actionTaken: 'LIEN_MARKED',
          idempotencyKey: 'lien-' + caseId
        })
      });
      loadAlerts();
    } catch (e) {
      console.warn('[Portal B] Mark lien failed:', e);
    }
  }

  loadAlerts();
  setInterval(loadAlerts, 5000);
</script>
</body>
</html>`;
}
