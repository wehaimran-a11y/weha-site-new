import { motion } from "framer-motion";
import { EASE, DUR } from "@/lib/motion";

export default function Reveal({ children, delay = 0, y = 24, className = "", as = "div" }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: DUR.reveal, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}
