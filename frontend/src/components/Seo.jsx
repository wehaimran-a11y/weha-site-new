// Per-page SEO. React 19 natively hoists <title>, <meta> and <link> to <head>,
// so no helmet library is required. Renders OpenGraph + Twitter + canonical and
// optional JSON-LD structured data (great for Google + LLM crawlers).

const SITE_URL = (process.env.REACT_APP_SITE_URL || "https://www.wehelpautomate.com").replace(/\/$/, "");
const DEFAULT_IMG = `${SITE_URL}/og-default.png`;
const DEFAULT_TITLE = "WeHA | We Help Automate · AI automation that runs itself";

export default function Seo({
  title,
  description = "We Help Automate (WeHA) turns your messiest manual workflows into AI systems that run themselves. Built in days, not months.",
  path = "/",
  image,
  type = "website",
  noindex = false,
  jsonLd,
}) {
  const fullTitle = title ? `${title} | WeHA` : DEFAULT_TITLE;
  const url = `${SITE_URL}${path}`;
  const img = image || DEFAULT_IMG;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="We Help Automate" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  );
}
