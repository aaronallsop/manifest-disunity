/*
 * Formatting helpers (M10.0, split out of js/app.js).
 *
 * Used by every other file in the shell. Loaded last only because nothing reads
 * them at evaluation time; they are hoisted function declarations like the rest.
 */

/* ------------------------------------------------------------------ */
/* formatting helpers                                                  */
/* ------------------------------------------------------------------ */
function fmtPop(n) {
  return n == null ? '&mdash;' : Math.round(n).toLocaleString('en-US');
}
function fmtGdp(n) {
  if (n == null) return '&mdash;';
  // Negatives fell through every magnitude branch and printed as a raw
  // "$-662,509,295"; treasuries go negative routinely now that actions cost money.
  const sign = n < 0 ? '&minus;$' : '$';
  const v = Math.abs(n);
  if (v >= 1e12) return sign + (v / 1e12).toFixed(2) + ' trillion';
  if (v >= 1e9) return sign + (v / 1e9).toFixed(1) + ' billion';
  if (v >= 1e6) return sign + (v / 1e6).toFixed(1) + ' million';
  return sign + Math.round(v).toLocaleString('en-US');
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
