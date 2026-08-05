import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * A soft light that trails the pointer, layered on top of the native
 * cursor (not replacing it, to keep click precision). Auto-disabled on
 * touch devices and for prefers-reduced-motion.
 */
const CursorGlow = () => {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [clicking, setClicking] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 320, damping: 30, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 320, damping: 30, mass: 0.4 });

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reducedMotion) return;

    setEnabled(true);

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const interactive = e.target.closest?.(
        "a, button, [role='button'], input, textarea, select, [data-cursor='magnetic']"
      );
      setActive(!!interactive);
    };
    const down = () => setClicking(true);
    const up = () => setClicking(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-screen"
      style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
    >
      <motion.div
        className="rounded-full"
        animate={{
          width: active ? 56 : clicking ? 14 : 22,
          height: active ? 56 : clicking ? 14 : 22,
          opacity: active ? 0.55 : 0.32,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        style={{
          background:
            "radial-gradient(circle, rgba(129,140,248,0.9) 0%, rgba(129,140,248,0) 70%)",
        }}
      />
    </motion.div>
  );
};

export default CursorGlow;