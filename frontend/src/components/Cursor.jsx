import { useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  // Bind the dot directly to the raw pointer position for true 1:1, lag-free tracking.
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target;
      const interactive = el.closest("a, button, [data-cursor='hover'], input, textarea, select, [data-testid='network-scene']");
      setHovering(!!interactive);
    };
    // passive listener so pointer updates are dispatched as fast as the browser allows
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[200] rounded-full mix-blend-difference"
        style={{
          x: x,
          y: y,
          translateX: "-50%",
          translateY: "-50%",
          width: hovering ? 46 : 10,
          height: hovering ? 46 : 10,
          backgroundColor: hovering ? "transparent" : "#5b3fa6",
          border: hovering ? "1.5px solid #5b3fa6" : "none",
          transition: "width 0.2s ease, height 0.2s ease, background-color 0.2s ease",
        }}
        aria-hidden="true"
      />
    </>
  );
}
