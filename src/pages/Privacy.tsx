import { Shell } from "@/components/SiteHeader";
export default function Privacy() {
  return (
    <Shell>
      <section className="space-y-3 px-5 py-8 text-sm font-semibold leading-relaxed">
        <h1 className="font-display text-3xl">Your child's details</h1>
        <p>We never ask for photos. We only use a first name, age, a written description of how they look, and what they love.</p>
        <p>While you create a book, these details are kept only in this browser tab. They are sent to our AI providers solely to write and draw the story, and we instruct them not to use them for training where the provider allows it.</p>
        <p>If you don't order, nothing is stored: close the tab and it's gone. If you order, we keep the finished book and order details for up to 90 days to deliver, reprint or refund it, then delete them. Order/accounting records (no story content) are kept as the law requires.</p>
        <p className="text-xs text-ink/60">Template wording, to be reviewed before launch.</p>
      </section>
    </Shell>
  );
}
