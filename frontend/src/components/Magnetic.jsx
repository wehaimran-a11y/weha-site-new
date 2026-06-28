import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MAGNETIC_SPRING } from "@/lib/motion";

export default function Magnetic({ children, strength = 0.4, className = "" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, MAGNETIC_SPRING);
  const sy = useSpring(y, MAGNETIC_SPRING);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - (rect.left + rect.width / 2);
    const my = e.clientY - (rect.top + rect.height / 2);
    x.set(mx * strength);
    y.set(my * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy, display: "inline-flex" }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
