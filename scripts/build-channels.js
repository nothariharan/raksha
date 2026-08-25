import fs from 'fs';

const icons = JSON.parse(fs.readFileSync('thesvg-cleaned.json', 'utf8'));

// Optimize OpenAI fill for light background: replace fill="#fff" with fill="#10A37F"
let openaiSvg = icons['openai'].replace(/fill="#fff"/gi, 'fill="#10A37F"');

// Optimize Cursor fill for light background: replace fill: #edecec with fill: #171717
let cursorSvg = icons['cursor'].replace(/fill:\s*#edecec/gi, 'fill: #171717');

let claudeSvg = icons['claude'];
let geminiSvg = icons['google-gemini'];
let copilotSvg = icons['microsoft-copilot'];
let perplexitySvg = icons['perplexity'];
let mistralSvg = icons['mistral'];
let metaSvg = icons['meta'];
let huggingFaceSvg = icons['hugging-face'];
let deepseekSvg = icons['deepseek'];
let groqSvg = icons['groq'];

const tsCode = `/**
 * How It Works — Channel Continuity & Trust Badges Section
 * "ONE CASE. EVERY CHANNEL."
 * Features 4 channel cards (Call, WhatsApp, Web, AI Agents with authentic AI logos from thesvg package) and 4 trust value props.
 */

export function renderChannelContinuityHtml(): string {
  // Official brand SVGs directly from thesvg v3.3.1
  const openaiSvg = \`${openaiSvg}\`;
  const claudeSvg = \`${claudeSvg}\`;
  const geminiSvg = \`${geminiSvg}\`;
  const copilotSvg = \`${copilotSvg}\`;
  const cursorSvg = \`${cursorSvg}\`;
  const perplexitySvg = \`${perplexitySvg}\`;
  const mistralSvg = \`${mistralSvg}\`;
  const metaSvg = \`${metaSvg}\`;
  const huggingFaceSvg = \`${huggingFaceSvg}\`;
  const deepseekSvg = \`${deepseekSvg}\`;
  const groqSvg = \`${groqSvg}\`;

  return \`
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
          <!-- 1. Call Raksha (Big full-opacity background icon behind mascot + Top-Right 1930 badge) -->
          <article class="channel-card card-call">
            <div class="channel-img-box">
              <div class="channel-bg-icon icon-bg-orange" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/></svg>
              </div>
              <img class="channel-mascot-img" src="/images/raksha/hero-call.png" alt="Citizen calling Raksha on phone" loading="lazy" />
              <div class="channel-floating-badge badge-pill badge-orange">
                <span class="badge-dot-orange"></span>
                <span>1930</span>
              </div>
            </div>
            <div class="channel-content">
              <h3>Call Raksha</h3>
              <p>Speak to us in your language.</p>
            </div>
          </article>

          <!-- 2. WhatsApp Raksha (Big full-opacity WhatsApp icon behind mascot) -->
          <article class="channel-card card-whatsapp">
            <div class="channel-img-box">
              <div class="channel-bg-icon icon-bg-green" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="#25D366"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.2 14.1c-.2.6-1.2 1.1-1.7 1.2-.5.1-1.1.2-3.6-.8-3.1-1.3-5.1-4.5-5.3-4.7-.1-.2-1.3-1.8-1.3-3.4 0-1.6.8-2.4 1.1-2.7.3-.3.7-.4 1-.4h.7c.2 0 .5 0 .7.6.3.7.9 2.3.9 2.5 0 .2 0 .4-.1.6-.1.2-.3.4-.5.6-.2.2-.4.4-.2.8.3.6 1.4 2.2 3.1 3 2 .9 2.4.7 2.8.4.3-.4.8-1 1-1.3.2-.3.5-.3.8-.1.3.1 2 1 2.3 1.2.3.2.5.3.6.5.1.3.1 1-.1 1.6z"/></svg>
              </div>
              <img class="channel-mascot-img" src="/images/raksha/hero-whatsapp.png" alt="Elderly citizen using WhatsApp for Raksha" loading="lazy" />
            </div>
            <div class="channel-content">
              <h3>WhatsApp Raksha</h3>
              <p>Send voice notes, photos or messages.</p>
            </div>
          </article>

          <!-- 3. Raksha on the Web (Big full-opacity Web Document icon behind mascot) -->
          <article class="channel-card card-web">
            <div class="channel-img-box">
              <div class="channel-bg-icon icon-bg-blue" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <img class="channel-mascot-img" src="/images/raksha/hero-web.png" alt="Citizen filing incident on Raksha web console" loading="lazy" />
            </div>
            <div class="channel-content">
              <h3>Raksha on the Web</h3>
              <p>Upload receipts, add details and review.</p>
            </div>
          </article>

          <!-- 4. AI Agents (Spherical Distributed Constellation with Generous Spacing) -->
          <article class="channel-card card-agents">
            <div class="channel-img-box ai-agents-box">
              <div class="ai-sphere-cluster">
                <!-- Outer Radial Ring (8 evenly spaced nodes) -->
                <div class="ai-sphere-node node-top" title="Anthropic / Claude">\${claudeSvg}</div>
                <div class="ai-sphere-node node-top-right" title="Microsoft Copilot">\${copilotSvg}</div>
                <div class="ai-sphere-node node-right" title="Cursor">\${cursorSvg}</div>
                <div class="ai-sphere-node node-bot-right" title="Perplexity AI">\${perplexitySvg}</div>
                <div class="ai-sphere-node node-bot" title="DeepSeek">\${deepseekSvg}</div>
                <div class="ai-sphere-node node-bot-left" title="Meta Llama">\${metaSvg}</div>
                <div class="ai-sphere-node node-left" title="Mistral AI">\${mistralSvg}</div>
                <div class="ai-sphere-node node-top-left" title="Hugging Face">\${huggingFaceSvg}</div>

                <!-- Inner Core Ring (3 evenly spaced nodes) -->
                <div class="ai-sphere-node node-inner-left" title="Groq">\${groqSvg}</div>
                <div class="ai-sphere-node node-center" title="Google Gemini">\${geminiSvg}</div>
                <div class="ai-sphere-node node-inner-right" title="OpenAI / ChatGPT">\${openaiSvg}</div>
              </div>
            </div>
            <div class="channel-content">
              <h3>AI Agents</h3>
              <p>Let AI agents assist and continue for you.</p>
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
  \`;
}
`;

fs.writeFileSync('apps/web/src/components/how-it-works/channels.ts', tsCode);
console.log('Successfully updated channels.ts with full opacity background icons and spaced AI sphere');
