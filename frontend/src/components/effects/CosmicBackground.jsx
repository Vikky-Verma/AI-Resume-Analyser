import ParticleField from "../animations/ParticleField";

/**
 * Global "AI universe" backdrop, mounted once at the root of the app (see
 * App.jsx) so every page — public and protected — sits on top of it.
 *
 * Layered back to front:
 *   1. Deep navy base
 *   2. Slow-drifting aurora blobs (reuses the existing float-blob keyframes)
 *   3. A soft radial gradient mesh anchored top/bottom for depth
 *   4. A sparse connected particle network
 *   5. A faint film-grain noise texture
 *
 * `fixed` + `pointer-events-none` + a negative z-index mean this never
 * affects layout, scroll, or click-through.
 */
const CosmicBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#0a0e14]"
    >
      {/* Aurora blobs */}
      <div className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] rounded-full bg-indigo-600/20 blur-[140px] animate-float-blob" />
      <div className="absolute top-0 -right-1/4 w-[55vw] h-[55vw] max-w-[800px] max-h-[800px] rounded-full bg-violet-600/14 blur-[140px] animate-float-blob-slow" />
      <div className="absolute bottom-[-20%] left-1/4 w-[50vw] h-[50vw] max-w-[750px] max-h-[750px] rounded-full bg-teal-500/10 blur-[130px] animate-float-blob" />
      <div className="absolute bottom-[-10%] right-1/3 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full bg-fuchsia-600/8 blur-[130px] animate-float-blob-slow" />

      {/* Gradient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.10),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(45,212,191,0.06),transparent)]" />

      {/* Connected particle network */}
      <ParticleField count={70} linkDistance={140} speed={0.15} className="opacity-40" />

      {/* Film-grain noise */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Bottom fade so solid content panels blend cleanly */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0e14] to-transparent" />
    </div>
  );
};

export default CosmicBackground;