import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Story, StoryInput, StoryPage } from "./types";
import { mockIllustration, mockStory } from "./mock";
import { buildCharacterSheet, buildImagePrompt } from "./character";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const MOCK = !url || !key || import.meta.env.VITE_MOCK_MODE === "true";
let client: SupabaseClient | null = null;
function sb() {
  if (!client) client = createClient(url!, key!);
  return client;
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function invoke<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await sb().functions.invoke(fn, { body });
  if (error) throw new Error(error.message);
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as T;
}

export async function generateStory(input: StoryInput): Promise<Story> {
  if (MOCK) { await wait(900); const s = mockStory(input); return { ...s, coverImage: undefined, pages: s.pages.map((p) => ({ ...p, image: undefined })) }; }
  const res = await invoke<{ title: string; coverPrompt: string; pages: StoryPage[] }>("generate-story", { input });
  return { ...res, characterSheet: buildCharacterSheet(input), seed: Math.floor(Math.random() * 1e9), mock: false };
}

/** Downscale the cover to a compact JPEG so it can be sent as the reference image. */
async function compactReference(src: string, px = 768): Promise<string> {
  const img = new Image();
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error("cover load failed")); img.src = src; });
  const c = document.createElement("canvas");
  c.width = px; c.height = px;
  c.getContext("2d")!.drawImage(img, 0, 0, px, px);
  return c.toDataURL("image/jpeg", 0.88);
}

/** index -1 = cover (text-to-image). Pages pass the stored cover as a reference image + the same character sheet, style and seed. */
export async function generateImage(input: StoryInput, story: Story, scene: string, index: number): Promise<string> {
  const isCover = index < 0;
  if (!isCover && !story.coverImage) throw new Error("Cover must be generated before pages");
  if (MOCK) {
    await wait(250);
    referenceLog.push({ index, usedCover: !isCover && !!story.coverImage });
    return mockIllustration(input, isCover ? 9 : index, isCover ? "cover" : `page ${index + 1} · ref: cover`);
  }
  const prompt = buildImagePrompt(story.characterSheet, scene, input.style);
  const reference = isCover ? undefined : await compactReference(story.coverImage!);
  const res = await invoke<{ image: string }>("generate-image", { prompt, seed: story.seed, style: input.style, reference });
  return res.image;
}
/** Mock-mode record of which calls received the cover as reference (inspected by the e2e test). */
export const referenceLog: { index: number; usedCover: boolean }[] = [];
if (typeof window !== "undefined") (window as unknown as { __inktalesRefLog: typeof referenceLog }).__inktalesRefLog = referenceLog;

export async function regenerateText(input: StoryInput, story: Story, index: number): Promise<string> {
  if (MOCK) { await wait(400); return story.pages[index].text.replace(/\.$/, "") + " — and this time it was even more magical."; }
  const res = await invoke<{ text: string }>("generate-story", { input, regenerate: { index, title: story.title, pages: story.pages.map((p) => p.text) } });
  return res.text;
}
