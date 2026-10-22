// Provider-agnostic AI calls. Swap providers with secrets only, no code change.
const env = (k: string, d = "") => Deno.env.get(k) ?? d;

export async function chatJSON(system: string, user: string): Promise<unknown> {
  const base = env("OPENAI_BASE_URL", "https://api.openai.com/v1");
  const key = env("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY not set");
  const r = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: env("TEXT_MODEL", "gpt-4o-mini"),
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    }),
  });
  if (!r.ok) throw new Error(`text provider ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const data = await r.json();
  return JSON.parse(data.choices[0].message.content);
}

async function toDataUrl(url: string): Promise<string> {
  const r = await fetch(url);
  const buf = new Uint8Array(await r.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return `data:${r.headers.get("content-type") ?? "image/png"};base64,${btoa(bin)}`;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/data:([^;]+)/)?.[1] ?? "image/png";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/**
 * Returns a data URL (so the browser can embed it in the PDF without CORS issues).
 * `reference` (data URL of the cover) switches to image-to-image / reference conditioning,
 * which keeps the hero looking the same on every page.
 */
export async function generateImage(prompt: string, seed: number, reference?: string): Promise<string> {
  const provider = env("IMAGE_PROVIDER", "openai"); // openai | replicate | fal
  if (provider === "openai") {
    // Any OpenAI-compatible images API. gpt-image models accept an input image on /images/edits.
    const base = env("IMAGE_BASE_URL", env("OPENAI_BASE_URL", "https://api.openai.com/v1"));
    const key = env("IMAGE_API_KEY", env("OPENAI_API_KEY"));
    const model = env("IMAGE_MODEL", "gpt-image-2");
    const size = env("IMAGE_SIZE", "1024x1024");
    const q = env("IMAGE_QUALITY", "low");
    let r: Response;
    if (reference) {
      const fd = new FormData();
      fd.append("model", model);
      fd.append("prompt", `Use the attached cover as the character reference: keep the main character's face, hair, skin tone, outfit and art style exactly the same. ${prompt}`);
      fd.append("image[]", dataUrlToBlob(reference), "cover.png");
      fd.append("n", "1");
      fd.append("size", size);
      if (q) fd.append("quality", q);
      if (env("IMAGE_INPUT_FIDELITY")) fd.append("input_fidelity", env("IMAGE_INPUT_FIDELITY")); // "high" = stronger likeness, more input tokens
      r = await fetch(`${base}/images/edits`, { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: fd });
    } else {
      const body: Record<string, unknown> = { model, prompt, n: 1, size };
      if (q) body.quality = q;
      r = await fetch(`${base}/images/generations`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    if (!r.ok) throw new Error(`image provider ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const d = (await r.json()).data[0];
    return d.b64_json ? `data:image/png;base64,${d.b64_json}` : await toDataUrl(d.url);
  }
  if (provider === "replicate") {
    // FLUX Kontext Pro does both text-to-image (cover) and reference editing (pages).
    const model = reference ? env("REF_IMAGE_MODEL", "black-forest-labs/flux-kontext-pro") : env("IMAGE_MODEL", "black-forest-labs/flux-kontext-pro");
    const input: Record<string, unknown> = { prompt: reference ? `Same character and art style as the reference image. ${prompt}` : prompt, seed, aspect_ratio: "1:1", output_format: "png", safety_tolerance: 2 };
    if (reference) input.input_image = reference; // data URI accepted
    const r = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${env("REPLICATE_API_TOKEN")}`, "Content-Type": "application/json", Prefer: "wait" },
      body: JSON.stringify({ input }),
    });
    if (!r.ok) throw new Error(`replicate ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const out = (await r.json()).output;
    if (!out) throw new Error("replicate: prediction did not finish in time");
    return await toDataUrl(Array.isArray(out) ? out[0] : out);
  }
  if (provider === "fal") {
    const model = reference ? env("REF_IMAGE_MODEL", "fal-ai/flux-pro/kontext") : env("IMAGE_MODEL", "fal-ai/flux-pro/kontext/text-to-image");
    const body: Record<string, unknown> = { prompt: reference ? `Same character and art style as the reference image. ${prompt}` : prompt, seed, num_images: 1, aspect_ratio: "1:1", output_format: "png", safety_tolerance: "2" };
    if (reference) body.image_url = reference; // fal accepts data URIs
    const r = await fetch(`https://fal.run/${model}`, {
      method: "POST",
      headers: { Authorization: `Key ${env("FAL_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`fal ${r.status}: ${(await r.text()).slice(0, 300)}`);
    return await toDataUrl((await r.json()).images[0].url);
  }
  throw new Error(`Unknown IMAGE_PROVIDER ${provider}`);
}
