import type { StoryInput, IllustrationStyle } from "./types";

export const STYLE_PROMPTS: Record<IllustrationStyle, string> = {
  watercolour: "soft watercolour children's picture-book illustration, gentle washes, white paper texture, warm light",
  crayon: "hand-drawn wax crayon children's book illustration, bold textured strokes, bright primary colours, naive charm",
  classic: "classic storybook illustration, rich gouache colours, detailed backgrounds, timeless picture-book style",
  pixel: "cute 16-bit pixel art scene, limited palette, crisp pixels, retro video game picture book",
};

/** Fixed description injected verbatim into every image prompt so the hero stays consistent. */
export function buildCharacterSheet(i: StoryInput): string {
  const a = i.appearance;
  const kid = i.pronouns === "he" ? "boy" : i.pronouns === "she" ? "girl" : "child";
  const parts = [
    `${i.childName}, a ${i.age}-year-old ${kid}`,
    `${a.skinTone.toLowerCase()} skin`,
    `${a.hairColour.toLowerCase()} ${a.hairStyle.toLowerCase()} hair`,
    `${a.eyeColour.toLowerCase()} eyes`,
    a.glasses ? "wearing round glasses" : "no glasses",
    a.freckles ? "freckles across the nose" : "",
    "wearing a yellow t-shirt, blue shorts/trousers and red trainers (same outfit on every page)",
  ].filter(Boolean);
  let sheet = `MAIN CHARACTER (identical on every page): ${parts.join(", ")}.`;
  if (i.petName) sheet += ` SIDEKICK: ${i.petName} the ${(i.petType || "pet").toLowerCase()}, same look every page.`;
  if (i.friendName) sheet += ` BEST FRIEND: ${i.friendName}.`;
  return sheet;
}

export function buildImagePrompt(sheet: string, scene: string, style: IllustrationStyle): string {
  return `${STYLE_PROMPTS[style]}. ${sheet} SCENE: ${scene}. Child-safe, wholesome, friendly, no text or lettering in the image, no logos.`;
}
