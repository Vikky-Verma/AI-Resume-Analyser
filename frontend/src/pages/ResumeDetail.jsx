import { useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import ScoreCard from "../components/ScoreCard";
import SkillBadge from "../components/SkillBadge";
import toast from "react-hot-toast";
import {
  Cpu,
  Target,
  Briefcase,
  Download,
  Loader2,
  ChevronRight,
  Sparkles,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

const Section = ({
  icon,
  title,
  iconBg = "bg-indigo-950",
  iconColor = "text-indigo-400",
  children,
}) => (
  <div className="bg-[#1a1d2e] border border-[#2e3150] rounded-2xl p-6 mb-5">
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <h3 className="text-white font-bold text-base">{title}</h3>
    </div>
    {children}
  </div>
);

const ResumeDetail = () => {
  const { resumeId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [career, setCareer] = useState(null);
  const [jobMatch, setJobMatch] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingCareer, setLoadingCareer] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [notResume, setNotResume] = useState(null);

  const parseAndAnalyze = async () => {
    setLoadingAnalysis(true);
    setNotResume(null);
    try {
      try {
        await API.post(`/resume/parse/${resumeId}`);
      } catch (_) {}

      const { data } = await API.post(`/analysis/${resumeId}`);
      setAnalysis(data.analysis);
      toast.success("Analysis complete!");
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.isResume === false) {
        setNotResume(
          errData.message || "This document does not appear to be a resume or CV."
        );
      } else {
        toast.error("Analysis failed");
      }
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const runCareer = async () => {
    setLoadingCareer(true);
    try {
      const { data } = await API.get(`/career/${resumeId}`);
      setCareer(data);
      toast.success("Career advice ready!");
    } catch {
      toast.error("Career analysis failed");
    } finally {
      setLoadingCareer(false);
    }
  };

  const runJobMatch = async () => {
    if (!jobDesc.trim()) {
      toast.error("Enter a job description");
      return;
    }
    setLoadingMatch(true);
    try {
      const { data } = await API.post(`/career/match/${resumeId}`, {
        jobDescription: jobDesc,
      });
      setJobMatch(data);
      toast.success("Match analysis done!");
    } catch {
      toast.error("Job match failed");
    } finally {
      setLoadingMatch(false);
    }
  };

  const downloadReport = async () => {
    setLoadingReport(true);
    try {
      const params = new URLSearchParams();
      if (jobMatch) {
        params.append("matchScore", jobMatch.matchScore);
        params.append("matchedSkills", JSON.stringify(jobMatch.matchedSkills || []));
        params.append("missingSkills", JSON.stringify(jobMatch.missingSkills || []));
        params.append("suggestions", JSON.stringify(jobMatch.suggestions || []));
      }

      const res = await API.get(`/report/${resumeId}?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-report-${resumeId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded!");
    } catch {
      toast.error("Download failed");
    } finally {
      setLoadingReport(false);
    }
  };

  const toArr = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      return JSON.parse(val);
    } catch {
      return String(val).split(",").map((s) => s.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Resume Analysis</h1>
            <p className="text-slate-400 text-sm mt-1">Run each analysis step below</p>
          </div>
          <button
            onClick={downloadReport}
            disabled={loadingReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1d2e] border border-[#2e3150] hover:border-indigo-500/50 text-slate-300 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            {loadingReport ? (
              <><Loader2 size={15} className="animate-spin" /> Generating...</>
            ) : (
              <><Download size={15} /> Download Report</>
            )}
          </button>
        </div>

        <Section
          icon={<Cpu size={16} />}
          title="AI Resume Analysis"
          iconBg="bg-indigo-950"
          iconColor="text-indigo-400"
        >
          {!analysis ? (
            <div className="flex flex-col gap-4">
              <button
                onClick={parseAndAnalyze}
                disabled={loadingAnalysis}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all w-fit"
              >
                {loadingAnalysis ? (
                  <><Loader2 size={15} className="animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles size={15} /> Run AI Analysis</>
                )}
              </button>

              {notResume && (
                <div className="flex items-start gap-4 p-4 bg-red-950/30 border border-red-800/50 rounded-xl">
                  <div className="w-9 h-9 bg-red-950 border border-red-800 rounded-lg flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-red-400 font-semibold text-sm mb-1">Not a Resume</p>
                    <p className="text-slate-400 text-sm leading-relaxed">{notResume}</p>
                    <p className="text-slate-500 text-xs mt-2">
                      Please go back and upload a valid resume or CV (PDF/DOCX).
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <ScoreCard label="Resume Score" score={analysis.score} color="#6366f1" />
                <ScoreCard label="ATS Score" score={analysis.atsScore} color="#10b981" />
              </div>

              {toArr(analysis.skills).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Skills Found</p>
                  <div className="flex flex-wrap">
                    {toArr(analysis.skills).map((s, i) => (
                      <SkillBadge key={i} skill={s} variant="purple" />
                    ))}
                  </div>
                </div>
              )}

              {toArr(analysis.missingSkills).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Missing Skills</p>
                  <div className="flex flex-wrap">
                    {toArr(analysis.missingSkills).map((s, i) => (
                      <SkillBadge key={i} skill={s} variant="red" />
                    ))}
                  </div>
                </div>
              )}

              {toArr(analysis.suggestions).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Suggestions</p>
                  <div className="space-y-2">
                    {toArr(analysis.suggestions).map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-[#242840] rounded-xl">
                        <ChevronRight size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                        <span className="text-slate-300 text-sm">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Section>

        <Section
          icon={<Target size={16} />}
          title="Career Recommendation"
          iconBg="bg-emerald-950"
          iconColor="text-emerald-400"
        >
          {!career ? (
            <button
              onClick={runCareer}
              disabled={loadingCareer}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
            >
              {loadingCareer ? (
                <><Loader2 size={15} className="animate-spin" /> Analyzing...</>
              ) : (
                <><Target size={15} /> Get Career Advice</>
              )}
            </button>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-[#242840] rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-amber-400" />
                  <span className="text-slate-400 text-sm">Best Fit Role</span>
                </div>
                <span className="text-white font-bold text-sm">{career.bestFitRole}</span>
              </div>

              {career.recommendedRoles?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Recommended Roles</p>
                  <div className="flex flex-wrap">
                    {career.recommendedRoles.map((r, i) => (
                      <SkillBadge key={i} skill={r} variant="green" />
                    ))}
                  </div>
                </div>
              )}

              {career.skillsToLearn?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Skills to Learn</p>
                  <div className="flex flex-wrap">
                    {career.skillsToLearn.map((s, i) => (
                      <SkillBadge key={i} skill={s} variant="yellow" />
                    ))}
                  </div>
                </div>
              )}

              {career.roadmap?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Career Roadmap</p>
                  <div className="space-y-2">
                    {career.roadmap.map((step, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-[#242840] rounded-xl">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-slate-300 text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Section>

        <Section
          icon={<Briefcase size={16} />}
          title="Job Description Match"
          iconBg="bg-amber-950"
          iconColor="text-amber-400"
        >
          <textarea
            rows={4}
            placeholder="Paste the job description here..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            className="w-full bg-[#242840] border border-[#2e3150] rounded-xl p-4 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-colors resize-y mb-3"
          />
          <button
            onClick={runJobMatch}
            disabled={loadingMatch}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
          >
            {loadingMatch ? (
              <><Loader2 size={15} className="animate-spin" /> Matching...</>
            ) : (
              <><ClipboardList size={15} /> Match Resume</>
            )}
          </button>

          {jobMatch && (
            <div className="mt-6 space-y-6">
              <div className="w-fit">
                <ScoreCard label="Match Score" score={jobMatch.matchScore} color="#f59e0b" />
              </div>

              {jobMatch.matchedSkills?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Matched Skills</p>
                  <div className="flex flex-wrap">
                    {jobMatch.matchedSkills.map((s, i) => (
                      <SkillBadge key={i} skill={s} variant="green" />
                    ))}
                  </div>
                </div>
              )}

              {jobMatch.missingSkills?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Missing Skills</p>
                  <div className="flex flex-wrap">
                    {jobMatch.missingSkills.map((s, i) => (
                      <SkillBadge key={i} skill={s} variant="red" />
                    ))}
                  </div>
                </div>
              )}

              {jobMatch.suggestions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Suggestions</p>
                  <div className="space-y-2">
                    {jobMatch.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-[#242840] rounded-xl">
                        <ChevronRight size={14} className="text-amber-400 mt-0.5 shrink-0" />
                        <span className="text-slate-300 text-sm">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Section>

      </div>
    </div>
  );
};

export default ResumeDetail;