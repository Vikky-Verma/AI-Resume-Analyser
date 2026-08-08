import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import PublicNavbar from "../components/PublicNavbar";
import ParticleField from "../components/animations/ParticleField";
import TypewriterText from "../components/animations/TypewriterText";
import AnimatedCounter from "../components/animations/AnimatedCounter";
import TiltCard from "../components/effects/TiltCard";
import GradientBorder from "../components/effects/GradientBorder";
import MagneticButton from "../components/effects/MagneticButton";
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
  Users,
  Eye,
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

const STATS = [
  { value: 100, suffix: "+", label: "Resumes Analyzed" },
  { value: 95, suffix: "%", label: "ATS Pass Rate" },
  { value: 6, suffix: "", label: "Score Dimensions" },
  { value: 24, suffix: "/7", label: "AI Availability" },
];

const TAGLINES = [
  "Software Engineer.",
  "Data Analyst.",
  "Product Manager.",
  "Finance Associate.",
  "Marketing Lead.",
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
  const [platformStats, setPlatformStats] = useState({ users: 0, visits: 0 });

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

    fetch(`${apiBase}/api/stats/public`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPlatformStats({ users: data.users ?? 0, visits: data.visits ?? 0 });
        }
      })
      .catch((err) => console.error("Failed to load platform stats:", err));
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Background is the global CosmicBackground mounted in App.jsx — this
          page intentionally stays transparent so it shows through. */}

      {/* Top bar */}
      <PublicNavbar />

      {/* Hero */}
      <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* Floating gradient blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-[26rem] h-[26rem] bg-indigo-600/20 rounded-full blur-[110px] animate-float-blob" />
        <div className="pointer-events-none absolute -top-10 -right-24 w-[24rem] h-[24rem] bg-violet-600/15 rounded-full blur-[110px] animate-float-blob-slow" />
        <div className="pointer-events-none absolute top-40 left-1/3 w-[20rem] h-[20rem] bg-teal-500/10 rounded-full blur-[100px] animate-float-blob" />

        {/* Subtle particle network behind the hero text */}
        <ParticleField count={42} linkDistance={120} className="opacity-70" />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative inline-flex items-center gap-2 px-3 py-1.5 bg-[#11151d]/80 backdrop-blur border border-[#232838] rounded-full mb-6"
        >
          <Sparkles size={13} className="text-indigo-400" />
          <span className="text-slate-400 text-xs font-medium">
            Your AI-Powered Placement Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="relative text-5xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight"
        >
          Get Placed As A <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-teal-300 bg-clip-text text-transparent">
            <TypewriterText words={TAGLINES} />
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="relative text-slate-400 text-lg mt-6 max-w-xl mx-auto"
        >
          Resume intelligence, ATS scoring, coding profile analysis, and mock
          interviews — one platform that tracks your placement readiness end
          to end.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="relative flex items-center justify-center gap-3 mt-9"
        >
          <MagneticButton
            as={Link}
            to={user ? "/home" : "/register"}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-[0_0_0_rgba(99,102,241,0)] hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] transition-[background-color,box-shadow]"
          >
            {user ? "Go to Dashboard" : "Get Started Free"}
            <ArrowRight size={16} />
          </MagneticButton>
          <MagneticButton
            as={Link}
            to={user ? "/ats-checker" : "/login"}
            className="px-6 py-3.5 bg-[#11151d]/80 backdrop-blur border border-[#232838] hover:border-indigo-500/50 text-slate-200 text-sm font-bold rounded-xl transition-colors"
          >
            Try ATS Checker
          </MagneticButton>
        </motion.div>

        {/* Animated stat counters */}
        <GradientBorder
          className="relative mt-16 max-w-2xl mx-auto"
          borderRadius="1.5rem"
          duration={9}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 rounded-[1.5rem] bg-[#0d111a]/70 backdrop-blur-xl px-6 py-7">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-extrabold text-white">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-slate-500 text-xs mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </GradientBorder>
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
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08, ease: "easeOut" }}
              >
                <TiltCard
                  maxTilt={7}
                  className="group h-full rounded-2xl bg-[#11151d]/80 backdrop-blur-xl border border-[#232838] hover:border-indigo-500/40 p-6 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] hover:shadow-[0_18px_40px_-18px_rgba(99,102,241,0.35)] transition-[border-color,box-shadow] duration-300"
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
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-[#1e2233]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-6 py-16 text-center"
        >
          <h2 className="text-2xl font-extrabold text-white mb-3">
            Ready to check your placement readiness?
          </h2>
          <p className="text-slate-400 text-sm mb-7">
            It takes less than a minute to upload and get your first report.
          </p>
          <MagneticButton
            as={Link}
            to={user ? "/home" : "/register"}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-[0_0_0_rgba(99,102,241,0)] hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] transition-[background-color,box-shadow]"
          >
            {user ? "Go to Dashboard" : "Get Started — It's Free"}
            <ArrowRight size={16} />
          </MagneticButton>
        </motion.div>
      </div>

      {/* Platform stats */}
      <div className="border-t border-[#1e2233]">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            <div className="rounded-2xl bg-[#11151d]/80 backdrop-blur-xl border border-[#232838] px-6 py-7 text-center">
              <Users size={20} className="text-indigo-400 mx-auto mb-2" />
              <p className="text-3xl sm:text-4xl font-extrabold text-white">
                <AnimatedCounter value={platformStats.users} suffix="+" />
              </p>
              <p className="text-slate-500 text-xs mt-1 font-medium">Active Users</p>
            </div>
            <div className="rounded-2xl bg-[#11151d]/80 backdrop-blur-xl border border-[#232838] px-6 py-7 text-center">
              <Eye size={20} className="text-indigo-400 mx-auto mb-2" />
              <p className="text-3xl sm:text-4xl font-extrabold text-white">
                <AnimatedCounter value={platformStats.visits} suffix="+" />
              </p>
              <p className="text-slate-500 text-xs mt-1 font-medium">Site Visits</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Landing;