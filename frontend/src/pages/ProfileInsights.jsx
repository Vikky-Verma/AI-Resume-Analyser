import { useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import SkillBadge from "../components/SkillBadge";
import toast from "react-hot-toast";
import {
  Radar,
  CloudUpload,
  Loader2,
  CheckCircle2,
  Github,
  Linkedin,
  Code2,
  Trophy,
  ChefHat,
  Terminal,
  BookOpen,
  ExternalLink,
  FolderGit2,
  ChevronRight,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";

const STEPS = [
  "Uploading Resume",
  "Parsing Document",
  "Scanning Coding Profiles",
  "Analyzing Projects",
];

const PLATFORM_ICON = {
  GitHub: Github,
  LinkedIn: Linkedin,
  LeetCode: Code2,
  Codeforces: Trophy,
  CodeChef: ChefHat,
  HackerRank: Terminal,
  GeeksforGeeks: BookOpen,
};

const PLATFORM_COLOR = {
  GitHub: { bg: "bg-slate-800", border: "border-slate-600", text: "text-slate-200" },
  LinkedIn: { bg: "bg-sky-950", border: "border-sky-800", text: "text-sky-400" },
  LeetCode: { bg: "bg-amber-950", border: "border-amber-800", text: "text-amber-400" },
  Codeforces: { bg: "bg-red-950", border: "border-red-800", text: "text-red-400" },
  CodeChef: { bg: "bg-orange-950", border: "border-orange-800", text: "text-orange-400" },
  HackerRank: { bg: "bg-emerald-950", border: "border-emerald-800", text: "text-emerald-400" },
  GeeksforGeeks: { bg: "bg-green-950", border: "border-green-800", text: "text-green-400" },
};

const statLabel = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

const ProfileInsights = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

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
    setStep(0);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const { data: uploadData } = await API.post(
        "/resume/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setStep(1);
      await API.post(`/resume/parse/${uploadData.resume.id}`);

      setStep(2);
      const { data } = await API.post(
        `/profile-insights/${uploadData.resume.id}`
      );

      if (!data.success) {
        toast.error(data.message || "Analysis failed");
        setAnalyzing(false);
        return;
      }

      setStep(3);
      await new Promise((r) => setTimeout(r, 400));

      setResult(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Profile insights analysis failed. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0e14]">
      <Navbar />

      {!result ? (
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Profile Insights
            </h1>
            <p className="text-slate-400 mt-3">
              We scan your resume for coding profiles &amp; analyze your
              projects — no manual entry needed.
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
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Upload Resume (PDF or DOCX)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="profile-insights-file-input"
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                  <label
                    htmlFor="profile-insights-file-input"
                    className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl cursor-pointer transition-all shrink-0"
                  >
                    Choose File
                  </label>
                  <span className="text-slate-400 text-sm truncate">
                    {file ? file.name : "No file chosen"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(PLATFORM_ICON).map(([name, Icon]) => (
                  <span
                    key={name}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1f2e] border border-[#232838] text-slate-400 text-xs font-medium rounded-full"
                  >
                    <Icon size={12} />
                    {name}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <CloudUpload size={16} />
                Scan Profiles &amp; Projects
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
          {/* Header */}
          <div className="bg-[#11151d] border border-[#232838] rounded-2xl p-6">
            <div className="flex items-center gap-2">
              <Radar size={18} className="text-indigo-400" />
              <h1 className="text-white font-extrabold text-xl">
                Profile Insights Report
              </h1>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Coding profiles detected from your resume, with live stats
              where available, plus a breakdown of your projects.
            </p>
          </div>

          {/* Coding & Social Profiles */}
          <div>
            <h2 className="text-white font-bold text-sm mb-3">
              Coding &amp; Social Profiles
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {result.profiles.map((p, i) => {
                const Icon = PLATFORM_ICON[p.platform] || Code2;
                const c = PLATFORM_COLOR[p.platform] || PLATFORM_COLOR.GitHub;

                return (
                  <div
                    key={i}
                    className={`bg-[#11151d] border rounded-xl p-5 ${
                      p.detected ? "border-[#232838]" : "border-[#1a1d28] opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}
                        >
                          <Icon size={16} className={c.text} />
                        </div>
                        <span className="text-white font-bold text-sm">
                          {p.platform}
                        </span>
                      </div>
                      {p.detected && p.profileUrl && (
                        <a
                          href={p.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>

                    {!p.detected ? (
                      <p className="text-slate-600 text-xs">
                        Not found in resume
                      </p>
                    ) : p.statsAvailable ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        {Object.entries(p.stats).map(([key, val]) => {
                          if (key === "topLanguages") {
                            return (
                              <div key={key} className="col-span-2">
                                <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-1">
                                  Top Languages
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {(val || []).map((lang, li) => (
                                    <span
                                      key={li}
                                      className="px-2 py-0.5 bg-[#1a1f2e] text-slate-300 text-[10px] rounded-full"
                                    >
                                      {lang}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={key}>
                              <p className="text-slate-500 text-[10px] uppercase tracking-wide">
                                {statLabel(key)}
                              </p>
                              <p className="text-slate-200 text-sm font-bold">
                                {val}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Handle:{" "}
                        <span className="text-slate-300 font-semibold">
                          {p.handle}
                        </span>
                        <br />
                        {p.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Deep-Dive */}
          <div>
            <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <FolderGit2 size={15} className="text-indigo-400" />
              Project Deep-Dive
            </h2>

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
                      <h3 className="text-white font-bold text-base">
                        {proj.name}
                      </h3>
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

          {/* Overall Project Suggestions */}
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

          <button
            type="button"
            onClick={reset}
            className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            Scan Another Resume
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileInsights;