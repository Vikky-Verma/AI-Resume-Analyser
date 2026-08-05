/**
 * Wraps children in a slowly-rotating conic-gradient border.
 * Usage:
 *   <GradientBorder className="rounded-2xl">
 *     <div className="rounded-[inherit] bg-[#11151d] p-6">...</div>
 *   </GradientBorder>
 */
const GradientBorder = ({
  children,
  className = "",
  borderRadius = "1rem",
  borderWidth = 1.5,
  colors = "#6366f1, #a855f7, #2dd4bf, #6366f1",
  duration = 6,
}) => {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius, padding: borderWidth }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-[-60%] animate-gradient-spin"
        style={{
          background: `conic-gradient(from 0deg, ${colors})`,
          animationDuration: `${duration}s`,
        }}
      />
      <div className="relative h-full w-full" style={{ borderRadius: `calc(${borderRadius} - ${borderWidth}px)` }}>
        {children}
      </div>
    </div>
  );
};

export default GradientBorder;