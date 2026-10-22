import type { StoryPage } from "@/lib/types";
import { WatermarkedImage, protect } from "@/components/ProtectedImage";

/** Preview-only page: watermarked picture + text with a repeating watermark overlay. */
export function PageView({ page, index }: { page: StoryPage; index: number }) {
  return (
    <div data-testid="preview-page" className="card-block relative select-none overflow-hidden rounded-md bg-white" {...protect}>
      <div className="relative aspect-square bg-muted">
        {page.image ? <WatermarkedImage src={page.image} alt={`Illustration for page ${index + 1}`} className="h-full w-full object-cover" />
          : <div className="grid h-full place-items-center font-hand text-2xl text-ink/50">drawing…</div>}
      </div>
      <div className="relative">
        <p className="p-4 text-center font-serif text-[15px] leading-relaxed">{page.text}</p>
        <div className="wm-repeat" aria-hidden />
      </div>
      <div className="pb-2 text-center text-[10px] font-bold text-ink/40">{index + 1}</div>
    </div>
  );
}

/** Blurred placeholder for pages that unlock after payment (text is never rendered). */
export function LockedPage({ index, onUnlock }: { index: number; onUnlock: () => void }) {
  return (
    <div data-testid="locked-page" className="card-block relative overflow-hidden rounded-md bg-white" {...protect}>
      <div className="aspect-square bg-gradient-to-br from-sun/40 via-paper to-leaf/30 blur-md" />
      <div className="space-y-2 p-4 blur-sm" aria-hidden>{[90, 75, 60].map((w) => <div key={w} className="mx-auto h-3 rounded bg-ink/20" style={{ width: `${w}%` }} />)}</div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-4xl">🔒</div>
          <p className="font-display text-lg">Page {index + 1}</p>
          <button data-testid="unlock-cta" onClick={onUnlock} className="mt-2 rounded-md border-2 border-ink bg-sun px-3 py-1.5 text-sm font-bold">Unlock your full book →</button>
        </div>
      </div>
    </div>
  );
}
