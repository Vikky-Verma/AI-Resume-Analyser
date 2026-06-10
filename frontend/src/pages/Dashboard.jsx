import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { CloudUpload, FileText, Trash2, Eye, Loader2 } from "lucide-react";

const Dashboard = () => {
  const [resumes, setResumes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]  = useState(false);
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const { data } = await API.get("/resume");
      setResumes(data.resumes || []);
    } catch {
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResumes(); }, []);

  const handleUpload = async (file) => {
    if (!file || file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
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
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById("file-input").click()}
          className={`
            border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all mb-8
            ${dragOver
              ? "border-indigo-500 bg-indigo-950/30"
              : "border-[#2e3150] bg-[#1a1d2e] hover:border-indigo-500/50 hover:bg-[#1e2140]"
            }
          `}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
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
                <p className="text-white font-semibold text-lg">Drop your PDF here</p>
                <p className="text-slate-500 text-sm mt-1">or click to browse — PDF files only</p>
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
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl px-5 py-4 flex items-center justify-between hover:border-indigo-500/40 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-950 border border-indigo-800 rounded-xl flex items-center justify-center">
                    <FileText size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{resume.originalName}</p>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;