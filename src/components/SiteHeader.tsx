import { Link } from "react-router-dom";
import { MOCK } from "@/lib/api";

export function SiteHeader({ badge }: { badge?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5">
      <Link to="/" className="font-display text-lg tracking-tight">
        <span className="inline-block -rotate-2 bg-ink px-2 py-0.5 text-paper">Ink</span>
        <span className="font-hand text-2xl font-bold">Tales</span>
      </Link>
      <div className="flex items-center gap-2">
        {MOCK && <span className="border-2 border-dashed border-punch px-1.5 py-0.5 text-[10px] font-bold uppercase text-punch" title="No AI keys configured: sample story and placeholder pictures">demo mode</span>}
        {badge && <span className="-rotate-3 border-2 border-ink bg-sun px-2 py-1 text-[11px] font-bold uppercase tracking-[0.2em]">{badge}</span>}
      </div>
    </div>
  );
}
export function SiteFooter() {
  return (
    <div className="px-5 pb-12 pt-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40">
      InkTales · secure checkout by Shopify · <Link to="/privacy" className="underline">privacy</Link>
    </div>
  );
}
export function Shell({ children, badge }: { children: React.ReactNode; badge?: string }) {
  return (
    <div className="noise min-h-screen bg-paper font-body text-ink">
      <div className="mx-auto max-w-xl">
        <SiteHeader badge={badge} />
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}
