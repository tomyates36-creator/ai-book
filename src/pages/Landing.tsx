import { Link } from "react-router-dom";
import { Shell } from "@/components/SiteHeader";
import { PRODUCTS } from "@/lib/options";
import cover from "@/assets/book-cover.jpg";
import spread from "@/assets/book-spread.jpg";

const steps = [
  { n: "1", text: "Add their name, age, look & what they love", chip: "bg-ink text-paper -rotate-3", card: "bg-paper" },
  { n: "2", text: "We write & illustrate a one-of-a-kind story where they're the hero", chip: "bg-leaf text-paper rotate-2", card: "bg-paper" },
  { n: "3", text: "Preview 2 pages free, then get the PDF or a real printed book", chip: "bg-ink text-paper -rotate-2", card: "bg-sun" },
];
const every = ["Personalised with your child's name", "Their interests, pet and hometown appear in the story", "The same illustrated hero on every page", "Choose watercolour, crayon, classic or pixel art", "Rhyming or prose, bedtime-calm or brave", "Free 2-page preview before you pay"];

export default function Landing() {
  return (
    <Shell badge="from £9.99">
      <section className="px-5 pb-8 pt-7">
        <div className="inline-block rotate-2 bg-leaf px-3 py-0.5 font-hand text-xl text-paper">a story starring your child</div>
        <h1 className="halo mt-4 font-display text-[3.1rem] leading-[0.95] text-paper" style={{ WebkitTextStroke: "1.5px oklch(24.3% .019 62.5)" }}>THEIR OWN<br />ADVENTURE.</h1>
        <p className="mt-4 max-w-[19rem] text-[15px] font-semibold leading-snug">
          Watch <span className="font-hand text-2xl text-punch">George</span>'s name appear on the page, his dinosaurs roar to life, and every picture drawn just for him.
        </p>
        <div className="mx-auto mt-6 w-[220px]">
          <img src={cover} alt="Personalised dinosaur storybook cover" width={1024} height={1280} className="w-full rotate-1 rounded-lg object-cover shadow-[6px_6px_0_theme(colors.ink)] outline outline-2 -outline-offset-2 outline-ink" />
          <div className="doodle mt-3 -rotate-2 text-center font-hand text-2xl font-bold">George's Dinosaur Adventure</div>
        </div>
        <Link to="/create" className="btn-block mt-7 flex w-full items-center justify-center bg-punch py-4 font-display text-xl tracking-wide text-paper">Create Their Adventure →</Link>
        <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.15em] text-ink/60">takes only a few minutes</p>
      </section>
      <section className="px-5 pb-8">
        <div className="mb-4 flex items-baseline gap-2"><h2 className="font-display text-2xl">How it works</h2><span className="font-hand text-2xl text-punch">→</span></div>
        <ol className="space-y-3">
          {steps.map((s) => (
            <li key={s.n} className={`card-block flex items-start gap-3 rounded-md p-3 ${s.card}`}>
              <span className={`grid h-8 w-8 shrink-0 place-items-center font-display text-2xl leading-none ${s.chip}`}>{s.n}</span>
              <p className="pt-1 text-sm font-semibold">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="px-5 pb-10">
        <h2 className="font-display text-2xl">Every book</h2>
        <ul className="mt-3 space-y-2">{every.map((e) => <li key={e} className="flex gap-2 text-sm font-semibold"><span className="font-hand text-xl leading-none text-punch">✶</span>{e}</li>)}</ul>
      </section>
      <section className="px-5 pb-10">
        <div className="rounded-lg bg-ink p-5 text-paper shadow-[6px_6px_0_theme(colors.punch)]">
          <span className="font-hand text-2xl text-sun">two ways to give it</span>
          <img src={spread} alt="Interior spread: a child and a triceratops in a jungle" loading="lazy" className="mt-4 w-full rounded-md object-cover outline outline-1 outline-paper/30" />
          <div className="mt-4 space-y-3">
            {PRODUCTS.map((p) => (
              <div key={p.id} className={`rounded-md border-2 p-3 ${p.recommended ? "border-sun bg-paper/10" : "border-paper/30"}`}>
                <div className="flex items-baseline justify-between gap-2"><h2 className="font-display text-xl leading-tight">{p.title.toUpperCase()}</h2><span className="shrink-0 font-display text-xl text-sun">{p.priceFormatted}</span></div>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-paper/70">{p.highlights.join(" · ")}</p>
              </div>
            ))}
          </div>
          <Link to="/create" className="btn-block mt-4 flex w-full items-center justify-center bg-sun py-3.5 font-display text-lg text-ink shadow-[4px_4px_0_theme(colors.paper)]">Create Their Adventure</Link>
        </div>
      </section>
    </Shell>
  );
}
