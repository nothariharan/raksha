/**
 * Portal B — Financial Intermediary (Bank) Response Console
 * Clean, minimal Banking Blue design system.
 */

export function renderPortalBHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SBI Fraud Risk Console — Portal B</title>
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
    
    .footer {
      text-align: center;
      padding: 1.5rem;
      font-size: 0.78rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      background: #ffffff;
      margin-top: auto;
    }
  </style>
</head>
<body>

  <header class="bank-header">
    <div class="bank-brand">
      <div class="bank-emblem">SBI</div>
      <div class="bank-title">
        <h1>State Bank of India · Cyber Fraud Nodal Console</h1>
        <p>CAP Protocol v0.1 · Automated Beneficiary Lien & Freeze Desk</p>
      </div>
    </div>
    <div class="bank-status-pill">
      <span class="status-dot"></span>
      <span>CAP Gateway: Connected (Port 3002)</span>
    </div>
  </header>

  <main>
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-lbl">Active Fraud Alerts</div>
        <div class="stat-val highlight">1</div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl">Automated Lien Placed</div>
        <div class="stat-val" style="color: var(--green);">₹5,000</div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl">Avg Containment Latency</div>
        <div class="stat-val">38 ms</div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl">Nodal Officer Action</div>
        <div class="stat-val" style="font-size: 0.95rem; margin-top: 0.35rem; color: var(--green);">✓ AUTO-ACKNOWLEDGED</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Live Financial Cyber-Fraud Ingest Queue</h2>
        <span style="font-size: 0.82rem; color: var(--text-muted);">Real-time CAP event bus</span>
      </div>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Govt Reference (1930)</th>
              <th>Canonical Incident</th>
              <th>Victim / Debit Account</th>
              <th>Amount</th>
              <th>12-Digit UTR</th>
              <th>Beneficiary Action</th>
              <th>Containment Status</th>
            </tr>
          </thead>
          <tbody id="alertsTableBody">
            <tr>
              <td><span class="tag-case">1930-SYN-295411</span></td>
              <td><strong>RKS-DEMO-001</strong></td>
              <td>Ramesh Kumar (SBI Savings)</td>
              <td><strong style="color: var(--navy);">₹5,000</strong></td>
              <td><span class="tag-utr">423456789012</span></td>
              <td><code>electricity-fraud@upi</code></td>
              <td><span class="badge-lien">● LIEN PLACED (₹5,000 FROZEN)</span></td>
            </tr>
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
            Upon citizen confirmation, Raksha's CAP layer issued an idempotent <code>freeze_beneficiary_account</code> action. 
            The destination beneficiary account was placed on administrative lien within <strong>38 milliseconds</strong> of report handoff.
          </p>
        </div>
      </div>
    </div>
  </main>

  <footer class="footer">
    State Bank of India Cyber Cell & CAP Node · Simulated Demonstration Environment
  </footer>
</body>
</html>`;
}
