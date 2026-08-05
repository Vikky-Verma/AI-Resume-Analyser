import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";

/**
 * Wraps any card content with a subtle mouse-driven 3D tilt, a cursor-
 * following glow, and a depth pop on the inner content (translateZ).
 * Respects prefers-reduced-motion; inert on touch devices.
 *
 * Usage: <TiltCard className="rounded-2xl bg-[#11151d] border border-[#232838] p-6">...</TiltCard>
 */
const TiltCard = ({
  children,
  className = "",
  maxTilt = 8,
  glowColor = "129,140,248", // indigo-400 as "r, g, b"
  disableGlow = false,
  style,
  ...props
}) => {
  const ref = useRef(null);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { stiffness: 180, damping: 20, mass: 0.4 };
  const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), springConfig);

  const glowX = useTransform(x, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(y, [0, 1], ["0%", "100%"]);
  const glowBackground = useMotionTemplate`radial-gradient(360px circle at ${glowX} ${glowY}, rgba(${glowColor},0.16), transparent 70%)`;

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMove = (e) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    x.set(0.5);
    y.set(0.5);
    setHovering(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={reset}
      style={{
        rotateX: reducedMotion ? 0 : rotateX,
        rotateY: reducedMotion ? 0 : rotateY,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
        ...style,
      }}
      className={`relative ${className}`}
      {...props}
    >
      {!disableGlow && !reducedMotion && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{ background: glowBackground, opacity: hovering ? 1 : 0 }}
        />
      )}
      <div className="relative" style={{ transform: "translateZ(24px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

export default TiltCard;