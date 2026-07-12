import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import {
  FileText,
  Cpu,
  ClipboardCheck,
  Gauge,
  Sparkles,
  SearchX,
  Target,
  Briefcase,
  Mic,
  Download,
  FolderOpen,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Cpu,
    color: "indigo",
    title: "AI Resume Analysis",
    desc: "Strict, domain-aware analysis powered by AI — works across Software, Finance, Medical, Marketing, and every other professional field.",
  },
  {
    icon: ClipboardCheck,
    color: "teal",
    title: "ATS Resume Scanner",
    desc: "Brutal, FAANG-level ATS evaluation with a hire verdict, category breakdown, and line-by-line rewrite suggestions.",
  },
  {
    icon: Gauge,
    color: "violet",
    title: "6-Dimension Resume Score",
    desc: "Scored on Impact, Domain Depth, Structure, Completeness, Keywords, and Career Narrative — not just a single vague number.",
  },
  {
    icon: Sparkles,
    color: "amber",
    title: "Smart Suggestions",
    desc: "5 specific, actionable rewrite suggestions tied to real lines in your resume — no generic advice.",
  },
  {
    icon: SearchX,
    color: "red",
    title: "Missing Skills Detection",
    desc: "Surfaces 6-8 high-demand skills you're missing for your target domain, so you know exactly what to add.",
  },
  {
    icon: Target,
    color: "emerald",
    title: "Career Roadmap & Recommendations",
    desc: "Get your best-fit role, recommended alternative roles, and a step-by-step roadmap to level up.",
  },
  {
    icon: Briefcase,
    color: "orange",
    title: "Job Description Match",
    desc: "Paste any job description and instantly see your match score, matched skills, and gaps to close.",
  },
  {
    icon: Mic,
    color: "pink",
    title: "AI Mock Interview",
    desc: "Practice with an AI interviewer tailored to your resume, then get a full performance report afterward.",
  },
  {
    icon: Download,
    color: "sky",
    title: "PDF Report Export",
    desc: "Download a clean, professional PDF report of your full analysis to keep or share.",
  },
  {
    icon: FolderOpen,
    color: "indigo",
    title: "Multi-Resume Management",
    desc: "Upload, view, and manage multiple resumes in PDF or DOCX format from one dashboard.",
  },
  {
    icon: ShieldCheck,
    color: "teal",
    title: "Secure Authentication",
    desc: "JWT-based login and registration keep your resumes and analysis history private to you.",
  },
  {
    icon: FileText,
    color: "violet",
    title: "PDF & DOCX Support",
    desc: "Upload resumes in either format — text extraction handles both seamlessly.",
  },
];

const colorClasses = {
  indigo: { bg: "bg-indigo-950", border: "border-indigo-800", text: "text-indigo-400" },
  teal: { bg: "bg-teal-950", border: "border-teal-800", text: "text-teal-400" },
  violet: { bg: "bg-violet-950", border: "border-violet-800", text: "text-violet-400" },
  amber: { bg: "bg-amber-950", border: "border-amber-800", text: "text-amber-400" },
  red: { bg: "bg-red-950", border: "border-red-800", text: "text-red-400" },
  emerald: { bg: "bg-emerald-950", border: "border-emerald-800", text: "text-emerald-400" },
  orange: { bg: "bg-orange-950", border: "border-orange-800", text: "text-orange-400" },
  pink: { bg: "bg-pink-950", border: "border-pink-800", text: "text-pink-400" },
  sky: { bg: "bg-sky-950", border: "border-sky-800", text: "text-sky-400" },
};

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      {/* Top bar */}
      <nav className="px-6 h-16 flex items-center justify-between border-b border-[#1e2233] max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            AlgoVerse
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-slate-300 hover:text-white text-sm font-semibold transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#11151d] border border-[#232838] rounded-full mb-6">
          <Sparkles size={13} className="text-indigo-400" />
          <span className="text-slate-400 text-xs font-medium">
            Your AI-Powered Placement Platform
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Everything You Need <br /> To Get Placed
        </h1>
        <p className="text-slate-400 text-lg mt-6 max-w-xl mx-auto">
          Resume intelligence, ATS scoring, coding profile analysis, and mock
          interviews — one platform that tracks your placement readiness end
          to end.
        </p>

        <div className="flex items-center justify-center gap-3 mt-9">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
            <ArrowRight size={16} />
          </Link>
          <Link
            to={user ? "/ats-checker" : "/login"}
            className="px-6 py-3.5 bg-[#11151d] border border-[#232838] hover:border-indigo-500/50 text-slate-200 text-sm font-bold rounded-xl transition-all"
          >
            Try ATS Checker
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-white">
            Everything Packed Into One Platform
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Every feature below is live and working — not a roadmap.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const c = colorClasses[f.color];
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-[#11151d] border border-[#232838] rounded-2xl p-6 hover:border-indigo-500/40 transition-all"
              >
                <div
                  className={`w-11 h-11 ${c.bg} border ${c.border} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon size={20} className={c.text} />
                </div>
                <h3 className="text-white font-bold text-base mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-[#1e2233]">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">
            Ready to check your placement readiness?
          </h2>
          <p className="text-slate-400 text-sm mb-7">
            It takes less than a minute to upload and get your first report.
          </p>
          <Link
            to={user ? "/dashboard" : "/register"}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all"
          >
            {user ? "Go to Dashboard" : "Get Started — It's Free"}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Landing;