import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";
import { useBooking } from "@/context/BookingContext";

export default function CTABanner({ heading, sub, cta = "Book My Free Audit", testid = "cta-banner" }) {
  const { openBooking } = useBooking();
  return (
    <section className="px-5 sm:px-8 py-20 md:py-24" data-testid={testid}>
      <div
        className="max-w-7xl mx-auto rounded-3xl px-8 py-14 md:px-16 md:py-20"
        style={{ background: "var(--weha-teal)" }}
      >
        <Reveal>
          <h2 className="weha-display text-4xl md:text-5xl text-white max-w-3xl leading-[1.05]">{heading}</h2>
        </Reveal>
        {sub && (
          <Reveal delay={0.08}>
            <p className="mt-5 text-white/85 text-lg max-w-2xl leading-relaxed">{sub}</p>
          </Reveal>
        )}
        <Reveal delay={0.14}>
          <Magnetic strength={0.3}>
            <button
              type="button"
              onClick={openBooking}
              data-testid={`${testid}-link`}
              data-cursor="hover"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-medium text-[var(--weha-teal)] transition-transform hover:-translate-y-0.5"
            >
              {cta} <ArrowUpRight size={17} />
            </button>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
