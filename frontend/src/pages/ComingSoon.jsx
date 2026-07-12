import Navbar from "../components/Navbar";
import { Sparkles } from "lucide-react";

/**
 * Reusable placeholder page for phases that aren't built yet.
 * Usage: <ComingSoon icon={Trophy} title="Progress" phase="Phase 6"
 *          description="..." features={["a", "b", "c"]} />
 */
const ComingSoon = ({
  icon: Icon = Sparkles,
  title = "Coming Soon",
  phase = "",
  description = "This feature is on the roadmap and under active development.",
  features = [],
}) => {
  return (
    <div className="min-h-screen bg-[#0f1120] text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6">
          <Icon size={28} className="text-indigo-400" />
        </div>

        {phase && (
          <span className="text-xs font-semibold tracking-wide uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1 mb-4">
            {phase}
          </span>
        )}

        <h1 className="text-3xl font-bold mb-3">{title}</h1>
        <p className="text-slate-400 mb-10 leading-relaxed">{description}</p>

        {features.length > 0 && (
          <div className="w-full bg-[#171a2c] border border-[#2e3150] rounded-2xl p-6 text-left">
            <p className="text-sm font-semibold text-slate-300 mb-4">
              What's coming
            </p>
            <ul className="space-y-3">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComingSoon;