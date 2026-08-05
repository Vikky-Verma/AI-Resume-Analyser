import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import {
  Loader2,
  Code2,
  Briefcase,
  Globe,
  AtSign,
  ExternalLink,
  FileQuestion,
  Sparkles,
} from "lucide-react";

const AVATAR_COLORS = [
  "#6366f1", "#0ea5e9", "#f59e0b", "#10b981", "#f43f5e", "#a855f7", "#14b8a6",
];

const avatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const LINK_META = {
  github: { icon: Code2, label: "GitHub" },
  linkedin: { icon: Briefcase, label: "LinkedIn" },
  website: { icon: Globe, label: "Website" },
  twitter: { icon: AtSign, label: "Twitter" },
};

const normalizeUrl = (url) => {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
    <FileQuestion size={32} className="text-slate-700 mb-4" />
    <h1 className="text-lg font-bold text-white mb-1.5">This portfolio isn't available</h1>
    <p className="text-slate-500 text-sm max-w-sm">
      The link may be private or the page has moved.
    </p>
    <Link
      to="/"
      className="mt-6 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
    >
      Go home
    </Link>
  </div>
);

const PortfolioPublic = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/portfolio/public/${slug}`);
        setPortfolio(res.data.data.portfolio);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={22} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (notFound || !portfolio) return <NotFound />;

  const links = Object.entries(portfolio.links || {}).filter(([, v]) => v);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-20">
        {/* Hero */}
        <div className="flex items-start gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ backgroundColor: avatarColor(portfolio.name) }}
          >
            {portfolio.name?.slice(0, 2).toUpperCase() || "P"}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {portfolio.name}
            </h1>
            {portfolio.headline && (
              <p className="text-indigo-400 text-sm font-medium mt-1">{portfolio.headline}</p>
            )}
          </div>
        </div>

        {portfolio.bio && (
          <p className="text-slate-400 text-[15px] leading-relaxed mt-6 max-w-2xl">
            {portfolio.bio}
          </p>
        )}

        {links.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 mt-6">
            {links.map(([key, value]) => {
              const meta = LINK_META[key] || { icon: Globe, label: key };
              const Icon = meta.icon;
              return (
                <a
                  key={key}
                  href={normalizeUrl(value)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-[#12141c] border border-[#20222c] hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-medium rounded-lg px-3 py-2 transition-colors"
                >
                  <Icon size={13} />
                  {meta.label}
                </a>
              );
            })}
          </div>
        )}

        {portfolio.skills?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {portfolio.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-[#12141c] border border-[#20222c] text-slate-300 text-xs font-medium px-2.5 py-1.5 rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {portfolio.projects?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Projects
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {portfolio.projects.map((project, idx) => (
                <div
                  key={idx}
                  className="bg-[#12141c] border border-[#20222c] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-semibold text-sm">{project.name}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {project.github && (
                        <a href={normalizeUrl(project.github)} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white">
                          <Code2 size={13} />
                        </a>
                      )}
                      {project.link && (
                        <a href={normalizeUrl(project.link)} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-400">
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-slate-500 text-[12.5px] leading-relaxed mt-1.5">
                      {project.description}
                    </p>
                  )}

                  {project.techStack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10.5px] font-medium text-slate-500 bg-[#0e0f16] border border-[#1c1e28] rounded px-1.5 py-0.5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 pt-6 border-t border-[#1c1e28] flex items-center justify-center gap-1.5">
          <Sparkles size={11} className="text-slate-700" />
          <p className="text-[11px] text-slate-700">Built with AI Resume Analyser</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPublic;