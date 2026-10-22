/**
 * Burns a diagonal repeating "InkTales PREVIEW" pattern into the pixels of an image.
 * The result is a new data URL, so the clean original is never put in the preview DOM:
 * right-click / save / devtools "open image" all get the watermarked copy.
 */
const cache = new Map<string, Promise<string>>();

export function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number, label = "InkTales PREVIEW") {
  const fs = Math.round(Math.max(w, h) / 14);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.font = `900 ${fs}px "Archivo Black", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = Math.max(1, fs / 18);
  const stepX = ctx.measureText(label).width + fs * 1.2;
  const stepY = fs * 2.4;
  const R = Math.hypot(w, h);
  for (let y = -R, row = 0; y <= R; y += stepY, row++) {
    for (let x = -R + (row % 2 ? stepX / 2 : 0); x <= R; x += stepX) {
      ctx.strokeStyle = "rgba(0,0,0,0.28)";
      ctx.strokeText(label, x, y);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(label, x, y);
    }
  }
  ctx.restore();
}

export function watermarkImage(src: string, px = 900): Promise<string> {
  const key = `${px}:${src}`;
  if (!cache.has(key)) {
    cache.set(key, (async () => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error("image load failed")); img.src = src; });
      const c = document.createElement("canvas");
      c.width = px; c.height = px; // preview is deliberately lower-res than the paid file
      const ctx = c.getContext("2d")!;
      const s = Math.max(px / img.width, px / img.height);
      ctx.drawImage(img, (px - img.width * s) / 2, (px - img.height * s) / 2, img.width * s, img.height * s);
      drawWatermark(ctx, px, px);
      return c.toDataURL("image/jpeg", 0.8);
    })());
  }
  return cache.get(key)!;
}
