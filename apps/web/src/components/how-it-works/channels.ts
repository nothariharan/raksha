/**
 * How It Works — Channel Continuity & Trust Badges Section
 * "ONE CASE. EVERY CHANNEL."
 * Features 4 channel cards (Call, WhatsApp, Web, AI Agents with vibrant brand AI logos) and 4 trust value props.
 */

export function renderChannelContinuityHtml(): string {
  // Rich, vibrant official brand SVGs (Not black/monochrome!)
  const openaiSvg = `
    <svg viewBox="0 0 24 24" width="30" height="30" fill="#10A37F" title="OpenAI / ChatGPT">
      <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9 6.07 6.07 0 0 0-10.27 2.17 5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9 5.98 5.98 0 0 0 4.51 2.01 6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.74-7.07zm-9.02 12.61a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zm-9.66-4.14a4.47 4.47 0 0 1-.53-3.01l.14.08 4.78 2.76c.24.14.54.14.78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.66zm-1.03-9.91a4.48 4.48 0 0 1 2.34-1.97v5.68c0 .28.15.53.39.68l5.84 3.37-2.02 1.17a.08.08 0 0 1-.07 0l-4.83-2.79a4.5 4.5 0 0 1-1.65-6.14zm14.87 4.15l-5.84-3.37 2.02-1.17a.08.08 0 0 1 .07 0l4.83 2.79a4.5 4.5 0 0 1-.68 8.1v-5.67a.76.76 0 0 0-.4-.68zm2.53-3.8l-.14-.09-4.78-2.76a.77.77 0 0 0-.78 0L8.45 9.39V7.06a.08.08 0 0 1 .03-.06l4.9-2.83a4.5 4.5 0 0 1 6.14 1.66 4.47 4.47 0 0 1 .53 3.01zM8.31 12.87l-2.02-1.17a.08.08 0 0 1-.04-.05V6.07a4.5 4.5 0 0 1 7.37-3.45l-.14.08-4.78 2.76a.79.79 0 0 0-.39.68v6.74zm1.31-1.5l2.38-1.38 2.38 1.38v2.75l-2.38 1.38-2.38-1.38z"/>
    </svg>`;

  const claudeSvg = `
    <svg viewBox="0 0 24 24" width="30" height="30" fill="#D97706" title="Anthropic / Claude">
      <path d="M17.47 2.05h-3.94L21.95 21.95h3.94L17.47 2.05zm-10.94 0L0 21.95h3.94l2.58-6.67h7.89l2.58 6.67h3.95L14.47 2.05H6.53zm2.25 10.33L10.5 6.05l1.72 6.33H8.78z"/>
    </svg>`;

  const geminiSvg = `
    <svg viewBox="0 0 24 24" width="30" height="30" title="Google Gemini">
      <defs>
        <linearGradient id="geminiLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1A73E8" />
          <stop offset="60%" stop-color="#8AB4F8" />
          <stop offset="100%" stop-color="#9333EA" />
        </linearGradient>
      </defs>
      <path fill="url(#geminiLogoGrad)" d="M12 0C12 6.63 6.63 12 0 12c6.63 0 12 5.63 12 12 0-6.63 5.63-12 12-12-6.63 0-12-5.63-12-12z"/>
    </svg>`;

  const copilotSvg = `
    <svg viewBox="0 0 24 24" width="30" height="30" title="Microsoft Copilot">
      <defs>
        <linearGradient id="copilotLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0078D4" />
          <stop offset="50%" stop-color="#00A4EF" />
          <stop offset="100%" stop-color="#EC4899" />
        </linearGradient>
      </defs>
      <path fill="url(#copilotLogoGrad)" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07A5.002 5.002 0 0 1 7.07 13H8v-2h-.93A5.002 5.002 0 0 1 11 7.07V6h2v1.07A5.002 5.002 0 0 1 16.93 11H16v2h.93A5.002 5.002 0 0 1 13 16.93zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
    </svg>`;

  const cursorSvg = `
    <svg viewBox="0 0 24 24" width="30" height="30" title="Cursor">
      <defs>
        <linearGradient id="cursorLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0EA5E9" />
          <stop offset="100%" stop-color="#6366F1" />
        </linearGradient>
      </defs>
      <path fill="url(#cursorLogoGrad)" d="M11.025.667L1.517 6.155A2.32 2.32 0 00.358 8.163v10.978c0 .83.442 1.597 1.159 2.008l9.508 5.488a2.32 2.32 0 002.32 0l9.508-5.488a2.32 2.32 0 001.159-2.008V8.163a2.32 2.32 0 00-1.159-2.008L13.345.667a2.32 2.32 0 00-2.32 0z"/>
    </svg>`;

  const mcpSvg = `
    <svg viewBox="0 0 24 24" width="30" height="30" title="Model Context Protocol">
      <circle cx="12" cy="12" r="9.5" fill="#f5f3ff" stroke="#8B5CF6" stroke-width="2"/>
      <circle cx="12" cy="7" r="2" fill="#8B5CF6"/>
      <circle cx="7" cy="15" r="2" fill="#8B5CF6"/>
      <circle cx="17" cy="15" r="2" fill="#8B5CF6"/>
      <path d="M12 9v3m-3 1.5l3-1.5 3 1.5" stroke="#8B5CF6" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;

  return `
    <section class="channels-section" id="channels">
      <div class="channels-container">
        <!-- Section Header -->
        <div class="channels-header">
          <span class="channels-kicker">ONE CASE. EVERY CHANNEL.</span>
          <h2 class="channels-title">Start anywhere. Same case, always.</h2>
          <p class="channels-sub">Begin on one channel, continue on another. Your case stays intact.</p>
        </div>

        <!-- Persistent Floating Case Capsule -->
        <div class="channels-hub">
          <div class="case-capsule">
            <div class="case-capsule-shield">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-3.5-3.5 1.41-1.41L11 13.67l5.09-5.09 1.41 1.41L11 16.5z"/></svg>
            </div>
            <span class="case-capsule-id">RKS-000001</span>
            <span class="case-capsule-status">Active case</span>
          </div>
          <div class="channels-connectors" aria-hidden="true">
            <svg class="channels-wire-svg" viewBox="0 0 1000 70" preserveAspectRatio="none">
              <path d="M 500 0 L 500 35 L 125 35 L 125 70 M 500 35 L 375 35 L 375 70 M 500 35 L 625 35 L 625 70 M 500 35 L 875 35 L 875 70" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4 4" />
            </svg>
          </div>
        </div>

        <!-- 4 Channel Cards Grid -->
        <div class="channels-grid">
          <!-- 1. Call Raksha -->
          <article class="channel-card card-call">
            <div class="channel-img-box">
              <img src="/images/raksha/hero-call.png" alt="Citizen calling Raksha on phone" loading="lazy" />
              <div class="channel-floating-badge badge-orange">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
                <span>1930</span>
              </div>
            </div>
            <div class="channel-content">
              <h3>Call Raksha</h3>
              <p>Speak to us in your language.</p>
              <div class="channel-circle-icon icon-orange">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/></svg>
              </div>
            </div>
          </article>

          <!-- 2. WhatsApp Raksha -->
          <article class="channel-card card-whatsapp">
            <div class="channel-img-box">
              <img src="/images/raksha/hero-whatsapp.png" alt="Elderly citizen using WhatsApp for Raksha" loading="lazy" />
              <div class="channel-floating-badge badge-green">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.2 14.1c-.2.6-1.2 1.1-1.7 1.2-.5.1-1.1.2-3.6-.8-3.1-1.3-5.1-4.5-5.3-4.7-.1-.2-1.3-1.8-1.3-3.4 0-1.6.8-2.4 1.1-2.7.3-.3.7-.4 1-.4h.7c.2 0 .5 0 .7.6.3.7.9 2.3.9 2.5 0 .2 0 .4-.1.6-.1.2-.3.4-.5.6-.2.2-.4.4-.2.8.3.6 1.4 2.2 3.1 3 2 .9 2.4.7 2.8.4.3-.4.8-1 1-1.3.2-.3.5-.3.8-.1.3.1 2 1 2.3 1.2.3.2.5.3.6.5.1.3.1 1-.1 1.6z"/></svg>
              </div>
            </div>
            <div class="channel-content">
              <h3>WhatsApp Raksha</h3>
              <p>Send voice notes, photos or messages.</p>
              <div class="channel-circle-icon icon-green">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.2 14.1c-.2.6-1.2 1.1-1.7 1.2-.5.1-1.1.2-3.6-.8-3.1-1.3-5.1-4.5-5.3-4.7-.1-.2-1.3-1.8-1.3-3.4 0-1.6.8-2.4 1.1-2.7.3-.3.7-.4 1-.4h.7c.2 0 .5 0 .7.6.3.7.9 2.3.9 2.5 0 .2 0 .4-.1.6-.1.2-.3.4-.5.6-.2.2-.4.4-.2.8.3.6 1.4 2.2 3.1 3 2 .9 2.4.7 2.8.4.3-.4.8-1 1-1.3.2-.3.5-.3.8-.1.3.1 2 1 2.3 1.2.3.2.5.3.6.5.1.3.1 1-.1 1.6z"/></svg>
              </div>
            </div>
          </article>

          <!-- 3. Raksha on the Web -->
          <article class="channel-card card-web">
            <div class="channel-img-box">
              <img src="/images/raksha/hero-web.png" alt="Citizen filing incident on Raksha web console" loading="lazy" />
              <div class="channel-floating-badge badge-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
            </div>
            <div class="channel-content">
              <h3>Raksha on the Web</h3>
              <p>Upload receipts, add details and review.</p>
              <div class="channel-circle-icon icon-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              </div>
            </div>
          </article>

          <!-- 4. AI Agents (Colorful brand icons side-by-side) -->
          <article class="channel-card card-agents">
            <div class="channel-img-box ai-agents-box">
              <div class="ai-logos-row">
                <div class="ai-brand-item" title="OpenAI / ChatGPT">${openaiSvg}</div>
                <div class="ai-brand-item" title="Anthropic / Claude">${claudeSvg}</div>
                <div class="ai-brand-item" title="Google Gemini">${geminiSvg}</div>
                <div class="ai-brand-item" title="Microsoft Copilot">${copilotSvg}</div>
                <div class="ai-brand-item" title="Cursor">${cursorSvg}</div>
                <div class="ai-brand-item" title="Model Context Protocol">${mcpSvg}</div>
              </div>
              <div class="channel-floating-badge badge-purple">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>
              </div>
            </div>
            <div class="channel-content">
              <h3>AI Agents</h3>
              <p>Let AI agents assist and continue for you.</p>
              <div class="channel-circle-icon icon-purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
              </div>
            </div>
          </article>
        </div>

        <!-- Bottom Trust & Value Props Bar -->
        <div class="trust-bar">
          <div class="trust-item">
            <div class="trust-icon icon-check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            </div>
            <div class="trust-text">
              <h4>Secure & Private</h4>
              <p>Your data is protected end to end.</p>
            </div>
          </div>

          <div class="trust-item">
            <div class="trust-icon icon-lock">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1"/></svg>
            </div>
            <div class="trust-text">
              <h4>Verified & Trusted</h4>
              <p>Government-grade security and process.</p>
            </div>
          </div>

          <div class="trust-item">
            <div class="trust-icon icon-sparkle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div class="trust-text">
              <h4>Always with You</h4>
              <p>One case. Any channel. Real human support.</p>
            </div>
          </div>

          <div class="trust-item">
            <div class="trust-icon icon-people">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div class="trust-text">
              <h4>For Everyone</h4>
              <p>Built for India. Built for every person.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
