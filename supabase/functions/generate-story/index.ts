import { corsHeaders, json } from "../_shared/cors.ts";
import { chatJSON } from "../_shared/ai.ts";
import { findUnsafe, SAFETY_RULES, s } from "../_shared/safety.ts";

// Stateless: nothing about the child is stored. Inputs are used for this request only.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { input, regenerate } = await req.json();
    const bad = findUnsafe(input, regenerate);
    if (bad) return json({ error: `Please keep it child-friendly (remove "${bad}").` }, 400);
    const pages = [8, 12, 16].includes(input.pages) ? input.pages : 8;
    const brief = [
      `Hero: ${s(input.childName, 30)}, age ${Number(input.age) || 5}, pronouns ${s(input.pronouns, 10)}.`,
      `Loves: ${[...(input.interests ?? []).map((x: string) => s(x, 30)), s(input.interestsOther, 120)].filter(Boolean).join(", ") || "adventures"}.`,
      `World/theme: ${input.theme === "custom" ? s(input.customTheme, 120) : s(input.theme, 30)}.`,
      input.petName ? `Sidekick: ${s(input.petName, 30)} the ${s(input.petType, 30)}.` : "",
      input.friendName ? `Best friend: ${s(input.friendName, 30)}.` : "",
      input.hometown ? `Hometown: ${s(input.hometown, 60)}.` : "",
      `Tone: ${s(input.tone, 20)}. Rhyming: ${input.rhyming ? "yes, rhyming couplets with good rhythm" : "no, lyrical prose"}.`,
      `Reading level: ${s(input.readingLevel, 80)}. Gentle lesson: ${s(input.lesson, 40)}.`,
    ].filter(Boolean).join("\n");

    if (regenerate) {
      const i = Number(regenerate.index);
      const out = await chatJSON(SAFETY_RULES, `${brief}\nStory "${s(regenerate.title)}". Pages so far:\n${(regenerate.pages as string[]).map((t, j) => `${j + 1}. ${s(t, 600)}`).join("\n")}\n\nRewrite page ${i + 1} only, keeping continuity with the pages before and after. Return JSON {"text": string}.`) as { text: string };
      return json({ text: s(out.text, 600) });
    }

    const out = await chatJSON(SAFETY_RULES,
      `${brief}\n\nWrite a ${pages}-page personalised picture book where the hero is the star and solves the problem themselves. Each page 1-4 sentences suited to the reading level. Return JSON exactly: {"title": string, "coverPrompt": string, "pages": [{"text": string, "illustrationPrompt": string}]} with exactly ${pages} pages. illustrationPrompt describes only the scene, setting, action and emotion (do NOT describe the hero's appearance; that is added separately), no text in image.`,
    ) as { title: string; coverPrompt: string; pages: { text: string; illustrationPrompt: string }[] };
    if (!out?.pages?.length) throw new Error("Story came back empty");
    const story = { title: s(out.title, 80), coverPrompt: s(out.coverPrompt, 400), pages: out.pages.slice(0, pages).map((p) => ({ text: s(p.text, 600), illustrationPrompt: s(p.illustrationPrompt, 400) })) };
    if (findUnsafe(story)) throw new Error("Generated story failed the safety check, please try again");
    return json(story);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
