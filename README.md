# InkTales — personalised children's storybooks

Vite + React + TypeScript + Tailwind (shadcn/ui-style components) + Supabase Edge Functions (Deno).
Matches the look of the demo at little-wonder-tale-maker.lovable.app (colours, Archivo/Archivo Black/Caveat fonts, cover and spread images re-used from it).

## Run it
```bash
npm install
npm run dev        # http://localhost:8080 — runs in DEMO (mock) MODE with no keys
npm run typecheck
npm run build
npm run e2e        # Playwright run-through (dev server must be running): screenshots/ + sample-book-mock.pdf
```

## Flow
Landing → 6-step wizard (/create) → AI writes story + draws cover and 2 pages → **free watermarked preview** (/preview) → choose Digital £9.99 / Real Book £18.99 → **checkout placeholder** (/checkout) → full **book viewer** (/book): page flip, edit text, regenerate text, regenerate picture, **PDF export** (square 21×21cm or A5; print orders add 3mm bleed).

Wizard options: name, age (sets reading level), pronouns, skin tone, hair colour/style, eye colour, glasses, freckles (no photo upload), interests (multi-select + free text), pet/sidekick, best friend, hometown, theme (7 + custom), tone, lesson, rhyming, 8/12/16 pages, reading level, illustration style (watercolour/crayon/classic/pixel), dedication + from.

## Character consistency (cover-as-reference)
1. The **cover is generated first** (text-to-image) from a fixed **character sheet** (`src/lib/character.ts`): age, skin, hair, eyes, glasses, freckles, a fixed outfit and the sidekick, plus the style string.
2. The cover is stored in the session (`sessionStorage`, with the story).
3. **Every page, and every "New picture" regeneration**, sends the cover as a **reference image** (downscaled to a 768px JPEG in the browser) plus the same character-sheet prompt, style and seed. The server picks the reference endpoint:
   - **OpenAI** (`IMAGE_PROVIDER=openai`, default `gpt-image-2`): `POST /images/edits` (multipart, `image[]` = cover). Optional `IMAGE_INPUT_FIDELITY=high` for a stronger likeness.
   - **fal**: cover `fal-ai/flux-pro/kontext/text-to-image`, pages `fal-ai/flux-pro/kontext` with `image_url`.
   - **Replicate**: `black-forest-labs/flux-kontext-pro` for both, pages with `input_image`.
4. Pages can't be drawn before a cover exists (the client throws).

This should keep the hero much more consistent than prompts alone, but it isn't verified with a real model yet (no API key was available). Kontext-style models can copy the cover's composition too closely, so check that pages actually vary.

## Mock mode
If `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are empty (or `VITE_MOCK_MODE=true`) the app uses `src/lib/mock.ts`: a sample story built from the wizard answers and SVG placeholder pictures drawn in the child's chosen skin/hair colours, glasses and freckles. A "demo mode" badge shows in the header.

## Importing into Lovable
1. Create an empty GitHub repo, then `git init && git add . && git commit -m "InkTales" && git push` to it.
2. In Lovable: **Settings → GitHub → Connect** to that repo (or create a Lovable project and paste/upload the files; `src/` structure and `@/` alias are Lovable's default).
3. In Lovable, connect **Supabase** (Lovable Cloud / Supabase integration). It will pick up `supabase/functions/*`. Or deploy manually: `supabase functions deploy generate-story generate-image`.
4. Set the frontend env `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Lovable fills these when Supabase is connected).

## Supabase secrets (Edge Functions → Secrets). Keys never reach the browser.
| Secret | Default | Notes |
|---|---|---|
| `OPENAI_API_KEY` | — | required for text |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | any OpenAI-compatible API (OpenAI, xAI, OpenRouter, Together…) |
| `TEXT_MODEL` | `gpt-4o-mini` | must support JSON mode |
| `IMAGE_PROVIDER` | `openai` | `openai` \| `replicate` \| `fal` |
| `IMAGE_MODEL` | openai `gpt-image-2` · replicate `black-forest-labs/flux-kontext-pro` · fal `fal-ai/flux-pro/kontext/text-to-image` | cover (text-to-image); on openai also used for page edits |
| `REF_IMAGE_MODEL` | replicate `black-forest-labs/flux-kontext-pro` · fal `fal-ai/flux-pro/kontext` | pages + regenerations (reference/image-to-image) |
| `IMAGE_INPUT_FIDELITY` | empty | openai only; `high` = stronger likeness, more input tokens |
| `IMAGE_BASE_URL`, `IMAGE_API_KEY` | fall back to OPENAI_* | for a different OpenAI-compatible image host |
| `IMAGE_QUALITY` | `low` | OpenAI only; set empty for providers that reject it |
| `IMAGE_SIZE` | `1024x1024` | OpenAI only |
| `REPLICATE_API_TOKEN` / `FAL_KEY` | — | when using those providers |

## Cost per book (estimate, checked 21 Oct 2026, USD)
Reference-capable models cost more than plain text-to-image. A 16-page book = 1 cover + 16 reference pages = 17 images (8-page = 9). Each abandoned preview = 3 images. Each "New picture" = 1 more.
| Images via | Price/image | 8-page book | 16-page book | Source |
|---|---|---|---|---|
| fal FLUX.1 Kontext [pro] | $0.04 | ~$0.36 | ~$0.68 | fal.ai/models/fal-ai/flux-pro/kontext |
| Replicate flux-kontext-pro | $0.04 | ~$0.36 | ~$0.68 | replicate.com/black-forest-labs/flux-kontext-pro; BFL pricing help.bfl.ai (Kontext pro = 4 credits = $0.04) |
| OpenAI gpt-image-2 (low, 1024², edits) | ~$0.005 output at low quality + reference-image input tokens (gpt-image-2 image input $8/1M tokens), so **roughly $0.01–0.02 per page (my estimate)** | ~$0.10–0.20 | ~$0.20–0.35 | developers.openai.com/api/docs/pricing; costgoat.com/pricing/openai-images |
| OpenAI at medium/high quality | up to ~$0.21/image | — | up to ~$3.60 | same |
Story text ≈ $0.01 or less per book. **Realistic: about $0.25–0.80 per sold 16-page book**, plus previews and redraws. That still leaves a big margin on £9.99. The old non-reference options (FLUX schnell, $0.003/image) still work by setting `IMAGE_MODEL` and leaving `REF_IMAGE_MODEL` pointed at a reference model. gpt-image-1-mini retires on 1 Dec 2026, so don't use it.

## Safety & data
- Word filter on every free-text field in the browser (`src/lib/safety.ts`) and again server-side (`supabase/functions/_shared/safety.ts`), plus on generated output. A strict child-safe system prompt; image prompts append "child-safe, no text". fal's safety checker is on.
- No photo upload. Only first name, age, a written appearance description, interests.
- **Retention:** wizard answers and the book live only in the tab's `sessionStorage` (cleared when the tab closes). Edge functions are stateless and store nothing. Policy text at `/privacy` proposes: keep ordered books up to 90 days for delivery/reprints, then delete. That needs implementing (a Supabase table + storage bucket + scheduled delete) when ordering goes live, and the wording needs checking before launch. Check each AI provider's data-retention/training terms.
- The preview watermark is a screen overlay. The two preview images are full-resolution in the browser, so someone technical could save them. For stronger protection, watermark on the server.

## Placeholders / not built
- **Shopify checkout** (`src/pages/Checkout.tsx`): no payment. Set `VITE_SHOPIFY_DIGITAL_URL`/`VITE_SHOPIFY_PRINT_URL` to cart permalinks for a "Pay with Shopify" link. The "Demo: simulate a paid order" button unlocks the book. Production needs a Storefront API cart with the story id as a line-item property, plus a Shopify `orders/paid` webhook (Supabase function) to unlock the book and save it.
- **Print fulfilment** (Gelato / Lulu Print API): not connected. The PDF export already makes a 21×21cm (or A5) file with 3mm bleed for print orders. You'd still need a separate cover/spine file to each printer's spec and an edge function that submits the order.
- Email delivery of the PDF, accounts, and order storage aren't built.
- Edge functions pass `deno check` but haven't been run against real AI providers (no keys were available when this was built).
