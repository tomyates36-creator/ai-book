import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Story, StoryInput } from "./types";

// Child data lives ONLY in this browser tab's sessionStorage. Closing the tab deletes it.
const KEY = "inktales:session";
export const DEFAULT_INPUT: StoryInput = {
  childName: "", age: 5, pronouns: "they",
  appearance: { hairColour: "Dark brown", hairStyle: "Curly", skinTone: "Light olive", eyeColour: "Brown", glasses: false, freckles: false },
  interests: [], interestsOther: "", theme: "dinosaurs", customTheme: "", petName: "", petType: "Dog", friendName: "", hometown: "",
  tone: "brave", rhyming: false, pages: 8, style: "watercolour", readingLevel: "Early reader (simple words, short sentences)",
  lesson: "Bravery", dedication: "", fromName: "",
};
interface State { input: StoryInput; story: Story | null; order: "digital" | "print" | null }
interface Ctx extends State { setInput: (i: StoryInput) => void; setStory: (s: Story | null) => void; setOrder: (o: State["order"]) => void; clear: () => void }
const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => {
    try { const raw = sessionStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch { /* ignore */ }
    return { input: DEFAULT_INPUT, story: null, order: null };
  });
  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* quota: images too big, keep in memory */ } }, [state]);
  const v: Ctx = {
    ...state,
    setInput: (input) => setState((s) => ({ ...s, input })),
    setStory: (story) => setState((s) => ({ ...s, story })),
    setOrder: (order) => setState((s) => ({ ...s, order })),
    clear: () => { sessionStorage.removeItem(KEY); setState({ input: DEFAULT_INPUT, story: null, order: null }); },
  };
  return <C.Provider value={v}>{children}</C.Provider>;
}
export function useStore() { const c = useContext(C); if (!c) throw new Error("no store"); return c; }
