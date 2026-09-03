/**
 * Mirrored side blooms for empty section margins.
 * Same lotus vine on both sides; the right rail is a horizontal flip.
 */

export function renderSideRailsHtml(): string {
  return `
    <div class="side-rails" aria-hidden="true">
      <img class="side-rail side-rail-left" src="/images/line/side-bloom-lotus.png" alt="" />
      <img class="side-rail side-rail-right" src="/images/line/side-bloom-lotus.png" alt="" />
    </div>
  `;
}
