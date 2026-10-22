import { jsPDF } from "jspdf";
import type { Story, StoryInput } from "./types";

export type PdfSize = "square" | "a5";
const SIZES: Record<PdfSize, [number, number]> = { square: [210, 210], a5: [148, 210] }; // mm, trim size
const BLEED = 3; // mm each side, standard for Gelato/Lulu print files

async function toJpeg(src: string, px = 1500): Promise<string> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error("image load failed")); img.src = src; });
  const c = document.createElement("canvas");
  c.width = px; c.height = px;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, px, px);
  const s = Math.max(px / img.width, px / img.height);
  ctx.drawImage(img, (px - img.width * s) / 2, (px - img.height * s) / 2, img.width * s, img.height * s);
  return c.toDataURL("image/jpeg", 0.9);
}

export async function buildPdf(story: Story, input: StoryInput, size: PdfSize = "square", print = false): Promise<jsPDF> {
  const [tw, th] = SIZES[size];
  const b = print ? BLEED : 0;
  const W = tw + b * 2, H = th + b * 2;
  const doc = new jsPDF({ unit: "mm", format: [W, H], orientation: W > H ? "landscape" : "portrait", compress: true });
  doc.setProperties({ title: story.title, creator: "InkTales" });
  const ink: [number, number, number] = [44, 36, 30];
  const paper: [number, number, number] = [243, 235, 216];

  // Cover
  doc.setFillColor(...paper); doc.rect(0, 0, W, H, "F");
  if (story.coverImage) doc.addImage(await toJpeg(story.coverImage), "JPEG", 0, 0, W, W > H ? H : W);
  doc.setFillColor(...ink); doc.rect(0, H * 0.72, W, H * 0.28, "F");
  doc.setTextColor(...paper); doc.setFont("helvetica", "bold");
  doc.setFontSize(size === "a5" ? 20 : 26);
  doc.text(doc.splitTextToSize(story.title, tw - 24), W / 2, H * 0.80, { align: "center" });
  doc.setFontSize(11); doc.setFont("helvetica", "normal");
  doc.text("An InkTales adventure", W / 2, H - b - 10, { align: "center" });

  // Dedication
  doc.addPage([W, H]);
  doc.setFillColor(...paper); doc.rect(0, 0, W, H, "F");
  doc.setTextColor(...ink); doc.setFont("times", "italic"); doc.setFontSize(16);
  const ded = input.dedication || `For ${input.childName}, the hero of this story.`;
  doc.text(doc.splitTextToSize(ded, tw - 50), W / 2, H / 2 - 10, { align: "center" });
  if (input.fromName) { doc.setFontSize(13); doc.text(`With love, ${input.fromName}`, W / 2, H / 2 + 22, { align: "center" }); }

  // Story pages: picture on top, text underneath
  for (let i = 0; i < story.pages.length; i++) {
    const p = story.pages[i];
    doc.addPage([W, H]);
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, "F");
    const imgH = H * 0.66;
    if (p.image) doc.addImage(await toJpeg(p.image), "JPEG", 0, 0, W, imgH);
    doc.setTextColor(...ink); doc.setFont("times", "normal"); doc.setFontSize(size === "a5" ? 12 : 14);
    const lines = doc.splitTextToSize(p.text, tw - 28);
    doc.text(lines, W / 2, imgH + 12, { align: "center", lineHeightFactor: 1.4 });
    doc.setFontSize(9); doc.text(String(i + 1), W / 2, H - b - 6, { align: "center" });
  }

  // Back page
  doc.addPage([W, H]);
  doc.setFillColor(...ink); doc.rect(0, 0, W, H, "F");
  doc.setTextColor(...paper); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
  doc.text("The End", W / 2, H / 2, { align: "center" });
  doc.setFontSize(9); doc.setFont("helvetica", "normal");
  doc.text("Made with InkTales", W / 2, H - b - 10, { align: "center" });
  return doc;
}
