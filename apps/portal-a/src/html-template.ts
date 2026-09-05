/**
 * Portal A — synthetic National Cyber Crime Reporting (1930) intake UI.
 * Visual language: government service desk (not the Raksha citizen emergency app).
 */

export function renderPortalAHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cyber Crime Intake — Portal A (Synthetic)</title>
  <style>
    :root {
      --saffron: #ff9933;
      --navy: #0b2545;
      --navy-2: #12345a;
      --paper: #f4f1ea;
      --card: #fffdf8;
      --ink: #1a1a1a;
      --muted: #5c6570;
      --line: #d5cfc4;
      --ok: #1b7f4e;
      --warn: #b45309;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Segoe UI", Tahoma, sans-serif;
      background: var(--paper);
      color: var(--ink);
      min-height: 100vh;
    }
    .gov-bar {
      height: 6px;
      background: linear-gradient(90deg, var(--saffron) 0 33%, #fff 33% 66%, #138808 66% 100%);
    }
    header {
      background: var(--navy);
      color: #fff;
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    header h1 { font-size: 1.05rem; font-weight: 700; letter-spacing: 0.02em; }
    header p { font-size: 0.75rem; opacity: 0.8; margin-top: 0.2rem; }
    nav { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    nav a {
      color: #fff;
      text-decoration: none;
      font-size: 0.85rem;
      padding: 0.4rem 0.7rem;
      border: 1px solid rgba(255,255,255,0.25);
      background: var(--navy-2);
    }
    nav a.active { background: var(--saffron); color: var(--navy); font-weight: 700; border-color: var(--saffron); }
    main { max-width: 960px; margin: 0 auto; padding: 1.5rem; }
    .banner {
      background: #fff3cd;
      border: 1px solid #e6d08a;
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--line);
      padding: 1.25rem;
      margin-bottom: 1rem;
    }
    h2 { font-size: 1.15rem; margin-bottom: 0.75rem; color: var(--navy); }
    label { display: block; font-size: 0.8rem; font-weight: 600; margin: 0.7rem 0 0.25rem; }
    input, textarea, select {
      width: 100%;
      padding: 0.5rem 0.6rem;
      border: 1px solid var(--line);
      font: inherit;
      background: #fff;
    }
    textarea { min-height: 90px; }
    button {
      margin-top: 1rem;
      background: var(--navy);
      color: #fff;
      border: 0;
      padding: 0.6rem 1.1rem;
      font-weight: 600;
      cursor: pointer;
    }
    button.secondary { background: #fff; color: var(--navy); border: 1px solid var(--navy); }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid var(--line); }
    th { background: #efe9dd; font-size: 0.75rem; text-transform: uppercase; }
    .status { font-weight: 700; color: var(--ok); }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem 1rem; }
    @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
    .dl { display: grid; grid-template-columns: 180px 1fr; gap: 0.4rem 1rem; font-size: 0.9rem; }
    .dl dt { color: var(--muted); }
    .muted { color: var(--muted); font-size: 0.85rem; }
    .result { margin-top: 1rem; padding: 1rem; background: #e8f5ee; border: 1px solid #b7ddc6; }
  </style>
</head>
<body>
  <div class="gov-bar"></div>
  <header>
    <div>
      <h1>NATIONAL CYBER CRIME REPORTING PORTAL</h1>
      <p>Portal A · Simulated downstream service — 1930 / bank response for prototype</p>
    </div>
    <nav>
      <a href="/" data-nav>Dashboard</a>
      <a href="/report" data-nav>Report fraud</a>
      <a href="/review" data-nav>Review incoming</a>
    </nav>
  </header>
  <main>
    <div class="banner">Simulated downstream service — 1930 / bank response for prototype. Synthetic demo data only.</div>
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

    function rupees(n) {
      if (n == null || n === "") return "—";
      return "₹" + Number(n).toLocaleString("en-IN");
    }

    async function api(path, options) {
      const res = await fetch(path, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      return data;
    }

    function dashboard(cases) {
      return \`
        <div class="card">
          <h2>Intake dashboard</h2>
          <p class="muted">Cases sync from CAP <code>incident.accepted</code> events (same filing as Raksha Web / WhatsApp / Phone). Simulated 1930 desk for prototype.</p>
        </div>
        <div class="card">
          <h2>Cases</h2>
          \${cases.length === 0 ? "<p class='muted'>No cases yet. File on Raksha <code>/app</code> first, then refresh — or use Report fraud / seed synthetic data.</p>" : \`
            <table>
              <thead><tr><th>Portal case</th><th>Tracking ref</th><th>Amount</th><th>UTR</th><th>Lifecycle</th></tr></thead>
              <tbody>
                \${cases.map((c) => \`
                  <tr>
                    <td><a href="/case/\${c.portalCaseId}">\${c.portalCaseId}</a></td>
                    <td><a href="/case/\${encodeURIComponent(c.externalReference || c.portalCaseId)}">\${c.externalReference || c.capCaseId}</a></td>
                    <td>\${rupees(c.incident?.transaction?.amount)}</td>
                    <td>\${c.incident?.transaction?.transactionId || "—"}</td>
                    <td class="status">\${c.lifecycle}</td>
                  </tr>\`).join("")}
              </tbody>
            </table>\`}
          <button class="secondary" id="seedBtn" type="button">Load synthetic CAP demo incident</button>
          <button class="secondary" id="refreshBtn" type="button" style="margin-left:0.5rem">Refresh from CAP</button>
        </div>\`;
    }

    function reportForm() {
      return \`
        <div class="card">
          <h2>Report financial cyber fraud</h2>
          <p class="muted">Submitted through CAP action <code>report_financial_fraud</code> using canonical schema fields.</p>
          <form id="reportForm">
            <label>Incident narrative</label>
            <textarea name="narrativeText" placeholder="Describe what happened in detail..." required></textarea>
            <div class="grid">
              <div>
                <label>Amount (INR)</label>
                <input name="amount" type="number" placeholder="e.g. 5000" required />
              </div>
              <div>
                <label>Transaction ID (UTR / Reference)</label>
                <input name="transactionId" placeholder="12-digit UTR number" required />
              </div>
              <div>
                <label>Timestamp</label>
                <input name="timestamp" placeholder="e.g. 2026-08-25T18:42:00+05:30" />
              </div>
              <div>
                <label>Debit institution</label>
                <input name="debitInstitution" placeholder="e.g. State Bank of India" />
              </div>
              <div>
                <label>Beneficiary identifier</label>
                <input name="beneficiaryIdentifier" placeholder="e.g. fraudster@upi" />
              </div>
              <div>
                <label>Evidence IDs (comma-separated)</label>
                <input name="evidence" placeholder="e.g. EV-001, EV-002" />
              </div>
            </div>
            <button type="submit">Submit via CAP</button>
          </form>
          <div id="reportResult"></div>
        </div>\`;
    }

    function reviewList(cases) {
      const incoming = cases.filter((c) => c.lifecycle === "ACCEPTED" || c.lifecycle === "RECEIVED" || c.lifecycle === "VALIDATING");
      return \`
        <div class="card">
          <h2>Review incoming incident</h2>
          <p class="muted">Operator queue. Acknowledge advances Portal A lifecycle (ACCEPTED → UNDER_REVIEW) without calling Portal B.</p>
          \${incoming.length === 0 ? "<p class='muted'>No incoming incidents.</p>" : \`
            <table>
              <thead><tr><th>Case</th><th>Type</th><th>Amount</th><th>Lifecycle</th><th></th></tr></thead>
              <tbody>
                \${incoming.map((c) => \`
                  <tr>
                    <td><a href="/case/\${c.portalCaseId}">\${c.portalCaseId}</a><br/><span class="muted">\${c.externalReference || ""}</span></td>
                    <td>FINANCIAL_CYBER_FRAUD</td>
                    <td>\${rupees(c.incident?.transaction?.amount)}</td>
                    <td class="status">\${c.lifecycle}</td>
                    <td><button data-ack="\${c.portalCaseId}" type="button">Acknowledge</button></td>
                  </tr>\`).join("")}
              </tbody>
            </table>\`}
        </div>\`;
    }

    function caseDetail(c) {
      const t = c.incident?.transaction || {};
      return \`
        <div class="card">
          <h2>Case \${c.portalCaseId}</h2>
          <p class="muted">CAP case \${c.capCaseId} · External \${c.externalReference}</p>
          <dl class="dl">
            <dt>Incident type</dt><dd>\${c.incident?.type || "—"}</dd>
            <dt>Amount</dt><dd>\${rupees(t.amount)} \${t.currency || ""}</dd>
            <dt>Transaction ID</dt><dd>\${t.transactionId || "—"}</dd>
            <dt>Timestamp</dt><dd>\${t.timestamp || "—"}</dd>
            <dt>Debit institution</dt><dd>\${t.debitInstitution || "—"}</dd>
            <dt>Beneficiary identifier</dt><dd>\${t.beneficiaryIdentifier || "—"}</dd>
            <dt>Evidence</dt><dd>\${(c.incident?.evidence || []).join(", ") || "—"}</dd>
            <dt>Lifecycle</dt><dd class="status">\${c.lifecycle}</dd>
            <dt>CAP status</dt><dd>\${c.status}</dd>
          </dl>
          <p class="muted"><strong>Simulated downstream service</strong> — 1930 / bank response for prototype</p>
          <h3>Timeline</h3>
          <ul>
            \${(c.timeline || []).map((row) => \`<li><strong>\${(row.at || "").slice(0, 10)}</strong> — \${row.label}</li>\`).join("") || "<li>No timeline rows yet</li>"}
          </ul>
          <button class="secondary" data-ack="\${c.portalCaseId}" type="button">Advance lifecycle</button>
        </div>\`;
    }

    async function render() {
      navHighlight();
      let path = location.pathname.replace(/\\/+$/, "") || "/";
      if (path.startsWith("/portal-a")) {
        path = path.slice("/portal-a".length) || "/";
      }
      const refParam = new URLSearchParams(location.search).get("ref");
      try {
        if (path === "/" || path === "" || path === "/index.html") {
          const { cases } = await api("/portal-a/cases");
          if (refParam) {
            const hit = cases.find((c) =>
              c.externalReference === refParam ||
              c.portalCaseId === refParam ||
              c.capCaseId === refParam ||
              c.incidentId === refParam
            );
            if (hit) {
              history.replaceState({}, "", "/case/" + encodeURIComponent(hit.portalCaseId));
              app.innerHTML = caseDetail(hit);
              document.querySelectorAll("[data-ack]").forEach((btn) => {
                btn.addEventListener("click", async () => {
                  const id = btn.getAttribute("data-ack");
                  await api("/portal-a/cases/" + id + "/acknowledge", { method: "POST" });
                  render();
                });
              });
              return;
            }
          }
          app.innerHTML = dashboard(cases);
          document.getElementById("seedBtn")?.addEventListener("click", async () => {
            await api("/portal-a/cases/synthetic", { method: "POST" });
            render();
          });
          document.getElementById("refreshBtn")?.addEventListener("click", () => render());
          return;
        }
        if (path === "/report") {
          app.innerHTML = reportForm();
          document.getElementById("reportForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const body = Object.fromEntries(fd.entries());
            body.amount = Number(body.amount);
            const resultEl = document.getElementById("reportResult");
            try {
              const result = await api("/portal-a/cases", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Idempotency-Key": "ui-" + Date.now() },
                body: JSON.stringify(body),
              });
              const pc = result.portalCase;
              resultEl.innerHTML = \`<div class="result"><strong>CASE CREATED</strong><br/>\${pc.portalCaseId}<br/>CAP \${pc.capCaseId}<br/>Ref \${pc.externalReference}<br/>Status: \${pc.lifecycle}</div>\`;
            } catch (err) {
              resultEl.innerHTML = "<p>" + err.message + "</p>";
            }
          });
          return;
        }
        if (path === "/review") {
          const { cases } = await api("/portal-a/cases");
          app.innerHTML = reviewList(cases);
        } else {
          const m = path.match(/^\\/case\\/([^/]+)$/);
          if (!m) {
            app.innerHTML = "<p>Not found.</p>";
            return;
          }
          const id = decodeURIComponent(m[1]);
          const data = await api("/portal-a/cases/" + encodeURIComponent(id));
          app.innerHTML = caseDetail(data.case);
        }
        document.querySelectorAll("[data-ack]").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-ack");
            await api("/portal-a/cases/" + id + "/acknowledge", { method: "POST" });
            render();
          });
        });
      } catch (err) {
        app.innerHTML = "<p>" + err.message + "</p>";
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
    render();
  </script>
</body>
</html>`;
}
