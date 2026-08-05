import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  Loader2,
  Plus,
  X,
  Trash2,
  Copy,
  ExternalLink,
  Sparkles,
  Code2,
  Briefcase,
  Globe,
  AtSign,
  Save,
} from "lucide-react";

const PUBLIC_BASE =
  (import.meta.env.VITE_APP_URL || window.location.origin) + "/portfolio/";

const EMPTY_PROJECT = { name: "", techStack: [], description: "", link: "", github: "" };

const TagInput = ({ tags, onChange, placeholder }) => {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim();
    if (value && !tags.includes(value)) onChange([...tags, value]);
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-[#12141c] border border-[#20222c] rounded-lg px-2.5 py-2 focus-within:border-indigo-500/60 transition-colors">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 bg-[#1c1e28] text-slate-300 text-[11px] font-medium px-2 py-1 rounded-md"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="text-slate-500 hover:text-rose-400"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={placeholder}
        className="flex-1 min-w-[100px] bg-transparent text-sm text-slate-200 focus:outline-none py-0.5"
      />
    </div>
  );
};

const ProjectEditor = ({ project, index, onChange, onRemove }) => (
  <div className="bg-[#12141c] border border-[#20222c] rounded-xl p-4 space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
        Project {index + 1}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-[#1c1e28]"
      >
        <Trash2 size={13} />
      </button>
    </div>

    <input
      type="text"
      value={project.name}
      onChange={(e) => onChange({ ...project, name: e.target.value })}
      placeholder="Project name"
      className="w-full bg-[#0e0f16] border border-[#20222c] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-colors"
    />

    <textarea
      value={project.description}
      onChange={(e) => onChange({ ...project, description: e.target.value })}
      rows={2}
      placeholder="What does it do?"
      className="w-full bg-[#0e0f16] border border-[#20222c] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-colors resize-none"
    />

    <TagInput
      tags={project.techStack || []}
      onChange={(techStack) => onChange({ ...project, techStack })}
      placeholder="Add tech, press Enter"
    />

    <div className="grid grid-cols-2 gap-2.5">
      <input
        type="text"
        value={project.link || ""}
        onChange={(e) => onChange({ ...project, link: e.target.value })}
        placeholder="Live link"
        className="w-full bg-[#0e0f16] border border-[#20222c] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-colors"
      />
      <input
        type="text"
        value={project.github || ""}
        onChange={(e) => onChange({ ...project, github: e.target.value })}
        placeholder="GitHub link"
        className="w-full bg-[#0e0f16] border border-[#20222c] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-colors"
      />
    </div>
  </div>
);

const PortfolioBuilder = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [portfolioRes, resumesRes] = await Promise.all([
          API.get("/portfolio/me"),
          API.get("/resume/my-resumes"),
        ]);
        setPortfolio(portfolioRes.data.data.portfolio);
        setResumes(resumesRes.data.resumes || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Couldn't load your portfolio.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const publicUrl = useMemo(
    () => (portfolio ? `${PUBLIC_BASE}${portfolio.slug}` : ""),
    [portfolio]
  );

  const updateField = (field) => (value) =>
    setPortfolio((p) => ({ ...p, [field]: value }));

  const updateLink = (key) => (e) =>
    setPortfolio((p) => ({ ...p, links: { ...p.links, [key]: e.target.value } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { headline, bio, skills, projects, links, slug } = portfolio;
      const res = await API.put("/portfolio/me", { headline, bio, skills, projects, links, slug });
      setPortfolio(res.data.data.portfolio);
      toast.success("Portfolio saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save changes");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    setPublishing(true);
    try {
      const res = await API.patch("/portfolio/me/publish", { isPublic: !portfolio.isPublic });
      setPortfolio(res.data.data.portfolio);
      toast.success(res.data.data.portfolio.isPublic ? "Portfolio is now public" : "Portfolio is now private");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update visibility");
    } finally {
      setPublishing(false);
    }
  };

  const handleImport = async () => {
    if (!selectedResumeId) {
      toast.error("Pick a resume to import from");
      return;
    }
    setImporting(true);
    try {
      const res = await API.post("/portfolio/import", { resumeId: selectedResumeId });
      setPortfolio(res.data.data.portfolio);
      toast.success("Pulled skills and projects from your resume");
    } catch (err) {
      toast.error(err.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copied");
  };

  const addProject = () =>
    setPortfolio((p) => ({ ...p, projects: [...(p.projects || []), { ...EMPTY_PROJECT }] }));

  const updateProject = (idx) => (next) =>
    setPortfolio((p) => ({
      ...p,
      projects: p.projects.map((proj, i) => (i === idx ? next : proj)),
    }));

  const removeProject = (idx) =>
    setPortfolio((p) => ({ ...p, projects: p.projects.filter((_, i) => i !== idx) }));

  if (loading || !portfolio) {
    return (
      <div className="min-h-screen bg-[#07080c]">
        <div className="flex items-center justify-center py-32">
          <Loader2 size={22} className="text-indigo-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080c]">

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#1c1e28]">
          <div>
            <h1 className="text-xl font-bold text-white">Portfolio Builder</h1>
            <p className="text-slate-500 text-[13px] mt-1">
              A public page recruiters can open — built from your resume and projects.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePublishToggle}
              disabled={publishing}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-60 ${
                portfolio.isPublic
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-[#12141c] border-[#20222c] text-slate-400"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${portfolio.isPublic ? "bg-emerald-400" : "bg-slate-600"}`} />
              {portfolio.isPublic ? "Public" : "Private"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm rounded-lg px-4 py-2 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          </div>
        </div>

        {/* Public link */}
        <div className="mt-5 flex items-center gap-2 bg-[#12141c] border border-[#20222c] rounded-xl px-4 py-3">
          <span className="text-xs text-slate-500 truncate flex-1">{publicUrl}</span>
          <button
            type="button"
            onClick={copyLink}
            className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-[#1c1e28] shrink-0"
          >
            <Copy size={14} />
          </button>
          {portfolio.isPublic && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-[#1c1e28] shrink-0"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Import from resume */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="flex-1 bg-[#12141c] border border-[#20222c] rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/60"
          >
            <option value="">Select a resume to import from...</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>{r.originalName}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="flex items-center justify-center gap-2 bg-[#12141c] border border-[#20222c] hover:border-indigo-500/40 text-slate-300 hover:text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-60 shrink-0"
          >
            {importing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Import skills & projects
          </button>
        </div>

        {/* Slug */}
        <div className="mt-6">
          <label className="text-[11px] font-medium text-slate-500 mb-1.5 block">Public link</label>
          <div className="flex items-center gap-0 bg-[#12141c] border border-[#20222c] rounded-lg overflow-hidden focus-within:border-indigo-500/60">
            <span className="pl-3 text-xs text-slate-600 whitespace-nowrap">{PUBLIC_BASE}</span>
            <input
              type="text"
              value={portfolio.slug}
              onChange={(e) => updateField("slug")(e.target.value)}
              className="flex-1 bg-transparent px-1 py-2.5 text-sm text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Headline + bio */}
        <div className="mt-4">
          <label className="text-[11px] font-medium text-slate-500 mb-1.5 block">Headline</label>
          <input
            type="text"
            value={portfolio.headline || ""}
            onChange={(e) => updateField("headline")(e.target.value)}
            placeholder="Full-Stack Developer | Building products people use"
            className="w-full bg-[#12141c] border border-[#20222c] rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
        </div>

        <div className="mt-4">
          <label className="text-[11px] font-medium text-slate-500 mb-1.5 block">Bio</label>
          <textarea
            value={portfolio.bio || ""}
            onChange={(e) => updateField("bio")(e.target.value)}
            rows={4}
            placeholder="A short summary of who you are and what you build."
            className="w-full bg-[#12141c] border border-[#20222c] rounded-lg px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-colors resize-none"
          />
        </div>

        {/* Skills */}
        <div className="mt-4">
          <label className="text-[11px] font-medium text-slate-500 mb-1.5 block">Skills</label>
          <TagInput
            tags={portfolio.skills || []}
            onChange={updateField("skills")}
            placeholder="Add a skill, press Enter"
          />
        </div>

        {/* Links */}
        <div className="mt-6">
          <label className="text-[11px] font-medium text-slate-500 mb-1.5 block">Links</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2 bg-[#12141c] border border-[#20222c] rounded-lg px-3 focus-within:border-indigo-500/60">
              <Code2 size={14} className="text-slate-500 shrink-0" />
              <input
                type="text"
                value={portfolio.links?.github || ""}
                onChange={updateLink("github")}
                placeholder="github.com/you"
                className="flex-1 bg-transparent py-2.5 text-sm text-slate-200 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-[#12141c] border border-[#20222c] rounded-lg px-3 focus-within:border-indigo-500/60">
              <Briefcase size={14} className="text-slate-500 shrink-0" />
              <input
                type="text"
                value={portfolio.links?.linkedin || ""}
                onChange={updateLink("linkedin")}
                placeholder="linkedin.com/in/you"
                className="flex-1 bg-transparent py-2.5 text-sm text-slate-200 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-[#12141c] border border-[#20222c] rounded-lg px-3 focus-within:border-indigo-500/60">
              <Globe size={14} className="text-slate-500 shrink-0" />
              <input
                type="text"
                value={portfolio.links?.website || ""}
                onChange={updateLink("website")}
                placeholder="yoursite.com"
                className="flex-1 bg-transparent py-2.5 text-sm text-slate-200 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-[#12141c] border border-[#20222c] rounded-lg px-3 focus-within:border-indigo-500/60">
              <AtSign size={14} className="text-slate-500 shrink-0" />
              <input
                type="text"
                value={portfolio.links?.twitter || ""}
                onChange={updateLink("twitter")}
                placeholder="x.com/you"
                className="flex-1 bg-transparent py-2.5 text-sm text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-medium text-slate-500 block">Projects</label>
            <button
              type="button"
              onClick={addProject}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <Plus size={13} />
              Add project
            </button>
          </div>

          {(!portfolio.projects || portfolio.projects.length === 0) ? (
            <div className="bg-[#12141c] border border-dashed border-[#20222c] rounded-xl py-8 text-center">
              <p className="text-[12px] text-slate-600">No projects yet — add one or import from a resume.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {portfolio.projects.map((project, idx) => (
                <ProjectEditor
                  key={idx}
                  project={project}
                  index={idx}
                  onChange={updateProject(idx)}
                  onRemove={() => removeProject(idx)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm rounded-lg px-5 py-2.5 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioBuilder;
