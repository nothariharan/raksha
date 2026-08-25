/**
 * Single-Screen Editorial Hero Landing Page for Raksha
 * Fits strictly in one viewport without scroll.
 */

import { renderPageLayout } from "./layout.js";

export function renderHomePageHtml(): string {
  const extraStyles = `
    .hero-container {
      max-width: 1360px;
      margin: 0 auto;
      padding: 2.5rem 3rem 1.5rem 3rem;
      height: calc(100vh - 85px);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.15fr 1.5fr 1.15fr;
      gap: 3rem;
      align-items: center;
      width: 100%;
    }

    /* Left Column */
    .hero-left {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      text-align: left;
    }
    .hero-headline {
      font-size: 3.2rem;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.035em;
      color: var(--text);
    }
    .hero-headline .text-orange {
      color: var(--orange);
      display: block;
    }
    .hero-subtext {
      color: var(--text-muted);
      font-size: 1.05rem;
      line-height: 1.6;
      font-weight: 400;
      max-width: 380px;
    }

    /* Center Column */
    .hero-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      position: relative;
    }
    .hero-art-frame {
      width: 100%;
      height: 330px;
      background: var(--bg-white);
      border: 1px solid var(--border);
      border-radius: 20px;
      overflow: hidden;
      position: relative;
      box-shadow: var(--card-shadow-lg);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-art-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.35s ease, transform 0.35s ease;
    }

    /* Floating UI Overlay Card */
    .hero-overlay-pill {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border);
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      transition: all 0.25s ease;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--orange);
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.6); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(234, 88, 12, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0); }
    }

    /* Segmented Control Mode Selector */
    .segmented-control {
      display: flex;
      background: var(--bg-white);
      border: 1px solid var(--border);
      border-radius: 9999px;
      padding: 0.3rem;
      box-shadow: var(--card-shadow);
      width: 100%;
      max-width: 480px;
    }
    .seg-btn {
      flex: 1;
      background: transparent;
      border: none;
      padding: 0.65rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.86rem;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      outline: none;
    }
    .seg-btn:hover {
      color: var(--text);
    }
    .seg-btn.active-call {
      background: var(--orange);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.28);
    }
    .seg-btn.active-whatsapp {
      background: var(--green);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.28);
    }
    .seg-btn.active-web {
      background: var(--blue);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.28);
    }
    .seg-btn svg {
      width: 16px;
      height: 16px;
      stroke-width: 2;
    }

    /* Right Column */
    .hero-right {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      min-height: 260px;
      justify-content: center;
      transition: opacity 0.25s ease;
    }
    .mode-tag {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      margin-bottom: 0.85rem;
    }
    .tag-call { background: var(--orange-light); color: var(--orange); border: 1px solid var(--orange-border); }
    .tag-whatsapp { background: var(--green-light); color: var(--green); border: 1px solid var(--green-border); }
    .tag-web { background: var(--blue-light); color: var(--blue); border: 1px solid var(--blue-border); }

    .mode-headline {
      font-size: 2.3rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text);
      margin-bottom: 0.65rem;
    }
    .mode-description {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.55;
      margin-bottom: 1.5rem;
      max-width: 320px;
    }

    .mode-bullets {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .mode-bullet-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text);
    }
    .bullet-icon-box {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bullet-icon-box svg {
      width: 14px;
      height: 14px;
      stroke-width: 2.2;
    }
    .icon-call { background: var(--orange-light); color: var(--orange); }
    .icon-whatsapp { background: var(--green-light); color: var(--green); }
    .icon-web { background: var(--blue-light); color: var(--blue); }

    /* Responsive */
    @media (max-width: 1024px) {
      .hero-container { height: auto; padding: 2rem 1.5rem; }
      .hero-grid { grid-template-columns: 1fr; gap: 2rem; }
      .hero-headline { font-size: 2.4rem; }
      .hero-art-frame { height: 260px; }
    }
  `;

  const bodyContent = `
    <div class="hero-container">
      <div class="hero-grid">

        <!-- LEFT: Headline & Concise Narrative -->
        <div class="hero-left">
          <h1 class="hero-headline" id="txtHeroHead">
            Tell us what<br>happened.<br>
            <span class="text-orange">We’ll handle the rest.</span>
          </h1>
          <p class="hero-subtext" id="txtHeroSub">
            Speak, send a screenshot, or message us. Raksha turns what happened into an emergency report and carries it through the system for you.
          </p>
        </div>

        <!-- CENTER: Illustration & Segmented Control -->
        <div class="hero-center">
          <div class="hero-art-frame">
            <img 
              id="heroArtImg" 
              src="/images/raksha/hero-call.png" 
              alt="Raksha Call Mode" 
              class="hero-art-img"
              onerror="this.src='/images/hero-illustration-call.png'" 
            />
            <div class="hero-overlay-pill" id="heroOverlayPill">
              <span class="pulse-dot"></span>
              <span id="heroOverlayText">Calling Raksha · 1930</span>
            </div>
          </div>

          <!-- Mode Selector (Segmented Control) -->
          <div class="segmented-control" role="tablist">
            <button id="btnModeCall" class="seg-btn active-call" onclick="setMode('call')" onmouseenter="setMode('call')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <span>Call Raksha</span>
            </button>
            <button id="btnModeWhatsapp" class="seg-btn" onclick="setMode('whatsapp')" onmouseenter="setMode('whatsapp')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              <span>WhatsApp Raksha</span>
            </button>
            <button id="btnModeWeb" class="seg-btn" onclick="setMode('web')" onmouseenter="setMode('web')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              <span>Use Raksha Web</span>
            </button>
          </div>
        </div>

        <!-- RIGHT: Dynamic Synchronized State -->
        <div class="hero-right" id="heroRightCol">
          <!-- Injected via setMode() -->
        </div>

      </div>
    </div>
  `;

  const extraScripts = `
    <script>
      const MODES = {
        call: {
          tagClass: "tag-call",
          tagText: "CALL RAKSHA",
          headline: "Just call.",
          desc: "Talk to Raksha in your language. No forms. No confusion. We'll understand and guide you.",
          bullets: [
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg>', iconClass: "icon-call", text: "Voice-first support" },
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>', iconClass: "icon-call", text: "Works in any language" },
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>', iconClass: "icon-call", text: "Guided reporting" }
          ],
          image: "/images/raksha/hero-call.png",
          fallbackImage: "/images/hero-illustration-call.png",
          overlayHtml: '<span class="pulse-dot"></span> Calling Raksha · 1930'
        },
        whatsapp: {
          tagClass: "tag-whatsapp",
          tagText: "WHATSAPP RAKSHA",
          headline: "Just message.",
          desc: "Send a voice note, screenshot, or text. We'll take it from there.",
          bullets: [
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg>', iconClass: "icon-whatsapp", text: "No forms" },
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>', iconClass: "icon-whatsapp", text: "Continue the same case" },
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>', iconClass: "icon-whatsapp", text: "Send anything" }
          ],
          image: "/images/raksha/hero-whatsapp.png",
          fallbackImage: "/images/hero-illustration-whatsapp.png",
          overlayHtml: '<svg style="width:14px;height:14px;color:var(--green);" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> Voice Note · 0:18'
        },
        web: {
          tagClass: "tag-web",
          tagText: "USE RAKSHA ON WEB",
          headline: "Just show us.",
          desc: "Upload the transaction or tell us what happened. We'll extract, verify and prepare the report.",
          bullets: [
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>', iconClass: "icon-web", text: "Screenshot extraction" },
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>', iconClass: "icon-web", text: "Evidence integrity" },
            { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>', iconClass: "icon-web", text: "Fast reporting" }
          ],
          image: "/images/raksha/hero-web.png",
          fallbackImage: "/images/hero-illustration-web.png",
          overlayHtml: '<svg style="width:14px;height:14px;color:var(--blue);" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ₹5,000 SBI UPI Verified'
        }
      };

      let activeMode = "call";

      function setMode(mode) {
        if (!MODES[mode]) return;
        activeMode = mode;
        const cfg = MODES[mode];

        // 1. Update Segmented Buttons
        document.getElementById("btnModeCall").className = "seg-btn" + (mode === "call" ? " active-call" : "");
        document.getElementById("btnModeWhatsapp").className = "seg-btn" + (mode === "whatsapp" ? " active-whatsapp" : "");
        document.getElementById("btnModeWeb").className = "seg-btn" + (mode === "web" ? " active-web" : "");

        // 2. Update Image & Overlay
        const img = document.getElementById("heroArtImg");
        img.style.opacity = "0";
        img.style.transform = "scale(0.98)";
        
        setTimeout(() => {
          img.src = cfg.image;
          img.onerror = () => { img.src = cfg.fallbackImage; };
          img.style.opacity = "1";
          img.style.transform = "scale(1)";
        }, 150);

        document.getElementById("heroOverlayPill").innerHTML = cfg.overlayHtml;

        // 3. Update Right Column
        const rightCol = document.getElementById("heroRightCol");
        rightCol.style.opacity = "0";
        
        setTimeout(() => {
          const bulletsHtml = cfg.bullets.map(b => \`
            <li class="mode-bullet-item">
              <span class="bullet-icon-box \${b.iconClass}">\${b.icon}</span>
              <span>\${b.text}</span>
            </li>
          \`).join("");

          rightCol.innerHTML = \`
            <div class="mode-tag \${cfg.tagClass}">\${cfg.tagText}</div>
            <h2 class="mode-headline">\${cfg.headline}</h2>
            <p class="mode-description">\${cfg.desc}</p>
            <ul class="mode-bullets">\${bulletsHtml}</ul>
          \`;
          rightCol.style.opacity = "1";
        }, 150);
      }

      window.switchLang = function(lang) {
        if (lang === "hi") {
          document.getElementById("txtHeroHead").innerHTML = 'बताइए क्या हुआ।<br><span class="text-orange">बाकी हम संभाल लेंगे।</span>';
          document.getElementById("txtHeroSub").innerText = 'बोलें, स्क्रीनशॉट भेजें या संदेश लिखें। रक्षा इसे तुरंत आपातकालीन रिपोर्ट में बदल देती है।';
        } else {
          document.getElementById("txtHeroHead").innerHTML = 'Tell us what<br>happened.<br><span class="text-orange">We’ll handle the rest.</span>';
          document.getElementById("txtHeroSub").innerText = 'Speak, send a screenshot, or message us. Raksha turns what happened into an emergency report and carries it through the system for you.';
        }
      };

      // Initialize
      setMode("call");
    </script>
  `;

  return renderPageLayout({
    title: "Multimodal Emergency Public-Service Protocol",
    bodyContent,
    extraStyles,
    extraScripts,
    isSingleScreen: true,
  });
}
