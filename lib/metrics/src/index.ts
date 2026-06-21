/**
 * Determines whether a metric value meets its stored goal. This is the single
 * source of truth shared by the API server (deterministic scoring) and the web
 * client (on/off-target badges) so the two never drift. The per-metric `target`
 * string is the source of truth. Returns `null` when the target is missing or
 * not comparable (e.g. `—`, `baseline ±20%`, or text without a number).
 *
 * Parses common target shapes: `≥ 85%`, `< 60 s`, `≤ 2%`, `0`,
 * ranges (`R$ 0,10–0,40`) and signed thresholds (`≥ +5pp`).
 */
export function metricTargetStatus(
  value: number,
  target: string | undefined,
): "on" | "off" | null {
  if (!target) return null;
  const t = target.trim();
  if (!t || t === "—" || t === "-") return null;
  // References to a baseline we don't have are not comparable.
  if (/baseline/i.test(t) || /±/.test(t)) return null;

  // Normalize pt-BR decimals (comma → dot) for numeric parsing.
  const norm = t.replace(/,/g, ".");

  // Range like "R$ 0.10–0.40" (en/em dash between two numbers).
  const range = norm.match(/(\d+(?:\.\d+)?)\s*[–—]\s*(\d+(?:\.\d+)?)/);
  if (range) {
    const lo = parseFloat(range[1]!);
    const hi = parseFloat(range[2]!);
    return value >= lo && value <= hi ? "on" : "off";
  }

  const numMatch = norm.match(/-?\d+(?:\.\d+)?/);
  if (!numMatch) return null;
  const num = parseFloat(numMatch[0]);

  // "lower is better" operators.
  if (/≤|<=|</.test(t)) return value <= num ? "on" : "off";
  // "higher is better" operators.
  if (/≥|>=|>/.test(t)) return value >= num ? "on" : "off";
  // No operator (e.g. "0" violations) → treat as an upper bound.
  return value <= num ? "on" : "off";
}
