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

const VERDICT_STYLE = {
  "Strong Hire": { bg: "bg-emerald-950", border: "border-emerald-800", text: "text-emerald-400" },
  Hire: { bg: "bg-teal-950", border: "border-teal-800", text: "text-teal-400" },
  "Leaning No Hire": { bg: "bg-amber-950", border: "border-amber-800", text: "text-amber-400" },
  "No Hire": { bg: "bg-red-950", border: "border-red-800", text: "text-red-400" },
};

const MockInterviewSetup = () => {
  const navigate = useNavigate();

  // Step 1: this section's OWN resume upload — independent of Resume Analysis
  const [uploadedResume, setUploadedResume] = useState(null); // { id, originalName }
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-violet-950 border border-violet-800 rounded-xl flex items-center justify-center">
            <Mic size={18} className="text-violet-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Mock Interview</h1>
        </div>
        <p className="text-slate-400 text-sm mb-8 ml-[52px]">
          3 rounds — HR, Technical &amp; DSA — 5 questions each, generated from
          your resume.
        </p>

        {submitting ? (
          <div className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl p-14 flex flex-col items-center gap-5">
            <Loader2 size={40} className="text-violet-400 animate-spin" />
            <div className="text-center">
              <p className="text-white font-semibold">{LOADING_LINES[loadingLine]}</p>
              <p className="text-slate-500 text-xs mt-2">
                This can take 15–30 seconds
              </p>
            </div>
          </div>
        ) : !uploadedResume ? (
          /* ── Step 1: Own Upload — independent of Resume Analysis ── */
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
              dragOver ? "border-violet-500 bg-violet-950/20" : ""
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={40} className="text-violet-400 animate-spin" />
                <p className="text-slate-400 text-sm">Uploading your resume...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#242840] rounded-2xl flex items-center justify-center">
                  <CloudUpload size={28} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-xl">
                    Upload Your Resume
                  </p>
                  <p className="text-slate-500 text-sm mt-2 max-w-sm">
                    Upload a PDF or DOCX — we'll use it to generate personalized
                    interview questions
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3 mt-2">
                  <input
                    id="mock-interview-file-input"
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files[0])}
                  />
                  <label
                    htmlFor="mock-interview-file-input"
                    className="px-4 py-2 bg-[#242840] border border-[#2e3150] hover:border-violet-500/50 text-slate-300 text-sm font-medium rounded-xl cursor-pointer transition-all"
                  >
                    Choose File
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("mock-interview-file-input")
                        .click()
                    }
                    className="w-full sm:w-auto px-8 py-3 bg-violet-500 hover:bg-violet-600 text-white text-sm font-bold rounded-xl transition-all"
                  >
                    Upload Resume
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Step 2: Company / Role / Level ── */
          <form
            onSubmit={handleSubmit}
            className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl p-6 space-y-6"
          >
            <div className="flex items-center justify-between gap-3 bg-[#242840] rounded-xl px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="text-slate-300 text-sm truncate">
                  {uploadedResume.originalName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUploadedResume(null)}
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
                className="w-full bg-[#242840] border border-[#2e3150] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 transition-colors"
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
                className="w-full bg-[#242840] border border-[#2e3150] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 transition-colors"
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
                        : "bg-[#242840] border-[#2e3150] hover:border-violet-500/40"
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
          </form>
        )}

        {/* ── Past Interviews — this section's own history ── */}
        {!submitting && (
          <div className="mt-12">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              Past Interviews
            </p>

            {loadingInterviews ? (
              <div className="flex justify-center py-10">
                <Loader2 size={26} className="text-violet-400 animate-spin" />
              </div>
            ) : interviews.length === 0 ? (
              <div className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl p-8 text-center">
                <Mic size={32} className="text-[#2e3150] mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  No mock interviews yet — your history will show up here.
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviewSetup;