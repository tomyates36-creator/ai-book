// Client-side first pass. The edge function re-runs the same checks server-side (supabase/functions/_shared/safety.ts).
const BLOCKED = [
  "kill", "murder", "blood", "gore", "gun", "knife", "stab", "shoot", "weapon", "bomb", "drug", "cocaine", "weed", "alcohol", "beer", "vodka",
  "sex", "sexy", "naked", "nude", "kiss on the lips", "porn", "suicide", "self harm", "die", "dead", "death", "hate", "racist",
  "fuck", "shit", "bitch", "cunt", "bastard", "dick", "piss", "wank",
];
export function findUnsafe(...values: string[]): string | null {
  const text = values.join(" ").toLowerCase();
  for (const w of BLOCKED) {
    const re = new RegExp(`(^|[^a-z])${w.replace(/ /g, "\\s+")}([^a-z]|$)`, "i");
    if (re.test(text)) return w;
  }
  return null;
}
export function cleanName(s: string): string {
  return s.replace(/[^\p{L}\p{M}' -]/gu, "").trim().slice(0, 30);
}
export function cleanText(s: string, max = 200): string {
  return s.replace(/[<>{}`]/g, "").trim().slice(0, max);
}
