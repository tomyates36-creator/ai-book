export const HAIR_COLOURS = ["Black", "Dark brown", "Light brown", "Blonde", "Ginger", "Auburn", "Grey/silver", "Blue", "Pink"];
export const HAIR_STYLES = ["Short", "Curly", "Afro", "Long & straight", "Wavy", "Pigtails", "Ponytail", "Braids", "Buzz cut", "Bald"];
export const SKIN_TONES = [
  { label: "Very fair", hex: "#f6dcc8" },
  { label: "Fair", hex: "#eec4a4" },
  { label: "Light olive", hex: "#d9a87e" },
  { label: "Medium brown", hex: "#b47a52" },
  { label: "Brown", hex: "#8a5534" },
  { label: "Deep brown", hex: "#5c3720" },
];
export const EYE_COLOURS = ["Brown", "Dark brown", "Blue", "Green", "Hazel", "Grey"];
export const INTERESTS = ["Dinosaurs", "Space", "Football", "Animals", "Cars & trucks", "Unicorns", "Drawing", "Dancing", "Robots", "Trains", "Bugs", "Cooking", "Music", "Swimming", "Magic", "Building blocks"];
export const THEMES = [
  { id: "dinosaurs", label: "Dinosaurs", emoji: "🦖" },
  { id: "space", label: "Space", emoji: "🚀" },
  { id: "pirates", label: "Pirates", emoji: "🏴‍☠️" },
  { id: "knights", label: "Princesses & knights", emoji: "🏰" },
  { id: "sea", label: "Under the sea", emoji: "🐙" },
  { id: "jungle", label: "Jungle", emoji: "🌴" },
  { id: "superheroes", label: "Superheroes", emoji: "🦸" },
  { id: "custom", label: "Something else…", emoji: "✏️" },
];
export const TONES = [
  { id: "bedtime", label: "Bedtime calm", desc: "Soft, cosy, winds down to sleep" },
  { id: "funny", label: "Funny", desc: "Silly moments and giggles" },
  { id: "brave", label: "Brave adventure", desc: "Exciting, with a big challenge" },
] as const;
export const STYLES = [
  { id: "watercolour", label: "Watercolour", desc: "Soft washes, gentle colour" },
  { id: "crayon", label: "Crayon", desc: "Hand-drawn, playful texture" },
  { id: "classic", label: "Storybook classic", desc: "Rich, traditional picture book" },
  { id: "pixel", label: "Pixel art", desc: "Retro video-game look" },
] as const;
export const LESSONS = ["Sharing", "Bravery", "Kindness", "Trying new things", "Being yourself", "Friendship", "Patience", "Helping others", "No lesson — just fun"];
export const PET_TYPES = ["Dog", "Cat", "Rabbit", "Hamster", "Guinea pig", "Fish", "Bird", "Tortoise", "Teddy bear", "Dragon (imaginary)"];

export function readingLevelFor(age: number): string {
  if (age <= 3) return "Toddler (very short sentences, lots of repetition)";
  if (age <= 5) return "Early reader (simple words, short sentences)";
  if (age <= 7) return "Beginning reader (simple paragraphs)";
  return "Confident reader (richer vocabulary, longer paragraphs)";
}
export const READING_LEVELS = [
  "Toddler (very short sentences, lots of repetition)",
  "Early reader (simple words, short sentences)",
  "Beginning reader (simple paragraphs)",
  "Confident reader (richer vocabulary, longer paragraphs)",
];

export const PRODUCTS = [
  { id: "digital", title: "Digital Adventure", price: 9.99, priceFormatted: "£9.99", highlights: ["Instant digital adventure", "Downloadable PDF"], recommended: false },
  { id: "print", title: "The Real Book", price: 18.99, priceFormatted: "£18.99", highlights: ["Professionally printed", "Delivered to your door"], recommended: true },
] as const;
