import { renderPageLayout } from "./layout.js";
import {
  renderHowItWorksStyles,
  renderHowItWorksHtml,
  renderHowItWorksScripts,
} from "../components/how-it-works/index.js";

export function renderHowPageHtml(): string {
  const extraStyles = renderHowItWorksStyles();
  const bodyContent = renderHowItWorksHtml({ page: true });
  const extraScripts = `${renderHowItWorksScripts()}
    <script>
      window.switchLang = function(lang) {
        var copy = {
          en: {
            kicker: "HOW RAKSHA WORKS",
            title: 'You speak <br>once.<br>We carry <br>it <span class="hl-motion">through.</span>',
            desc: "You speak once. Raksha files a verified case through to 1930 and the bank. You stay in control at every step.",
            watch: "Watch the journey",
            sub: "See how a report moves through Raksha"
          },
          hi: {
            kicker: "रक्षा कैसे काम करती है",
            title: 'एक बार<br>बोलिए।<br>आगे <span class="hl-motion">हम ले चलते हैं।</span>',
            desc: "आप एक बार बोलें। रक्षा सत्यापित केस को 1930 और बैंक तक ले जाती है। हर कदम पर नियंत्रण आपके पास रहता है।",
            watch: "पूरा सफ़र देखें",
            sub: "देखें कि रिपोर्ट रक्षा में कैसे आगे बढ़ती है"
          },
          ta: {
            kicker: "ரக்ஷா எப்படி வேலை செய்கிறது",
            title: 'ஒருமுறை<br>சொல்லுங்கள்.<br>நாங்கள் <span class="hl-motion">இறுதிவரை நடத்துவோம்.</span>',
            desc: "ஒருமுறை சொல்லுங்கள். ரக்ஷா சரிபார்க்கப்பட்ட வழக்கை 1930 மற்றும் வங்கிவரை கொண்டு செல்கிறது. ஒவ்வொரு அடியிலும் கட்டுப்பாடு உங்களிடமே.",
            watch: "பயணத்தைப் பாருங்கள்",
            sub: "ஒரு புகார் ரக்ஷாவில் எப்படி நகர்கிறது என்று பாருங்கள்"
          }
        };
        var t = copy[lang] || copy.en;
        var k = document.getElementById("howKicker");
        var title = document.getElementById("howTitle");
        var desc = document.getElementById("howDesc");
        var watch = document.getElementById("howWatch");
        var sub = document.getElementById("howWatchSub");
        if (k) k.textContent = t.kicker;
        if (title) title.innerHTML = t.title;
        if (desc) desc.textContent = t.desc;
        if (watch) watch.textContent = t.watch;
        if (sub) sub.textContent = t.sub;
        if (typeof window.applyHowLang === "function") window.applyHowLang(lang);
      };
    </script>
  `;

  return renderPageLayout({
    title: "How Raksha works — The 6-Step Case Journey",
    activeNav: "how",
    bodyContent,
    extraStyles,
    extraScripts,
    isSingleScreen: false,
  });
}
