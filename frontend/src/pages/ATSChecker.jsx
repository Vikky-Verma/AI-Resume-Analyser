import { useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import ScoreCard from "../components/ScoreCard";
import toast from "react-hot-toast";
import {
  ClipboardCheck,
  CloudUpload,
  Loader2,
  CheckCircle2,
  XCircle,
  KeyRound,
} from "lucide-react";

const ATSChecker = () => {
  const [uploadedResume, setUploadedResume] = useState(null); // { id, originalName }
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

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
    setResult(null);

    try {
      const { data } = await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Extract text so the ATS checks have something to scan
      await API.post(`/resume/parse/${data.resume.id}`);

      setUploadedResume(data.resume);
      toast.success("Resume ready!");
      runCheck(data.resume.id);
    } catch {
      toast.error("Upload failed. Please try again.");
      setUploading(false);
    }
  };

  const runCheck = async (resumeId) => {
    setChecking(true);
    try {
      const { data } = await API.get(`/ats/${resumeId}`);
      setResult(data);
    } catch {
      toast.error("ATS check failed. Please try again.");
    } finally {
      setChecking(false);
      setUploading(false);
    }
  };

  const reset = () => {
    setUploadedResume(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-amber-950 border border-amber-800 rounded-xl flex items-center justify-center">
            <ClipboardCheck size={18} className="text-amber-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">ATS Checker</h1>
        </div>
        <p className="text-slate-400 text-sm mb-8 ml-[52px]">
          Upload a resume and get an instant ATS-compatibility score.
        </p>

        {!uploadedResume ? (
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
            className={`bg-[#1a1d2e] border border-[#2e3150] rounded-2xl p-14 text-center transition-all ${
              dragOver ? "border-amber-500 bg-amber-950/20" : ""
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={40} className="text-amber-400 animate-spin" />
                <p className="text-slate-400 text-sm">Uploading your resume...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#242840] rounded-2xl flex items-center justify-center">
                  <CloudUpload size={28} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-xl">
                    Upload Your Resume
                  </p>
                  <p className="text-slate-500 text-sm mt-2 max-w-sm">
                    Upload a PDF or DOCX — we'll scan it for ATS compatibility
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3 mt-2">
                  <input
                    id="ats-file-input"
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files[0])}
                  />
                  <label
                    htmlFor="ats-file-input"
                    className="px-4 py-2 bg-[#242840] border border-[#2e3150] hover:border-amber-500/50 text-slate-300 text-sm font-medium rounded-xl cursor-pointer transition-all"
                  >
                    Choose File
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("ats-file-input").click()
                    }
                    className="w-full sm:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all"
                  >
                    Upload Resume
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 bg-[#1a1d2e] border border-[#2e3150] rounded-xl px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="text-slate-300 text-sm truncate">
                  {uploadedResume.originalName}
                </span>
              </div>
              <button
                type="button"
                onClick={reset}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 shrink-0"
              >
                Check Another
              </button>
            </div>

            {checking ? (
              <div className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl p-14 flex flex-col items-center gap-4">
                <Loader2 size={36} className="text-amber-400 animate-spin" />
                <p className="text-slate-400 text-sm">Scanning your resume...</p>
              </div>
            ) : result ? (
              <>
                <div className="w-fit">
                  <ScoreCard
                    label="ATS Score"
                    score={result.atsScore}
                    color="#f59e0b"
                  />
                </div>

                {result.passedChecks?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                      Passed Checks
                    </p>
                    <div className="space-y-2">
                      {result.passedChecks.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-[#1a1d2e] border border-[#2e3150] rounded-xl"
                        >
                          <CheckCircle2
                            size={15}
                            className="text-emerald-400 shrink-0"
                          />
                          <span className="text-slate-300 text-sm">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.failedChecks?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                      Needs Improvement
                    </p>
                    <div className="space-y-2">
                      {result.failedChecks.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-[#1a1d2e] border border-[#2e3150] rounded-xl"
                        >
                          <XCircle size={15} className="text-red-400 shrink-0" />
                          <span className="text-slate-300 text-sm">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.keywordsFound?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                      Keywords Found
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordsFound.map((k, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#242840] border border-[#2e3150] text-slate-300 text-xs font-medium rounded-full"
                        >
                          <KeyRound size={11} className="text-amber-400" />
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSChecker;