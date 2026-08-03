import { motion } from "framer-motion";

/**
 * Three-line hamburger that morphs smoothly into an X when `open` is true.
 */
const MorphMenuIcon = ({ open, size = 18, color = "currentColor" }) => {
  const lineProps = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: "round",
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <motion.line
        x1="3" y1="6" x2="21" y2="6"
        {...lineProps}
        animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        style={{ originX: "12px", originY: "6px" }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
      <motion.line
        x1="3" y1="12" x2="21" y2="12"
        {...lineProps}
        animate={open ? { opacity: 0, x: -6 } : { opacity: 1, x: 0 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
      />
      <motion.line
        x1="3" y1="18" x2="21" y2="18"
        {...lineProps}
        animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        style={{ originX: "12px", originY: "18px" }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
    </svg>
  );
};

export default MorphMenuIcon;