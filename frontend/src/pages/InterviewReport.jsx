import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import ScoreCard from "../components/ScoreCard";
import toast from "react-hot-toast";
import {
  Loader2,
  ChevronDown,
  Users,
  Cpu,
  Code2,
  RotateCcw,
  LayoutDashboard,
  Award,
} from "lucide-react";

const ROUND_ICONS = { HR: Users, TECHNICAL: Cpu, DSA: Code2 };

const VERDICT_STYLE = {
  "Strong Hire": { bg: "bg-emerald-950", border: "border-emerald-800", text: "text-emerald-400" },
  Hire: { bg: "bg-teal-950", border: "border-teal-800", text: "text-teal-400" },
  "Leaning No Hire": { bg: "bg-amber-950", border: "border-amber-800", text: "text-amber-400" },
  "No Hire": { bg: "bg-red-950", border: "border-red-800", text: "text-red-400" },
};

const scoreColor = (score) => {
  if (score >= 7) return "text-emerald-400";
  if (score >= 4) return "text-amber-400";
  return "text-red-400";
};

const InterviewReport = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openRound, setOpenRound] = useState(0);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data } = await API.get(`/interview/${interviewId}`);
        setInterview(data.interview);
      } catch {
        toast.error("Failed to load report");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  if (loading || !interview) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <Loader2 size={32} className="text-violet-400 animate-spin" />
      </div>
    );
  }

  const verdictStyle = VERDICT_STYLE[interview.verdict] || VERDICT_STYLE["Hire"];

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Interview Report</h1>
            <p className="text-slate-400 text-sm mt-1">
              {interview.role} @ {interview.company} — {interview.level}
            </p>
          </div>
          {interview.verdict && (
            <span
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${verdictStyle.bg} ${verdictStyle.border} ${verdictStyle.text}`}
            >
              <Award size={15} /> {interview.verdict}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <ScoreCard label="Overall Score" score={interview.overallScore ?? 0} color="#8b5cf6" />
          {interview.rounds.map((round) => (
            <ScoreCard
              key={round.type}
              label={round.label}
              score={round.score ?? 0}
              max={10}
              color={round.type === "HR" ? "#10b981" : round.type === "TECHNICAL" ? "#6366f1" : "#f59e0b"}
            />
          ))}
        </div>

        {interview.overallFeedback && (
          <div className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl p-6 mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Panel Feedback
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">{interview.overallFeedback}</p>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {interview.rounds.map((round, ri) => {
            const Icon = ROUND_ICONS[round.type] || Users;
            const isOpen = openRound === ri;
            return (
              <div
                key={round.type}
                className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenRound(isOpen ? -1 : ri)}
                  className="w-full flex items-center justify-between px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#242840] rounded-lg flex items-center justify-center">
                      <Icon size={15} className="text-violet-400" />
                    </div>
                    <span className="text-white font-bold text-sm">{round.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-sm ${scoreColor(round.score || 0)}`}>
                      {round.score ?? "—"}/10
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 space-y-4 border-t border-[#2e3150] pt-4">
                    {round.questions.map((q, qi) => (
                      <div key={qi} className="bg-[#242840] rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-white text-sm font-semibold">
                            Q{qi + 1}. {q.question}
                          </p>
                          <span
                            className={`shrink-0 text-xs font-bold ${scoreColor(q.score || 0)}`}
                          >
                            {q.score ?? "—"}/10
                          </span>
                        </div>
                        {q.answer && (
                          <p className="text-slate-400 text-xs mb-2 whitespace-pre-wrap">
                            <span className="text-slate-500 font-semibold">Your answer: </span>
                            {q.answer}
                          </p>
                        )}
                        {q.feedback && (
                          <p className="text-slate-300 text-xs leading-relaxed border-t border-[#2e3150] pt-2 mt-2">
                            {q.feedback}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/interview/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold rounded-xl transition-all"
          >
            <RotateCcw size={15} /> New Mock Interview
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1d2e] border border-[#2e3150] hover:border-violet-500/50 text-slate-300 text-sm font-semibold rounded-xl transition-all"
          >
            <LayoutDashboard size={15} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewReport;