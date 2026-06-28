import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Download } from "lucide-react";
import PageHero from "@/components/PageHero";
import CTABanner from "@/components/CTABanner";
import Reveal from "@/components/Reveal";
import ScrollSection from "@/components/ScrollSection";
import Seo from "@/components/Seo";
import ResourceDownloadModal from "@/components/ResourceDownloadModal";
import { DRIVE } from "@/lib/resourceLinks";

const items = [
  {
    title: "The Automation-First Operating System",
    desc: "How to run a business on systems instead of manual effort.",
    downloadUrl: DRIVE.ebookOperatingSystem,
    slug: "operating-system",
  },
  {
    title: "Deterministic vs Agentic AI",
    desc: "A plain English guide to the two kinds of automation and when to use each.",
    downloadUrl: DRIVE.ebookDeterministic,
    slug: "deterministic-vs-agentic",
  },
  {
    title: "The First 90 Days of Automation",
    desc: "What to automate first, second, and third, and why order matters.",
    downloadUrl: DRIVE.ebook90Days,
    slug: "first-90-days",
  },
  {
    title: "AI Without Lock-In",
    desc: "How to adopt AI on the tools you already own and keep control.",
    downloadUrl: DRIVE.ebookLockIn,
    slug: "ai-without-lock-in",
  },
];

export default function ResourceEbooks() {
  const [asset, setAsset] = useState(null);
  const openGate = (it) =>
    setAsset({
      title: it.title,
      description: it.desc,
      downloadUrl: it.downloadUrl,
      source: `resource:ebook:${it.slug}`,
    });

  return (
    <div data-testid="resource-ebooks-page" className="overflow-x-hidden">
      <Seo
        title="Free eBooks"
        description="Free WeHA eBooks: practical guides on automating any business, what to automate first, and how to keep control of the tools you already own."
        path="/resources/ebooks"
      />
      <PageHero
        kicker="Resources / eBooks"
        title="Free"
        italicWord="eBooks."
        subtitle="Practical guides on automating any business, what to automate first, and how to keep control of your tools."
        showForm={false}
      />

      <ScrollSection direction="left" settle depth={0} intensity={0.4}>
        <section className="section-glass relative section-solid py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <Reveal>
              <Link to="/resources" data-cursor="hover" className="inline-flex items-center gap-2 text-weha-muted hover:text-weha-teal transition-colors">
                <ArrowLeft size={15} /> Back to Resources
              </Link>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {items.map((it, i) => (
                <Reveal key={it.slug} delay={i * 0.06}>
                  <div className="weha-card h-full p-7 flex flex-col" data-testid={`ebook-${it.slug}`}>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-weha-teal-soft text-weha-teal">
                      <FileText size={20} />
                    </span>
                    <h3 className="weha-display text-2xl mt-5 text-weha-text">{it.title}</h3>
                    <p className="mt-2 text-weha-muted leading-relaxed flex-1">{it.desc}</p>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-widest uppercase text-weha-faint">5 min read</span>
                      <button
                        type="button"
                        data-cursor="hover"
                        className="btn-ghost"
                        data-testid={`ebook-download-${it.slug}`}
                        onClick={() => openGate(it)}
                      >
                        <Download size={15} /> Download
                      </button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      <ScrollSection direction="right" settle depth={0.35} intensity={0.45}>
        <CTABanner heading="Have a question the eBook did not answer?" sub="Book a free AI Audit with a human." testid="ebooks-cta" />
      </ScrollSection>

      <ResourceDownloadModal open={!!asset} onOpenChange={(v) => { if (!v) setAsset(null); }} asset={asset} />
    </div>
  );
}
