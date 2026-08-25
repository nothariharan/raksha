/**
 * How It Works — Channel Continuity & Trust Badges Section
 * "ONE CASE. EVERY CHANNEL."
 * Features 4 channel cards (Call, WhatsApp, Web, AI Agents with multi-AI logos) and 4 trust value props.
 */

export function renderChannelContinuityHtml(): string {
  // SVGs for AI agent logos
  const openaiSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" title="OpenAI / ChatGPT"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.66-4.1354a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1402-1.6564zm-1.0267-9.913a4.4755 4.4755 0 0 1 2.3418-1.9729v5.682a.7617.7617 0 0 0 .388.6765l5.8428 3.3732-2.02 1.1684a.0757.0757 0 0 1-.071 0l-4.8303-2.7915a4.4945 4.4945 0 0 1-1.6513-6.1358zm14.8697 4.1495l-5.8428-3.3732 2.02-1.1684a.0757.0757 0 0 1 .071 0l4.8303 2.7915a4.4945 4.4945 0 0 1-.6766 8.1005v-5.6726a.7617.7617 0 0 0-.4019-.6778zm2.5312-3.804l-.142-.0852-4.783-2.7582a.7712.7712 0 0 0-.7806 0L8.4478 9.3883V7.0559a.0804.0804 0 0 1 .0332-.0615l4.8974-2.8277a4.4993 4.4993 0 0 1 6.1402 1.6564 4.4708 4.4708 0 0 1 .5346 3.0137zM8.3057 12.871l-2.02-1.1684a.0804.0804 0 0 1-.038-.052V6.068a4.504 4.504 0 0 1 7.371-3.4539l-.142.0805-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369zm1.3108-1.5046l2.3838-1.3768 2.3838 1.3768v2.7537l-2.3838 1.3768-2.3838-1.3768z"/></svg>`;
  
  const claudeSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" title="Anthropic / Claude"><path d="M17.472 2.05h-3.944L21.95 21.95h3.944L17.472 2.05zm-10.944 0L0 21.95h3.944l2.583-6.667h7.889l2.583 6.667h3.944L14.472 2.05H6.528zm2.25 10.333L10.5 6.05l1.722 6.333H8.778z"/></svg>`;
  
  const geminiSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" title="Google Gemini"><path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.627 12 12 0-6.627 5.627-12 12-12-6.627 0-12-5.627-12-12z"/></svg>`;
  
  const copilotSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" title="Microsoft Copilot"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07A5.002 5.002 0 0 1 7.07 13H8v-2h-.93A5.002 5.002 0 0 1 11 7.07V6h2v1.07A5.002 5.002 0 0 1 16.93 11H16v2h.93A5.002 5.002 0 0 1 13 16.93zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>`;
  
  const cursorSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" title="Cursor / OpenCode"><path d="M11.025.667L1.517 6.155A2.32 2.32 0 00.358 8.163v10.978c0 .83.442 1.597 1.159 2.008l9.508 5.488a2.32 2.32 0 002.32 0l9.508-5.488a2.32 2.32 0 001.159-2.008V8.163a2.32 2.32 0 00-1.159-2.008L13.345.667a2.32 2.32 0 00-2.32 0z"/></svg>`;
  
  const mcpSvg = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" title="Model Context Protocol"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 14.93V17a1 1 0 01-2 0v-.07a5 5 0 01-3.93-3.93H7a1 1 0 010-2h.07A5 5 0 0111 7.07V7a1 1 0 012 0v.07a5 5 0 013.93 3.93H17a1 1 0 010 2h-.07a5 5 0 01-3.93 3.93z"/></svg>`;

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

          <!-- 4. AI Agents -->
          <article class="channel-card card-agents">
            <div class="channel-img-box ai-agents-box">
              <div class="ai-logos-showcase">
                <div class="ai-logo-pill" title="OpenAI">${openaiSvg}</div>
                <div class="ai-logo-pill" title="Claude / Anthropic">${claudeSvg}</div>
                <div class="ai-logo-pill" title="Google Gemini">${geminiSvg}</div>
                <div class="ai-logo-pill" title="Microsoft Copilot">${copilotSvg}</div>
                <div class="ai-logo-pill" title="Cursor">${cursorSvg}</div>
                <div class="ai-logo-pill" title="MCP">${mcpSvg}</div>
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
