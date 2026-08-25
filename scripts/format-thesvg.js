import fs from 'fs';

const icons = JSON.parse(fs.readFileSync('thesvg-icons.json', 'utf8'));
const cleaned = {};

for (const [k, v] of Object.entries(icons)) {
  let s = v.replace(/<\?xml.*?\?>/gi, '').trim();
  s = s.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
    let a = attrs.replace(/\bwidth="[^"]*"/gi, '').replace(/\bheight="[^"]*"/gi, '').trim();
    return `<svg width="28" height="28" ${a}>`;
  });
  cleaned[k] = s;
}

fs.writeFileSync('thesvg-cleaned.json', JSON.stringify(cleaned, null, 2));
console.log('Successfully formatted all thesvg icons');
