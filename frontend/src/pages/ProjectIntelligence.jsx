import { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import SkillBadge from "../components/SkillBadge";
import toast from "react-hot-toast";
import {
  FolderGit2,
  CloudUpload,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  ShieldAlert,
  FileText,
  X,
  ArrowRight,
  Sparkles,
  Target,
  Layers,
} from "lucide-react";

const MAX_FILE_MB = 5;

const FEATURES = [
  {
    icon: Layers,
    color: "indigo",
    title: "Per-project breakdown",
    desc: "Tech stack, what it actually covers, and how it reads to a recruiter.",
  },
  {
    icon: Sparkles,
    color: "violet",
    title: "Strengths & gaps, side by side",
    desc: "What's working in your write-up, and what's missing (metrics, live links, tests).",
  },
  {
    icon: Target,
    color: "emerald",
    title: "Concrete suggested additions",
    desc: "Specific, actionable lines to add — not generic advice.",
  },
];

const COLOR_MAP = {
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
};

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const STEPS = ["Uploading Resume", "Parsing Document", "Analyzing Projects"];

const ProjectIntelligence = () => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  // ── Existing-resume picker (same pattern as ATS Checker) ──
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

  const handleAnalyze = async () => {
    const usingExisting = useExisting && selectedResumeId;

    if (!usingExisting && !file) {
      toast.error("Please choose a resume file first");
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
      // Re-parse is cheap and guarantees extractedText is present either way
      await API.post(`/resume/parse/${finalResumeId}`);

      setStep(2);
      const { data } = await API.post(`/projects/${finalResumeId}`);

      if (!data.success) {
        toast.error(data.message || "Analysis failed");
        setAnalyzing(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 400));

      setResult(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Project analysis failed. Please try again."
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
          <div className="pointer-events-none absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-indigo-600/15 rounded-full blur-[120px]" />
          <div className="pointer-events-none absolute top-40 -right-32 w-[28rem] h-[28rem] bg-violet-500/15 rounded-full blur-[120px]" />
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
                {/* ───────────────────── Left: Description ───────────────────── */}
                <div className="lg:sticky lg:top-24">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                    <FolderGit2 size={13} className="text-indigo-400" />
                    <span className="text-indigo-300 text-xs font-semibold tracking-wide">
                      Project Intelligence
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-[2.6rem] font-extrabold text-white leading-[1.12] tracking-tight">
                    Recruiter-grade feedback
                    <br />
                    on{" "}
                    <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-300 bg-clip-text text-transparent">
                      every project.
                    </span>
                  </h1>

                  <p className="text-slate-400 text-base mt-5 leading-relaxed max-w-md">
                    We read the Projects section of your resume and break
                    down each one — what it actually covers, strengths,
                    gaps, and exactly what to add.
                  </p>

                  {/* Live-preview mockup */}
                  <div className="mt-9 bg-[#12141a] border border-[#22262f] rounded-2xl p-5 max-w-md">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-sm">ResQLink</span>
                      <div className="flex gap-1">
                        <span className="px-2 py-0.5 bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-[10px] font-semibold rounded-full">
                          Next.js
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-[10px] font-semibold rounded-full">
                          Supabase
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                          Strength
                        </p>
                        <p className="text-slate-300 text-xs leading-snug">
                          Reduced false incidents 85% with AI validation
                        </p>
                      </div>
                      <div>
                        <p className="text-red-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                          Missing
                        </p>
                        <p className="text-slate-300 text-xs leading-snug">
                          No live demo link or metrics on retention
                        </p>
                      </div>
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
                  <div className="p-[1px] rounded-3xl bg-gradient-to-br from-indigo-500/40 via-violet-500/15 to-transparent">
                    <div className="bg-[#0a0c11] rounded-3xl p-7 sm:p-8">
                      <h2 className="text-white font-bold text-xl">
                        Analyze your projects
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
                                    ? "border-indigo-500 bg-indigo-950/20"
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
                                  className="accent-indigo-500"
                                />
                                <FileText size={14} className="text-indigo-400 shrink-0" />
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
                              !useExisting ? "text-indigo-400" : "text-slate-500 hover:text-indigo-400"
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
                              ? "border-indigo-500 bg-indigo-950/20"
                              : "border-[#22262f] bg-[#12141a]"
                          } ${file ? "p-4" : "p-10"}`}
                        >
                          <input
                            id="project-intelligence-file-input"
                            type="file"
                            accept=".pdf,.docx"
                            className="hidden"
                            onChange={(e) => handleFileChange(e.target.files[0])}
                          />

                          {file ? (
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
                                  <FileText size={16} className="text-indigo-400" />
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
                              <div className="w-16 h-16 rounded-full border border-dashed border-indigo-500/40 flex items-center justify-center">
                                <CloudUpload size={22} className="text-indigo-400" />
                              </div>
                              <p className="text-slate-400 text-sm">
                                Drag &amp; drop your resume here
                              </p>
                              <label
                                htmlFor="project-intelligence-file-input"
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
                        onClick={handleAnalyze}
                        disabled={analyzing || (useExisting ? !selectedResumeId : !file)}
                        className="w-full mt-7 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-full transition-all"
                      >
                        {analyzing ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            Analyze Projects <ArrowRight size={16} />
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
          <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
            {/* Header */}
            <div className="bg-[#11151d] border border-[#232838] rounded-2xl p-6">
              <div className="flex items-center gap-2">
                <FolderGit2 size={18} className="text-indigo-400" />
                <h1 className="text-white font-extrabold text-xl">
                  Project Intelligence Report
                </h1>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                A per-project breakdown of what's on your resume, with
                strengths, gaps, and suggested additions.
              </p>
            </div>

            {/* Project Deep-Dive */}
            <div>
              {result.projects.length === 0 ? (
                <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-6 flex items-start gap-3">
                  <ShieldAlert size={17} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-200/90 text-sm">
                    No projects section detected in this resume. See the
                    suggestions below for what to add.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {result.projects.map((proj, i) => (
                    <div
                      key={i}
                      className="bg-[#11151d] border border-[#232838] rounded-xl p-5 space-y-4"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-white font-bold text-base">{proj.name}</h3>
                        <div className="flex flex-wrap">
                          {(proj.techStack || []).map((t, ti) => (
                            <SkillBadge key={ti} skill={t} variant="purple" />
                          ))}
                        </div>
                      </div>

                      <p className="text-slate-400 text-sm leading-relaxed">
                        {proj.whatItCovers}
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4 pt-2">
                        {proj.strengths?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">
                              Strengths
                            </p>
                            <ul className="space-y-1.5">
                              {proj.strengths.map((s, si) => (
                                <li
                                  key={si}
                                  className="text-slate-300 text-xs flex items-start gap-1.5"
                                >
                                  <span className="text-emerald-400 mt-0.5">+</span>
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {proj.missingElements?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">
                              Missing
                            </p>
                            <ul className="space-y-1.5">
                              {proj.missingElements.map((m, mi) => (
                                <li
                                  key={mi}
                                  className="text-slate-300 text-xs flex items-start gap-1.5"
                                >
                                  <span className="text-red-400 mt-0.5">–</span>
                                  {m}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {proj.suggestedAdditions?.length > 0 && (
                        <div className="pt-2 border-t border-[#232838]">
                          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
                            Suggested Additions
                          </p>
                          <div className="space-y-1.5">
                            {proj.suggestedAdditions.map((s, si) => (
                              <div
                                key={si}
                                className="flex items-start gap-2 text-slate-300 text-xs"
                              >
                                <ChevronRight
                                  size={12}
                                  className="text-indigo-400 mt-0.5 shrink-0"
                                />
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Overall Project Suggestions */}
            {result.overallProjectSuggestions?.length > 0 && (
              <div className="bg-[#11151d] border border-[#232838] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={15} className="text-amber-400" />
                  <h2 className="text-white font-bold text-sm">
                    Overall Project Suggestions
                  </h2>
                </div>
                <div className="space-y-2">
                  {result.overallProjectSuggestions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-[#1a1f2e] rounded-xl"
                    >
                      <ChevronRight size={14} className="text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-slate-300 text-sm">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={reset}
              className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              Analyze Another Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectIntelligence;
