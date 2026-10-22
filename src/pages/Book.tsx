import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { generateImage, regenerateText } from "@/lib/api";
import { buildPdf, type PdfSize } from "@/lib/pdf";
import { findUnsafe } from "@/lib/safety";
import type { Story } from "@/lib/types";

type Spread = { kind: "cover" } | { kind: "dedication" } | { kind: "page"; i: number } | { kind: "end" };

export default function Book() {
  const { input, story, setStory, order } = useStore();
  const nav = useNavigate();
  const [at, setAt] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [size, setSize] = useState<PdfSize>(order === "print" ? "square" : "square");
  const ref = useRef<Story | null>(story);
  ref.current = story;

  useEffect(() => { if (!story || !order) nav("/preview"); }, [story, order, nav]);
  // Draw any pages not drawn yet (pages after the free preview)
  useEffect(() => {
    if (!story) return;
    let cancel = false;
    (async () => {
      for (let i = 0; i < story.pages.length; i++) {
        const s = ref.current!;
        if (cancel || s.pages[i].image) continue;
        setBusy(`Drawing page ${i + 1} of ${s.pages.length}…`);
        const img = await generateImage(input, s, s.pages[i].illustrationPrompt, i);
        const cur = ref.current!;
        setStory({ ...cur, pages: cur.pages.map((p, j) => (j === i ? { ...p, image: img } : p)) });
      }
      if (!cancel) setBusy(null);
    })().catch((e) => setBusy(`Error: ${(e as Error).message}`));
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!story) return null;

  const spreads: Spread[] = [{ kind: "cover" }, { kind: "dedication" }, ...story.pages.map((_, i) => ({ kind: "page" as const, i })), { kind: "end" }];
  const cur = spreads[at];
  const updatePage = (i: number, patch: Partial<Story["pages"][number]>) => setStory({ ...ref.current!, pages: ref.current!.pages.map((p, j) => (j === i ? { ...p, ...patch } : p)) });

  async function regenImage(i: number) {
    setBusy("Redrawing…");
    updatePage(i, { image: await generateImage(input, ref.current!, ref.current!.pages[i].illustrationPrompt, i) });
    setBusy(null);
  }
  async function regenText(i: number) { setBusy("Rewriting…"); updatePage(i, { text: await regenerateText(input, story!, i) }); setBusy(null); }
  async function exportPdf() {
    setBusy("Building PDF…");
    try {
      const doc = await buildPdf(ref.current!, input, size, order === "print");
      doc.save(`${ref.current!.title.replace(/[^a-z0-9]+/gi, "-")}.pdf`);
    } finally { setBusy(null); }
  }

  return (
    <Shell badge={order === "print" ? "the real book" : "digital"}>
      <section className="px-5 py-6">
        <h1 data-testid="book-title" className="font-display text-3xl leading-tight">{story.title}</h1>
        {story.mock && <p className="mt-1 text-xs font-bold text-punch">Demo mode: sample story & placeholder pictures (no AI keys configured).</p>}
        {busy && <div data-testid="busy" className="card-block mt-3 animate-pulse rounded-md bg-sun p-2 text-center text-sm font-display">{busy}</div>}

        <div key={at} className="flip-in mt-4" data-testid="spread">
          {cur.kind === "cover" && <div className="card-block relative overflow-hidden rounded-md bg-ink">
            {story.coverImage && <img src={story.coverImage} alt="cover" className="aspect-square w-full object-cover" />}
            <div className="p-4 text-center font-display text-2xl text-paper">{story.title}</div></div>}
          {cur.kind === "dedication" && <div className="card-block grid aspect-square place-items-center rounded-md bg-paper p-8 text-center font-serif italic">
            <div><p className="text-xl">{input.dedication || `For ${input.childName}, the hero of this story.`}</p>{input.fromName && <p className="mt-6">With love, {input.fromName}</p>}</div></div>}
          {cur.kind === "end" && <div className="card-block grid aspect-square place-items-center rounded-md bg-ink font-display text-4xl text-paper">The End</div>}
          {cur.kind === "page" && (() => { const p = story.pages[cur.i]; return (
            <div className="card-block overflow-hidden rounded-md bg-white">
              <div className="aspect-square bg-muted">{p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center font-hand text-2xl">drawing…</div>}</div>
              {editing ? <div className="p-3"><textarea data-testid="edit-text" className="field min-h-[110px] font-serif" value={draft} onChange={(e) => setDraft(e.target.value)} />
                <div className="mt-2 flex gap-2"><Button size="sm" onClick={() => { const bad = findUnsafe(draft); if (bad) { alert(`Please remove "${bad}".`); return; } updatePage(cur.i, { text: draft.slice(0, 600) }); setEditing(false); }}>Save</Button><Button size="sm" variant="paper" onClick={() => setEditing(false)}>Cancel</Button></div></div>
                : <p data-testid="page-text" className="p-4 text-center font-serif text-[15px] leading-relaxed">{p.text}</p>}
              <div className="pb-2 text-center text-[10px] font-bold text-ink/40">{cur.i + 1}</div>
            </div>); })()}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button data-testid="prev" variant="paper" size="sm" disabled={at === 0} onClick={() => { setAt(at - 1); setEditing(false); }}>← Prev</Button>
          <span className="text-xs font-bold">{at + 1} / {spreads.length}</span>
          <Button data-testid="next-page" variant="ink" size="sm" disabled={at === spreads.length - 1} onClick={() => { setAt(at + 1); setEditing(false); }}>Next →</Button>
        </div>
        {cur.kind === "page" && !editing && <div className="mt-3 flex flex-wrap gap-2">
          <Button data-testid="edit" size="sm" variant="paper" onClick={() => { setDraft(story.pages[cur.i].text); setEditing(true); }}>✏️ Edit text</Button>
          <Button data-testid="regen-text" size="sm" variant="paper" disabled={!!busy} onClick={() => regenText(cur.i)}>↻ New text</Button>
          <Button data-testid="regen-image" size="sm" variant="paper" disabled={!!busy} onClick={() => regenImage(cur.i)}>↻ New picture</Button>
        </div>}

        <div className="card-block mt-6 rounded-md bg-paper p-4">
          <label className="label">PDF size</label>
          <div className="flex gap-2">{(["square", "a5"] as const).map((s) => <button key={s} data-on={size === s} className="chip" onClick={() => setSize(s)}>{s === "square" ? "Square 21×21cm" : "A5 portrait"}</button>)}</div>
          {order === "print" && <p className="mt-2 text-xs font-semibold text-ink/60">Print file includes 3mm bleed. Sent to the print partner after payment (not connected yet).</p>}
          <Button data-testid="export" size="lg" className="mt-4" disabled={!!busy} onClick={exportPdf}>Download PDF ↓</Button>
        </div>
      </section>
    </Shell>
  );
}
