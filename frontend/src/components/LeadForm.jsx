import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { submitAuditRequest } from "@/lib/api";

const initial = { name: "", email: "", company: "", process: "" };

export default function LeadForm({ heading = "Book your free AI Audit", testid = "lead-form", source = "lead-form" }) {
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.company.trim() || !form.process.trim()) {
      toast.error("Please add your name, company, and what you'd like to automate.");
      return;
    }
    setSubmitting(true);
    try {
      await submitAuditRequest({
        ...form,
        source,
        country: "Not specified",
        industry: "Not specified",
        contact_method: "Email",
      });
      setDone(true);
      toast.success("Request received — we'll reply within 24 hours.");
      setForm(initial);
    } catch (err) {
      toast.error("Something went wrong. Email hello@wehelpautomate.com");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-7 md:p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]" data-testid={testid}>
      {done ? (
        <div className="py-6" data-testid={`${testid}-success`}>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-weha-teal">Received</span>
          <h3 className="weha-display text-3xl mt-3 text-weha-text">Your audit request is in.</h3>
          <p className="mt-3 text-weha-muted leading-relaxed">
            We respond within 24 hours. No sales scripts — just a conversation about your workflow.
          </p>
          <button onClick={() => setDone(false)} className="btn-ghost mt-5" data-testid={`${testid}-reset`}>
            Send another <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} data-testid={`${testid}-form`} className="space-y-4">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-weha-teal">Free · 60 min</span>
            <h3 className="weha-display text-2xl md:text-3xl mt-2 text-weha-text leading-tight">{heading}</h3>
          </div>
          <div>
            <label className="weha-label" htmlFor={`${testid}-name`}>Name</label>
            <input id={`${testid}-name`} className="weha-input" value={form.name} onChange={update("name")} placeholder="Your name" data-testid={`${testid}-name`} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="weha-label" htmlFor={`${testid}-company`}>Company</label>
              <input id={`${testid}-company`} className="weha-input" value={form.company} onChange={update("company")} placeholder="Company" data-testid={`${testid}-company`} />
            </div>
            <div>
              <label className="weha-label" htmlFor={`${testid}-email`}>Email</label>
              <input id={`${testid}-email`} type="email" className="weha-input" value={form.email} onChange={update("email")} placeholder="you@company.com" data-testid={`${testid}-email`} />
            </div>
          </div>
          <div>
            <label className="weha-label" htmlFor={`${testid}-process`}>What do you want to automate?</label>
            <textarea id={`${testid}-process`} rows={3} className="weha-input resize-none" value={form.process} onChange={update("process")} placeholder="e.g. WhatsApp lead routing, RFQ-to-quote…" data-testid={`${testid}-process`} />
          </div>
          <button type="submit" disabled={submitting} className="btn-teal w-full justify-center disabled:opacity-60" data-cursor="hover" data-testid={`${testid}-submit`}>
            {submitting ? "Sending…" : "Request My Free Audit"} <ArrowRight size={16} />
          </button>
          <p className="text-xs text-weha-muted leading-relaxed">No pitch decks. We reply within 24 hours.</p>
        </form>
      )}
    </div>
  );
}
