import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

/**
 * Animated circular progress gauge — sweeps from 0 to `score` (out of `max`)
 * the first time it scrolls into view, and interpolates its stroke color
 * from red -> yellow -> green as the score climbs.
 */

// Interpolates across a red -> yellow -> green ramp based on 0..1 progress.
const rampColor = (t) => {
  const stops = [
    { p: 0, c: [248, 113, 113] }, // red-400
    { p: 0.5, c: [250, 204, 21] }, // yellow-400
    { p: 1, c: [74, 222, 128] }, // green-400
  ];
  let a = stops[0];
  let b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].p && t <= stops[i + 1].p) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const span = b.p - a.p || 1;
  const local = (t - a.p) / span;
  const rgb = a.c.map((v, i) => Math.round(v + (b.c[i] - v) * local));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
};

const CircularGauge = ({
  score = 0,
  max = 10,
  size = 64,
  strokeWidth = 6,
  trackColor = "#22262f",
  showValue = true,
  valueFormatter = (v) => Math.round(v),
  className = "",
}) => {
  const wrapRef = useRef(null);
  const isInView = useInView(wrapRef, { once: true, margin: "-40px" });
  const [progress, setProgress] = useState(0); // 0..1
  const [display, setDisplay] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = Math.max(0, Math.min(1, score / max));

  useEffect(() => {
    if (!isInView) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setProgress(target);
      setDisplay(score);
      return;
    }

    const controls = animate(0, target, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => {
        setProgress(v);
        setDisplay(v * max);
      },
    });

    return () => controls.stop();
  }, [isInView, target, score, max]);

  const color = rampColor(progress);

  return (
    <div ref={wrapRef} className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: "stroke 0.3s linear" }}
        />
      </svg>
      {showValue && (
        <span
          className="absolute inset-0 flex items-center justify-center font-extrabold text-white"
          style={{ fontSize: size * 0.24, color }}
        >
          {valueFormatter(display)}
        </span>
      )}
    </div>
  );
};

export default CircularGauge;