import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { SCROLL_SPRING } from "@/lib/motion";

/**
 * ScrollSection — wraps a page section with a scroll-linked entrance.
 *
 * Premium behaviour:
 *  - The progress is spring-smoothed so motion feels weighted, not mechanical.
 *  - In `settle` mode the section animates IN once and then locks rock-steady
 *    (no exit drift / tilt / fade) so content you're reading never wobbles.
 *  - `depth` controls how much true 3D (rotateY) is used: 0 = flat slide for
 *    body copy, up to 1 = bold 3D for hero/feature moments.
 *
 * Props:
 *   direction: "left" | "right"   side the section enters from
 *   intensity: 0..1               overall amount of movement (default 0.45)
 *   depth:     0..1               amount of 3D rotateY (default 1)
 *   settle:    boolean            one-way settle (no exit animation)
 *   className: passthrough
 */
export default function ScrollSection({
  children,
  direction = "left",
  intensity = 0.45,
  depth = 1,
  settle = false,
  className = "",
}) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.1"],
  });

  // Weighted, premium scroll feel (not 1:1 with the wheel).
  const p = useSpring(scrollYProgress, SCROLL_SPRING);

  const xMul = direction === "left" ? -1 : 1;
  const xIn = 64 * intensity * xMul;
  const rotIn = 8 * intensity * depth * xMul;

  // One-way "settle": animate in, then hold perfectly still.
  const xKeys = settle ? [xIn, 0, 0, 0] : [xIn, 0, 0, -20 * intensity * xMul];
  const rotKeys = settle ? [rotIn, 0, 0, 0] : [rotIn, 0, 0, -4 * intensity * depth * xMul];
  const opacityKeys = settle ? [0, 1, 1, 1] : [0, 1, 1, 0.92];
  const scaleKeys = settle ? [0.975, 1, 1, 1] : [0.95, 1, 1, 0.98];

  const x = useTransform(p, [0, 0.24, 0.85, 1], xKeys);
  const rotateY = useTransform(p, [0, 0.24, 0.85, 1], rotKeys);
  const opacity = useTransform(p, [0, 0.2, 0.85, 1], opacityKeys);
  const scale = useTransform(p, [0, 0.24, 0.85, 1], scaleKeys);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      data-testid="scroll-section"
      data-direction={direction}
      style={{
        x,
        rotateY,
        opacity,
        scale,
        position: "relative",
        transformPerspective: 1400,
        transformOrigin: direction === "left" ? "left center" : "right center",
        willChange: "transform, opacity",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
