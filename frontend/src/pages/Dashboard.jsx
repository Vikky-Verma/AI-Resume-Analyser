import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { CloudUpload, FileText, Trash2, Eye, Loader2 } from "lucide-react";

const Dashboard = () => {
  const [resumes, setResumes]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
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

  useEffect(() => { fetchResumes(); }, []);

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
    if (ext === "docx") return { label: "DOCX", bg: "bg-blue-950", border: "border-blue-800", text: "text-blue-400" };
    return { label: "PDF", bg: "bg-indigo-950", border: "border-indigo-800", text: "text-indigo-400" };
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white">Your Resumes</h1>
          <p className="text-slate-400 text-sm mt-2">
            Upload your resume to get AI-powered analysis, ATS score, and career advice.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleUpload(e.dataTransfer.files[0]);
          }}
          onClick={() => document.getElementById("file-input").click()}
          className={`
            border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all mb-8
            ${dragOver
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
                <p className="text-white font-semibold text-lg">Drop your Resume here</p>
                <p className="text-slate-500 text-sm mt-1">or click to browse — PDF or DOCX supported</p>
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
            <p className="text-slate-500 text-sm mt-2">Upload your first resume above to get started</p>
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
                  className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl px-5 py-4 flex items-center justify-between hover:border-indigo-500/40 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* ✅ Icon color changes based on file type */}
                    <div className={`w-10 h-10 ${badge.bg} border ${badge.border} rounded-xl flex items-center justify-center`}>
                      <FileText size={18} className={getFileIcon(resume.originalName)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold text-sm">{resume.originalName}</p>
                        {/* ✅ PDF / DOCX badge next to filename */}
                        <span className={`px-2 py-0.5 ${badge.bg} border ${badge.border} ${badge.text} text-[10px] font-bold rounded-full`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {new Date(resume.uploadedAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/resume/${resume.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      <Eye size={13} /> Analyze
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
  );
};

export default Dashboard;