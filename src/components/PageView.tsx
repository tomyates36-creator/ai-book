import type { StoryPage } from "@/lib/types";

export function PageView({ page, index, watermark, locked }: { page: StoryPage; index: number; watermark?: boolean; locked?: boolean }) {
  return (
    <div className="card-block overflow-hidden rounded-md bg-white">
      <div className="relative aspect-square bg-muted">
        {page.image && !locked ? <img src={page.image} alt={`Illustration for page ${index + 1}`} className="h-full w-full object-cover" /> : (
          <div className="grid h-full place-items-center font-hand text-2xl text-ink/50">{locked ? "🔒 unlocks after checkout" : "drawing…"}</div>
        )}
        {watermark && !locked && <div className="watermark">INKTALES PREVIEW</div>}
      </div>
      <p className={`p-4 text-center font-serif text-[15px] leading-relaxed ${locked ? "select-none blur-sm" : ""}`}>{page.text}</p>
      <div className="pb-2 text-center text-[10px] font-bold text-ink/40">{index + 1}</div>
    </div>
  );
}
