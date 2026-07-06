import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import {
  Mic,
  FileText,
  Building2,
  BriefcaseBusiness,
  GraduationCap,
  Sparkles,
  Loader2,
  ChevronRight,
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

const MockInterviewSetup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [resumeId, setResumeId] = useState(searchParams.get("resumeId") || "");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Fresher");
  const [submitting, setSubmitting] = useState(false);
  const [loadingLine, setLoadingLine] = useState(0);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const { data } = await API.get("/resume/my-resumes");
        setResumes(data.resumes || []);
        if (!resumeId && data.resumes?.length) {
          setResumeId(data.resumes[0].id);
        }
      } catch {
        toast.error("Failed to load resumes");
      } finally {
        setLoadingResumes(false);
      }
    };
    fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!submitting) return;
    const interval = setInterval(() => {
      setLoadingLine((prev) => Math.min(prev + 1, LOADING_LINES.length - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [submitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeId) {
      toast.error("Please select a resume");
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
        resumeId,
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
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl p-6 space-y-6"
          >
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                <FileText size={13} /> Resume
              </label>
              {loadingResumes ? (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Loader2 size={14} className="animate-spin" /> Loading resumes...
                </div>
              ) : resumes.length === 0 ? (
                <p className="text-sm text-slate-500">
                  You need to upload a resume first from the Dashboard.
                </p>
              ) : (
                <select
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="w-full bg-[#242840] border border-[#2e3150] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500 transition-colors"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.originalName}
                    </option>
                  ))}
                </select>
              )}
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
              disabled={resumes.length === 0}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all"
            >
              <Sparkles size={16} /> Generate Interview <ChevronRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MockInterviewSetup;