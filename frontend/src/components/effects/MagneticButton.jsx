import { useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Drop-in replacement for a button/link that pulls toward the cursor,
 * sweeps a shine across itself on hover, and ripples on click.
 * `as` lets it wrap any component (e.g. `as={Link}` with a `to` prop).
 */
const MagneticButton = ({ as = "button", children, className = "", strength = 14, onClick, ...props }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [shining, setShining] = useState(false);
  const [ripples, setRipples] = useState([]);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMove = (e) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const relY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setPos({ x: relX * strength, y: relY * strength });
  };

  const reset = () => {
    setPos({ x: 0, y: 0 });
    setShining(false);
  };

  const handleClick = (e) => {
    if (!reducedMotion && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const id = Date.now() + Math.random();
      const rx = e.clientX - rect.left;
      const ry = e.clientY - rect.top;
      setRipples((r) => [...r, { id, x: rx, y: ry }]);
      setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 650);
    }
    onClick?.(e);
  };

  const MotionTag = motion.create ? motion.create(as) : motion(as);

  return (
    <MotionTag
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setShining(true)}
      onMouseLeave={reset}
      onClick={handleClick}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 220, damping: 16, mass: 0.3 }}
      className={`relative overflow-hidden isolate ${className}`}
      {...props}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[1]"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.22) 48%, transparent 66%)",
        }}
        initial={{ x: "-120%" }}
        animate={{ x: shining && !reducedMotion ? "120%" : "-120%" }}
        transition={{ duration: 0.65, ease: "easeInOut" }}
      />

      {children}

      {ripples.map((r) => (
        <span
          key={r.id}
          className="animate-ripple pointer-events-none absolute rounded-full bg-white/50"
          style={{ left: r.x, top: r.y, width: 8, height: 8, marginLeft: -4, marginTop: -4 }}
        />
      ))}
    </MotionTag>
  );
};

export default MagneticButton;