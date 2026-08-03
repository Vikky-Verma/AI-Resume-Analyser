import { motion } from "framer-motion";

/**
 * Track + fill bar that eases its width in from 0 the first time it
 * scrolls into view. Drop-in replacement for a static width-style div.
 */
const AnimatedBar = ({
  percent = 0,
  trackClassName = "h-2 rounded-full bg-[#242840] overflow-hidden",
  fillClassName = "h-full rounded-full bg-indigo-500",
  color,
  delay = 0,
  duration = 0.9,
}) => {
  const pct = Math.max(0, Math.min(100, percent));

  return (
    <div className={trackClassName}>
      <motion.div
        className={fillClassName}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%`, backgroundColor: color }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
        style={color ? { backgroundColor: color } : undefined}
      />
    </div>
  );
};

export default AnimatedBar;