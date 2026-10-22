export type Pronouns = "he" | "she" | "they";
export type Tone = "bedtime" | "funny" | "brave";
export type IllustrationStyle = "watercolour" | "crayon" | "classic" | "pixel";
export type PageCount = 8 | 12 | 16;

export interface Appearance {
  hairColour: string;
  hairStyle: string;
  skinTone: string;
  eyeColour: string;
  glasses: boolean;
  freckles: boolean;
}

export interface StoryInput {
  childName: string;
  age: number;
  pronouns: Pronouns;
  appearance: Appearance;
  interests: string[];
  interestsOther: string;
  theme: string;
  customTheme: string;
  petName: string;
  petType: string;
  friendName: string;
  hometown: string;
  tone: Tone;
  rhyming: boolean;
  pages: PageCount;
  style: IllustrationStyle;
  readingLevel: string;
  lesson: string;
  dedication: string;
  fromName: string;
}

export interface StoryPage {
  text: string;
  illustrationPrompt: string;
  image?: string; // data URL or https URL
}

export interface Story {
  title: string;
  coverPrompt: string;
  coverImage?: string;
  pages: StoryPage[];
  characterSheet: string;
  seed: number;
  mock: boolean;
}
