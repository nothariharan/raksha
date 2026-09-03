/**
 * Mobile number normalization for Raksha.
 * All channels must pass mobile through normalizeMobile() before storing or comparing.
 *
 * Canonical form: digits only, no leading plus, 12-digit Indian numbers start with "91".
 * Examples:
 *   "+919876543210"  → "919876543210"
 *   "919876543210"   → "919876543210"
 *   "9876543210"     → "919876543210"
 *   "09876543210"    → "919876543210"
 *   "whatsapp:+919876543210" → "919876543210"
 */
export function normalizeMobile(raw: string): string {
  if (!raw) return "";
  // Strip whatsapp: prefix, spaces, hyphens, parens, leading plus
  const digits = raw
    .replace(/whatsapp:/i, "")
    .replace(/\s/g, "")
    .replace(/\+/g, "")
    .replace(/[^\d]/g, "");

  if (!digits) return "";

  // 10-digit Indian number (no country code)
  if (digits.length === 10 && !digits.startsWith("0")) {
    return "91" + digits;
  }
  // 11-digit with leading 0 (old STD format)
  if (digits.length === 11 && digits.startsWith("0")) {
    return "91" + digits.slice(1);
  }
  // Already 12-digit Indian (91XXXXXXXXXX)
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  // 13-digit with extra leading digit (rare formatting artefact like 091XXXXXXXXXX)
  if (digits.length === 13 && digits.startsWith("091")) {
    return digits.slice(1);
  }

  // Non-Indian or already canonical — return as-is (digits only)
  return digits;
}
