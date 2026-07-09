import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import {
  Mic,
  Building2,
  BriefcaseBusiness,
  GraduationCap,
  Sparkles,
  Loader2,
  ChevronRight,
  CloudUpload,
  Award,
  CheckCircle2,
  Users,
  Gauge,
  FileText,
  X,
} from "lucide-react";

const LEVELS = [
  { key: "Fresher", desc: "0 years — campus / first job" },
  { key: "Intermediate", desc: "1–4 years experience" },
  { key: "Advanced", desc: "5+ years / leadership" },
];

const LOADING_LINES = [
  "Reading your resume...",
  "Designing HR round questions...",
  "Designing technical round questions...",
  "Designing DSA round questions...",
  "Almost ready...",
];

const FEATURES = [
  {
    icon: Users,
    color: "violet",
    title: "3 rounds, real pressure",
    desc: "HR, Technical & DSA rounds — 5 questions each, generated from your own resume.",
  },
  {
    icon: Gauge,
    color: "indigo",
    title: "Every answer scored",
    desc: "Instant scoring out of 10 with detailed feedback, not just a checkmark.",
  },
  {
    icon: Award,
    color: "amber",
    title: "A real hiring verdict",
    desc: "Walk away with a Hire / No-Hire call and a full report you can revisit.",
  },
];

const COLOR_MAP = {
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400" },
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
};

const VERDICT_STYLE = {
  "Strong Hire": { bg: "bg-emerald-950", border: "border-emerald-800", text: "text-emerald-400" },
  Hire: { bg: "bg-teal-950", border: "border-teal-800", text: "text-teal-400" },
  "Leaning No Hire": { bg: "bg-amber-950", border: "border-amber-800", text: "text-amber-400" },
  "No Hire": { bg: "bg-red-950", border: "border-red-800", text: "text-red-400" },
};

const MAX_FILE_MB = 5;

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const Panel = ({ title, icon, children }) => (
  <div className="border rounded-2xl p-6 bg-[#11151d] border-[#232838]">
    {(title || icon) && (
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="font-bold text-sm text-white">{title}</h2>
      </div>
    )}
    {children}
  </div>
);

const MockInterviewSetup = () => {
  const navigate = useNavigate();

  // Step 1: this section's OWN resume upload — independent of Resume Analysis
  const [uploadedResume, setUploadedResume] = useState(null); // { id, originalName }
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  // Step 2: interview setup form
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Fresher");
  const [submitting, setSubmitting] = useState(false);
  const [loadingLine, setLoadingLine] = useState(0);

  // Past interviews — this page's own history, standalone home
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const { data } = await API.get("/interview/my-interviews");
        setInterviews(data.interviews || []);
      } catch {
        /* silent — non-critical */
      } finally {
        setLoadingInterviews(false);
      }
    };
    fetchInterviews();
  }, []);

  useEffect(() => {
    if (!submitting) return;
    const interval = setInterval(() => {
      setLoadingLine((prev) => Math.min(prev + 1, LOADING_LINES.length - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [submitting]);

  const handleFileChange = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!file || !allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or DOCX file");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_FILE_MB}MB`);
      return;
    }
    setPendingFile(file);
  };

  const handleUpload = async () => {
    if (!pendingFile) {
      toast.error("Choose a resume file first");
      return;
    }
    const formData = new FormData();
    formData.append("resume", pendingFile);
    setUploading(true);

    try {
      const { data } = await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Parse immediately so the interview can be generated from it
      await API.post(`/resume/parse/${data.resume.id}`);

      setUploadedResume(data.resume);
      toast.success("Resume ready!");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uploadedResume) {
      toast.error("Please upload your resume first");
      return;
    }
    if (!company.trim() || !role.trim()) {
      toast.error("Enter both company and role");
      return;
    }

    setSubmitting(true);
    setLoadingLine(0);
    try {
      const { data } = await API.post("/interview/start", {
        resumeId: uploadedResume.id,
        company: company.trim(),
        role: role.trim(),
        level,
      });
      toast.success("Interview ready!");
      navigate(`/interview/${data.interview.id}/room`);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to start interview. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isLanding = !uploadedResume && !submitting;

  return (
    <div className="min-h-screen bg-[#07090f] relative overflow-hidden">
      {isLanding && (
        <>
          <div className="pointer-events-none absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-violet-600/15 rounded-full blur-[120px]" />
          <div className="pointer-events-none absolute top-40 -right-32 w-[28rem] h-[28rem] bg-indigo-500/15 rounded-full blur-[120px]" />
        </>
      )}

      <div className="relative">
        <Navbar />

        {isLanding ? (
          <div className="max-w-6xl mx-auto px-6 py-14">
            <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 items-start">
              {/* ───────────────────── Left: Description ───────────────────── */}
              <div className="lg:sticky lg:top-24">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full mb-6">
                  <Mic size={13} className="text-violet-400" />
                  <span className="text-violet-300 text-xs font-semibold tracking-wide">
                    AI Mock Interview
                  </span>
                </div>

                <h1 className="text-4xl sm:text-[2.6rem] font-extrabold text-white leading-[1.12] tracking-tight">
                  Interview practice
                  <br />
                  that actually{" "}
                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-300 bg-clip-text text-transparent">
                    feels real.
                  </span>
                </h1>

                <p className="text-slate-400 text-base mt-5 leading-relaxed max-w-md">
                  Three rounds — HR, Technical &amp; DSA — generated from your
                  resume, scored question by question, ending in a real
                  hire / no-hire verdict.
                </p>

                {/* Live-preview mockup */}
                <div className="mt-9 bg-[#12141a] border border-[#22262f] rounded-2xl p-5 max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Technical Round · Q3 of 5
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-violet-400">
                      In Progress
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative w-16 h-16 shrink-0">
                      <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                        <circle cx="32" cy="32" r="27" fill="none" stroke="#22262f" strokeWidth="6" />
                        <circle
                          cx="32"
                          cy="32"
                          r="27"
                          fill="none"
                          stroke="#a78bfa"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 27 * 0.8} ${2 * Math.PI * 27}`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-sm">
                        8/10
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-xs leading-snug">
                        "Explain how you'd design a rate limiter for a public
                        API."
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-3">
                    <p className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                      Panel Feedback
                    </p>
                    <p className="text-emerald-200/80 text-xs leading-snug">
                      Strong grasp of token-bucket vs sliding-window
                      tradeoffs — mention distributed state next time.
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

                {/* Chips */}
                <div className="mt-9 flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12141a] border border-[#22262f] text-slate-300 text-xs font-semibold rounded-full">
                    <Users size={12} className="text-violet-400" />
                    HR · Technical · DSA
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12141a] border border-[#22262f] text-slate-300 text-xs font-semibold rounded-full">
                    <Gauge size={12} className="text-violet-400" />
                    Instant Scoring
                  </span>
                </div>
              </div>

              {/* ───────────────────── Right: Upload Form ───────────────────── */}
              <div>
                <div className="p-[1px] rounded-3xl bg-gradient-to-br from-violet-500/40 via-indigo-500/15 to-transparent">
                  <div className="bg-[#0a0c11] rounded-3xl p-7 sm:p-8">
                    <h2 className="text-white font-bold text-xl">
                      Upload your resume
                    </h2>
                    <p className="text-slate-500 text-sm mt-1.5 mb-7">
                      PDF or DOCX — we'll build your interview from it.
                    </p>

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
                          ? "border-violet-500 bg-violet-950/20"
                          : "border-[#22262f] bg-[#12141a]"
                      } ${pendingFile ? "p-4" : "p-10"}`}
                    >
                      <input
                        id="mock-interview-file-input"
                        type="file"
                        accept=".pdf,.docx"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files[0])}
                      />

                      {pendingFile ? (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
                              <FileText size={16} className="text-violet-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-semibold truncate">
                                {pendingFile.name}
                              </p>
                              <p className="text-slate-500 text-xs mt-0.5">
                                {formatBytes(pendingFile.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPendingFile(null)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-[#1a1d24] rounded-full transition-all shrink-0"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center gap-4">
                          <div className="w-16 h-16 rounded-full border border-dashed border-violet-500/40 flex items-center justify-center">
                            <CloudUpload size={22} className="text-violet-400" />
                          </div>
                          <p className="text-slate-400 text-sm">
                            Drag &amp; drop your resume here
                          </p>
                          <label
                            htmlFor="mock-interview-file-input"
                            className="px-5 py-2 bg-[#1a1d24] hover:bg-[#20242d] border border-[#2a2e38] text-slate-200 text-xs font-bold rounded-full cursor-pointer transition-all"
                          >
                            Browse Files
                          </label>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={!pendingFile || uploading}
                      className="mt-5 w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all"
                    >
                      {uploading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} /> Continue <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Past Interviews ── */}
            <div className="mt-16 max-w-3xl">
              <Panel
                title="Past Interviews"
                icon={<Mic size={15} className="text-violet-400" />}
              >
                {loadingInterviews ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={24} className="text-violet-400 animate-spin" />
                  </div>
                ) : interviews.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">
                    No mock interviews yet — your history will show up here.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {interviews.map((iv) => {
                      const verdictStyle = VERDICT_STYLE[iv.verdict] || null;
                      return (
                        <div
                          key={iv.id}
                          onClick={() =>
                            navigate(
                              iv.status === "completed"
                                ? `/interview/${iv.id}/report`
                                : `/interview/${iv.id}/room`
                            )
                          }
                          className="bg-[#1a1f2e] border border-[#232838] rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:border-violet-500/40 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Mic size={16} className="text-violet-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-semibold text-sm truncate">
                                {iv.role} @ {iv.company}
                              </p>
                              <p className="text-slate-500 text-xs mt-1">
                                {iv.level} ·{" "}
                                {new Date(iv.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                                {iv.status !== "completed" && " · In progress"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {verdictStyle && (
                              <span
                                className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${verdictStyle.bg} ${verdictStyle.border} ${verdictStyle.text}`}
                              >
                                <Award size={10} /> {iv.verdict}
                              </span>
                            )}
                            {iv.overallScore !== null && iv.overallScore !== undefined && (
                              <span className="text-white font-bold text-sm">
                                {iv.overallScore}/100
                              </span>
                            )}
                            <ChevronRight size={16} className="text-slate-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-6 py-14">
            {submitting ? (
              <div className="p-[1px] rounded-3xl bg-gradient-to-br from-violet-500/40 via-indigo-500/15 to-transparent">
                <div className="bg-[#0a0c11] rounded-3xl p-14 flex flex-col items-center gap-5">
                  <Loader2 size={40} className="text-violet-400 animate-spin" />
                  <div className="text-center">
                    <p className="text-white font-semibold">
                      {LOADING_LINES[loadingLine]}
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                      This can take 15–30 seconds
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Step 2: Company / Role / Level ── */
              <form onSubmit={handleSubmit}>
                <div className="p-[1px] rounded-3xl bg-gradient-to-br from-violet-500/40 via-indigo-500/15 to-transparent">
                  <div className="bg-[#0a0c11] rounded-3xl p-7 sm:p-8 space-y-6">
                    <div>
                      <h2 className="text-white font-bold text-xl">
                        Set up your interview
                      </h2>
                      <p className="text-slate-500 text-sm mt-1.5">
                        Tell us who you're interviewing with.
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-[#1a1f2e] border border-[#232838] rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        <span className="text-slate-300 text-sm truncate">
                          {uploadedResume.originalName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedResume(null);
                          setPendingFile(null);
                        }}
                        className="text-xs font-semibold text-violet-400 hover:text-violet-300 shrink-0"
                      >
                        Change
                      </button>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                        <Building2 size={13} /> Target Company
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Google, Amazon, TCS, a startup..."
                        className="w-full bg-[#1a1f2e] border border-[#232838] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                        <BriefcaseBusiness size={13} /> Target Role
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. SDE1, Backend Developer, Data Analyst..."
                        className="w-full bg-[#1a1f2e] border border-[#232838] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                        <GraduationCap size={13} /> Experience Level
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {LEVELS.map((l) => (
                          <button
                            type="button"
                            key={l.key}
                            onClick={() => setLevel(l.key)}
                            className={`text-left px-4 py-3 rounded-xl border transition-all ${
                              level === l.key
                                ? "bg-violet-500/10 border-violet-500 ring-1 ring-violet-500"
                                : "bg-[#1a1f2e] border-[#232838] hover:border-violet-500/40"
                            }`}
                          >
                            <p
                              className={`text-sm font-bold ${
                                level === l.key ? "text-violet-300" : "text-white"
                              }`}
                            >
                              {l.key}
                            </p>
                            <p className="text-slate-500 text-xs mt-1">{l.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all"
                    >
                      <Sparkles size={16} /> Generate Interview <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviewSetup;