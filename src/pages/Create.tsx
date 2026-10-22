import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { EYE_COLOURS, HAIR_COLOURS, HAIR_STYLES, INTERESTS, LESSONS, PET_TYPES, READING_LEVELS, SKIN_TONES, STYLES, THEMES, TONES, readingLevelFor } from "@/lib/options";
import { cleanName, cleanText, findUnsafe } from "@/lib/safety";
import type { StoryInput } from "@/lib/types";

const STEPS = ["The hero", "Their look", "What they love", "The story", "Pictures", "Dedication"];

function Chip({ on, onClick, children, testId }: { on: boolean; onClick: () => void; children: ReactNode; testId?: string }) {
  return <button type="button" data-on={on} data-testid={testId} onClick={onClick} className="chip">{children}</button>;
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="mb-5"><label className="label">{label}</label>{children}</div>;
}

export default function Create() {
  const { input, setInput, setStory } = useStore();
  const [step, setStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();
  const set = (patch: Partial<StoryInput>) => setInput({ ...input, ...patch });
  const setA = (patch: Partial<StoryInput["appearance"]>) => set({ appearance: { ...input.appearance, ...patch } });
  const name = input.childName || "your hero";
  const toggleInterest = (i: string) => set({ interests: input.interests.includes(i) ? input.interests.filter((x) => x !== i) : [...input.interests, i].slice(0, 5) });

  function next() {
    setErr(null);
    if (step === 0 && !cleanName(input.childName)) return setErr("Please add their first name.");
    if (step === 3 && input.theme === "custom" && !input.customTheme.trim()) return setErr("Tell us what the story world should be.");
    const bad = findUnsafe(input.childName, input.interestsOther, input.customTheme, input.petName, input.friendName, input.hometown, input.dedication, input.fromName);
    if (bad) return setErr(`Let's keep it child-friendly. Please change the word "${bad}".`);
    if (step < STEPS.length - 1) return setStep(step + 1);
    setInput({
      ...input, childName: cleanName(input.childName), friendName: cleanName(input.friendName), petName: cleanName(input.petName), fromName: cleanName(input.fromName),
      interestsOther: cleanText(input.interestsOther, 120), customTheme: cleanText(input.customTheme, 120), hometown: cleanText(input.hometown, 60), dedication: cleanText(input.dedication, 300),
    });
    setStory(null);
    nav("/preview");
  }

  return (
    <Shell badge={`step ${step + 1}/${STEPS.length}`}>
      <section className="px-5 pb-6 pt-6">
        <div className="mb-2 flex gap-1">{STEPS.map((s, i) => <div key={s} className={`h-2 flex-1 rounded-full border border-ink ${i <= step ? "bg-punch" : "bg-paper"}`} />)}</div>
        <span className="font-hand text-2xl text-leaf">create their adventure</span>
        <h1 className="font-display text-3xl" data-testid="step-title">{STEPS[step]}</h1>
        <div className="card-block mt-4 rounded-md bg-paper p-4">
          {step === 0 && <>
            <Field label="Child's first name"><input data-testid="name" className="field" maxLength={30} value={input.childName} onChange={(e) => set({ childName: e.target.value })} placeholder="e.g. George" /></Field>
            <Field label={`Age: ${input.age}`}><input type="range" min={1} max={10} value={input.age} onChange={(e) => { const age = +e.target.value; set({ age, readingLevel: readingLevelFor(age) }); }} className="w-full accent-[oklch(60%_.199_27.8)]" /></Field>
            <Field label="Pronouns"><div className="flex gap-2">{(["he", "she", "they"] as const).map((p) => <Chip key={p} on={input.pronouns === p} onClick={() => set({ pronouns: p })}>{p === "he" ? "He/him" : p === "she" ? "She/her" : "They/them"}</Chip>)}</div></Field>
          </>}
          {step === 1 && <>
            <p className="mb-4 text-xs font-semibold text-ink/70">We draw {name} from a description. No photos needed, ever.</p>
            <Field label="Skin tone"><div className="flex flex-wrap gap-2">{SKIN_TONES.map((s) => <button key={s.label} type="button" title={s.label} onClick={() => setA({ skinTone: s.label })} className={`h-10 w-10 rounded-full border-2 ${input.appearance.skinTone === s.label ? "border-ink ring-2 ring-punch ring-offset-2" : "border-ink/40"}`} style={{ background: s.hex }} />)}</div></Field>
            <Field label="Hair colour"><div className="flex flex-wrap gap-2">{HAIR_COLOURS.map((h) => <Chip key={h} on={input.appearance.hairColour === h} onClick={() => setA({ hairColour: h })}>{h}</Chip>)}</div></Field>
            <Field label="Hair style"><div className="flex flex-wrap gap-2">{HAIR_STYLES.map((h) => <Chip key={h} on={input.appearance.hairStyle === h} onClick={() => setA({ hairStyle: h })}>{h}</Chip>)}</div></Field>
            <Field label="Eye colour"><div className="flex flex-wrap gap-2">{EYE_COLOURS.map((h) => <Chip key={h} on={input.appearance.eyeColour === h} onClick={() => setA({ eyeColour: h })}>{h}</Chip>)}</div></Field>
            <div className="flex gap-2"><Chip on={input.appearance.glasses} onClick={() => setA({ glasses: !input.appearance.glasses })}>👓 Glasses</Chip><Chip on={input.appearance.freckles} onClick={() => setA({ freckles: !input.appearance.freckles })}>✨ Freckles</Chip></div>
          </>}
          {step === 2 && <>
            <Field label="Favourite things (up to 5)"><div className="flex flex-wrap gap-2">{INTERESTS.map((i) => <Chip key={i} testId={`interest-${i}`} on={input.interests.includes(i)} onClick={() => toggleInterest(i)}>{i}</Chip>)}</div></Field>
            <Field label="Anything else they love?"><input className="field" maxLength={120} value={input.interestsOther} onChange={(e) => set({ interestsOther: e.target.value })} placeholder="e.g. jam sandwiches, their red wellies" /></Field>
            <Field label="Pet or sidekick (optional)"><div className="flex gap-2"><input data-testid="pet" className="field" maxLength={30} value={input.petName} onChange={(e) => set({ petName: e.target.value })} placeholder="Name, e.g. Biscuit" /><select className="field max-w-[45%]" value={input.petType} onChange={(e) => set({ petType: e.target.value })}>{PET_TYPES.map((p) => <option key={p}>{p}</option>)}</select></div></Field>
            <Field label="Best friend (optional)"><input className="field" maxLength={30} value={input.friendName} onChange={(e) => set({ friendName: e.target.value })} placeholder="First name" /></Field>
            <Field label="Hometown (optional)"><input data-testid="town" className="field" maxLength={60} value={input.hometown} onChange={(e) => set({ hometown: e.target.value })} placeholder="e.g. Manchester" /></Field>
          </>}
          {step === 3 && <>
            <Field label="Story world"><div className="grid grid-cols-2 gap-2">{THEMES.map((t) => <Chip key={t.id} testId={`theme-${t.id}`} on={input.theme === t.id} onClick={() => set({ theme: t.id })}>{t.emoji} {t.label}</Chip>)}</div></Field>
            {input.theme === "custom" && <Field label="Describe the world"><input className="field" maxLength={120} value={input.customTheme} onChange={(e) => set({ customTheme: e.target.value })} placeholder="e.g. a giant's vegetable garden" /></Field>}
            <Field label="Tone"><div className="space-y-2">{TONES.map((t) => <button key={t.id} type="button" data-on={input.tone === t.id} onClick={() => set({ tone: t.id })} className="chip block w-full text-left">{t.label} <span className="font-normal opacity-70">— {t.desc}</span></button>)}</div></Field>
            <Field label="Lesson"><div className="flex flex-wrap gap-2">{LESSONS.map((l) => <Chip key={l} on={input.lesson === l} onClick={() => set({ lesson: l })}>{l}</Chip>)}</div></Field>
            <Field label="Rhyming"><div className="flex gap-2"><Chip on={input.rhyming} onClick={() => set({ rhyming: true })}>Rhymes</Chip><Chip on={!input.rhyming} onClick={() => set({ rhyming: false })}>No rhymes</Chip></div></Field>
            <Field label="Length"><div className="flex gap-2">{([8, 12, 16] as const).map((n) => <Chip key={n} on={input.pages === n} onClick={() => set({ pages: n })}>{n} pages</Chip>)}</div></Field>
            <Field label="Reading level"><select className="field" value={input.readingLevel} onChange={(e) => set({ readingLevel: e.target.value })}>{READING_LEVELS.map((r) => <option key={r}>{r}</option>)}</select></Field>
          </>}
          {step === 4 && <div className="grid grid-cols-2 gap-3">{STYLES.map((s) => <button key={s.id} type="button" data-testid={`style-${s.id}`} data-on={input.style === s.id} onClick={() => set({ style: s.id })} className="chip p-3 text-left"><div className="font-display">{s.label}</div><div className="text-xs font-semibold opacity-70">{s.desc}</div></button>)}</div>}
          {step === 5 && <>
            <Field label="Dedication message"><textarea data-testid="dedication" className="field min-h-[96px]" maxLength={300} value={input.dedication} onChange={(e) => set({ dedication: e.target.value })} placeholder={`For ${name}, who is braver than they know.`} /></Field>
            <Field label="From"><input data-testid="from" className="field" maxLength={30} value={input.fromName} onChange={(e) => set({ fromName: e.target.value })} placeholder="e.g. Grandma & Grandad" /></Field>
            <p className="text-xs font-semibold text-ink/60">Next we'll write the story and draw 2 free preview pages.</p>
          </>}
        </div>
        {err && <p data-testid="error" className="mt-3 rounded-md border-2 border-punch bg-punch/10 p-2 text-sm font-bold text-punch">{err}</p>}
        <div className="mt-6 flex gap-3">
          {step > 0 && <Button variant="paper" onClick={() => setStep(step - 1)}>← Back</Button>}
          <Button data-testid="next" className="flex-1 py-4 text-lg" onClick={next}>{step === STEPS.length - 1 ? "Write my story ✶" : "Next →"}</Button>
        </div>
      </section>
    </Shell>
  );
}
