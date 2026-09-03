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
            title: 'You bring <br>the story.<br>We handle <br>the <span class="hl-motion">rest.</span>',
            desc: "Raksha turns what you share into a verified report and gets it to the right authorities. You stay in control at every step.",
            watch: "Watch the journey",
            sub: "See how a report moves through Raksha"
          },
          hi: {
            kicker: "रक्षा कैसे काम करती है",
            title: 'आप कहानी<br>लाते हैं।<br>बाकी <span class="hl-motion">हम संभालते हैं।</span>',
            desc: "रक्षा जो भी आप साझा कर सकते हैं उसे सत्यापित रिपोर्ट बनाती है और सही अधिकारियों तक पहुँचाती है। हर कदम पर नियंत्रण आपके पास रहता है।",
            watch: "पूरा सफ़र देखें",
            sub: "देखें कि रिपोर्ट रक्षा में कैसे आगे बढ़ती है"
          },
          ta: {
            kicker: "ரக்ஷா எப்படி வேலை செய்கிறது",
            title: 'நீங்கள் கதையைக்<br>கொண்டு வாருங்கள்.<br>மீதியை <span class="hl-motion">நாங்கள் கையாளுகிறோம்.</span>',
            desc: "நீங்கள் பகிரக்கூடியதை ரக்ஷா சரிபார்க்கப்பட்ட புகாராக மாற்றி சரியான அதிகாரிகளிடம் கொண்டு செல்கிறது. ஒவ்வொரு அடியிலும் கட்டுப்பாடு உங்களிடமே.",
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
