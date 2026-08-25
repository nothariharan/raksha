/**
 * /cap — Civic Action Protocol (CAP v0.1) Specification
 * Formal RFC-style developer documentation for the CAP protocol layer.
 */

import { renderPageLayout } from "./layout.js";

export function renderCapPageHtml(): string {
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
      color: var(--orange);
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
      margin-bottom: 3.5rem;
      max-width: 740px;
    }

    .spec-section {
      background: var(--bg-white);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: var(--card-shadow);
      margin-bottom: 2rem;
    }
    .spec-section h2 {
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
      color: var(--text);
    }
    .spec-section p {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1.25rem;
    }

    table.spec-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
      margin-top: 1rem;
    }
    table.spec-table th, table.spec-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
      text-align: left;
    }
    table.spec-table th {
      background: #fafaf9;
      font-weight: 700;
      font-size: 0.76rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    table.spec-table td code {
      font-family: var(--mono);
      font-size: 0.8rem;
      background: #f5f5f4;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
    }
  `;

  const bodyContent = `
    <div class="page-container">
      <div class="page-tag">OPEN PROTOCOL SPECIFICATION</div>
      <h1 class="page-title">Civic Action Protocol (CAP v0.1)</h1>
      <p class="page-lead">
        A decentralized, typed protocol connecting conversational frontend adapters, autonomous AI agents, cybercrime intake authorities, and financial intermediaries.
      </p>

      <div class="spec-section">
        <h2>1. Protocol Philosophy & Invariants</h2>
        <p>
          Emergency public-service actions require deterministic guarantees that unstructured LLM outputs cannot provide alone. CAP enforces strict separation between extraction intelligence and civic execution.
        </p>
        <table class="spec-table">
          <thead>
            <tr>
              <th>Invariant</th>
              <th>Guarantee</th>
              <th>Enforcement Mechanism</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Idempotency</strong></td>
              <td>Duplicate requests never create multiple liens or cases.</td>
              <td><code>Idempotency-Key</code> header persisted in action repository.</td>
            </tr>
            <tr>
              <td><strong>Auditability</strong></td>
              <td>Every state change is cryptographically sealed.</td>
              <td>SHA-256 hashed evidence capsule on every event.</td>
            </tr>
            <tr>
              <td><strong>Simulation Boundary</strong></td>
              <td>Demonstration environments generate synthetic references.</td>
              <td><code>1930-SYN-XXXXXX</code> format enforced across all downstreams.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="spec-section">
        <h2>2. Action Primitives</h2>
        <table class="spec-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Target Service</th>
              <th>Payload Type</th>
              <th>Lifecycle States</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>report_financial_fraud</code></td>
              <td>Portal A (1930 Intake)</td>
              <td><code>FraudIncident</code></td>
              <td><code>RECEIVED → VALIDATING → ACCEPTED</code></td>
            </tr>
            <tr>
              <td><code>acknowledge_response</code></td>
              <td>Portal B (Bank Console)</td>
              <td><code>AcknowledgeResponsePayload</code></td>
              <td><code>ALERT_TRIGGERED → LIEN_MARKED</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  return renderPageLayout({
    title: "CAP Protocol Specification",
    activeNav: "cap",
    bodyContent,
    extraStyles,
  });
}
