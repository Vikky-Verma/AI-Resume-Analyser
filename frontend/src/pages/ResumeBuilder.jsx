import { useEffect, useMemo, useState, useCallback } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import ResumePreview from "../components/resumeBuilder/ResumePreview";
import { RESUME_TEMPLATES, getTemplate } from "../data/resumeTemplates";
import { COMPANY_PRESETS, getCompanyPreset } from "../data/companyPresets";
import {
  Loader2,
  Plus,
  X,
  Trash2,
  Save,
  Download,
  Palette,
  Building2,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Sparkles as SkillsIcon,
  Trophy,
  Award,
  ChevronRight,
  Check,
} from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 10);

const blankResume = () => ({
  title: "Untitled Resume",
  templateId: "classic",
  companyId: "general",
  personalInfo: {
    fullName: "",
    role: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
  },
  summary: "",
  experience: [],
  education: [],
  projects: [],
  skills: [],
  achievements: [],
  certifications: [],
});

const SECTIONS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "skills", label: "Skills", icon: SkillsIcon },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "certifications", label: "Certifications", icon: Award },
];

const inputCls =
  "w-full bg-[#0e0f16] border border-[#20222c] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-colors";
const labelCls = "text-[11px] font-medium text-slate-500 mb-1.5 block";
const cardCls = "bg-[#12141c] border border-[#20222c] rounded-xl p-4 space-y-3";

const TagInput = ({ tags, onChange, placeholder }) => {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const value = draft.trim();
    if (value && !tags.includes(value)) onChange([...tags, value]);
    setDraft("");
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-[#0e0f16] border border-[#20222c] rounded-lg px-2.5 py-2 focus-within:border-indigo-500/60 transition-colors">
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 bg-[#1c1e28] text-slate-300 text-[11px] font-medium px-2 py-1 rounded-md">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} className="text-slate-500 hover:text-rose-400">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && tags.length > 0) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={placeholder}
        className="flex-1 min-w-[100px] bg-transparent text-sm text-slate-200 focus:outline-none py-0.5"
      />
    </div>
  );
};

const BulletList = ({ bullets = [], onChange, placeholder }) => {
  const update = (i, val) => onChange(bullets.map((b, idx) => (idx === i ? val : b)));
  const remove = (i) => onChange(bullets.filter((_, idx) => idx !== i));
  const add = () => onChange([...bullets, ""]);
  return (
    <div className="space-y-1.5">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={b}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-[#0e0f16] border border-[#20222c] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/60"
          />
          <button type="button" onClick={() => remove(i)} className="p-1 text-slate-500 hover:text-rose-400 shrink-0">
            <X size={13} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300">
        <Plus size={12} /> Add bullet point
      </button>
    </div>
  );
};

const EntryCard = ({ index, label, onRemove, children }) => (
  <div className={cardCls}>
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label} {index + 1}</span>
      <button type="button" onClick={onRemove} className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-[#1c1e28]">
        <Trash2 size={13} />
      </button>
    </div>
    {children}
  </div>
);

const ResumeBuilder = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [resume, setResume] = useState(blankResume());
  const [activeSection, setActiveSection] = useState("personal");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);

  const template = getTemplate(resume.templateId);
  const companyPreset = getCompanyPreset(resume.companyId);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get("/resume-builder");
        const list = res.data.data.resumes || [];
        setResumes(list);
        if (list.length > 0) {
          setCurrentId(list[0].id);
          setResume({ ...blankResume(), ...list[0] });
        } else {
          const created = await API.post("/resume-builder", blankResume());
          setResumes([created.data.data.resume]);
          setCurrentId(created.data.data.resume.id);
          setResume({ ...blankResume(), ...created.data.data.resume });
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Couldn't load your resumes.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const patch = useCallback((fields) => setResume((r) => ({ ...r, ...fields })), []);
  const patchPersonal = (field) => (e) =>
    setResume((r) => ({ ...r, personalInfo: { ...r.personalInfo, [field]: e.target.value } }));

  const addEntry = (section, template) =>
    setResume((r) => ({ ...r, [section]: [...(r[section] || []), { id: uid(), ...template }] }));
  const updateEntry = (section, id, fields) =>
    setResume((r) => ({ ...r, [section]: r[section].map((e) => (e.id === id ? { ...e, ...fields } : e)) }));
  const removeEntry = (section, id) =>
    setResume((r) => ({ ...r, [section]: r[section].filter((e) => e.id !== id) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, userId, createdAt, updatedAt, ...body } = resume;
      const res = await API.put(`/resume-builder/${currentId}`, body);
      const saved = res.data.data.resume;
      setResume((r) => ({ ...r, ...saved }));
      setResumes((list) => list.map((r) => (r.id === currentId ? saved : r)));
      toast.success("Resume saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleNewResume = async () => {
    try {
      const res = await API.post("/resume-builder", blankResume());
      const created = res.data.data.resume;
      setResumes((list) => [created, ...list]);
      setCurrentId(created.id);
      setResume({ ...blankResume(), ...created });
      setActiveSection("personal");
      toast.success("New resume created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't create a new resume");
    }
  };

  const handleSwitchResume = async (id) => {
    if (id === currentId) return;
    try {
      const res = await API.get(`/resume-builder/${id}`);
      setCurrentId(id);
      setResume({ ...blankResume(), ...res.data.data.resume });
      setActiveSection("personal");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't load that resume");
    }
  };

  const applyCompanyPreset = (companyId) => {
    const preset = getCompanyPreset(companyId);
    patch({ companyId, templateId: preset.recommendedTemplate });
    setShowCompanies(false);
  };

  const handleDownload = () => window.print();

  const renderSection = () => {
    switch (activeSection) {
      case "personal":
        return (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Full name</label>
                <input className={inputCls} value={resume.personalInfo.fullName} onChange={patchPersonal("fullName")} placeholder="Jane Doe" />
              </div>
              <div>
                <label className={labelCls}>Target role / title</label>
                <input className={inputCls} value={resume.personalInfo.role} onChange={patchPersonal("role")} placeholder="Software Engineer" />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} value={resume.personalInfo.email} onChange={patchPersonal("email")} placeholder="jane@email.com" />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={resume.personalInfo.phone} onChange={patchPersonal("phone")} placeholder="+1 555 010 2030" />
              </div>
              <div>
                <label className={labelCls}>Location</label>
                <input className={inputCls} value={resume.personalInfo.location} onChange={patchPersonal("location")} placeholder="Bangalore, India" />
              </div>
              <div>
                <label className={labelCls}>LinkedIn</label>
                <input className={inputCls} value={resume.personalInfo.linkedin} onChange={patchPersonal("linkedin")} placeholder="linkedin.com/in/jane" />
              </div>
              <div>
                <label className={labelCls}>GitHub</label>
                <input className={inputCls} value={resume.personalInfo.github} onChange={patchPersonal("github")} placeholder="github.com/jane" />
              </div>
              <div>
                <label className={labelCls}>Website / Portfolio</label>
                <input className={inputCls} value={resume.personalInfo.website} onChange={patchPersonal("website")} placeholder="jane.dev" />
              </div>
            </div>
          </div>
        );

      case "summary":
        return (
          <div className="space-y-2">
            <label className={labelCls}>Professional summary</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={6}
              value={resume.summary}
              onChange={(e) => patch({ summary: e.target.value })}
              placeholder={companyPreset.summaryHint}
            />
            <p className="text-[11px] text-slate-500">
              Tip for {companyPreset.name}: {companyPreset.summaryHint}
            </p>
          </div>
        );

      case "experience":
        return (
          <div className="space-y-3">
            {resume.experience.map((exp, i) => (
              <EntryCard key={exp.id} index={i} label="Experience" onRemove={() => removeEntry("experience", exp.id)}>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <input className={inputCls} value={exp.role} onChange={(e) => updateEntry("experience", exp.id, { role: e.target.value })} placeholder="Role / Title" />
                  <input className={inputCls} value={exp.company} onChange={(e) => updateEntry("experience", exp.id, { company: e.target.value })} placeholder="Company" />
                  <input className={inputCls} value={exp.location} onChange={(e) => updateEntry("experience", exp.id, { location: e.target.value })} placeholder="Location" />
                  <div className="flex items-center gap-2">
                    <input className={inputCls} value={exp.startDate} onChange={(e) => updateEntry("experience", exp.id, { startDate: e.target.value })} placeholder="Start (e.g. Jan 2023)" />
                    <input className={inputCls} value={exp.endDate} disabled={exp.current} onChange={(e) => updateEntry("experience", exp.id, { endDate: e.target.value })} placeholder="End" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-400">
                  <input type="checkbox" checked={!!exp.current} onChange={(e) => updateEntry("experience", exp.id, { current: e.target.checked })} />
                  Currently working here
                </label>
                <div>
                  <label className={labelCls}>Bullet points</label>
                  <BulletList bullets={exp.bullets} onChange={(bullets) => updateEntry("experience", exp.id, { bullets })} placeholder={companyPreset.bulletHint} />
                </div>
              </EntryCard>
            ))}
            <button
              type="button"
              onClick={() => addEntry("experience", { role: "", company: "", location: "", startDate: "", endDate: "", current: false, bullets: [] })}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <Plus size={13} /> Add experience
            </button>
          </div>
        );

      case "education":
        return (
          <div className="space-y-3">
            {resume.education.map((ed, i) => (
              <EntryCard key={ed.id} index={i} label="Education" onRemove={() => removeEntry("education", ed.id)}>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <input className={inputCls} value={ed.school} onChange={(e) => updateEntry("education", ed.id, { school: e.target.value })} placeholder="School / University" />
                  <input className={inputCls} value={ed.degree} onChange={(e) => updateEntry("education", ed.id, { degree: e.target.value })} placeholder="Degree (e.g. B.Tech)" />
                  <input className={inputCls} value={ed.field} onChange={(e) => updateEntry("education", ed.id, { field: e.target.value })} placeholder="Field of study" />
                  <input className={inputCls} value={ed.gpa} onChange={(e) => updateEntry("education", ed.id, { gpa: e.target.value })} placeholder="GPA (optional)" />
                  <input className={inputCls} value={ed.startDate} onChange={(e) => updateEntry("education", ed.id, { startDate: e.target.value })} placeholder="Start year" />
                  <input className={inputCls} value={ed.endDate} onChange={(e) => updateEntry("education", ed.id, { endDate: e.target.value })} placeholder="End year" />
                </div>
              </EntryCard>
            ))}
            <button
              type="button"
              onClick={() => addEntry("education", { school: "", degree: "", field: "", gpa: "", startDate: "", endDate: "" })}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <Plus size={13} /> Add education
            </button>
          </div>
        );

      case "projects":
        return (
          <div className="space-y-3">
            {resume.projects.map((p, i) => (
              <EntryCard key={p.id} index={i} label="Project" onRemove={() => removeEntry("projects", p.id)}>
                <input className={inputCls} value={p.name} onChange={(e) => updateEntry("projects", p.id, { name: e.target.value })} placeholder="Project name" />
                <textarea className={`${inputCls} resize-none`} rows={2} value={p.description} onChange={(e) => updateEntry("projects", p.id, { description: e.target.value })} placeholder="What does it do?" />
                <TagInput tags={p.techStack || []} onChange={(techStack) => updateEntry("projects", p.id, { techStack })} placeholder="Add tech, press Enter" />
                <div className="grid grid-cols-2 gap-2.5">
                  <input className={inputCls} value={p.link || ""} onChange={(e) => updateEntry("projects", p.id, { link: e.target.value })} placeholder="Live link" />
                  <input className={inputCls} value={p.github || ""} onChange={(e) => updateEntry("projects", p.id, { github: e.target.value })} placeholder="GitHub link" />
                </div>
                <div>
                  <label className={labelCls}>Bullet points</label>
                  <BulletList bullets={p.bullets || []} onChange={(bullets) => updateEntry("projects", p.id, { bullets })} placeholder="Impact-focused detail" />
                </div>
              </EntryCard>
            ))}
            <button
              type="button"
              onClick={() => addEntry("projects", { name: "", techStack: [], description: "", bullets: [], link: "", github: "" })}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <Plus size={13} /> Add project
            </button>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-3">
            {resume.skills.map((group, i) => (
              <EntryCard key={group.id} index={i} label="Skill group" onRemove={() => removeEntry("skills", group.id)}>
                <input className={inputCls} value={group.category} onChange={(e) => updateEntry("skills", group.id, { category: e.target.value })} placeholder="Category (e.g. Languages, Tools)" />
                <TagInput tags={group.items || []} onChange={(items) => updateEntry("skills", group.id, { items })} placeholder="Add a skill, press Enter" />
              </EntryCard>
            ))}
            <button
              type="button"
              onClick={() => addEntry("skills", { category: "", items: [] })}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <Plus size={13} /> Add skill group
            </button>
          </div>
        );

      case "achievements":
        return (
          <div className="space-y-2.5">
            {resume.achievements.map((a, i) => (
              <div key={a.id} className="flex items-center gap-2">
                <input
                  className={inputCls}
                  value={a.text}
                  onChange={(e) => updateEntry("achievements", a.id, { text: e.target.value })}
                  placeholder={`Achievement ${i + 1}`}
                />
                <button type="button" onClick={() => removeEntry("achievements", a.id)} className="p-1 text-slate-500 hover:text-rose-400 shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addEntry("achievements", { text: "" })}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <Plus size={13} /> Add achievement
            </button>
          </div>
        );

      case "certifications":
        return (
          <div className="space-y-3">
            {resume.certifications.map((c, i) => (
              <EntryCard key={c.id} index={i} label="Certification" onRemove={() => removeEntry("certifications", c.id)}>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <input className={inputCls} value={c.name} onChange={(e) => updateEntry("certifications", c.id, { name: e.target.value })} placeholder="Certification name" />
                  <input className={inputCls} value={c.issuer} onChange={(e) => updateEntry("certifications", c.id, { issuer: e.target.value })} placeholder="Issuer" />
                  <input className={inputCls} value={c.date} onChange={(e) => updateEntry("certifications", c.id, { date: e.target.value })} placeholder="Date" />
                </div>
              </EntryCard>
            ))}
            <button
              type="button"
              onClick={() => addEntry("certifications", { name: "", issuer: "", date: "" })}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <Plus size={13} /> Add certification
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117]">

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <input
              value={resume.title}
              onChange={(e) => patch({ title: e.target.value })}
              className="bg-transparent text-xl font-bold text-white focus:outline-none border-b border-transparent focus:border-[#20222c] px-1"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={currentId || ""}
              onChange={(e) => handleSwitchResume(e.target.value)}
              className="bg-[#12141c] border border-[#20222c] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/60"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.title || "Untitled Resume"}</option>
              ))}
            </select>
            <button onClick={handleNewResume} className="flex items-center gap-1.5 bg-[#12141c] border border-[#20222c] hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-semibold rounded-lg px-3 py-2 transition-colors">
              <Plus size={13} /> New
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs rounded-lg px-4 py-2 transition-colors disabled:opacity-60">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
            </button>
            <button onClick={handleDownload} className="flex items-center gap-2 bg-[#12141c] border border-[#20222c] hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs font-semibold rounded-lg px-4 py-2 transition-colors">
              <Download size={13} /> Download PDF
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 mt-4">
          <div className="relative">
            <button
              onClick={() => { setShowTemplates((s) => !s); setShowCompanies(false); }}
              className="flex items-center gap-2 bg-[#12141c] border border-[#20222c] hover:border-indigo-500/40 rounded-lg px-3.5 py-2 text-xs text-slate-300"
            >
              <Palette size={13} style={{ color: template.accent }} /> Template: <span className="font-semibold text-white">{template.name}</span>
              <ChevronRight size={12} className={`transition-transform ${showTemplates ? "rotate-90" : ""}`} />
            </button>
            {showTemplates && (
              <div className="absolute z-20 mt-2 w-[560px] max-w-[90vw] bg-[#12141c] border border-[#20222c] rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 shadow-2xl">
                {RESUME_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { patch({ templateId: t.id }); setShowTemplates(false); }}
                    className={`text-left p-3 rounded-lg border transition-colors ${resume.templateId === t.id ? "border-indigo-500/60 bg-[#181b26]" : "border-[#20222c] hover:border-indigo-500/30"}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accent }} />
                      {resume.templateId === t.id && <Check size={13} className="text-indigo-400" />}
                    </div>
                    <p className="text-xs font-semibold text-white">{t.name}</p>
                    <p className="text-[10.5px] text-slate-500 mt-0.5 leading-snug">{t.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => { setShowCompanies((s) => !s); setShowTemplates(false); }}
              className="flex items-center gap-2 bg-[#12141c] border border-[#20222c] hover:border-indigo-500/40 rounded-lg px-3.5 py-2 text-xs text-slate-300"
            >
              <Building2 size={13} style={{ color: companyPreset.color }} /> Target: <span className="font-semibold text-white">{companyPreset.name}</span>
              <ChevronRight size={12} className={`transition-transform ${showCompanies ? "rotate-90" : ""}`} />
            </button>
            {showCompanies && (
              <div className="absolute z-20 mt-2 w-[320px] bg-[#12141c] border border-[#20222c] rounded-xl p-2 space-y-1 shadow-2xl">
                {COMPANY_PRESETS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => applyCompanyPreset(c.id)}
                    className={`w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg transition-colors ${resume.companyId === c.id ? "bg-[#181b26]" : "hover:bg-[#181b26]"}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-xs font-medium text-slate-200">{c.name}</span>
                    {resume.companyId === c.id && <Check size={13} className="ml-auto text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 bg-[#12141c] border border-[#20222c] rounded-xl p-3.5">
          <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Tips for {companyPreset.name}</p>
          <ul className="text-[11.5px] text-slate-400 space-y-1 list-disc list-inside">
            {companyPreset.tips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-16 grid lg:grid-cols-[220px_1fr_auto] gap-5">
        <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeSection === s.id ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30" : "text-slate-400 hover:bg-[#12141c] border border-transparent"
              }`}
            >
              <s.icon size={14} /> {s.label}
            </button>
          ))}
        </div>

        <div className="min-w-0">{renderSection()}</div>

        <div className="hidden xl:block">
          <div className="sticky top-6 origin-top" style={{ transform: "scale(0.55)", transformOrigin: "top" }}>
            <ResumePreview resume={resume} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
