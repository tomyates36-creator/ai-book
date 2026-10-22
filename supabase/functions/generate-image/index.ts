import { corsHeaders, json } from "../_shared/cors.ts";
import { generateImage } from "../_shared/ai.ts";
import { findUnsafe, s } from "../_shared/safety.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { prompt, seed, reference } = await req.json();
    const ref = typeof reference === "string" && /^data:image\/(png|jpe?g|webp);base64,/.test(reference) && reference.length < 8_000_000 ? reference : undefined;
    const p = s(prompt, 1800);
    const bad = findUnsafe(p);
    if (bad) return json({ error: `Unsafe prompt ("${bad}")` }, 400);
    // Prompt already contains the fixed character sheet + style (built in src/lib/character.ts).
    const image = await generateImage(`${p} Children's book illustration, safe for ages 2-10.`, Number(seed) || 4242, ref);
    return json({ image });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
