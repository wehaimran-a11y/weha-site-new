// Infinite horizontal ticker of integration logos using Simple Icons CDN.
// Logos are rendered grayscale at reduced opacity for a refined, on-brand strip;
// brand color appears on hover.
const TOOLS = [
  { name: "Google Sheets", slug: "googlesheets" },
  { name: "n8n",      slug: "n8n" },
  { name: "HubSpot",  slug: "hubspot" },
  { name: "WhatsApp", slug: "whatsapp" },
  { name: "Claude",   slug: "anthropic" },
  { name: "Make",     slug: "make" },
  { name: "Airtable", slug: "airtable" },
  { name: "OpenAI",   slug: "openai" },
  { name: "Zapier",   slug: "zapier" },
  { name: "Slack",    slug: "slack" },
  { name: "Notion",   slug: "notion" },
  { name: "Apify",    slug: "apify" },
];

function Logo({ name, slug }) {
  return (
    <div
      className="shrink-0 mx-7 md:mx-10 flex items-center gap-3 group"
      title={name}
      data-testid={`integration-logo-${slug}`}
    >
      <img
        src={`https://cdn.simpleicons.org/${slug}`}
        alt={`${name} logo`}
        loading="lazy"
        className="h-7 w-7 md:h-8 md:w-8 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition duration-300"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
      <span className="text-sm md:text-[0.95rem] font-medium text-weha-muted group-hover:text-weha-text transition-colors whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export default function IntegrationStrip({ heading = "Fluent in your stack" }) {
  return (
    <section
      aria-label="Tool fluency — integrations we build with"
      data-testid="integration-strip"
      className="relative border-y border-weha-border bg-weha-surface/70 backdrop-blur-sm py-7 md:py-9 overflow-hidden"
    >
      <p className="text-center text-[0.7rem] md:text-xs font-semibold tracking-[0.22em] uppercase text-weha-faint mb-5">
        {heading}
      </p>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-40 z-10"
           style={{ background: "linear-gradient(to right, var(--weha-bg), transparent)" }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-40 z-10"
           style={{ background: "linear-gradient(to left, var(--weha-bg), transparent)" }} />
      <div className="weha-marquee" data-testid="integration-marquee">
        <div className="weha-marquee__track">
          {TOOLS.map((t) => <Logo key={`a-${t.slug}`} {...t} />)}
          {/* duplicated set for seamless loop */}
          {TOOLS.map((t) => <Logo key={`b-${t.slug}`} {...t} />)}
        </div>
      </div>
    </section>
  );
}
