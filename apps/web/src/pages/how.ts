import { renderPageLayout } from "./layout.js";
import {
  renderHowItWorksStyles,
  renderHowItWorksHtml,
  renderHowItWorksScripts,
} from "../components/how-it-works/index.js";

export function renderHowPageHtml(): string {
  const extraStyles = renderHowItWorksStyles();
  const bodyContent = renderHowItWorksHtml();
  const extraScripts = renderHowItWorksScripts();

  return renderPageLayout({
    title: "How Raksha works — The 6-Step Case Journey",
    activeNav: "how",
    bodyContent,
    extraStyles,
    extraScripts,
    isSingleScreen: false,
  });
}
