import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { Code2, Search, Trophy, Star, Loader2 } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-[#0f1120] text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center">
            <Code2 size={20} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold">DSA Insights</h1>
        </div>
        <p className="text-slate-400 mb-6">
          See your problem-solving breakdown across platforms.
        </p>

        {/* Platform tabs */}
        <div className="flex gap-2 mb-6 bg-[#171a2c] border border-[#2e3150] rounded-lg p-1 w-fit">
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              onClick={() => switchPlatform(p.key)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                platform === p.key
                  ? "bg-indigo-500 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleFetch} className="flex gap-3 mb-10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLATFORMS.find((p) => p.key === platform).placeholder}
            className="flex-1 bg-[#171a2c] border border-[#2e3150] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Fetch
          </button>
        </form>

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
    </div>
  );
};

export default DsaInsights;