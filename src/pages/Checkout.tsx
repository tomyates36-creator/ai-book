import { useSearchParams, useNavigate } from "react-router-dom";
import { Shell } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/lib/options";
import { useStore } from "@/lib/store";

/**
 * ⚠️ PLACEHOLDER — SHOPIFY CHECKOUT INTEGRATION POINT
 * Production: create a Shopify cart via the Storefront API (or a buy-button/cart permalink set in
 * VITE_SHOPIFY_DIGITAL_URL / VITE_SHOPIFY_PRINT_URL) with the story id as a line-item property,
 * then unlock the book from a Shopify `orders/paid` webhook handled by a Supabase edge function.
 * Nothing here takes payment.
 */
export default function Checkout() {
  const [q] = useSearchParams();
  const nav = useNavigate();
  const { story, setOrder, markPaid } = useStore();
  const product = PRODUCTS.find((p) => p.id === q.get("product")) ?? PRODUCTS[0];
  const shopUrl = (product.id === "digital" ? import.meta.env.VITE_SHOPIFY_DIGITAL_URL : import.meta.env.VITE_SHOPIFY_PRINT_URL) as string | undefined;
  return (
    <Shell badge="checkout">
      <section className="px-5 py-6">
        <h1 className="font-display text-3xl">Checkout</h1>
        <div className="card-block mt-4 rounded-md bg-paper p-4">
          <div className="flex justify-between font-display text-xl"><span>{product.title}</span><span>{product.priceFormatted}</span></div>
          <p className="mt-1 text-sm font-semibold">{story?.title}</p>
        </div>
        <div data-testid="shopify-placeholder" className="mt-4 rounded-md border-2 border-dashed border-punch bg-punch/10 p-4 text-sm font-semibold">
          <b className="font-display">SHOPIFY CHECKOUT — NOT CONNECTED YET.</b> This is where the customer pays via Shopify. No payment is taken in this build.
          {product.id === "print" && <> Printed books will be sent to a print partner (e.g. Gelato or Lulu) after payment — also not connected yet.</>}
        </div>
        {shopUrl ? <Button asChild size="lg" className="mt-5"><a href={shopUrl}>Pay with Shopify →</a></Button> : null}
        <Button data-testid="simulate-paid" size="lg" variant="sun" className="mt-5" onClick={() => { setOrder(product.id); markPaid(); nav("/book"); }}>Demo: simulate a paid order →</Button>
      </section>
    </Shell>
  );
}
