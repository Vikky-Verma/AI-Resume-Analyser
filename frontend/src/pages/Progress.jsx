import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import {
  Trophy,
  Flame,
  FileText,
  Mic,
  Code2,
  Briefcase,
  Lock,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const MODULE_CARDS = [
  { key: "resumes", label: "Resumes Analyzed", icon: FileText, color: "indigo" },
  { key: "mockInterviews", label: "Mock Interviews Completed", icon: Mic, color: "amber" },
  { key: "dsaSolved", label: "DSA Questions Solved", icon: Code2, color: "emerald" },
  { key: "applications", label: "Applications Tracked", icon: Briefcase, color: "rose" },
];

const COLOR_CLASSES = {
  indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
};

const WeeklyBar = ({ day, maxCount }) => {
  const heightPct = maxCount > 0 ? Math.max((day.count / maxCount) * 100, day.count > 0 ? 12 : 4) : 4;
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="w-full h-24 flex items-end">
        <div
          className={`w-full rounded-t-md transition-all ${
            day.count > 0 ? "bg-indigo-500" : "bg-[#242840]"
          }`}
          style={{ height: `${heightPct}%` }}
          title={`${day.count} activities`}
        />
      </div>
      <span className="text-[11px] text-slate-500">{day.label}</span>
    </div>
  );
};

const AchievementCard = ({ achievement }) => (
  <div
    className={`flex items-start gap-3 rounded-2xl border p-4 ${
      achievement.unlocked
        ? "bg-[#171a2c] border-emerald-500/30"
        : "bg-[#12141a] border-[#22262f] opacity-60"
    }`}
  >
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        achievement.unlocked
          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
          : "bg-[#20243b] border border-[#2e3150] text-slate-500"
      }`}
    >
      {achievement.unlocked ? <CheckCircle2 size={18} /> : <Lock size={16} />}
    </div>
    <div>
      <p className="text-sm font-semibold text-white">{achievement.title}</p>
      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
        {achievement.description}
      </p>
    </div>
  </div>
);

const Progress = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await API.get("/progress/summary");
        setData(res.data.data);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Couldn't load your progress."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const maxWeeklyCount = data
    ? Math.max(...data.weeklyActivity.map((d) => d.count), 1)
    : 1;

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed -top-40 -left-40 w-[32rem] h-[32rem] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none fixed top-40 -right-32 w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-[120px]" />

      <div className="relative">

        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-5">
            <Trophy size={13} className="text-indigo-400" />
            <span className="text-indigo-300 text-xs font-semibold tracking-wide">
              Progress
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Your prep activity,{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-amber-300 bg-clip-text text-transparent">
              in one place.
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-3 max-w-2xl leading-relaxed">
            Streaks, achievements, and momentum across every module.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={24} className="text-indigo-400 animate-spin" />
            </div>
          ) : !data ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-slate-400 text-sm">
                Couldn't load your progress. Try refreshing.
              </p>
            </div>
          ) : (
            <>
              {/* Streak + weekly activity */}
              <div className="mt-8 grid md:grid-cols-3 gap-4">
                <div className="bg-[#171a2c] border border-[#2e3150] rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mb-3">
                    <Flame size={22} className="text-orange-400" />
                  </div>
                  <p className="text-3xl font-extrabold text-white">
                    {data.streak.current}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Day streak {data.streak.current > 0 ? "🔥" : ""}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-2">
                    Longest: {data.streak.longest} days
                  </p>
                </div>

                <div className="md:col-span-2 bg-[#171a2c] border border-[#2e3150] rounded-2xl p-6">
                  <p className="text-sm font-semibold text-slate-300 mb-4">
                    Last 7 days
                  </p>
                  <div className="flex gap-2">
                    {data.weeklyActivity.map((day) => (
                      <WeeklyBar key={day.date} day={day} maxCount={maxWeeklyCount} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Module breakdown */}
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MODULE_CARDS.map(({ key, label, icon: Icon, color }) => (
                  <div
                    key={key}
                    className="bg-[#171a2c] border border-[#2e3150] rounded-2xl p-5"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${COLOR_CLASSES[color]}`}
                    >
                      <Icon size={17} />
                    </div>
                    <p className="text-2xl font-extrabold text-white">
                      {data.modules[key]}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              <div className="mt-8">
                <p className="text-sm font-semibold text-slate-300 mb-4">
                  Achievements
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {data.achievements.map((a) => (
                    <AchievementCard key={a.id} achievement={a} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
