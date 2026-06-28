export default function Logo({ className = "", animated = false }) {
  // New WeHA wordmark — theme-adaptive.
  //   "We" picks up --weha-text (cream on dark, ink on light)
  //   "HA" and the tall vertical stroke use --weha-teal (Ink Violet)
  // When `animated` is true, the stroke "draws" and "HA" eases in on a slow loop.
  const animClass = animated ? "weha-logo--animated" : "";
  return (
    <span
      className={`weha-logo inline-flex items-center select-none ${animClass} ${className}`}
      data-testid="weha-logo"
      aria-label="WeHA — We Help Automate"
    >
      <span className="weha-logo__word weha-logo__we text-weha-text">We</span>
      <span aria-hidden="true" className="weha-logo__stroke bg-weha-teal" />
      <span className="weha-logo__word weha-logo__ha text-weha-teal">HA</span>
    </span>
  );
}
