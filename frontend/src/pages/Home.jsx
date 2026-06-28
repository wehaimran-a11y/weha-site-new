import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, MousePointer2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import MaskReveal from "@/components/MaskReveal";
import Magnetic from "@/components/Magnetic";
import IntegrationStrip from "@/components/IntegrationStrip";
import ScrollSection from "@/components/ScrollSection";
import Seo from "@/components/Seo";
import { useBooking } from "@/context/BookingContext";

const pains = [
  "I copy the same data between three different tools every single day.",
  "Leads come in and sit unanswered for hours because everyone's busy.",
  "I spend my evenings building the same reports by hand, every week.",
];

const steps = [
  { no: "01", title: "Audit", body: "Map your manual workflows together and identify the top 3 worth automating this month." },
  { no: "02", title: "Build", body: "Deploy automation using n8n, Claude, and your existing tools. No new software to buy." },
  { no: "03", title: "Hand Off", body: "Working system + documentation + 30-day support. You own it." },
];

const whyWeha = [
  "You own every system we build, no lock-in, no monthly hostage fees.",
  "We automate on top of the tools you already use. No rip-and-replace.",
  "Live systems in days, not months. You see value almost immediately.",
  "Every automation is documented and handed off, so your team stays in control.",
];

const capabilities = [
  { name: "Lead Capture & Follow-up", example: "Every enquiry answered and routed in seconds, day or night." },
  { name: "Client Onboarding", example: "New clients set up and active without the manual back-and-forth." },
  { name: "Quotes & Proposals", example: "Turn a request into a sent quote in minutes, not hours." },
  { name: "Reporting & Dashboards", example: "Your numbers compiled automatically, no more manual spreadsheets." },
  { name: "Data Sync", example: "Your tools finally talk to each other. Enter data once, everywhere." },
  { name: "Reminders & Notifications", example: "Nothing slips through the cracks. Follow-ups happen on their own." },
];

const metrics = [
  ["120+", "workflows automated"],
  ["200+", "hours saved per month"],
  ["55+", "tools integrated"],
  ["90 min", "to your first live demo"],
];

export default function Home() {
  const { openBooking } = useBooking();

  const rotatingWords = [
    "your manual tasks",
    "your workflows",
    "your follow-ups",
    "your reporting",
    "your onboarding",
    "your invoicing",
    "your lead routing",
    "your stress",
  ];
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Hero → first-section handoff: as the hero scrolls away it lifts + fades,
  // synced with the network camera pulling the viewer inward.
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, -80]);
  const heroOpacity = useTransform(heroProgress, [0, 0.75], [1, 0]);
  const cueOpacity = useTransform(heroProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % rotatingWords.length);
        setVisible(true);
      }, 350);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div data-testid="home-page" className="overflow-x-hidden">
      <Seo
        title=""
        description="We Help Automate (WeHA) turns your messiest manual workflows into AI systems that run themselves, built in days, not months. Book a free AI Audit."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "We Help Automate",
          alternateName: "WeHA",
          url: "https://www.wehelpautomate.com",
          email: "hi@wehelpautomate.com",
          description:
            "AI automation for SMBs. We turn your messiest manual workflows into systems that run themselves, built in days, not months.",
          areaServed: "Worldwide",
          sameAs: ["https://www.linkedin.com/company/we-help-automate"],
        }}
      />
      {/* HERO - over the live floating tech network */}
      <section ref={heroRef} className="relative min-h-[88svh] flex items-center pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, var(--weha-bg) 0%, var(--weha-bg) 24%, color-mix(in srgb, var(--weha-bg) 55%, transparent) 48%, transparent 76%)",
          }}
        />
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative max-w-7xl mx-auto px-5 sm:px-8 w-full pt-20 pb-16"
        >
          <div className="max-w-3xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-weha-teal animate-pulse flex-shrink-0" />
                <span className="text-weha-teal">We Help Automate</span>
                <span
                  className="text-weha-muted normal-case tracking-normal italic font-semibold transition-all duration-300"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0px)" : "translateY(6px)",
                  }}
                >
                  {rotatingWords[wordIndex]}
                </span>
              </span>
            </Reveal>
            <h1 className="weha-display text-5xl sm:text-7xl lg:text-[5.5rem] mt-6 text-weha-text leading-[1.02]">
              <MaskReveal delay={0.05}>Your business probably</MaskReveal>
              <MaskReveal delay={0.13}>runs on 47 manual steps.</MaskReveal>
              <MaskReveal delay={0.21}>
                <span className="italic text-weha-teal">Let's automate that.</span>
              </MaskReveal>
            </h1>
            <Reveal delay={0.35}>
              <p className="mt-7 text-lg md:text-xl text-weha-muted max-w-xl leading-relaxed">
                We turn your messiest, most time-consuming workflows into systems that run
                themselves. Built in days, not months.
              </p>
            </Reveal>
            <Reveal delay={0.45}>
              <div className="mt-9 flex flex-wrap items-center gap-5 pointer-events-auto">
                <Magnetic>
                  <button type="button" onClick={openBooking} className="btn-teal" data-testid="hero-primary-cta" data-cursor="hover">
                    Book a Free AI Audit <ArrowRight size={16} />
                  </button>
                </Magnetic>
                <Magnetic strength={0.3}>
                  <Link to="/services" className="btn-ghost" data-testid="hero-secondary-cta" data-cursor="hover">
                    See How It Works <ArrowRight size={15} />
                  </Link>
                </Magnetic>
              </div>
            </Reveal>
          </div>
        </motion.div>
        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
          >
            <span className="scroll-cue" />
          </motion.div>
        </motion.div>
      </section>

      {/* INTEGRATION LOGO TICKER - tool fluency */}
      <IntegrationStrip />

      {/* PAIN - glass cards floating over the network */}
      <ScrollSection direction="left" settle depth={0.25} intensity={0.4}>
      <section className="relative section-glass py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <h2 className="weha-display text-4xl md:text-6xl text-weha-text">Sound familiar?</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pains.map((p, i) => (
              <Parallax key={i} speed={20 + i * 14} className="h-full">
                <Reveal delay={i * 0.08} className="h-full">
                  <div className="glass rounded-2xl p-7 h-full" data-cursor="hover">
                    <span className="text-xs uppercase tracking-[0.2em] text-weha-faint">Inbound · 8:14 AM</span>
                    <p className="mt-4 text-lg leading-relaxed text-weha-text">"{p}"</p>
                  </div>
                </Reveal>
              </Parallax>
            ))}
          </div>
          <Reveal delay={0.1}>
            <p className="mt-12 weha-display text-2xl md:text-4xl text-weha-text max-w-3xl leading-snug">
              These are the exact bottlenecks we automate{" "}
              <span className="italic text-weha-teal">first</span>, whatever business you run.
            </p>
          </Reveal>
        </div>
      </section>
      </ScrollSection>

      {/* HOW IT WORKS */}
      <ScrollSection direction="right" settle depth={0} intensity={0.4}>
      <section className="section-glass relative section-surface border-y border-weha-border py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-weha-teal">How it works</span>
            <h2 className="weha-display text-4xl md:text-5xl mt-3 text-weha-text">Three steps to your time back.</h2>
          </Reveal>
          <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((s, i) => (
              <Reveal key={s.no} delay={i * 0.1}>
                <div className="relative" data-cursor="hover">
                  <span className="weha-display text-7xl text-weha-teal/25">{s.no}</span>
                  <h3 className="weha-display text-3xl mt-2 text-weha-text">{s.title}</h3>
                  <p className="mt-4 text-weha-muted leading-relaxed text-base">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      </ScrollSection>

      {/* DIFFERENCE - dark moment */}
      <ScrollSection direction="left" settle depth={1} intensity={0.6}>
      <section className="section-glass relative py-28 md:py-40 overflow-hidden" style={{ background: "#171614", "--weha-bg": "#171614", "--weha-text": "#f7f6f2" }}>
        <div
          className="absolute inset-0 opacity-[0.55]"
          style={{ background: "radial-gradient(circle at 75% 50%, rgba(155,128,224,0.30), transparent 55%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid gap-14 md:grid-cols-2 md:gap-20 md:items-center">
          <Reveal>
            <h2 className="weha-display text-4xl md:text-6xl text-[#f7f6f2] leading-[1.05]">
              Built to run without us, and{" "}
              <span className="italic" style={{ color: "#9b80e0" }}>without lock-in.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <ul className="space-y-7">
              {whyWeha.map((t, i) => (
                <li key={i} className="flex gap-4">
                  <span style={{ color: "#9b80e0" }} className="text-xl leading-none mt-1">✦</span>
                  <span className="text-lg text-[#e9e6df] leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
      </ScrollSection>

      {/* WHAT WE AUTOMATE */}
      <ScrollSection direction="right" settle depth={0} intensity={0.4}>
      <section className="section-glass relative section-surface border-b border-weha-border py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Reveal>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-weha-teal">What we automate</span>
            <h2 className="weha-display text-4xl md:text-5xl mt-3 text-weha-text">From first enquiry to final report.</h2>
          </Reveal>
          <div className="mt-14 flex md:grid md:grid-cols-3 gap-5 overflow-x-auto md:overflow-visible hide-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
            {capabilities.map((v, i) => (
              <Reveal key={v.name} delay={(i % 3) * 0.08}>
                <div className="weha-card p-7 min-w-[78vw] sm:min-w-[320px] md:min-w-0 h-full" data-cursor="hover">
                  <h3 className="weha-display text-2xl text-weha-text">{v.name}</h3>
                  <p className="mt-4 text-weha-muted leading-relaxed">{v.example}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      </ScrollSection>

      {/* METRICS - over the network */}
      <ScrollSection direction="left" settle depth={0.7} intensity={0.5}>
      <section className="relative section-glass py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6">
          {metrics.map(([n, label], i) => (
            <Parallax key={label} speed={18 + i * 8}>
              <Reveal delay={i * 0.06}>
                <p className="weha-display text-5xl md:text-7xl text-weha-teal">{n}</p>
                <p className="mt-2 text-weha-muted">{label}</p>
              </Reveal>
            </Parallax>
          ))}
        </div>
      </section>
      </ScrollSection>

      {/* CTA BANNER */}
      <ScrollSection direction="right" settle depth={0.35} intensity={0.45}>
      <section className="section-glass section-solid px-5 sm:px-8 pb-24">
        <div className="max-w-7xl mx-auto rounded-3xl px-8 py-16 md:px-16 md:py-24 relative overflow-hidden" style={{ background: "var(--weha-teal)" }}>
          <Reveal>
            <h2 className="weha-display text-4xl md:text-6xl text-white max-w-3xl leading-[1.05]">
              See your first automation built in 90 minutes.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-white/85 text-lg max-w-2xl leading-relaxed">
              Book a free AI Audit. We'll map your top 3 automatable workflows, and build one
              live on the call.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <Magnetic>
              <button
                type="button"
                onClick={openBooking}
                data-testid="home-banner-cta"
                data-cursor="hover"
                className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-medium text-[var(--weha-teal)] transition-transform hover:-translate-y-0.5"
              >
                Book My Free Audit <ArrowUpRight size={17} />
              </button>
            </Magnetic>
          </Reveal>
        </div>
      </section>
      </ScrollSection>
    </div>
  );
}
