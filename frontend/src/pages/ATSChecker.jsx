import { useState, useEffect } from "react";
import API from "../api/axios";
import SkillBadge from "../components/SkillBadge";
import CircularGauge from "../components/CircularGauge";
import AnimatedBar from "../components/animations/AnimatedBar";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import TiltCard from "../components/effects/TiltCard";
import GradientBorder from "../components/effects/GradientBorder";
import MagneticButton from "../components/effects/MagneticButton";
import {
  ClipboardCheck,
  CloudUpload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Sparkles,
  Target,
  ChevronRight,
  Briefcase,
  ClipboardList,
  Gauge,
  FileText,
  X,
  ArrowRight,
} from "lucide-react";

const EXPERIENCE_LEVELS = [
  "Fresher",
  "Junior",
  "Mid-Level",
  "Senior",
  "Expert",
];

const FEATURES = [
  {
    icon: Gauge,
    color: "teal",
    title: "A real ATS score",
    desc: "See exactly how applicant tracking systems will parse and rank your resume.",
  },
  {
    icon: KeyRound,
    color: "indigo",
    title: "Missing keywords surfaced",
    desc: "We flag the exact terms recruiters and bots are scanning for that you're missing.",
  },
  {
    icon: ClipboardList,
    color: "amber",
    title: "Line-by-line rewrites",
    desc: "Weak bullet points get rewritten for you, not just flagged.",
  },
];

const COLOR_MAP = {
  teal: { bg: "bg-teal-500/10", border: "border-teal-500/20", text: "text-teal-400" },
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
};

const MAX_FILE_MB = 5;

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const verdictColor = (verdict = "") => {
  const v = verdict.toUpperCase();
  if (v.includes("STRONG HIRE")) return "#2dd4bf";
  if (v.includes("NO HIRE")) return "#f87171";
  if (v.includes("LEAN")) return "#facc15";
  return "#4ade80"; // HIRE
};

const scoreColor = (score) => {
  if (score >= 8) return "#4ade80";
  if (score >= 5) return "#facc15";
  return "#f87171";
};

const toArr = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    return JSON.parse(val);
  } catch {
    return String(val)
      .split(",")
      .map((s) => s.trim());
  }
};

const Panel = ({ title, icon, children, tone = "default" }) => {
  const toneClasses =
    tone === "danger"
      ? "bg-red-950/30 backdrop-blur-xl border-red-900/50"
      : "bg-[#11151d]/80 backdrop-blur-xl border-[#232838]";
  const titleClasses = tone === "danger" ? "text-red-400" : "text-white";

  return (
    <div className={`border rounded-2xl p-6 ${toneClasses}`}>
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className={`font-bold text-sm ${titleClasses}`}>{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
};

const ATSChecker = () => {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState("Fresher");

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // ── Existing-resume picker (avoids duplicate uploads across sections) ──
  const [existingResumes, setExistingResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [useExisting, setUseExisting] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState(null);

  // Job Description Match (folded in from the old Resume Analysis page)
  const [jobDesc, setJobDesc] = useState("");
  const [jobMatch, setJobMatch] = useState(null);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const { data } = await API.get("/resume/my-resumes");
        const resumes = data.resumes || [];
        setExistingResumes(resumes);
        if (resumes.length > 0) {
          setSelectedResumeId(resumes[0].id);
          setUseExisting(true);
        } else {
          setUseExisting(false);
        }
      } catch {
        setUseExisting(false);
      } finally {
        setLoadingResumes(false);
      }
    };
    fetchResumes();
  }, []);

  const handleFileChange = (f) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!f || !allowedTypes.includes(f.type)) {
      toast.error("Please upload a PDF or DOCX file");
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_FILE_MB}MB`);
      return;
    }
    setFile(f);
  };

  const handleAnalyze = async () => {
    const usingExisting = useExisting && selectedResumeId;

    if (!usingExisting && !file) {
      toast.error("Please choose a resume file first");
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setJobMatch(null);

    try {
      let finalResumeId = selectedResumeId;

      if (!usingExisting) {
        const formData = new FormData();
        formData.append("resume", file);

        const { data: uploadData } = await API.post(
          "/resume/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        finalResumeId = uploadData.resume.id;
      }

      // Re-parse is cheap and guarantees extractedText is present either way
      await API.post(`/resume/parse/${finalResumeId}`);

      const { data } = await API.post(`/ats/${finalResumeId}`, {
        targetRole,
        experienceLevel,
      });

      if (!data.success) {
        toast.error(data.message || "Analysis failed");
        setAnalyzing(false);
        return;
      }

      setResumeId(finalResumeId);
      setResult(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "ATS check failed. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const runJobMatch = async () => {
    if (!jobDesc.trim()) {
      toast.error("Paste a job description first");
      return;
    }
    setMatching(true);
    try {
      const { data } = await API.post(`/career/match/${resumeId}`, {
        jobDescription: jobDesc,
      });
      setJobMatch(data);
      toast.success("Match analysis done!");
    } catch {
      toast.error("Job match failed");
    } finally {
      setMatching(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setResumeId(null);
    setJobDesc("");
    setJobMatch(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {!result && (
        <>
          <div className="pointer-events-none absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-teal-600/15 rounded-full blur-[120px]" />
          <div className="pointer-events-none absolute top-40 -right-32 w-[28rem] h-[28rem] bg-indigo-500/15 rounded-full blur-[120px]" />
        </>
      )}

      <div className="relative">

        {!result ? (
          <div className="max-w-6xl mx-auto px-6 py-14">
            <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 items-start">
              {/* ───────────────────── Left: Description ───────────────────── */}
              <div className="lg:sticky lg:top-24">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-full mb-6">
                  <ClipboardCheck size={13} className="text-teal-400" />
                  <span className="text-teal-300 text-xs font-semibold tracking-wide">
                    ATS Resume Scanner
                  </span>
                </div>

                <h1 className="text-4xl sm:text-[2.6rem] font-extrabold text-white leading-[1.12] tracking-tight">
                  The feedback recruiters
                  <br />
                  give{" "}
                  <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-300 bg-clip-text text-transparent">
                    everyone else.
                  </span>
                </h1>

                <p className="text-slate-400 text-base mt-5 leading-relaxed max-w-md">
                  Brutal, FAANG-level feedback on how your resume actually
                  scores — and exactly what to rewrite to fix it.
                </p>

                {/* Live-preview mockup */}
                <TiltCard maxTilt={5} className="mt-9 bg-[#12141a]/80 backdrop-blur-xl border border-[#22262f] rounded-2xl p-5 max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] text-slate-500 font-medium">
                      ATS Score
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-teal-400">
                      Hire
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-5">
                    <CircularGauge score={82} max={100} size={64} strokeWidth={6} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-red-950/40 border border-red-900/40 text-red-300 text-[10px] font-semibold rounded-full">
                          Docker
                        </span>
                        <span className="px-2 py-0.5 bg-red-950/40 border border-red-900/40 text-red-300 text-[10px] font-semibold rounded-full">
                          CI/CD
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1.5">Missing keywords</p>
                    </div>
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-3">
                    <p className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                      Rewrite Suggestion
                    </p>
                    <p className="text-emerald-200/80 text-xs leading-snug">
                      "Reduced API latency 40% by redesigning the caching
                      layer" — vs. "Worked on backend performance"
                    </p>
                  </div>
                </TiltCard>

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

                {/* Chips */}
                <div className="mt-9 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12141a]/70 backdrop-blur-sm border border-[#22262f] text-slate-300 text-xs font-semibold rounded-full">
                    <Target size={12} className="text-teal-400" />
                    Career Roadmap
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12141a]/70 backdrop-blur-sm border border-[#22262f] text-slate-300 text-xs font-semibold rounded-full">
                    <Briefcase size={12} className="text-teal-400" />
                    Job Description Match
                  </span>
                </div>
              </div>

              {/* ───────────────────── Right: Form ───────────────────── */}
              <div>
                <GradientBorder
                  borderRadius="1.5rem"
                  borderWidth={1}
                  colors="rgba(45,212,191,0.5), rgba(99,102,241,0.15), transparent, rgba(45,212,191,0.5)"
                  duration={8}
                >
                  <div className="bg-[#0a0c11]/90 backdrop-blur-xl rounded-3xl p-7 sm:p-8">
                    <h2 className="text-white font-bold text-xl">
                      Scan your resume
                    </h2>
                    <p className="text-slate-500 text-sm mt-1.5 mb-7">
                      PDF or DOCX — takes about 20 seconds.
                    </p>

                    {!loadingResumes && existingResumes.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
                          Use an uploaded resume
                        </label>
                        <div className="space-y-2">
                          {existingResumes.map((r) => (
                            <label
                              key={r.id}
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                useExisting && selectedResumeId === r.id
                                  ? "border-teal-500 bg-teal-950/20"
                                  : "border-[#22262f] bg-[#12141a]/70 backdrop-blur-sm"
                              }`}
                            >
                              <input
                                type="radio"
                                name="existing-resume"
                                checked={useExisting && selectedResumeId === r.id}
                                onChange={() => {
                                  setUseExisting(true);
                                  setSelectedResumeId(r.id);
                                  setFile(null);
                                }}
                                className="accent-teal-500"
                              />
                              <FileText size={14} className="text-teal-400 shrink-0" />
                              <span className="text-slate-200 text-sm truncate">
                                {r.originalName}
                              </span>
                            </label>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setUseExisting(false)}
                          className={`mt-2.5 text-xs font-semibold ${
                            !useExisting ? "text-teal-400" : "text-slate-500 hover:text-teal-400"
                          }`}
                        >
                          + Upload a new resume instead
                        </button>
                      </div>
                    )}

                    {(!useExisting || existingResumes.length === 0) && (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        handleFileChange(e.dataTransfer.files[0]);
                      }}
                      className={`rounded-2xl border transition-all ${
                        dragOver
                          ? "border-teal-500 bg-teal-950/20"
                          : "border-[#22262f] bg-[#12141a]/70 backdrop-blur-sm"
                      } ${file ? "p-4" : "p-10"}`}
                    >
                      <input
                        id="ats-file-input"
                        type="file"
                        accept=".pdf,.docx"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files[0])}
                      />

                      {file ? (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-teal-500/15 border border-teal-500/25 flex items-center justify-center shrink-0">
                              <FileText size={16} className="text-teal-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-semibold truncate">
                                {file.name}
                              </p>
                              <p className="text-slate-500 text-xs mt-0.5">
                                {formatBytes(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-[#1a1d24] rounded-full transition-all shrink-0"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center gap-4">
                          <div className="w-16 h-16 rounded-full border border-dashed border-teal-500/40 flex items-center justify-center">
                            <CloudUpload size={22} className="text-teal-400" />
                          </div>
                          <p className="text-slate-400 text-sm">
                            Drag &amp; drop your resume here
                          </p>
                          <label
                            htmlFor="ats-file-input"
                            className="px-5 py-2 bg-[#1a1d24] hover:bg-[#20242d] border border-[#2a2e38] text-slate-200 text-xs font-bold rounded-full cursor-pointer transition-all"
                          >
                            Browse Files
                          </label>
                          <p className="text-slate-600 text-[11px]">
                            PDF or DOCX · Max {MAX_FILE_MB}MB
                          </p>
                        </div>
                      )}
                    </div>
                    )}

                    <div className="mt-6">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
                        Target Role
                      </label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Software Engineer"
                        className="w-full bg-[#12141a] border border-[#22262f] rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>

                    <div className="mt-5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
                        Experience Level
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {EXPERIENCE_LEVELS.map((lvl) => (
                          <button
                            type="button"
                            key={lvl}
                            onClick={() => setExperienceLevel(lvl)}
                            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                              experienceLevel === lvl
                                ? "bg-teal-500/10 border-teal-500 text-teal-300 ring-1 ring-teal-500"
                                : "bg-[#12141a] border-[#22262f] text-slate-400 hover:border-teal-500/40"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <MagneticButton
                      as="button"
                      type="button"
                      onClick={handleAnalyze}
                      disabled={analyzing || (useExisting ? !selectedResumeId : !file)}
                      className="w-full mt-7 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-full transition-all"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Analyze Resume <ArrowRight size={16} />
                        </>
                      )}
                    </MagneticButton>
                  </div>
                </GradientBorder>
              </div>
            </div>
          </div>
        ) : (
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <TiltCard
              maxTilt={3}
              className="bg-[#11151d]/80 backdrop-blur-xl border border-[#232838] rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardCheck size={18} className="text-teal-400" />
                  <h1 className="text-white font-extrabold text-xl">
                    ATS Evaluation Complete
                  </h1>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  Target Role: {result.targetRole} &nbsp;|&nbsp; Level:{" "}
                  {result.experienceLevel}
                  {result.domain && (
                    <>
                      {" "}
                      &nbsp;|&nbsp; Domain: {result.domain}
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-8">
                {result.resumeScore !== undefined && (
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-indigo-400">
                      {result.resumeScore}
                    </p>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                      Resume Score
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <CircularGauge score={result.atsScore} max={100} size={72} strokeWidth={7} />
                  <p
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: verdictColor(result.verdict) }}
                  >
                    {result.verdict}
                  </p>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Best Role Matches */}
          {result.bestRoleMatches?.length > 0 && (
            <Panel
              title="AI Career Advisor: Best Role Matches"
              icon={<Sparkles size={15} className="text-teal-400" />}
            >
              <div className="space-y-4">
                {result.bestRoleMatches.map((r, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-200 text-sm font-medium">
                        {r.role}
                      </span>
                      <span className="text-teal-400 text-xs font-bold">
                        {r.matchPercent}% Match
                      </span>
                    </div>
                    <AnimatedBar
                      percent={r.matchPercent}
                      trackClassName="w-full h-1.5 bg-[#232838] rounded-full overflow-hidden"
                      fillClassName="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                      delay={i * 0.06}
                    />
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Best Fit Role + Recommended Roles */}
          {(result.bestFitRole || result.recommendedRoles?.length > 0) && (
            <Panel
              title="Career Recommendation"
              icon={<Target size={15} className="text-emerald-400" />}
            >
              {result.bestFitRole && (
                <div className="flex items-center justify-between bg-[#1a1f2e] rounded-xl px-4 py-3 mb-4">
                  <span className="text-slate-400 text-sm">Best Fit Role</span>
                  <span className="text-white font-bold text-sm">
                    {result.bestFitRole}
                  </span>
                </div>
              )}
              {result.recommendedRoles?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                    Recommended Roles
                  </p>
                  <div className="flex flex-wrap">
                    {result.recommendedRoles.map((r, i) => (
                      <SkillBadge key={i} skill={r} variant="green" />
                    ))}
                  </div>
                </div>
              )}
            </Panel>
          )}

          {/* Critical Issues */}
          {result.criticalIssues?.length > 0 && (
            <Panel
              title="Critical Issues Detected"
              icon={<AlertTriangle size={15} className="text-red-400" />}
              tone="danger"
            >
              <motion.ul
                className="space-y-2"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.12 } },
                }}
              >
                {result.criticalIssues.map((issue, i) => (
                  <motion.li
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: -12 },
                      show: { opacity: 1, x: 0 },
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="text-red-200/90 text-sm flex items-start gap-2"
                  >
                    <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    {issue}
                  </motion.li>
                ))}
              </motion.ul>
            </Panel>
          )}

          {/* Category Breakdown */}
          {result.categoryBreakdown?.length > 0 && (
            <div>
              <h2 className="text-white font-bold text-sm mb-3">
                Category Breakdown
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {result.categoryBreakdown.map((cat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.35, delay: (i % 2) * 0.08 }}
                  >
                    <TiltCard maxTilt={5} className="bg-[#11151d]/80 backdrop-blur-xl border border-[#232838] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-slate-200 text-sm font-bold">
                          {cat.category}
                        </span>
                        <span
                          className="text-sm font-extrabold"
                          style={{ color: scoreColor(cat.score) }}
                        >
                          {cat.score}/10
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed mb-2.5">
                        {cat.note}
                      </p>
                      <AnimatedBar
                        percent={(cat.score / 10) * 100}
                        trackClassName="h-1.5 rounded-full bg-[#232838] overflow-hidden"
                        fillClassName="h-full rounded-full"
                        color={scoreColor(cat.score)}
                        delay={(i % 2) * 0.08}
                      />
                    </TiltCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Found / Missing Skills */}
          {(toArr(result.skillsFound).length > 0 ||
            toArr(result.missingSkills).length > 0) && (
            <Panel title="Skills Overview">
              <div className="space-y-5">
                {toArr(result.skillsFound).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Skills Found
                    </p>
                    <div className="flex flex-wrap">
                      {toArr(result.skillsFound).map((s, i) => (
                        <SkillBadge key={i} skill={s} variant="purple" />
                      ))}
                    </div>
                  </div>
                )}
                {toArr(result.missingSkills).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Missing Skills
                    </p>
                    <div className="flex flex-wrap">
                      {toArr(result.missingSkills).map((s, i) => (
                        <SkillBadge key={i} skill={s} variant="red" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {/* Suggestions */}
          {toArr(result.suggestions).length > 0 && (
            <Panel
              title="Suggestions"
              icon={<Sparkles size={15} className="text-indigo-400" />}
            >
              <div className="space-y-2">
                {toArr(result.suggestions).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-[#1a1f2e] rounded-xl"
                  >
                    <ChevronRight
                      size={14}
                      className="text-indigo-400 mt-0.5 shrink-0"
                    />
                    <span className="text-slate-300 text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Skills To Learn + Career Roadmap */}
          {(toArr(result.skillsToLearn).length > 0 ||
            toArr(result.careerRoadmap).length > 0) && (
            <Panel
              title="Career Roadmap"
              icon={<Target size={15} className="text-emerald-400" />}
            >
              <div className="space-y-5">
                {toArr(result.skillsToLearn).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Skills To Learn
                    </p>
                    <div className="flex flex-wrap">
                      {toArr(result.skillsToLearn).map((s, i) => (
                        <SkillBadge key={i} skill={s} variant="yellow" />
                      ))}
                    </div>
                  </div>
                )}
                {toArr(result.careerRoadmap).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Roadmap
                    </p>
                    <div className="space-y-2">
                      {toArr(result.careerRoadmap).map((step, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-[#1a1f2e] rounded-xl"
                        >
                          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {i + 1}
                          </div>
                          <span className="text-slate-300 text-sm">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {/* Line-by-Line Fixes */}
          {result.lineByLineFixes?.length > 0 && (
            <div>
              <h2 className="text-white font-bold text-sm mb-3">
                Line-by-Line Fixes
              </h2>
              <div className="space-y-4">
                {result.lineByLineFixes.map((fix, i) => (
                  <div
                    key={i}
                    className="bg-[#11151d]/80 backdrop-blur-xl border border-[#232838] rounded-xl p-4 space-y-3"
                  >
                    <p className="text-slate-400 text-xs italic">
                      "{fix.reasoning}"
                    </p>
                    <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-3">
                      <p className="text-red-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                        Original (Remove)
                      </p>
                      <p className="text-red-200/80 text-sm">
                        {fix.original}
                      </p>
                    </div>
                    <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-3">
                      <p className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                        Rewrite (Add)
                      </p>
                      <p className="text-emerald-200/80 text-sm">
                        {fix.rewrite}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {result.missingKeywords?.length > 0 && (
            <Panel title="Missing Keywords">
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((k, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1f2e] border border-[#232838] text-slate-300 text-xs font-medium rounded-full"
                  >
                    <KeyRound size={11} className="text-indigo-400" />
                    {k}
                  </span>
                ))}
              </div>
            </Panel>
          )}

          {/* Job Description Match */}
          <Panel
            title="Job Description Match"
            icon={<Briefcase size={15} className="text-amber-400" />}
          >
            <textarea
              rows={4}
              placeholder="Paste the job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="w-full bg-[#1a1f2e] border border-[#232838] rounded-xl p-4 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-colors resize-y mb-3"
            />
            <MagneticButton
              as="button"
              onClick={runJobMatch}
              disabled={matching}
              strength={10}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
            >
              {matching ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Matching...
                </>
              ) : (
                <>
                  <ClipboardList size={15} /> Match Resume
                </>
              )}
            </MagneticButton>

            {jobMatch && (
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-3xl font-extrabold text-amber-400">
                    {jobMatch.matchScore}
                    <span className="text-sm text-slate-500 font-semibold">
                      {" "}
                      / 100 Match Score
                    </span>
                  </p>
                </div>

                {jobMatch.matchedSkills?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Matched Skills
                    </p>
                    <div className="flex flex-wrap">
                      {jobMatch.matchedSkills.map((s, i) => (
                        <SkillBadge key={i} skill={s} variant="green" />
                      ))}
                    </div>
                  </div>
                )}

                {jobMatch.missingSkills?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Missing Skills
                    </p>
                    <div className="flex flex-wrap">
                      {jobMatch.missingSkills.map((s, i) => (
                        <SkillBadge key={i} skill={s} variant="red" />
                      ))}
                    </div>
                  </div>
                )}

                {jobMatch.suggestions?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Suggestions
                    </p>
                    <div className="space-y-2">
                      {jobMatch.suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 bg-[#1a1f2e] rounded-xl"
                        >
                          <ChevronRight
                            size={14}
                            className="text-amber-400 mt-0.5 shrink-0"
                          />
                          <span className="text-slate-300 text-sm">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Panel>

          <MagneticButton
            as="button"
            type="button"
            onClick={reset}
            className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            Check Another Resume
          </MagneticButton>
        </div>
      )}
      </div>
    </div>
  );
};

export default ATSChecker;