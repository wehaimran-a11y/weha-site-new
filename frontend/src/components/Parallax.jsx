import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Parallax({ children, speed = 40, className = "", opacity = false }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  const o = useTransform(scrollYProgress, [0, 0.25, 0.85, 1], [0.4, 1, 1, 0.4]);
  return (
    <motion.div ref={ref} style={{ y, opacity: opacity ? o : undefined }} className={className}>
      {children}
    </motion.div>
  );
}
