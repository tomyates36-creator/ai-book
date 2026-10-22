import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shell } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { PageView } from "@/components/PageView";
import { useStore } from "@/lib/store";
import { generateImage, generateStory } from "@/lib/api";
import { PRODUCTS } from "@/lib/options";
import type { Story } from "@/lib/types";

export const FREE_PAGES = 2;

export default function Preview() {
  const { input, story, setStory, setOrder } = useStore();
  const [status, setStatus] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const started = useRef(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!input.childName) { nav("/create"); return; }
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        let s: Story = story ?? (setStatus(`Writing ${input.childName}'s story…`), await generateStory(input));
        setStory(s);
        if (!s.coverImage) { setStatus("Painting the cover…"); s = { ...s, coverImage: await generateImage(input, s, s.coverPrompt, -1) }; setStory(s); }
        for (let i = 0; i < FREE_PAGES; i++) {
          if (s.pages[i].image) continue;
          setStatus(`Drawing page ${i + 1} of ${FREE_PAGES}…`);
          const img = await generateImage(input, s, s.pages[i].illustrationPrompt, i);
          s = { ...s, pages: s.pages.map((p, j) => (j === i ? { ...p, image: img } : p)) };
          setStory(s);
        }
        setStatus("");
      } catch (e) { setErr((e as Error).message); setStatus(""); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Shell badge="free preview">
      <section className="px-5 pb-8 pt-6">
        {status && <div data-testid="status" className="card-block mb-4 animate-pulse rounded-md bg-sun p-3 text-center font-display">{status}</div>}
        {err && <div className="card-block mb-4 rounded-md bg-punch p-3 text-paper"><b>Something went wrong:</b> {err} <button className="underline" onClick={() => location.reload()}>try again</button></div>}
        {story && <>
          <span className="font-hand text-2xl text-leaf">your free preview</span>
          <h1 data-testid="title" className="font-display text-3xl leading-tight">{story.title}</h1>
          <div className="relative mx-auto mt-4 w-3/4">
            {story.coverImage ? <img src={story.coverImage} alt="cover" className="card-block w-full rounded-md" /> : <div className="card-block grid aspect-square place-items-center rounded-md">…</div>}
            <div className="watermark">PREVIEW</div>
          </div>
          <div className="mt-6 space-y-4">
            {story.pages.slice(0, FREE_PAGES + 1).map((p, i) => <PageView key={i} page={p} index={i} watermark locked={i >= FREE_PAGES} />)}
          </div>
          <p className="mt-3 text-center text-sm font-bold">+ {story.pages.length - FREE_PAGES} more pages, a dedication page and “The End”.</p>
          <div className="mt-6 rounded-lg bg-ink p-5 text-paper shadow-[6px_6px_0_theme(colors.punch)]">
            <span className="font-hand text-2xl text-sun">love it? unlock the whole book</span>
            <div className="mt-3 space-y-3">
              {PRODUCTS.map((p) => (
                <button key={p.id} data-testid={`buy-${p.id}`} disabled={!!status} onClick={() => { setOrder(p.id); nav(`/checkout?product=${p.id}`); }}
                  className={`block w-full rounded-md border-2 p-3 text-left ${p.recommended ? "border-sun bg-paper/10" : "border-paper/30"}`}>
                  <div className="flex items-baseline justify-between"><span className="font-display text-xl">{p.title.toUpperCase()}</span><span className="font-display text-xl text-sun">{p.priceFormatted}</span></div>
                  <span className="text-xs font-bold uppercase tracking-[0.1em] text-paper/70">{p.highlights.join(" · ")}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 text-center"><Link to="/create" onClick={() => setStory(null)} className="text-xs font-bold uppercase tracking-[0.15em] underline">change details</Link></div>
        </>}
        {!story && !err && <Button size="lg" disabled>Starting…</Button>}
      </section>
    </Shell>
  );
}
