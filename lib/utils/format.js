/**
 * Normalize any casing (ALL CAPS, lowercase, mixed) to Title Case for display.
 * "ELECTRICAL WIRES" | "electrical wires" -> "Electrical Wires"
 * Non-destructive: use at render time only; stored data is unchanged.
 */
export function titleCase(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .toLowerCase()
    .split(/(\s+)/) // keep whitespace tokens so spacing is preserved
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join("");
}
