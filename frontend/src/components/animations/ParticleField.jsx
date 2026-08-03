import { useEffect, useRef } from "react";

/**
 * Subtle animated particle/network background, drawn on a <canvas>.
 * Deliberately dependency-free (no particles.js/tsparticles) to keep the
 * bundle light — this renders the same "floating nodes + connecting lines"
 * effect at a fraction of the size.
 *
 * Usage: absolutely position a parent with `position: relative` and drop
 * <ParticleField /> inside it, then layer your real content on top with a
 * higher z-index.
 */
const ParticleField = ({
  count = 46,
  color = "99, 102, 241", // indigo-500 as "r, g, b"
  linkDistance = 130,
  speed = 0.25,
  className = "",
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = canvas.getContext("2d");
    let width, height, dpr;
    let particles = [];
    let animationId;
    let visible = true;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const makeParticles = () => {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * 1.6 + 0.6,
      }));
    };

    const step = () => {
      if (!visible) {
        animationId = requestAnimationFrame(step);
        return;
      }
      ctx.clearRect(0, 0, width, height);

      // links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDistance) {
            const alpha = (1 - dist / linkDistance) * 0.35;
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, 0.55)`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(step);
    };

    resize();
    makeParticles();

    if (!prefersReducedMotion) {
      animationId = requestAnimationFrame(step);
    } else {
      // Draw a single static frame for reduced-motion users.
      step();
      cancelAnimationFrame(animationId);
    }

    const onResize = () => {
      resize();
      makeParticles();
    };
    window.addEventListener("resize", onResize);

    // Pause work when the tab/section isn't visible.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, [count, color, linkDistance, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden="true"
    />
  );
};

export default ParticleField;