// Brand-violet floating WhatsApp button — bottom-right, all pages.
// Opens chat with +91 81808 61084 in a new tab.
const WHATSAPP_NUMBER = "918180861084";
const WHATSAPP_PREFILL =
  "Hi WeHA — I'd like to learn about your AI automation services.";

export default function FloatingWhatsApp() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="floating-whatsapp"
      aria-label="Chat with WeHA on WhatsApp"
      className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-[120] group inline-flex items-center gap-2 outline-none focus-visible:ring-4 focus-visible:ring-weha-teal/30 rounded-full"
    >
      {/* Tooltip pill — desktop only */}
      <span className="hidden md:inline-flex items-center text-sm font-medium rounded-full px-4 py-2 bg-weha-bg/95 backdrop-blur-sm border border-weha-border text-weha-text shadow-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
        Chat on WhatsApp
      </span>

      {/* Round button with WhatsApp glyph */}
      <span
        className="relative h-14 w-14 md:h-15 md:w-15 grid place-items-center rounded-full shadow-lg shadow-black/20 transition-transform group-hover:scale-105 group-active:scale-95"
        style={{ backgroundColor: "var(--weha-teal)" }}
      >
        {/* Pulse halo */}
        <span
          aria-hidden="true"
          className="weha-whatsapp-pulse absolute inset-0 rounded-full"
          style={{ backgroundColor: "var(--weha-teal)" }}
        />
        {/* WhatsApp icon (currentColor → white) */}
        <svg
          viewBox="0 0 32 32"
          width="28"
          height="28"
          className="relative text-white"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M16.003 3C9.39 3 4 8.388 4 14.997c0 2.357.687 4.564 1.997 6.45L4 29l7.78-2.04a12 12 0 0 0 4.224.762h.001C22.61 27.722 28 22.334 28 15.725 28 12.547 26.748 9.557 24.476 7.288 22.205 5.018 19.182 3.001 16.004 3.001Zm0 21.778h-.002a9.74 9.74 0 0 1-4.969-1.36l-.357-.212-4.62 1.212 1.234-4.5-.232-.37a9.7 9.7 0 0 1-1.49-5.151c0-5.378 4.378-9.757 9.762-9.757 2.605 0 5.053 1.014 6.892 2.857a9.7 9.7 0 0 1 2.856 6.9c0 5.378-4.376 9.757-9.762 9.757Zm5.353-7.305c-.292-.146-1.728-.852-1.996-.949-.268-.097-.463-.146-.658.146s-.755.948-.926 1.144c-.17.195-.34.219-.633.073-.293-.146-1.237-.456-2.357-1.456-.872-.778-1.46-1.74-1.63-2.033-.17-.292-.018-.45.128-.595.131-.131.293-.341.439-.512.146-.17.195-.293.293-.487.097-.195.05-.366-.024-.512s-.658-1.586-.902-2.176c-.236-.57-.477-.493-.658-.5l-.561-.01a1.078 1.078 0 0 0-.78.366c-.268.292-1.024 1-1.024 2.437 0 1.437 1.049 2.826 1.195 3.02.146.195 2.065 3.156 5.005 4.428.7.302 1.245.482 1.671.617.702.224 1.34.192 1.846.117.563-.084 1.728-.706 1.972-1.387.243-.682.243-1.266.17-1.387-.072-.122-.268-.195-.561-.341Z" />
        </svg>
      </span>
    </a>
  );
}
