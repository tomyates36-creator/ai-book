import { useEffect, useState } from "react";
import { watermarkImage } from "@/lib/watermark";

const block = (e: React.SyntheticEvent) => e.preventDefault();
export const protect = { onContextMenu: block, onDragStart: block, style: { WebkitTouchCallout: "none" } as React.CSSProperties };

/** Shows only a watermark-composited copy of `src`; the clean image never reaches the DOM. */
export function WatermarkedImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [out, setOut] = useState<string | null>(null);
  useEffect(() => { let live = true; setOut(null); watermarkImage(src).then((u) => live && setOut(u)).catch(() => live && setOut(null)); return () => { live = false; }; }, [src]);
  if (!out) return <div className={`grid place-items-center bg-muted font-hand text-xl text-ink/50 ${className ?? ""}`}>preparing preview…</div>;
  return <img src={out} alt={alt} draggable={false} {...protect} className={`select-none ${className ?? ""}`} />;
}
