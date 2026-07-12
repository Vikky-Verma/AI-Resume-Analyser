import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { Code2, Search, Trophy, Star, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

const DsaInsights = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setStats(null);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE}/dsa/leetcode/${encodeURIComponent(username.trim())}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStats(res.data.data);
    } catch (err) {
      const message =
        err.response?.status === 404
          ? "LeetCode user not found. Check the username and try again."
          : "Couldn't fetch stats right now. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
        <p className="text-slate-400 mb-8">
          Enter your LeetCode username to see your solved-problem breakdown.
        </p>

        <form onSubmit={handleFetch} className="flex gap-3 mb-10">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="LeetCode username"
            className="flex-1 bg-[#171a2c] border border-[#2e3150] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            Fetch
          </button>
        </form>

        {stats && (
          <div className="bg-[#171a2c] border border-[#2e3150] rounded-2xl p-6 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-white">
                  {stats.realName || stats.username}
                </p>
                <p className="text-sm text-slate-500">@{stats.username}</p>
              </div>
              <div className="flex gap-6 text-right">
                <div>
                  <div className="flex items-center gap-1.5 justify-end text-slate-400 text-xs mb-1">
                    <Trophy size={13} /> Rank
                  </div>
                  <p className="font-semibold text-white">
                    {stats.ranking ? `#${stats.ranking.toLocaleString()}` : "—"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 justify-end text-slate-400 text-xs mb-1">
                    <Star size={13} /> Reputation
                  </div>
                  <p className="font-semibold text-white">
                    {stats.reputation ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-white">
                  {stats.solved.total}
                </span>
                <span className="text-sm text-slate-500">problems solved</span>
              </div>

              <div className="space-y-4">
                <DifficultyBar
                  label="Easy"
                  value={stats.solved.easy}
                  total={stats.solved.total}
                  colorClass="bg-emerald-500"
                />
                <DifficultyBar
                  label="Medium"
                  value={stats.solved.medium}
                  total={stats.solved.total}
                  colorClass="bg-amber-500"
                />
                <DifficultyBar
                  label="Hard"
                  value={stats.solved.hard}
                  total={stats.solved.total}
                  colorClass="bg-rose-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DsaInsights;
