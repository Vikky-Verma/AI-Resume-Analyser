import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { CloudUpload, FileText, Trash2, Eye, Loader2, Sparkles, ScanSearch, Gauge, Layers, X, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: ScanSearch,
    color: "indigo",
    title: "Skill & experience extraction",
    desc: "We parse your projects, tools and years of experience straight from the file.",
  },
  {
    icon: Gauge,
    color: "blue",
    title: "One-click deep analysis",
    desc: "Get an ATS score, career advice and a best-fit role match in seconds.",
  },
  {
    icon: Layers,
    color: "violet",
    title: "PDF & DOCX supported",
    desc: "Upload whatever format your resume is already in — no converting needed.",
  },
];

const COLOR_MAP = {
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400" },
};

const MAX_FILE_MB = 5;

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const { data } = await API.get("/resume/my-resumes");
      setResumes(data.resumes || []);
    } catch {
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // ✅ Supports both PDF and DOCX
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
    setSelectedFile(file);
  };

  const handleContinue = async () => {
    if (!selectedFile) {
      toast.error("Choose a resume first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);
    setUploading(true);

    try {
      await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Resume uploaded!");
      setSelectedFile(null);
      fetchResumes();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this resume?")) return;
    try {
      await API.delete(`/resume/${id}`);
      toast.success("Deleted");
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  // ✅ Icon color based on file type
  const getFileIcon = (fileName) => {
    const ext = fileName?.split(".").pop().toLowerCase();
    if (ext === "docx") return "text-blue-400";
    return "text-indigo-400";
  };

  const getFileBadge = (fileName) => {
    const ext = fileName?.split(".").pop().toLowerCase();
    if (ext === "docx")
      return {
        label: "DOCX",
        bg: "bg-blue-950",
        border: "border-blue-800",
        text: "text-blue-400",
      };
    return {
      label: "PDF",
      bg: "bg-indigo-950",
      border: "border-indigo-800",
      text: "text-indigo-400",
    };
  };

  return (
    <div className="min-h-screen bg-[#07080d] relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-indigo-600/15 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute top-40 -right-32 w-[28rem] h-[28rem] bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="relative">
        <Navbar />

        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 items-start">
            {/* ───────────────────── Left: Description ───────────────────── */}
            <div className="lg:sticky lg:top-24">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
                <Sparkles size={13} className="text-indigo-400" />
                <span className="text-indigo-300 text-xs font-semibold tracking-wide">
                  Resume Intelligence
                </span>
              </div>

              <h1 className="text-4xl sm:text-[2.6rem] font-extrabold text-white leading-[1.12] tracking-tight">
                One upload. A
                <br />
                complete{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-violet-300 bg-clip-text text-transparent">
                  picture.
                </span>
              </h1>

              <p className="text-slate-400 text-base mt-5 leading-relaxed max-w-md">
                Keep every version of your resume in one place, then run
                AI-powered analysis, ATS scoring and career advice on any of
                them, anytime.
              </p>

              {/* Live-preview mockup */}
              <div className="mt-9 bg-[#12141a] border border-[#22262f] rounded-2xl p-5 max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Extracted from resume.pdf
                  </span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">
                    Parsed
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {["React", "Node.js", "PostgreSQL", "Docker", "AWS"].map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 bg-indigo-950/40 border border-indigo-900/40 text-indigo-300 text-[11px] font-semibold rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-[#22262f] rounded-full overflow-hidden">
                    <div className="h-full w-[87%] bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full" />
                  </div>
                  <span className="text-white text-xs font-bold shrink-0">
                    87% Match
                  </span>
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

            {/* ───────────────────── Right: Upload ───────────────────── */}
            <div>
              <div className="p-[1px] rounded-3xl bg-gradient-to-br from-indigo-500/40 via-blue-500/15 to-transparent">
                <div className="bg-[#0a0b11] rounded-3xl p-7 sm:p-8">
                  <h2 className="text-white font-bold text-xl">
                    Add a resume
                  </h2>
                  <p className="text-slate-500 text-sm mt-1.5 mb-7">
                    PDF or DOCX — we'll keep it in your library.
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
                        ? "border-indigo-500 bg-indigo-950/20"
                        : "border-[#22262f] bg-[#12141a]"
                    } ${selectedFile ? "p-4" : "p-10"}`}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files[0])}
                    />

                    {selectedFile ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-slate-500 text-xs mt-0.5">
                              {formatBytes(selectedFile.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
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
                          htmlFor="file-input"
                          className="px-5 py-2 bg-[#1a1d24] hover:bg-[#20242d] border border-[#2a2e38] text-slate-200 text-xs font-bold rounded-full cursor-pointer transition-all"
                        >
                          Browse Files
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2.5 py-0.5 bg-indigo-950/40 border border-indigo-900/40 text-indigo-300 text-[10px] font-semibold rounded-full">
                            PDF
                          </span>
                          <span className="px-2.5 py-0.5 bg-blue-950/40 border border-blue-900/40 text-blue-300 text-[10px] font-semibold rounded-full">
                            DOCX
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          Max {MAX_FILE_MB}MB
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!selectedFile || uploading}
                    className="w-full mt-5 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-full transition-all"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Uploading...
                      </>
                    ) : (
                      <>
                        Upload Resume <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Resume Library ── */}
          <div className="mt-16">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              {loading
                ? "Your Resumes"
                : `${resumes.length} Resume${resumes.length !== 1 ? "s" : ""}`}
            </p>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={32} className="text-indigo-400 animate-spin" />
              </div>
            ) : resumes.length === 0 ? (
              <div className="bg-[#12141a] border border-[#22262f] rounded-2xl p-16 text-center">
                <FileText size={48} className="text-[#22262f] mx-auto mb-4" />
                <p className="text-white font-semibold text-lg">No resumes yet</p>
                <p className="text-slate-500 text-sm mt-2">
                  Upload your first resume above to get started
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {resumes.map((resume) => {
                  const badge = getFileBadge(resume.originalName);

                  return (
                    <div
                      key={resume.id}
                      className="bg-[#12141a] border border-[#22262f] rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-indigo-500/40 transition-all group"
                    >
                      {/* Left Side */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`w-10 h-10 ${badge.bg} border ${badge.border} rounded-xl flex items-center justify-center flex-shrink-0`}
                        >
                          <FileText
                            size={18}
                            className={getFileIcon(resume.originalName)}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white font-semibold text-sm break-all">
                              {resume.originalName}
                            </p>

                            <span
                              className={`px-2 py-0.5 ${badge.bg} border ${badge.border} ${badge.text} text-[10px] font-bold rounded-full`}
                            >
                              {badge.label}
                            </span>
                          </div>

                          <p className="text-slate-500 text-xs mt-1">
                            {new Date(resume.uploadedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right Side Buttons */}
                      <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                        <button
                          onClick={() => navigate(`/resume/${resume.id}`)}
                          className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl transition-all"
                        >
                          <Eye size={13} />
                          Analyze
                        </button>

                        <button
                          onClick={() => handleDelete(resume.id)}
                          className="p-2 text-red-400 bg-red-950/40 border border-red-900/30 hover:bg-red-900/40 rounded-xl transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;