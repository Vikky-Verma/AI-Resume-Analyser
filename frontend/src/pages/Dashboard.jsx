import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { CloudUpload, FileText, Trash2, Eye, Loader2, Mic, ChevronRight, Award } from "lucide-react";

const VERDICT_STYLE = {
  "Strong Hire": { bg: "bg-emerald-950", border: "border-emerald-800", text: "text-emerald-400" },
  Hire: { bg: "bg-teal-950", border: "border-teal-800", text: "text-teal-400" },
  "Leaning No Hire": { bg: "bg-amber-950", border: "border-amber-800", text: "text-amber-400" },
  "No Hire": { bg: "bg-red-950", border: "border-red-800", text: "text-red-400" },
};

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
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

  const fetchInterviews = async () => {
    try {
      const { data } = await API.get("/interview/my-interviews");
      setInterviews(data.interviews || []);
    } catch {
      /* silent — non-critical section */
    } finally {
      setLoadingInterviews(false);
    }
  };

  useEffect(() => {
    fetchResumes();
    fetchInterviews();
  }, []);

  // ✅ Supports both PDF and DOCX
  const handleUpload = async (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!file || !allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or DOCX file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    setUploading(true);

    try {
      await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Resume uploaded!");
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
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white">Your Resumes</h1>
          <p className="text-slate-400 text-sm mt-2">
            Upload your resume to get AI-powered analysis, ATS score, and career
            advice.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleUpload(e.dataTransfer.files[0]);
          }}
          onClick={() => document.getElementById("file-input").click()}
          className={`
            border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all mb-8
            ${
              dragOver
                ? "border-indigo-500 bg-indigo-950/30"
                : "border-[#2e3150] bg-[#1a1d2e] hover:border-indigo-500/50 hover:bg-[#1e2140]"
            }
          `}
        >
          {/* ✅ Accept both PDF and DOCX */}
          <input
            id="file-input"
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files[0])}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={40} className="text-indigo-400 animate-spin" />
              <p className="text-slate-400 text-sm">Uploading your resume...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-[#242840] rounded-2xl flex items-center justify-center">
                <CloudUpload size={28} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">
                  Drop your Resume here
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  or click to browse — PDF or DOCX supported
                </p>
              </div>
              {/* ✅ File type badges */}
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs font-semibold rounded-full">
                  PDF
                </span>
                <span className="px-3 py-1 bg-blue-950 border border-blue-800 text-blue-400 text-xs font-semibold rounded-full">
                  DOCX
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Resume List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="text-indigo-400 animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl p-16 text-center">
            <FileText size={48} className="text-[#2e3150] mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">No resumes yet</p>
            <p className="text-slate-500 text-sm mt-2">
              Upload your first resume above to get started
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
              {resumes.length} Resume{resumes.length > 1 ? "s" : ""}
            </p>
            {resumes.map((resume) => {
              const badge = getFileBadge(resume.originalName);

              return (
                <div
                  key={resume.id}
                  className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-indigo-500/40 transition-all group"
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

        {/* ── Mock Interview Section ── */}
        <div className="mt-14">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-white">Mock Interviews</h2>
              <p className="text-slate-400 text-sm mt-1">
                Practice HR, Technical &amp; DSA rounds tailored to your resume.
              </p>
            </div>
            <Link
              to="/interview/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold rounded-xl transition-all shrink-0"
            >
              <Mic size={15} /> Start Mock Interview
            </Link>
          </div>

          {loadingInterviews ? (
            <div className="flex justify-center py-10">
              <Loader2 size={26} className="text-violet-400 animate-spin" />
            </div>
          ) : interviews.length === 0 ? (
            <div className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl p-10 text-center">
              <Mic size={36} className="text-[#2e3150] mx-auto mb-3" />
              <p className="text-white font-semibold text-sm">No mock interviews yet</p>
              <p className="text-slate-500 text-xs mt-1">
                Start one from a resume's page or the button above.
              </p>
            </div>
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
                    className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl px-5 py-4 flex items-center justify-between gap-4 hover:border-violet-500/40 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 bg-violet-950 border border-violet-800 rounded-xl flex items-center justify-center flex-shrink-0">
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
                        <span className="text-white font-bold text-sm">{iv.overallScore}/100</span>
                      )}
                      <ChevronRight size={16} className="text-slate-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;