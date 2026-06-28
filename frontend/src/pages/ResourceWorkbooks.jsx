import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Download } from "lucide-react";
import PageHero from "@/components/PageHero";
import CTABanner from "@/components/CTABanner";
import Reveal from "@/components/Reveal";
import ScrollSection from "@/components/ScrollSection";
import Seo from "@/components/Seo";
import ResourceDownloadModal from "@/components/ResourceDownloadModal";
import { DRIVE } from "@/lib/resourceLinks";

const items = [
  {
    title: "The Workflow Audit Workbook",
    format: "PDF",
    desc: "Map every manual step in your busiest process and score it for automation.",
    downloadUrl: DRIVE.wbAudit,
    slug: "workflow-audit",
  },
  {
    title: "The Prioritization Matrix",
    format: "PDF",
    desc: "Score your workflows by impact and ease, and know exactly where to start.",
    downloadUrl: DRIVE.wbMatrix,
    slug: "prioritization-matrix",
  },
  {
    title: "Automation ROI Calculator",
    format: "Excel",
    desc: "Estimate the hours and cost you could save before building anything.",
    downloadUrl: DRIVE.wbRoiCalc,
    slug: "roi-calculator",
  },
  {
    title: "Tool Stack Inventory",
    format: "Excel",
    desc: "List what you already pay for and spot your automation gaps.",
    downloadUrl: DRIVE.wbToolStack,
    slug: "tool-stack-inventory",
  },
];

export default function ResourceWorkbooks() {
  const [asset, setAsset] = useState(null);
  const openGate = (it) =>
    setAsset({
      title: it.title,
      description: it.desc,
      downloadUrl: it.downloadUrl,
      source: `resource:workbook:${it.slug}`,
    });

  return (
    <div data-testid="resource-workbooks-page" className="overflow-x-hidden">
      <Seo
        title="Free Workbooks"
        description="Free printable WeHA workbooks to map, score, and prioritize the manual workflows worth automating first."
        path="/resources/workbooks"
      />
      <PageHero
        kicker="Resources / Workbooks"
        title="Free"
        italicWord="workbooks."
        subtitle="Practical worksheets to help you find and prioritize your highest-impact automations."
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
                  <div className="weha-card h-full p-7 flex flex-col" data-testid={`workbook-${it.slug}`}>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-weha-teal-soft text-weha-teal">
                        <BookOpen size={20} />
                      </span>
                      <span className="rounded-full border border-weha-border px-3 py-1 text-xs font-semibold tracking-widest uppercase text-weha-muted">
                        {it.format}
                      </span>
                    </div>
                    <h3 className="weha-display text-2xl mt-5 text-weha-text">{it.title}</h3>
                    <p className="mt-2 text-weha-muted leading-relaxed flex-1">{it.desc}</p>
                    <div className="mt-6 flex items-center justify-end">
                      <button
                        type="button"
                        data-cursor="hover"
                        className="btn-ghost"
                        data-testid={`workbook-download-${it.slug}`}
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
        <CTABanner heading="Prefer we map it with you?" sub="Book a free AI Audit and we will fill out the workbook live, for your business." testid="workbooks-cta" />
      </ScrollSection>

      <ResourceDownloadModal open={!!asset} onOpenChange={(v) => { if (!v) setAsset(null); }} asset={asset} />
    </div>
  );
}
