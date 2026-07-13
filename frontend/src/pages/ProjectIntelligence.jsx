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
} from "lucide-react";

const STEPS = ["Uploading Resume", "Parsing Document", "Analyzing Projects"];

const ProjectIntelligence = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  // ── Existing-resume picker (avoids duplicate uploads across sections) ──
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
    setStep(0);
  };

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <Navbar />

      {!result ? (
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Project Intelligence
            </h1>
            <p className="text-slate-400 mt-3">
              Upload your resume for a recruiter-grade breakdown of every
              project you've listed — strengths, gaps, and what to add.
            </p>
          </div>

          {analyzing ? (
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
          ) : (
            <div className="bg-[#11151d] border border-[#232838] rounded-2xl p-8 space-y-6">
              {!loadingResumes && existingResumes.length > 0 && (
                <div>
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
                            : "border-[#232838] bg-[#1a1f2e]"
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
                      !useExisting
                        ? "text-indigo-400"
                        : "text-slate-500 hover:text-indigo-400"
                    }`}
                  >
                    + Upload a new resume instead
                  </button>
                </div>
              )}

              {(!useExisting || existingResumes.length === 0) && (
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Upload Resume (PDF or DOCX)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="project-intelligence-file-input"
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files[0])}
                    />
                    <label
                      htmlFor="project-intelligence-file-input"
                      className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl cursor-pointer transition-all shrink-0"
                    >
                      Choose File
                    </label>
                    <span className="text-slate-400 text-sm truncate">
                      {file ? file.name : "No file chosen"}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAnalyze}
                className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <CloudUpload size={16} />
                Analyze Projects
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
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
  );
};

export default ProjectIntelligence;