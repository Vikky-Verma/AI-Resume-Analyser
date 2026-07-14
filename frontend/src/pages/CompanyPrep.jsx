import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import {
  Building2,
  Search,
  Loader2,
  Info,
  ArrowUpDown,
  ChevronRight,
  ListChecks,
} from "lucide-react";

const DIFFICULTY_COLOR = {
  easy: "bg-emerald-500",
  medium: "bg-amber-500",
  hard: "bg-rose-500",
};

const MiniDifficultyBar = ({ breakdown = {}, total = 0 }) => {
  const easy = breakdown.easy || 0;
  const medium = breakdown.medium || 0;
  const hard = breakdown.hard || 0;
  const sum = total || easy + medium + hard || 1;

  return (
    <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-[#242840]">
      {easy > 0 && (
        <div className={DIFFICULTY_COLOR.easy} style={{ width: `${(easy / sum) * 100}%` }} />
      )}
      {medium > 0 && (
        <div className={DIFFICULTY_COLOR.medium} style={{ width: `${(medium / sum) * 100}%` }} />
      )}
      {hard > 0 && (
        <div className={DIFFICULTY_COLOR.hard} style={{ width: `${(hard / sum) * 100}%` }} />
      )}
    </div>
  );
};

const CompanyCard = ({ company, solved }) => {
  const total = company.totalQuestions || 0;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <Link
      to={`/company-prep/${company.slug}`}
      className="group relative bg-[#171a2c] border border-[#2e3150] hover:border-indigo-500/40 rounded-2xl p-5 transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <span className="text-indigo-400 font-bold text-xs">
              #{company.volumeRank}
            </span>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">{company.name}</p>
            <span className="text-[10px] font-semibold tracking-wide uppercase text-slate-500">
              {company.tier}
            </span>
          </div>
        </div>
        <ChevronRight
          size={16}
          className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span>{total} questions</span>
        {solved > 0 && (
          <span className="text-emerald-400 font-semibold">
            {solved}/{total} solved
          </span>
        )}
      </div>

      <MiniDifficultyBar breakdown={company.difficultyBreakdown} total={total} />

      {solved > 0 && (
        <div className="mt-2 h-1 rounded-full bg-[#242840] overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {company.topTopics?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {company.topTopics.map((topic) => (
            <span
              key={topic}
              className="px-2 py-0.5 rounded-md bg-[#20243b] text-[10px] font-medium text-slate-400"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};

const CompanyPrep = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [rankingMethod, setRankingMethod] = useState(null);
  const [progressSummary, setProgressSummary] = useState({});

  const [search, setSearch] = useState("");
  const [activeTier, setActiveTier] = useState("All");
  const [sortBy, setSortBy] = useState("rank"); // "rank" | "az"

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await API.get("/company-prep/companies");
        const { companies, tiers, rankingMethod, progressSummary } = res.data.data;
        setCompanies(companies || []);
        setTiers(tiers || []);
        setRankingMethod(rankingMethod || null);
        setProgressSummary(progressSummary || {});
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Couldn't load company prep data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filtered = useMemo(() => {
    let list = [...companies];

    if (activeTier !== "All") {
      list = list.filter((c) => c.tier === activeTier);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }

    if (sortBy === "az") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => a.volumeRank - b.volumeRank);
    }

    return list;
  }, [companies, activeTier, search, sortBy]);

  return (
    <div className="min-h-screen bg-[#07090f]">
      <div className="pointer-events-none fixed -top-40 -left-40 w-[32rem] h-[32rem] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none fixed top-40 -right-32 w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-[120px]" />

      <div className="relative">
        <Navbar />

        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-5">
            <Building2 size={13} className="text-indigo-400" />
            <span className="text-indigo-300 text-xs font-semibold tracking-wide">
              Company Prep
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Top {companies.length || 100} companies,{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-amber-300 bg-clip-text text-transparent">
              their most-asked questions.
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-3 max-w-2xl leading-relaxed">
            Pick a company to see its top interview questions, topic
            breakdown, and a preparation roadmap. Track what you've solved as
            you go.
          </p>

          {rankingMethod?.rankingMethod && (
            <div className="mt-5 flex items-start gap-2.5 bg-[#12141a] border border-[#22262f] rounded-xl px-4 py-3 max-w-2xl">
              <Info size={15} className="text-slate-500 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">
                {rankingMethod.rankingMethod}
                {rankingMethod.source && (
                  <>
                    {" "}
                    Source:{" "}
                    <span className="text-slate-400">{rankingMethod.source}</span>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="mt-8 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search companies..."
                className="w-full bg-[#12141a] border border-[#22262f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={() => setSortBy(sortBy === "rank" ? "az" : "rank")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12141a] border border-[#22262f] text-sm font-semibold text-slate-300 hover:text-white hover:border-indigo-500/40 transition-colors shrink-0"
            >
              <ArrowUpDown size={14} />
              {sortBy === "rank" ? "Sorted by rank" : "Sorted A–Z"}
            </button>
          </div>

          {/* Tier filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTier("All")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeTier === "All"
                  ? "bg-indigo-500 text-white"
                  : "bg-[#12141a] border border-[#22262f] text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            {tiers.map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setActiveTier(tier)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeTier === tier
                    ? "bg-indigo-500 text-white"
                    : "bg-[#12141a] border border-[#22262f] text-slate-400 hover:text-white"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={24} className="text-indigo-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ListChecks size={28} className="text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">
                No companies match "{search}".
              </p>
            </div>
          ) : (
            <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((company) => (
                <CompanyCard
                  key={company.slug}
                  company={company}
                  solved={progressSummary[company.slug] || 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyPrep;