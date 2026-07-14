import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  Check,
  Search,
  Map,
  Tag,
} from "lucide-react";

const DIFFICULTY_STYLE = {
  Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Hard: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

const DifficultyBar = ({ label, value, total, colorClass }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-semibold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#242840] overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const QuestionRow = ({ question, solved, onToggle, updating }) => {
  const title = question.title || question.name || "Untitled question";
  const difficulty = question.difficulty || "Medium";
  const link = question.link || question.url;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
        solved
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-[#12141a] border-[#22262f] hover:border-[#2e3150]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={updating}
        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 ${
          solved
            ? "bg-emerald-500 border-emerald-500"
            : "border-[#3a3f5c] hover:border-indigo-400"
        }`}
      >
        {solved && <Check size={13} className="text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            solved ? "text-slate-400 line-through" : "text-slate-200"
          }`}
        >
          {title}
        </p>
        {question.topic && (
          <p className="text-[11px] text-slate-500 mt-0.5">{question.topic}</p>
        )}
      </div>

      {question.frequency != null && (
        <span className="hidden sm:block text-[11px] text-slate-500 shrink-0">
          {typeof question.frequency === "number"
            ? `${question.frequency <= 1 ? Math.round(question.frequency * 100) : Math.round(question.frequency)}% freq`
            : question.frequency}
        </span>
      )}

      <span
        className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border shrink-0 ${
          DIFFICULTY_STYLE[difficulty] || DIFFICULTY_STYLE.Medium
        }`}
      >
        {difficulty}
      </span>

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-indigo-400 transition-colors shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={15} />
        </a>
      )}
    </div>
  );
};

const CompanyPrepDetail = () => {
  const { slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [solvedIds, setSolvedIds] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [hideSolved, setHideSolved] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/company-prep/companies/${slug}`);
        const data = res.data.data;
        setCompany(data);
        setSolvedIds(data.solvedIds || []);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Couldn't load this company."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [slug]);

  const questions = company?.questions || [];

  const topics = useMemo(() => {
    const set = new Set(questions.map((q) => q.topic).filter(Boolean));
    return [...set].sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    let list = [...questions];

    if (difficultyFilter !== "All") {
      list = list.filter((q) => (q.difficulty || "Medium") === difficultyFilter);
    }
    if (topicFilter !== "All") {
      list = list.filter((q) => q.topic === topicFilter);
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((q) => (q.title || q.name || "").toLowerCase().includes(s));
    }
    if (hideSolved) {
      list = list.filter((q) => !solvedIds.includes(q.id));
    }

    return list;
  }, [questions, difficultyFilter, topicFilter, search, hideSolved, solvedIds]);

  const handleToggle = async (questionId) => {
    const isSolved = solvedIds.includes(questionId);
    const next = isSolved
      ? solvedIds.filter((id) => id !== questionId)
      : [...solvedIds, questionId];

    setSolvedIds(next); // optimistic
    setUpdatingId(questionId);

    try {
      const res = await API.post(`/company-prep/companies/${slug}/progress`, {
        questionId,
        solved: !isSolved,
      });
      setSolvedIds(res.data.data.solvedIds || next);
    } catch (err) {
      setSolvedIds(solvedIds); // revert
      toast.error(err.response?.data?.message || "Couldn't save progress.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090f]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 size={24} className="text-indigo-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[#07090f]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <p className="text-slate-400">Company not found.</p>
          <Link
            to="/company-prep"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <ArrowLeft size={14} /> Back to companies
          </Link>
        </div>
      </div>
    );
  }

  const total = company.totalQuestions || questions.length;
  const solvedCount = solvedIds.length;
  const diff = company.difficultyBreakdown || {};

  return (
    <div className="min-h-screen bg-[#07090f]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link
          to="/company-prep"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-400 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to companies
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <span className="text-indigo-400 font-bold text-sm">
                #{company.volumeRank}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {company.name}
                </h1>
                <span className="text-[10px] font-semibold tracking-wide uppercase text-slate-400 bg-[#171a2c] border border-[#2e3150] rounded-full px-2.5 py-1">
                  {company.tier}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {total} top questions · ranked by reported interview volume
              </p>
            </div>
          </div>

          <div className="bg-[#171a2c] border border-[#2e3150] rounded-xl px-5 py-3 text-right shrink-0">
            <p className="text-2xl font-bold text-white">
              {solvedCount}
              <span className="text-slate-500 text-base font-medium">/{total}</span>
            </p>
            <p className="text-[11px] text-slate-500">solved</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          {/* Left: question list */}
          <div>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full bg-[#12141a] border border-[#22262f] rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-[#12141a] border border-[#22262f] rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="All">All difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              {topics.length > 0 && (
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  className="bg-[#12141a] border border-[#22262f] rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="All">All topics</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => setHideSolved((v) => !v)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors shrink-0 ${
                  hideSolved
                    ? "bg-indigo-500 border-indigo-500 text-white"
                    : "bg-[#12141a] border-[#22262f] text-slate-400 hover:text-white"
                }`}
              >
                Hide solved
              </button>
            </div>

            {/* Questions */}
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-sm">
                No questions match your filters.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredQuestions.map((q) => (
                  <QuestionRow
                    key={q.id}
                    question={q}
                    solved={solvedIds.includes(q.id)}
                    updating={updatingId === q.id}
                    onToggle={() => handleToggle(q.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: sidebar stats */}
          <div className="space-y-5">
            <div className="bg-[#171a2c] border border-[#2e3150] rounded-2xl p-5">
              <p className="text-sm font-semibold text-white mb-4">
                Difficulty breakdown
              </p>
              <div className="space-y-3.5">
                <DifficultyBar
                  label="Easy"
                  value={diff.easy || 0}
                  total={total}
                  colorClass="bg-emerald-500"
                />
                <DifficultyBar
                  label="Medium"
                  value={diff.medium || 0}
                  total={total}
                  colorClass="bg-amber-500"
                />
                <DifficultyBar
                  label="Hard"
                  value={diff.hard || 0}
                  total={total}
                  colorClass="bg-rose-500"
                />
              </div>
            </div>

            {company.topicBreakdown?.length > 0 && (
              <div className="bg-[#171a2c] border border-[#2e3150] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={14} className="text-indigo-400" />
                  <p className="text-sm font-semibold text-white">
                    Topics covered
                  </p>
                </div>
                <div className="space-y-2.5">
                  {company.topicBreakdown.slice(0, 8).map((t) => (
                    <div
                      key={t.topic}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-400">{t.topic}</span>
                      <span className="text-slate-500 font-semibold">
                        {t.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {company.roadmap?.length > 0 && (
              <div className="bg-[#171a2c] border border-[#2e3150] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Map size={14} className="text-amber-400" />
                  <p className="text-sm font-semibold text-white">
                    Prep roadmap
                  </p>
                </div>
                <ul className="space-y-3">
                  {company.roadmap.map((step, i) => (
                    <li key={i} className="flex gap-3 text-xs">
                      <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-slate-400 leading-relaxed">
                        {step.title || step}
                        {step.description && (
                          <span className="block text-slate-500 mt-0.5">
                            {step.description}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPrepDetail;