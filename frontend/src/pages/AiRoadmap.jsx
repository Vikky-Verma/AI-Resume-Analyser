import { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import {
  Route as RouteIcon,
  CloudUpload,
  Loader2,
  CheckCircle2,
  FileText,
  X,
  ArrowRight,
  Milestone,
  Gauge,
  ListChecks,
  Sparkles,
} from "lucide-react";

const MAX_FILE_MB = 5;
const TIMEFRAMES = [
  { weeks: 4, label: "1 Month" },
  { weeks: 8, label: "2 Months" },
  { weeks: 12, label: "3 Months" },
  { weeks: 24, label: "6 Months" },
];

const FEATURES = [
  {
    icon: Gauge,
    color: "rose",
    title: "Honest readiness score",
    desc: "Where you actually stand for the role today — no inflation.",
  },
  {
    icon: ListChecks,
    color: "amber",
    title: "Phased, concrete tasks",
    desc: "Not \"learn backend\" — specific things to build, by specific weeks.",
  },
  {
    icon: Milestone,
    color: "indigo",
    title: "A milestone per phase",
    desc: "Something checkable you should be able to show at the end of each block.",
  },
];

const COLOR_MAP = {
  rose: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
};

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const readinessColor = (score) => {
  if (score >= 70) return "#4ade80";
  if (score >= 40) return "#facc15";
  return "#f87171";
};

const STEPS = ["Uploading Resume", "Parsing Document", "Building Your Roadmap"];

const AiRoadmap = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [timeframeWeeks, setTimeframeWeeks] = useState(8);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  // ── Existing-resume picker ──
  const [existingResumes, setExistingResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [useExisting, setUseExisting] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState(null);

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

  const handleGenerate = async () => {
    const usingExisting = useExisting && selectedResumeId;

    if (!usingExisting && !file) {
      toast.error("Please choose a resume file first");
      return;
    }
    if (!targetRole.trim()) {
      toast.error("Enter the role you're targeting");
      return;
    }

    setAnalyzing(true);
    setStep(0);
    setResult(null);

    try {
      let finalResumeId = selectedResumeId;

      if (!usingExisting) {
        const formData = new FormData();
        formData.append("resume", file);

        const { data: uploadData } = await API.post("/resume/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalResumeId = uploadData.resume.id;
      }

      setStep(1);
      await API.post(`/resume/parse/${finalResumeId}`);

      setStep(2);
      const { data } = await API.post(`/roadmap/${finalResumeId}`, {
        targetRole: targetRole.trim(),
        timeframeWeeks,
      });

      if (!data.success) {
        toast.error(data.message || "Roadmap generation failed");
        setAnalyzing(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 400));
      setResult(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Roadmap generation failed. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#07090f] relative overflow-hidden">
      {!result && (
        <>
          <div className="pointer-events-none absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-rose-600/10 rounded-full blur-[120px]" />
          <div className="pointer-events-none absolute top-40 -right-32 w-[28rem] h-[28rem] bg-indigo-500/15 rounded-full blur-[120px]" />
        </>
      )}

      <div className="relative">
        <Navbar />

        {!result ? (
          analyzing ? (
            <div className="max-w-2xl mx-auto px-6 py-16">
              <div className="bg-[#11151d] border border-[#232838] rounded-2xl p-10">
                <div className="flex flex-col gap-4">
                  {STEPS.map((label, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                          i < step
                            ? "bg-indigo-500 border-indigo-500"
                            : i === step
                            ? "border-indigo-500 bg-[#1a1f2e]"
                            : "border-[#2e3150] bg-[#1a1f2e]"
                        }`}
                      >
                        {i < step ? (
                          <CheckCircle2 size={15} className="text-white" />
                        ) : i === step ? (
                          <Loader2 size={13} className="animate-spin text-indigo-400" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          i <= step ? "text-slate-200" : "text-slate-600"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto px-6 py-14">
              <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 items-start">
                {/* Left */}
                <div className="lg:sticky lg:top-24">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full mb-6">
                    <RouteIcon size={13} className="text-rose-400" />
                    <span className="text-rose-300 text-xs font-semibold tracking-wide">
                      AI Roadmap
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-[2.6rem] font-extrabold text-white leading-[1.12] tracking-tight">
                    A real plan, not
                    <br />
                    another{" "}
                    <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-indigo-300 bg-clip-text text-transparent">
                      to-do list.
                    </span>
                  </h1>

                  <p className="text-slate-400 text-base mt-5 leading-relaxed max-w-md">
                    Tell us the role and the timeframe. We'll read your resume,
                    score how ready you actually are, and build a phased plan
                    to close the gap.
                  </p>

                  {/* Live preview mockup */}
                  <div className="mt-9 bg-[#12141a] border border-[#22262f] rounded-2xl p-5 max-w-md">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Readiness Score
                      </span>
                      <span className="text-2xl font-extrabold" style={{ color: readinessColor(42) }}>
                        42
                      </span>
                    </div>
                    <div className="bg-[#1a1d24] rounded-lg p-3">
                      <p className="text-indigo-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                        Weeks 1-2: Close the Core Gap
                      </p>
                      <p className="text-slate-300 text-xs leading-snug">
                        Build a REST API with auth, write tests, deploy it live
                      </p>
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

                {/* Right: Form */}
                <div>
                  <div className="p-[1px] rounded-3xl bg-gradient-to-br from-rose-500/40 via-indigo-500/15 to-transparent">
                    <div className="bg-[#0a0c11] rounded-3xl p-7 sm:p-8">
                      <h2 className="text-white font-bold text-xl">
                        Build your roadmap
                      </h2>
                      <p className="text-slate-500 text-sm mt-1.5 mb-7">
                        Takes about 20 seconds.
                      </p>

                      <div className="mb-6">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
                          Target Role
                        </label>
                        <input
                          type="text"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          placeholder="e.g. Backend Engineer"
                          className="w-full bg-[#12141a] border border-[#22262f] rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                        />
                      </div>

                      <div className="mb-6">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
                          Timeframe
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {TIMEFRAMES.map((t) => (
                            <button
                              type="button"
                              key={t.weeks}
                              onClick={() => setTimeframeWeeks(t.weeks)}
                              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                timeframeWeeks === t.weeks
                                  ? "bg-rose-500/10 border-rose-500 text-rose-300 ring-1 ring-rose-500"
                                  : "bg-[#12141a] border-[#22262f] text-slate-400 hover:border-rose-500/40"
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

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
                                    ? "border-rose-500 bg-rose-950/20"
                                    : "border-[#22262f] bg-[#12141a]"
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
                                  className="accent-rose-500"
                                />
                                <FileText size={14} className="text-rose-400 shrink-0" />
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
                              !useExisting ? "text-rose-400" : "text-slate-500 hover:text-rose-400"
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
                          className={`rounded-2xl border transition-all mb-6 ${
                            dragOver
                              ? "border-rose-500 bg-rose-950/20"
                              : "border-[#22262f] bg-[#12141a]"
                          } ${file ? "p-4" : "p-10"}`}
                        >
                          <input
                            id="ai-roadmap-file-input"
                            type="file"
                            accept=".pdf,.docx"
                            className="hidden"
                            onChange={(e) => handleFileChange(e.target.files[0])}
                          />

                          {file ? (
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0">
                                  <FileText size={16} className="text-rose-400" />
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
                              <div className="w-16 h-16 rounded-full border border-dashed border-rose-500/40 flex items-center justify-center">
                                <CloudUpload size={22} className="text-rose-400" />
                              </div>
                              <p className="text-slate-400 text-sm">
                                Drag &amp; drop your resume here
                              </p>
                              <label
                                htmlFor="ai-roadmap-file-input"
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

                      <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={
                          analyzing ||
                          !targetRole.trim() ||
                          (useExisting ? !selectedResumeId : !file)
                        }
                        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-rose-500 to-indigo-500 hover:from-rose-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-full transition-all"
                      >
                        {analyzing ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Building...
                          </>
                        ) : (
                          <>
                            Build My Roadmap <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
            {/* Header */}
            <div className="bg-[#11151d] border border-[#232838] rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <RouteIcon size={18} className="text-rose-400" />
                  <h1 className="text-white font-extrabold text-xl">
                    Roadmap: {result.targetRole}
                  </h1>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  {result.timeframeWeeks}-week plan &nbsp;|&nbsp; {result.currentLevel}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-4xl font-extrabold"
                  style={{ color: readinessColor(result.readinessScore) }}
                >
                  {result.readinessScore}
                </p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                  Readiness Today
                </p>
              </div>
            </div>

            {/* Phases */}
            <div className="space-y-4">
              {result.phases?.map((phase, i) => (
                <div
                  key={i}
                  className="bg-[#11151d] border border-[#232838] rounded-xl p-5"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0 text-rose-400 text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">{phase.title}</h3>
                      <p className="text-slate-500 text-xs mt-0.5">{phase.focus}</p>
                    </div>
                  </div>

                  <div className="pl-10 space-y-1.5 mb-3">
                    {phase.tasks?.map((t, ti) => (
                      <div key={ti} className="flex items-start gap-2 text-slate-300 text-xs">
                        <Sparkles size={11} className="text-indigo-400 mt-0.5 shrink-0" />
                        {t}
                      </div>
                    ))}
                  </div>

                  {phase.milestone && (
                    <div className="ml-10 flex items-start gap-2 bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-3">
                      <Milestone size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                      <p className="text-emerald-200/90 text-xs">{phase.milestone}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {result.finalReadinessNote && (
              <div className="bg-[#11151d] border border-[#232838] rounded-2xl p-6">
                <h2 className="text-white font-bold text-sm mb-2">
                  What "Job-Ready" Looks Like By The End
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {result.finalReadinessNote}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={reset}
              className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              Build Another Roadmap
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiRoadmap;
