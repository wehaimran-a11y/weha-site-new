import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Workflow, Download } from "lucide-react";
import PageHero from "@/components/PageHero";
import CTABanner from "@/components/CTABanner";
import Reveal from "@/components/Reveal";
import ScrollSection from "@/components/ScrollSection";
import Seo from "@/components/Seo";
import ResourceDownloadModal from "@/components/ResourceDownloadModal";
import { DRIVE } from "@/lib/resourceLinks";

const items = [
  {
    title: "Lead Capture to CRM Router",
    stack: "n8n",
    desc: "Catch every inbound lead, create a CRM record, and alert your team.",
    downloadUrl: DRIVE.wfLeadCapture,
    slug: "lead-capture-crm",
  },
  {
    title: "Cold Outreach Sequencer",
    stack: "n8n + LLM",
    desc: "Pull prospects daily, personalize each message, keep a human gate, then send.",
    downloadUrl: DRIVE.wfColdOutreach,
    slug: "cold-outreach",
  },
  {
    title: "Meeting Notes to Action Items",
    stack: "n8n + LLM",
    desc: "Turn any call transcript into assigned, tracked tasks.",
    downloadUrl: DRIVE.wfMeetingNotes,
    slug: "meeting-notes",
  },
  {
    title: "Invoice Payment Reminder",
    stack: "n8n",
    desc: "Detect overdue invoices and send polite, escalating reminders on their own.",
    downloadUrl: DRIVE.wfInvoiceReminder,
    slug: "invoice-reminder",
  },
];

export default function ResourceWorkflows() {
  const [asset, setAsset] = useState(null);
  const openGate = (it) =>
    setAsset({
      title: it.title,
      description: it.desc,
      downloadUrl: it.downloadUrl,
      source: `resource:workflow:${it.slug}`,
    });

  return (
    <div data-testid="resource-workflows-page" className="overflow-x-hidden">
      <Seo
        title="Free Workflow Automations"
        description="Free, ready-to-import n8n workflow automation templates you can plug into your own stack in minutes. Each download includes the template plus a setup guide."
        path="/resources/workflow-automations"
      />
      <PageHero
        kicker="Resources / Workflow Automations"
        title="Free workflow"
        italicWord="automations."
        subtitle="Ready-to-import n8n templates. Grab one, connect your tools, and ship."
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
                <Reveal key={it.slug} delay={i * 0.05}>
                  <div className="weha-card h-full p-7 flex flex-col" data-testid={`workflow-${it.slug}`}>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-weha-teal-soft text-weha-teal">
                      <Workflow size={20} />
                    </span>
                    <h3 className="weha-display text-xl mt-5 text-weha-text">{it.title}</h3>
                    <p className="mt-1 text-xs font-medium text-weha-teal">{it.stack}</p>
                    <p className="mt-3 text-weha-muted leading-relaxed flex-1">{it.desc}</p>
                    <p className="mt-4 text-xs text-weha-faint">Includes template plus setup guide (.zip)</p>
                    <button
                      type="button"
                      data-cursor="hover"
                      className="btn-ghost mt-4 self-start"
                      data-testid={`workflow-download-${it.slug}`}
                      onClick={() => openGate(it)}
                    >
                      <Download size={15} /> Download
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </ScrollSection>

      <ScrollSection direction="right" settle depth={0.35} intensity={0.45}>
        <CTABanner heading="Need a custom automation?" sub="Book a free AI Audit and we will build a rough version live, on your stack." testid="workflows-cta" />
      </ScrollSection>

      <ResourceDownloadModal open={!!asset} onOpenChange={(v) => { if (!v) setAsset(null); }} asset={asset} />
    </div>
  );
}
