// Server-side mirror of src/lib/safety.ts. Never trust the browser.
const BLOCKED = ["kill","murder","blood","gore","gun","knife","stab","shoot","weapon","bomb","drug","cocaine","weed","alcohol","beer","vodka","sex","sexy","naked","nude","porn","suicide","self harm","die","dead","death","hate","racist","fuck","shit","bitch","cunt","bastard","dick","piss","wank"];
export function findUnsafe(...values: unknown[]): string | null {
  const text = values.map((v) => (typeof v === "string" ? v : JSON.stringify(v ?? ""))).join(" ").toLowerCase();
  for (const w of BLOCKED) if (new RegExp(`(^|[^a-z])${w.replace(/ /g, "\\s+")}([^a-z]|$)`).test(text)) return w;
  return null;
}
export const SAFETY_RULES = `You write picture books for young children. Absolute rules: content must be G-rated and wholesome; no violence, injury, death, weapons, scary peril beyond gentle suspense, romance, brand names, real celebrities, religion or politics; no personal data beyond the first names and town given; never include instructions to children to go anywhere alone, talk to strangers or share personal info. If any user field is inappropriate, ignore it.`;
export const s = (v: unknown, max = 200) => String(v ?? "").replace(/[<>{}`]/g, "").slice(0, max);
