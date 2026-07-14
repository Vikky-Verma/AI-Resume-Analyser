import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import {
  Code2,
  Search,
  Trophy,
  Star,
  Loader2,
  Gauge,
  ListChecks,
  BarChart3,
} from "lucide-react";

const DifficultyBar = ({ label, value, total, colorClass }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#242840] overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const PLATFORMS = [
  { key: "leetcode", label: "LeetCode", placeholder: "LeetCode username" },
  { key: "codeforces", label: "Codeforces", placeholder: "Codeforces handle" },
];

const FEATURES = [
  {
    icon: Gauge,
    color: "amber",
    title: "Rating & rank, at a glance",
    desc: "See exactly where you stand — current rating, max rating, and global rank.",
  },
  {
    icon: ListChecks,
    color: "emerald",
    title: "Difficulty breakdown",
    desc: "Easy / Medium / Hard split of every problem you've solved.",
  },
  {
    icon: BarChart3,
    color: "indigo",
    title: "Cross-platform",
    desc: "LeetCode and Codeforces in one place, same clean layout.",
  },
];

const COLOR_MAP = {
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
};

const DsaInsights = () => {
  const [platform, setPlatform] = useState("leetcode");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [codeforcesStats, setCodeforcesStats] = useState(null);

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    try {
      const endpoint =
        platform === "leetcode"
          ? `/dsa/leetcode/${encodeURIComponent(input.trim())}`
          : `/dsa/codeforces/${encodeURIComponent(input.trim())}`;

      const res = await API.get(endpoint);

      if (platform === "leetcode") {
        setLeetcodeStats(res.data.data);
      } else {
        setCodeforcesStats(res.data.data);
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        `Couldn't fetch ${platform === "leetcode" ? "LeetCode" : "Codeforces"} stats. Please try again.`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const switchPlatform = (key) => {
    setPlatform(key);
    setInput("");
  };

  const currentStats = platform === "leetcode" ? leetcodeStats : codeforcesStats;
  const hasResult = Boolean(currentStats);

  return (
    <div className="min-h-screen bg-[#07090f] relative overflow-hidden">
      {!hasResult && (
        <>
          <div className="pointer-events-none absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-amber-500/10 rounded-full blur-[120px]" />
          <div className="pointer-events-none absolute top-40 -right-32 w-[28rem] h-[28rem] bg-indigo-500/15 rounded-full blur-[120px]" />
        </>
      )}

      <div className="relative">
        <Navbar />

        {!hasResult ? (
          <div className="max-w-6xl mx-auto px-6 py-14">
            <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 items-start">
              {/* ───────────────────── Left: Description ───────────────────── */}
              <div className="lg:sticky lg:top-24">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
                  <Code2 size={13} className="text-amber-400" />
                  <span className="text-amber-300 text-xs font-semibold tracking-wide">
                    DSA Insights
                  </span>
                </div>

                <h1 className="text-4xl sm:text-[2.6rem] font-extrabold text-white leading-[1.12] tracking-tight">
                  Your problem-solving
                  <br />
                  record,{" "}
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-300 bg-clip-text text-transparent">
                    one search away.
                  </span>
                </h1>

                <p className="text-slate-400 text-base mt-5 leading-relaxed max-w-md">
                  Pull your live rating, rank, and difficulty breakdown from
                  LeetCode or Codeforces — no manual counting.
                </p>

                {/* Live-preview mockup */}
                <div className="mt-9 bg-[#12141a] border border-[#22262f] rounded-2xl p-5 max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Codeforces
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">
                      Expert
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-white">1874</span>
                    <span className="text-sm text-slate-500">rating</span>
                  </div>
                  <div className="space-y-2.5">
                    <DifficultyBar label="Easy" value={420} total={600} colorClass="bg-emerald-500" />
                    <DifficultyBar label="Medium" value={140} total={600} colorClass="bg-amber-500" />
                    <DifficultyBar label="Hard" value={40} total={600} colorClass="bg-rose-500" />
                  </div>
                </div>

                {/* Feature tiles */}
                <div className="mt-9 space-y-4">
                  {FEATURES.map(({ icon: Icon, color, title, desc }) => {
                    const c = COLOR_MAP[color];
                    return (
                      <div key={title} className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}
                        >
                          <Icon size={17} className={c.text} />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{title}</p>
                          <p className="text-slate-500 text-sm mt-0.5 leading-relaxed max-w-sm">
                            {desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ───────────────────── Right: Form ───────────────────── */}
              <div>
                <div className="p-[1px] rounded-3xl bg-gradient-to-br from-amber-500/40 via-indigo-500/15 to-transparent">
                  <div className="bg-[#0a0c11] rounded-3xl p-7 sm:p-8">
                    <h2 className="text-white font-bold text-xl">
                      Fetch your stats
                    </h2>
                    <p className="text-slate-500 text-sm mt-1.5 mb-7">
                      Pick a platform and enter your username or handle.
                    </p>

                    <div className="mb-6">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
                        Platform
                      </label>
                      <div className="flex gap-2 bg-[#12141a] border border-[#22262f] rounded-xl p-1 w-fit">
                        {PLATFORMS.map((p) => (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => switchPlatform(p.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                              platform === p.key
                                ? "bg-amber-500 text-white"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleFetch}>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
                        {PLATFORMS.find((p) => p.key === platform).label} Username
                      </label>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={PLATFORMS.find((p) => p.key === platform).placeholder}
                        className="w-full bg-[#12141a] border border-[#22262f] rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      />

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-7 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-amber-500 to-indigo-500 hover:from-amber-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-full transition-all"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Fetching...
                          </>
                        ) : (
                          <>
                            <Search size={16} />
                            Fetch Stats
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center">
                  <Code2 size={20} className="text-amber-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">DSA Insights</h1>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLeetcodeStats(null);
                  setCodeforcesStats(null);
                  setInput("");
                }}
                className="text-xs font-semibold text-slate-500 hover:text-amber-400 transition-colors"
              >
                ← Search another
              </button>
            </div>

            {/* LeetCode result */}
            {platform === "leetcode" && currentStats && (
              <div className="bg-[#171a2c] border border-[#2e3150] rounded-2xl p-6 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {currentStats.realName || currentStats.username}
                    </p>
                    <p className="text-sm text-slate-500">@{currentStats.username}</p>
                  </div>
                  <div className="flex gap-6 text-right">
                    <div>
                      <div className="flex items-center gap-1.5 justify-end text-slate-400 text-xs mb-1">
                        <Trophy size={13} /> Rank
                      </div>
                      <p className="font-semibold text-white">
                        {currentStats.ranking ? `#${currentStats.ranking.toLocaleString()}` : "—"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 justify-end text-slate-400 text-xs mb-1">
                        <Star size={13} /> Reputation
                      </div>
                      <p className="font-semibold text-white">{currentStats.reputation ?? "—"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-white">{currentStats.solved.total}</span>
                    <span className="text-sm text-slate-500">problems solved</span>
                  </div>

                  <div className="space-y-4">
                    <DifficultyBar label="Easy" value={currentStats.solved.easy} total={currentStats.solved.total} colorClass="bg-emerald-500" />
                    <DifficultyBar label="Medium" value={currentStats.solved.medium} total={currentStats.solved.total} colorClass="bg-amber-500" />
                    <DifficultyBar label="Hard" value={currentStats.solved.hard} total={currentStats.solved.total} colorClass="bg-rose-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Codeforces result */}
            {platform === "codeforces" && currentStats && (
              <div className="bg-[#171a2c] border border-[#2e3150] rounded-2xl p-6 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">@{currentStats.handle}</p>
                    <p className="text-sm text-slate-500 capitalize">{currentStats.rank || "Unrated"}</p>
                  </div>
                  <div className="flex gap-6 text-right">
                    <div>
                      <div className="flex items-center gap-1.5 justify-end text-slate-400 text-xs mb-1">
                        <Trophy size={13} /> Rating
                      </div>
                      <p className="font-semibold text-white">{currentStats.rating ?? "Unrated"}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 justify-end text-slate-400 text-xs mb-1">
                        <Star size={13} /> Max Rating
                      </div>
                      <p className="font-semibold text-white">{currentStats.maxRating ?? "—"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-white">{currentStats.solved.total}</span>
                    <span className="text-sm text-slate-500">problems solved</span>
                  </div>

                  <div className="space-y-4">
                    <DifficultyBar label="Easy (< 1200)" value={currentStats.solved.easy} total={currentStats.solved.total} colorClass="bg-emerald-500" />
                    <DifficultyBar label="Medium (1200-1799)" value={currentStats.solved.medium} total={currentStats.solved.total} colorClass="bg-amber-500" />
                    <DifficultyBar label="Hard (1800+)" value={currentStats.solved.hard} total={currentStats.solved.total} colorClass="bg-rose-500" />
                    {currentStats.solved.unrated > 0 && (
                      <DifficultyBar label="Unrated" value={currentStats.solved.unrated} total={currentStats.solved.total} colorClass="bg-slate-500" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DsaInsights;
