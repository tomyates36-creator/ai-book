import type { Story, StoryInput, StoryPage } from "./types";
import { buildCharacterSheet } from "./character";
import { SKIN_TONES, THEMES } from "./options";

const HAIR_HEX: Record<string, string> = {
  Black: "#1d1a18", "Dark brown": "#3b2516", "Light brown": "#7a5233", Blonde: "#e3c06a", Ginger: "#c8642a",
  Auburn: "#8c3a22", "Grey/silver": "#b9b9b9", Blue: "#3b6fd1", Pink: "#e57fb3",
};
const SCENE_BG: Record<string, [string, string]> = {
  dinosaurs: ["#9fd18b", "#3d7a4f"], space: ["#1b2350", "#5b3a8c"], pirates: ["#7cc4e4", "#2f6f9a"], knights: ["#f2c6d8", "#8a6bb0"],
  sea: ["#5fc3d6", "#155a7a"], jungle: ["#7fc27a", "#235c32"], superheroes: ["#f6d36b", "#d1493a"], custom: ["#f4d9a8", "#c77a4a"],
};

/** Placeholder illustration as an SVG data URL, drawn with the character's real colours. */
export function mockIllustration(input: StoryInput, index: number, label: string): string {
  const [a, b] = SCENE_BG[input.theme] ?? SCENE_BG.custom;
  const skin = SKIN_TONES.find((s) => s.label === input.appearance.skinTone)?.hex ?? "#d9a87e";
  const hair = HAIR_HEX[input.appearance.hairColour] ?? "#3b2516";
  const emoji = THEMES.find((t) => t.id === input.theme)?.emoji ?? "✨";
  const x = 160 + ((index * 53) % 120);
  const glasses = input.appearance.glasses
    ? `<circle cx="${x - 9}" cy="196" r="7" fill="none" stroke="#222" stroke-width="2.5"/><circle cx="${x + 9}" cy="196" r="7" fill="none" stroke="#222" stroke-width="2.5"/><line x1="${x - 2}" y1="196" x2="${x + 2}" y2="196" stroke="#222" stroke-width="2"/>`
    : `<circle cx="${x - 8}" cy="196" r="2.5" fill="#222"/><circle cx="${x + 8}" cy="196" r="2.5" fill="#222"/>`;
  const freckles = input.appearance.freckles ? `<g fill="#a0522d" opacity=".7"><circle cx="${x - 12}" cy="206" r="1.4"/><circle cx="${x - 8}" cy="209" r="1.4"/><circle cx="${x + 9}" cy="208" r="1.4"/><circle cx="${x + 13}" cy="205" r="1.4"/></g>` : "";
  const pet = input.petName ? `<text x="${x + 70}" y="300" font-size="44">🐾</text>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="512" height="512" fill="url(#g)"/>
<circle cx="${420 - index * 9}" cy="90" r="46" fill="#fff6c9" opacity=".8"/>
<ellipse cx="256" cy="470" rx="320" ry="90" fill="#000" opacity=".12"/>
<text x="330" y="330" font-size="120">${emoji}</text>
<rect x="${x - 22}" y="222" width="44" height="58" rx="10" fill="#f3c33b"/>
<rect x="${x - 20}" y="276" width="16" height="44" fill="#3a5fb0"/><rect x="${x + 4}" y="276" width="16" height="44" fill="#3a5fb0"/>
<rect x="${x - 24}" y="316" width="22" height="10" rx="4" fill="#d33"/><rect x="${x + 2}" y="316" width="22" height="10" rx="4" fill="#d33"/>
<circle cx="${x}" cy="195" r="28" fill="${skin}"/>
<path d="M${x - 29} 190 Q${x} 150 ${x + 29} 190 Q${x + 20} 172 ${x} 172 Q${x - 20} 172 ${x - 29} 190Z" fill="${hair}"/>
${glasses}${freckles}<path d="M${x - 8} 210 Q${x} 217 ${x + 8} 210" stroke="#222" stroke-width="2.5" fill="none"/>
${pet}
<rect x="0" y="462" width="512" height="50" fill="#000" opacity=".35"/>
<text x="256" y="494" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="18" fill="#fff">MOCK ILLUSTRATION · ${label.replace(/[<&>]/g, "")}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function mockStory(input: StoryInput): Story {
  const n = input.childName;
  const they = input.pronouns === "he" ? "he" : input.pronouns === "she" ? "she" : "they";
  const their = input.pronouns === "he" ? "his" : input.pronouns === "she" ? "her" : "their";
  const themeLabel = input.theme === "custom" ? input.customTheme || "a secret world" : THEMES.find((t) => t.id === input.theme)?.label.toLowerCase();
  const pal = input.petName ? `${input.petName} the ${input.petType.toLowerCase() || "pet"}` : input.friendName || "a brand-new friend";
  const town = input.hometown || "home";
  const love = [...input.interests, input.interestsOther].filter(Boolean)[0]?.toLowerCase() || "adventures";
  const lesson = input.lesson.toLowerCase();
  const beats = [
    `In ${town}, ${n} was getting ready for bed when a glow appeared under the door. "Something's out there," ${they} whispered to ${pal}.`,
    `Through the door was a world of ${themeLabel}! Everything shimmered, and a voice called ${n}'s name.`,
    `"We need someone who loves ${love}," said a tiny guide. ${n} grinned. That was exactly ${their} favourite thing.`,
    `The path wobbled and twisted. ${pal} held on tight as ${n} led the way, one careful step at a time.`,
    `Soon they found a friend who was stuck and sad. ${n} remembered something important about ${lesson}.`,
    `Together they worked out a clever plan, and it was ${n}'s idea that made it work.`,
    `Everyone cheered! The whole world of ${themeLabel} sparkled brighter than before.`,
    `Back in bed in ${town}, ${n} smiled. Tomorrow could be another adventure. The end.`,
  ];
  while (beats.length < input.pages) beats.splice(beats.length - 1, 0, `${n} and ${pal} explored a little further, laughing as they discovered surprise number ${beats.length - 6}.`);
  const sheet = buildCharacterSheet(input);
  const pages: StoryPage[] = beats.slice(0, input.pages).map((text, i) => ({
    text,
    illustrationPrompt: `${n} in the ${themeLabel} world, story beat ${i + 1}: ${text.slice(0, 80)}`,
    image: mockIllustration(input, i, `page ${i + 1}`),
  }));
  return {
    title: `${n}'s ${themeLabel ? themeLabel[0].toUpperCase() + themeLabel.slice(1) : "Big"} Adventure`,
    coverPrompt: `${n} as the hero on a ${themeLabel} storybook cover`,
    coverImage: mockIllustration(input, 9, "cover"),
    pages,
    characterSheet: sheet,
    seed: 4242,
    mock: true,
  };
}
