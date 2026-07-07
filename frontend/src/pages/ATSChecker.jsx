import { useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import SkillBadge from "../components/SkillBadge";
import toast from "react-hot-toast";
import {
  ClipboardCheck,
  CloudUpload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Sparkles,
  Target,
  ChevronRight,
  Briefcase,
  ClipboardList,
} from "lucide-react";

const EXPERIENCE_LEVELS = [
  "Fresher",
  "Junior",
  "Mid-Level",
  "Senior",
  "Expert",
];

const verdictColor = (verdict = "") => {
  const v = verdict.toUpperCase();
  if (v.includes("STRONG HIRE")) return "#2dd4bf";
  if (v.includes("NO HIRE")) return "#f87171";
  if (v.includes("LEAN")) return "#facc15";
  return "#4ade80"; // HIRE
};

const scoreColor = (score) => {
  if (score >= 8) return "#4ade80";
  if (score >= 5) return "#facc15";
  return "#f87171";
};

const toArr = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    return JSON.parse(val);
  } catch {
    return String(val)
      .split(",")
      .map((s) => s.trim());
  }
};

const Panel = ({ title, icon, children, tone = "default" }) => {
  const toneClasses =
    tone === "danger"
      ? "bg-red-950/30 border-red-900/50"
      : "bg-[#11151d] border-[#232838]";
  const titleClasses = tone === "danger" ? "text-red-400" : "text-white";

  return (
    <div className={`border rounded-2xl p-6 ${toneClasses}`}>
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className={`font-bold text-sm ${titleClasses}`}>{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
};

const ATSChecker = () => {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [experienceLevel, setExperienceLevel] = useState("Fresher");

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [resumeId, setResumeId] = useState(null);

  // Job Description Match (folded in from the old Resume Analysis page)
  const [jobDesc, setJobDesc] = useState("");
  const [jobMatch, setJobMatch] = useState(null);
  const [matching, setMatching] = useState(false);

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
    if (!file) {
      toast.error("Please choose a resume file first");
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setJobMatch(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const { data: uploadData } = await API.post(
        "/resume/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      await API.post(`/resume/parse/${uploadData.resume.id}`);

      const { data } = await API.post(`/ats/${uploadData.resume.id}`, {
        targetRole,
        experienceLevel,
      });

      if (!data.success) {
        toast.error(data.message || "Analysis failed");
        setAnalyzing(false);
        return;
      }

      setResumeId(uploadData.resume.id);
      setResult(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "ATS check failed. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const runJobMatch = async () => {
    if (!jobDesc.trim()) {
      toast.error("Paste a job description first");
      return;
    }
    setMatching(true);
    try {
      const { data } = await API.post(`/career/match/${resumeId}`, {
        jobDescription: jobDesc,
      });
      setJobMatch(data);
      toast.success("Match analysis done!");
    } catch {
      toast.error("Job match failed");
    } finally {
      setMatching(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setResumeId(null);
    setJobDesc("");
    setJobMatch(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <Navbar />

      {!result ? (
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              ATS Resume Scanner
            </h1>
            <p className="text-slate-400 mt-3">
              Get brutal, FAANG-level feedback on your resume.
            </p>
          </div>

          <div className="bg-[#11151d] border border-[#232838] rounded-2xl p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Upload Resume (PDF)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="ats-file-input"
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
                <label
                  htmlFor="ats-file-input"
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl cursor-pointer transition-all shrink-0"
                >
                  Choose File
                </label>
                <span className="text-slate-400 text-sm truncate">
                  {file ? file.name : "No file chosen"}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full bg-[#0a0e14] border border-[#232838] rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-[#0a0e14] border border-[#232838] rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              >
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <CloudUpload size={16} />
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
          {/* Header */}
          <div className="bg-[#11151d] border border-[#232838] rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardCheck size={18} className="text-teal-400" />
                <h1 className="text-white font-extrabold text-xl">
                  ATS Evaluation Complete
                </h1>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Target Role: {result.targetRole} &nbsp;|&nbsp; Level:{" "}
                {result.experienceLevel}
                {result.domain && (
                  <>
                    {" "}
                    &nbsp;|&nbsp; Domain: {result.domain}
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-8">
              {result.resumeScore !== undefined && (
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-indigo-400">
                    {result.resumeScore}
                  </p>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                    Resume Score
                  </p>
                </div>
              )}
              <div className="text-right">
                <p
                  className="text-4xl font-extrabold"
                  style={{ color: verdictColor(result.verdict) }}
                >
                  {result.atsScore}
                </p>
                <p
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: verdictColor(result.verdict) }}
                >
                  {result.verdict}
                </p>
              </div>
            </div>
          </div>

          {/* Best Role Matches */}
          {result.bestRoleMatches?.length > 0 && (
            <Panel
              title="AI Career Advisor: Best Role Matches"
              icon={<Sparkles size={15} className="text-teal-400" />}
            >
              <div className="space-y-4">
                {result.bestRoleMatches.map((r, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-200 text-sm font-medium">
                        {r.role}
                      </span>
                      <span className="text-teal-400 text-xs font-bold">
                        {r.matchPercent}% Match
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#232838] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                        style={{ width: `${r.matchPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Best Fit Role + Recommended Roles */}
          {(result.bestFitRole || result.recommendedRoles?.length > 0) && (
            <Panel
              title="Career Recommendation"
              icon={<Target size={15} className="text-emerald-400" />}
            >
              {result.bestFitRole && (
                <div className="flex items-center justify-between bg-[#1a1f2e] rounded-xl px-4 py-3 mb-4">
                  <span className="text-slate-400 text-sm">Best Fit Role</span>
                  <span className="text-white font-bold text-sm">
                    {result.bestFitRole}
                  </span>
                </div>
              )}
              {result.recommendedRoles?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                    Recommended Roles
                  </p>
                  <div className="flex flex-wrap">
                    {result.recommendedRoles.map((r, i) => (
                      <SkillBadge key={i} skill={r} variant="green" />
                    ))}
                  </div>
                </div>
              )}
            </Panel>
          )}

          {/* Critical Issues */}
          {result.criticalIssues?.length > 0 && (
            <Panel
              title="Critical Issues Detected"
              icon={<AlertTriangle size={15} className="text-red-400" />}
              tone="danger"
            >
              <ul className="space-y-2">
                {result.criticalIssues.map((issue, i) => (
                  <li
                    key={i}
                    className="text-red-200/90 text-sm flex items-start gap-2"
                  >
                    <span className="text-red-400 mt-1">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {/* Category Breakdown */}
          {result.categoryBreakdown?.length > 0 && (
            <div>
              <h2 className="text-white font-bold text-sm mb-3">
                Category Breakdown
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {result.categoryBreakdown.map((cat, i) => (
                  <div
                    key={i}
                    className="bg-[#11151d] border border-[#232838] rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-200 text-sm font-bold">
                        {cat.category}
                      </span>
                      <span
                        className="text-sm font-extrabold"
                        style={{ color: scoreColor(cat.score) }}
                      >
                        {cat.score}/10
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {cat.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Found / Missing Skills */}
          {(toArr(result.skillsFound).length > 0 ||
            toArr(result.missingSkills).length > 0) && (
            <Panel title="Skills Overview">
              <div className="space-y-5">
                {toArr(result.skillsFound).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Skills Found
                    </p>
                    <div className="flex flex-wrap">
                      {toArr(result.skillsFound).map((s, i) => (
                        <SkillBadge key={i} skill={s} variant="purple" />
                      ))}
                    </div>
                  </div>
                )}
                {toArr(result.missingSkills).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Missing Skills
                    </p>
                    <div className="flex flex-wrap">
                      {toArr(result.missingSkills).map((s, i) => (
                        <SkillBadge key={i} skill={s} variant="red" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {/* Suggestions */}
          {toArr(result.suggestions).length > 0 && (
            <Panel
              title="Suggestions"
              icon={<Sparkles size={15} className="text-indigo-400" />}
            >
              <div className="space-y-2">
                {toArr(result.suggestions).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-[#1a1f2e] rounded-xl"
                  >
                    <ChevronRight
                      size={14}
                      className="text-indigo-400 mt-0.5 shrink-0"
                    />
                    <span className="text-slate-300 text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Skills To Learn + Career Roadmap */}
          {(toArr(result.skillsToLearn).length > 0 ||
            toArr(result.careerRoadmap).length > 0) && (
            <Panel
              title="Career Roadmap"
              icon={<Target size={15} className="text-emerald-400" />}
            >
              <div className="space-y-5">
                {toArr(result.skillsToLearn).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Skills To Learn
                    </p>
                    <div className="flex flex-wrap">
                      {toArr(result.skillsToLearn).map((s, i) => (
                        <SkillBadge key={i} skill={s} variant="yellow" />
                      ))}
                    </div>
                  </div>
                )}
                {toArr(result.careerRoadmap).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Roadmap
                    </p>
                    <div className="space-y-2">
                      {toArr(result.careerRoadmap).map((step, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 bg-[#1a1f2e] rounded-xl"
                        >
                          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {i + 1}
                          </div>
                          <span className="text-slate-300 text-sm">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {/* Line-by-Line Fixes */}
          {result.lineByLineFixes?.length > 0 && (
            <div>
              <h2 className="text-white font-bold text-sm mb-3">
                Line-by-Line Fixes
              </h2>
              <div className="space-y-4">
                {result.lineByLineFixes.map((fix, i) => (
                  <div
                    key={i}
                    className="bg-[#11151d] border border-[#232838] rounded-xl p-4 space-y-3"
                  >
                    <p className="text-slate-400 text-xs italic">
                      "{fix.reasoning}"
                    </p>
                    <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-3">
                      <p className="text-red-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                        Original (Remove)
                      </p>
                      <p className="text-red-200/80 text-sm">
                        {fix.original}
                      </p>
                    </div>
                    <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg p-3">
                      <p className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-1">
                        Rewrite (Add)
                      </p>
                      <p className="text-emerald-200/80 text-sm">
                        {fix.rewrite}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {result.missingKeywords?.length > 0 && (
            <Panel title="Missing Keywords">
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((k, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1f2e] border border-[#232838] text-slate-300 text-xs font-medium rounded-full"
                  >
                    <KeyRound size={11} className="text-indigo-400" />
                    {k}
                  </span>
                ))}
              </div>
            </Panel>
          )}

          {/* Job Description Match */}
          <Panel
            title="Job Description Match"
            icon={<Briefcase size={15} className="text-amber-400" />}
          >
            <textarea
              rows={4}
              placeholder="Paste the job description here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="w-full bg-[#1a1f2e] border border-[#232838] rounded-xl p-4 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-colors resize-y mb-3"
            />
            <button
              onClick={runJobMatch}
              disabled={matching}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
            >
              {matching ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Matching...
                </>
              ) : (
                <>
                  <ClipboardList size={15} /> Match Resume
                </>
              )}
            </button>

            {jobMatch && (
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-3xl font-extrabold text-amber-400">
                    {jobMatch.matchScore}
                    <span className="text-sm text-slate-500 font-semibold">
                      {" "}
                      / 100 Match Score
                    </span>
                  </p>
                </div>

                {jobMatch.matchedSkills?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Matched Skills
                    </p>
                    <div className="flex flex-wrap">
                      {jobMatch.matchedSkills.map((s, i) => (
                        <SkillBadge key={i} skill={s} variant="green" />
                      ))}
                    </div>
                  </div>
                )}

                {jobMatch.missingSkills?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Missing Skills
                    </p>
                    <div className="flex flex-wrap">
                      {jobMatch.missingSkills.map((s, i) => (
                        <SkillBadge key={i} skill={s} variant="red" />
                      ))}
                    </div>
                  </div>
                )}

                {jobMatch.suggestions?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Suggestions
                    </p>
                    <div className="space-y-2">
                      {jobMatch.suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 bg-[#1a1f2e] rounded-xl"
                        >
                          <ChevronRight
                            size={14}
                            className="text-amber-400 mt-0.5 shrink-0"
                          />
                          <span className="text-slate-300 text-sm">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Panel>

          <button
            type="button"
            onClick={reset}
            className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            Check Another Resume
          </button>
        </div>
      )}
    </div>
  );
};

export default ATSChecker;