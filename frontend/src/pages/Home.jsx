import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import StreakCalendar from "../components/StreakCalendar";
import { useAuth } from "../context/AuthContext";
import TiltCard from "../components/effects/TiltCard";
import MagneticButton from "../components/effects/MagneticButton";
import {
  Flame,
  Mic,
  Building2,
  Users,
  FileText,
  ArrowRight,
  Loader2,
  Megaphone,
} from "lucide-react";

// Static product bulletin — swap for a real /updates endpoint later.
const UPDATES = [
  {
    tag: "Loop change",
    color: "rose",
    title: "A major fintech firm dropped its take-home round",
    body: "Candidates now go straight from screen to a 3-round onsite loop — one system design, two coding rounds.",
    time: "2 hours ago",
  },
  {
    tag: "Question bank",
    color: "emerald",
    title: "42 new questions added across Company Prep",
    body: "Sourced from recent candidate reports, tagged by round and difficulty.",
    time: "Yesterday",
  },
  {
    tag: "Feature",
    color: "indigo",
    title: "Voice mode is live in Mock Interview sessions",
    body: "Practice answering out loud — sessions now score pacing and filler words too.",
    time: "4 days ago",
  },
];

const UPDATE_COLOR = {
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
};

const QUICK_LINKS = [
  {
    to: "/interview",
    icon: Mic,
    color: "amber",
    title: "Mock Interview",
    desc: "Sit a timed AI-led interview and get scored feedback.",
  },
  {
    to: "/company-prep",
    icon: Building2,
    color: "indigo",
    title: "Company Prep",
    desc: "Solve questions tagged by company and interview round.",
  },
  {
    to: "/community",
    icon: Users,
    color: "emerald",
    title: "Community",
    desc: "Message mentors and peers prepping for the same roles.",
  },
  {
    to: "/dashboard",
    icon: FileText,
    color: "violet",
    title: "Resume Analysis",
    desc: "Upload a resume for a full AI-scored breakdown.",
  },
];

const QUICK_COLOR = {
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
};

const Home = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await API.get("/progress/summary");
        setData(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Couldn't load your dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const firstName = (user?.name || "there").split(" ")[0];

  return (
    <div className="min-h-screen relative">
      <div className="relative">

        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
                Welcome back, {firstName}.
              </h1>
              <p className="text-slate-400 text-sm mt-2">
                Here's where your prep stands today.
              </p>
            </div>
            {!loading && data && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
                <Flame size={16} className="text-orange-400" />
                <span className="text-orange-300 text-sm font-semibold">
                  {data.streak.current} day{data.streak.current === 1 ? "" : "s"} streak
                </span>
              </div>
            )}
          </div>

          {/* Quick launch */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {QUICK_LINKS.map(({ to, icon: Icon, color, title, desc }) => (
              <MagneticButton
                as={Link}
                key={to}
                to={to}
                strength={8}
                className="group bg-[#171a2c]/80 backdrop-blur-xl border border-[#2e3150] hover:border-indigo-500/40 rounded-2xl p-5 transition-colors block text-left"
              >
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${QUICK_COLOR[color]}`}
                >
                  <Icon size={17} />
                </div>
                <p className="text-white font-bold text-sm mb-1 flex items-center gap-1">
                  {title}
                  <ArrowRight
                    size={13}
                    className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all"
                  />
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </MagneticButton>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Bulletin */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Megaphone size={15} className="text-indigo-400" />
                <p className="text-sm font-semibold text-slate-300">Bulletin</p>
              </div>
              <div className="flex flex-col gap-3">
                {UPDATES.map((u, i) => (
                  <TiltCard
                    key={i}
                    maxTilt={4}
                    className="bg-[#171a2c]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl p-4"
                  >
                    <span
                      className={`inline-block text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border mb-2 ${UPDATE_COLOR[u.color]}`}
                    >
                      {u.tag}
                    </span>
                    <p className="text-sm font-semibold text-white leading-snug">
                      {u.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {u.body}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-2">{u.time}</p>
                  </TiltCard>
                ))}
              </div>
            </div>

            {/* Training log / streak calendar */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <Flame size={15} className="text-orange-400" />
                <p className="text-sm font-semibold text-slate-300">Training log</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24 bg-[#171a2c]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl">
                  <Loader2 size={22} className="text-indigo-400 animate-spin" />
                </div>
              ) : !data ? (
                <div className="flex items-center justify-center py-24 bg-[#171a2c]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl">
                  <p className="text-slate-400 text-sm">Couldn't load your streak.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <TiltCard maxTilt={4} className="bg-[#171a2c]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl p-4">
                      <p className="text-[11px] text-slate-500 mb-1">Current streak</p>
                      <p className="text-2xl font-extrabold text-white">
                        {data.streak.current}
                      </p>
                    </TiltCard>
                    <TiltCard maxTilt={4} className="bg-[#171a2c]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl p-4">
                      <p className="text-[11px] text-slate-500 mb-1">Longest streak</p>
                      <p className="text-2xl font-extrabold text-white">
                        {data.streak.longest}
                      </p>
                    </TiltCard>
                    <TiltCard maxTilt={4} className="bg-[#171a2c]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl p-4">
                      <p className="text-[11px] text-slate-500 mb-1">Active days</p>
                      <p className="text-2xl font-extrabold text-white">
                        {data.totalActivityDays}
                      </p>
                    </TiltCard>
                  </div>
                  <div className="bg-[#171a2c]/80 backdrop-blur-xl border border-[#2e3150] rounded-2xl p-5">
                    <StreakCalendar calendarActivity={data.calendarActivity} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;