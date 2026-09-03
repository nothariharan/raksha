/**
 * How It Works — Product Artifact HTML Generators
 * Renders real interactive UI artifacts for each step of the journey.
 */

export function renderStepArtifact(stepKey: string): string {
  switch (stepKey) {
    case "tell":
      return `
        <div class="artifact-card artifact-voice">
          <div class="artifact-voice-player">
            <button class="artifact-play-btn" aria-label="Play sample voice note">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
            </button>
            <div class="artifact-waveform" aria-hidden="true">
              <span style="height: 35%"></span>
              <span style="height: 60%"></span>
              <span style="height: 85%"></span>
              <span style="height: 100%"></span>
              <span style="height: 70%"></span>
              <span style="height: 45%"></span>
              <span style="height: 80%"></span>
              <span style="height: 95%"></span>
              <span style="height: 65%"></span>
              <span style="height: 40%"></span>
              <span style="height: 75%"></span>
              <span style="height: 90%"></span>
              <span style="height: 55%"></span>
              <span style="height: 30%"></span>
              <span style="height: 65%"></span>
              <span style="height: 80%"></span>
              <span style="height: 45%"></span>
              <span style="height: 25%"></span>
            </div>
            <div class="artifact-timer">0:18</div>
          </div>
          <div class="artifact-submeta">Today, 10:30 AM</div>
        </div>
      `;

    case "understand":
      return `
        <div class="artifact-card artifact-extracted">
          <div class="artifact-extracted-grid">
            <div class="artifact-kv-list">
              <div class="artifact-kv-row">
                <span class="artifact-k">Amount</span>
                <span class="artifact-v">₹5,000</span>
              </div>
              <div class="artifact-kv-row">
                <span class="artifact-k">Mode</span>
                <span class="artifact-v">UPI</span>
              </div>
              <div class="artifact-kv-row">
                <span class="artifact-k">Bank</span>
                <span class="artifact-v">SBI</span>
              </div>
              <div class="artifact-kv-row">
                <span class="artifact-k">To</span>
                <span class="artifact-v font-mono">**** 8921</span>
              </div>
            </div>
            <div class="artifact-ai-badge">
              <div class="artifact-ai-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
                <span>AI</span>
              </div>
              <div class="artifact-ai-label">Extracted by<br><strong>Raksha AI</strong></div>
            </div>
          </div>
        </div>
      `;

    case "verify":
      return `
        <div class="artifact-card artifact-reconciled">
          <div class="artifact-reconciled-grid">
            <div class="artifact-checklist">
              <div class="artifact-check-row">
                <span class="artifact-check-name">Voice note</span>
                <span class="artifact-check-icon">✓</span>
              </div>
              <div class="artifact-check-row">
                <span class="artifact-check-name">Screenshot</span>
                <span class="artifact-check-icon">✓</span>
              </div>
              <div class="artifact-check-row">
                <span class="artifact-check-name">Transaction</span>
                <span class="artifact-check-icon">✓</span>
              </div>
              <div class="artifact-check-row">
                <span class="artifact-check-name">Time & date</span>
                <span class="artifact-check-icon">✓</span>
              </div>
            </div>
            <div class="artifact-verified-badge">
              <div class="artifact-shield-circle">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-3.5-3.5 1.41-1.41L11 13.67l5.09-5.09 1.41 1.41L11 16.5z"/>
                </svg>
              </div>
              <div class="artifact-verified-label">All details<br><strong>verified</strong></div>
            </div>
          </div>
        </div>
      `;

    case "confirm":
      return `
        <div class="artifact-card artifact-confirm">
          <div class="artifact-confirm-header">
            <div class="artifact-confirm-title">Everything looks correct?</div>
            <div class="artifact-confirm-sub">You are in control.</div>
          </div>
          <button class="artifact-confirm-btn" type="button">
            <span>Yes, report this</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      `;

    case "cap":
      return `
        <div class="artifact-card artifact-cap">
          <div class="artifact-cap-nodes">
            <div class="artifact-cap-box cap-action">
              <span class="artifact-cap-tag">Action</span>
              <span class="artifact-cap-val font-mono">report_financial_fraud</span>
            </div>
            <div class="artifact-cap-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </div>
            <div class="artifact-cap-box highlight">
              <div class="artifact-cap-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-3.5-3.5 1.41-1.41L11 13.67l5.09-5.09 1.41 1.41L11 16.5z"/>
                </svg>
              </div>
              <div class="artifact-cap-meta">
                <strong>1930</strong>
                <span>Cyber Intake</span>
              </div>
            </div>
            <div class="artifact-cap-arrow" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </div>
            <div class="artifact-cap-box">
              <div class="artifact-cap-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="3" y1="21" x2="21" y2="21"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="5 6 12 3 19 6"/><line x1="4" y1="10" x2="4" y2="21"/><line x1="20" y1="10" x2="20" y2="21"/>
                </svg>
              </div>
              <div class="artifact-cap-meta">
                <strong>Bank / FIU</strong>
                <span>Response</span>
              </div>
            </div>
          </div>
        </div>
      `;

    case "update":
      return `
        <div class="artifact-card artifact-timeline">
          <div class="artifact-timeline-grid">
            <div class="artifact-timeline-rail">
              <div class="artifact-step-dot done">
                <div class="artifact-dot-circle"></div>
                <div class="artifact-dot-time">10:30 AM</div>
                <div class="artifact-dot-label">Captured</div>
              </div>
              <div class="artifact-step-connector done"></div>
              <div class="artifact-step-dot done">
                <div class="artifact-dot-circle"></div>
                <div class="artifact-dot-time">10:33 AM</div>
                <div class="artifact-dot-label">Verified</div>
              </div>
              <div class="artifact-step-connector done"></div>
              <div class="artifact-step-dot done">
                <div class="artifact-dot-circle"></div>
                <div class="artifact-dot-time">10:34 AM</div>
                <div class="artifact-dot-label">Submitted</div>
              </div>
              <div class="artifact-step-connector done"></div>
              <div class="artifact-step-dot active">
                <div class="artifact-dot-circle"></div>
                <div class="artifact-dot-time">10:36 AM</div>
                <div class="artifact-dot-label">Accepted</div>
              </div>
            </div>
            <div class="artifact-live-badge">
              <div class="artifact-live-dot"></div>
              <div class="artifact-live-label"><strong>Live</strong><span>Tracking case</span></div>
            </div>
          </div>
        </div>
      `;

    default:
      return "";
  }
}
