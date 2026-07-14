import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import {
  Plus,
  Loader2,
  X,
  Trash2,
  Pencil,
  Link as LinkIcon,
  Calendar,
  AlertTriangle,
  Briefcase,
  Send,
  Trophy,
  Clock,
} from "lucide-react";

const COLUMNS = [
  { key: "applied", label: "Applied", accent: "#64748b" },
  { key: "oa", label: "Online Assessment", accent: "#38bdf8" },
  { key: "interview", label: "Interview", accent: "#fbbf24" },
  { key: "offer", label: "Offer", accent: "#34d399" },
  { key: "rejected", label: "Rejected", accent: "#fb7185" },
];

const AVATAR_COLORS = [
  "#6366f1", "#0ea5e9", "#f59e0b", "#10b981", "#f43f5e", "#a855f7", "#14b8a6",
];

const avatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const EMPTY_FORM = { company: "", role: "", link: "", deadline: "", notes: "" };

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  const ms = target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
};

const DeadlineBadge = ({ deadline }) => {
  if (!deadline) return null;
  const d = daysUntil(deadline);
  const label = new Date(deadline).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  let classes = "text-slate-500";
  if (d < 0) classes = "text-rose-400";
  else if (d <= 3) classes = "text-amber-400";

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${classes}`}>
      <Calendar size={11} />
      {d < 0 ? "Overdue" : d === 0 ? "Due today" : label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, tint }) => (
  <div className="flex items-center gap-3.5 bg-[#12141c] border border-[#20222c] rounded-xl px-4 py-3.5">
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${tint}1a`, color: tint }}
    >
      <Icon size={16} />
    </div>
    <div>
      <p className="text-xl font-bold text-white leading-none">{value}</p>
      <p className="text-[11px] text-slate-500 mt-1">{label}</p>
    </div>
  </div>
);

const ApplicationCard = ({ app, onEdit, onDelete, onDragStart, onDragOver, onDrop, dragging }) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, app)}
    onDragOver={(e) => onDragOver(e, app)}
    onDrop={(e) => onDrop(e, app)}
    onClick={() => onEdit(app)}
    className={`group bg-[#12141c] border border-[#20222c] hover:border-[#2e3140] rounded-lg p-3 cursor-grab active:cursor-grabbing transition-colors ${
      dragging ? "opacity-40" : "opacity-100"
    }`}
  >
    <div className="flex items-start gap-2.5">
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-xs font-bold text-white"
        style={{ backgroundColor: avatarColor(app.company) }}
      >
        {app.company.slice(0, 2).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-white font-semibold text-[13px] leading-tight truncate">{app.company}</p>
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5 -mr-0.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(app); }}
              className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-[#1c1e28]"
            >
              <Pencil size={11} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(app); }}
              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-[#1c1e28]"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
        <p className="text-slate-500 text-[12px] leading-tight mt-0.5">{app.role}</p>
      </div>
    </div>

    {app.notes && (
      <p className="text-[11px] text-slate-500 leading-relaxed mt-2.5 line-clamp-2">{app.notes}</p>
    )}

    {(app.deadline || app.link) && (
      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#1c1e28]">
        <DeadlineBadge deadline={app.deadline} />
        {app.link && (
          <a
            href={app.link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-slate-500 hover:text-indigo-400 transition-colors"
          >
            <LinkIcon size={12} />
          </a>
        )}
      </div>
    )}
  </div>
);

const ApplicationModal = ({ initial, onClose, onSave, onDelete }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?.id);

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md bg-[#0e0f16] border border-[#20222c] rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c1e28]">
          <h2 className="text-[15px] font-semibold text-white">
            {isEdit ? "Edit application" : "New application"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#1c1e28]"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1.5 block">Company</label>
              <input
                type="text"
                value={form.company}
                onChange={handleChange("company")}
                placeholder="Google"
                className="w-full bg-[#12141c] border border-[#20222c] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1.5 block">Role</label>
              <input
                type="text"
                value={form.role}
                onChange={handleChange("role")}
                placeholder="SDE Intern"
                className="w-full bg-[#12141c] border border-[#20222c] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1.5 block">Job link</label>
              <input
                type="text"
                value={form.link || ""}
                onChange={handleChange("link")}
                placeholder="https://..."
                className="w-full bg-[#12141c] border border-[#20222c] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 mb-1.5 block">Deadline</label>
              <input
                type="date"
                value={form.deadline ? form.deadline.slice(0, 10) : ""}
                onChange={handleChange("deadline")}
                className="w-full bg-[#12141c] border border-[#20222c] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-500 mb-1.5 block">Notes</label>
            <textarea
              value={form.notes || ""}
              onChange={handleChange("notes")}
              rows={3}
              placeholder="Referral, recruiter contact, prep notes..."
              className="w-full bg-[#12141c] border border-[#20222c] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm rounded-lg py-2.5 transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save changes" : "Add application"}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={() => onDelete(initial)}
                className="px-3 py-2.5 rounded-lg border border-[#20222c] text-slate-500 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const InternshipTracker = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [modalApp, setModalApp] = useState(null);
  const [draggedApp, setDraggedApp] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await API.get("/applications");
        setApplications(res.data.data.applications || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Couldn't load your applications.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const grouped = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.key, []]));
    [...applications]
      .sort((a, b) => a.position - b.position)
      .forEach((app) => {
        if (map[app.status]) map[app.status].push(app);
      });
    return map;
  }, [applications]);

  const stats = useMemo(() => {
    const total = applications.length;
    const active = applications.filter((a) => !["offer", "rejected"].includes(a.status)).length;
    const offers = applications.filter((a) => a.status === "offer").length;
    const overdue = applications.filter(
      (a) => a.deadline && !["offer", "rejected"].includes(a.status) && daysUntil(a.deadline) < 0
    ).length;
    return { total, active, offers, overdue };
  }, [applications]);

  const upcomingDeadlines = useMemo(() => {
    return applications
      .filter((a) => a.deadline && !["offer", "rejected"].includes(a.status))
      .map((a) => ({ ...a, days: daysUntil(a.deadline) }))
      .filter((a) => a.days <= 3)
      .sort((a, b) => a.days - b.days);
  }, [applications]);

  const handleSave = async (form) => {
    try {
      if (modalApp?.id) {
        const res = await API.patch(`/applications/${modalApp.id}`, form);
        setApplications((prev) =>
          prev.map((a) => (a.id === modalApp.id ? res.data.data.application : a))
        );
        toast.success("Application updated");
      } else {
        const res = await API.post("/applications", form);
        setApplications((prev) => [...prev, res.data.data.application]);
        toast.success("Application added");
      }
      setModalApp(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (app) => {
    try {
      await API.delete(`/applications/${app.id}`);
      setApplications((prev) => prev.filter((a) => a.id !== app.id));
      toast.success("Application removed");
      setModalApp(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete application");
    }
  };

  const handleDragStart = (e, app) => {
    setDraggedApp(app);
    e.dataTransfer.effectAllowed = "move";
  };

  const reorderLocally = (targetStatus, targetIndex) => {
    if (!draggedApp) return;
    setApplications((prev) => {
      const withoutDragged = prev.filter((a) => a.id !== draggedApp.id);
      const columnItems = withoutDragged
        .filter((a) => a.status === targetStatus)
        .sort((a, b) => a.position - b.position);
      const rest = withoutDragged.filter((a) => a.status !== targetStatus);

      const updatedDragged = { ...draggedApp, status: targetStatus };
      columnItems.splice(targetIndex, 0, updatedDragged);
      const renumbered = columnItems.map((a, idx) => ({ ...a, position: idx }));

      return [...rest, ...renumbered];
    });
  };

  const handleCardDragOver = (e, overApp) => {
    e.preventDefault();
    if (!draggedApp || draggedApp.id === overApp.id) return;
    const targetIndex = grouped[overApp.status].findIndex((a) => a.id === overApp.id);
    if (targetIndex === -1) return;
    reorderLocally(overApp.status, targetIndex);
  };

  const handleColumnDragOver = (e, columnKey) => {
    e.preventDefault();
    setDragOverColumn(columnKey);
  };

  const persistMove = async (app, status) => {
    const columnItems = grouped[status] || [];
    const position = columnItems.findIndex((a) => a.id === app.id);
    try {
      await API.patch(`/applications/${app.id}/move`, {
        status,
        position: position === -1 ? columnItems.length : position,
      });
    } catch (err) {
      toast.error("Couldn't save the new position");
    }
  };

  const handleColumnDrop = (e, columnKey) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedApp) return;
    if (draggedApp.status !== columnKey || grouped[columnKey].length === 0) {
      reorderLocally(columnKey, grouped[columnKey]?.length || 0);
    }
    persistMove(draggedApp, columnKey);
    setDraggedApp(null);
  };

  const handleCardDrop = (e, overApp) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumn(null);
    if (!draggedApp) return;
    persistMove(draggedApp, overApp.status);
    setDraggedApp(null);
  };

  return (
    <div className="min-h-screen bg-[#07080c]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#1c1e28]">
          <div>
            <h1 className="text-xl font-bold text-white">Internship Tracker</h1>
            <p className="text-slate-500 text-[13px] mt-1">
              Track every application from first submit to final offer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalApp({})}
            className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-colors shrink-0"
          >
            <Plus size={15} />
            Add application
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <StatCard icon={Briefcase} label="Total applications" value={stats.total} tint="#818cf8" />
          <StatCard icon={Send} label="Active" value={stats.active} tint="#38bdf8" />
          <StatCard icon={Trophy} label="Offers" value={stats.offers} tint="#34d399" />
          <StatCard icon={Clock} label="Overdue" value={stats.overdue} tint="#fb7185" />
        </div>

        {upcomingDeadlines.length > 0 && (
          <div className="mt-4 flex items-center gap-2.5 bg-[#171310] border border-amber-500/20 rounded-xl px-4 py-2.5">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <p className="text-[12.5px] text-amber-300/90">
              {upcomingDeadlines.length} deadline{upcomingDeadlines.length > 1 ? "s" : ""} coming up:{" "}
              {upcomingDeadlines
                .slice(0, 3)
                .map((a) => `${a.company} (${a.days < 0 ? "overdue" : a.days === 0 ? "today" : `${a.days}d`})`)
                .join(", ")}
            </p>
          </div>
        )}

        {/* Board */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={22} className="text-indigo-400 animate-spin" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {COLUMNS.map((col) => (
              <div
                key={col.key}
                onDragOver={(e) => handleColumnDragOver(e, col.key)}
                onDrop={(e) => handleColumnDrop(e, col.key)}
                className={`rounded-xl border p-2.5 min-h-[20rem] transition-colors ${
                  dragOverColumn === col.key
                    ? "border-indigo-500/40 bg-indigo-500/[0.03]"
                    : "border-[#1c1e28] bg-[#0a0b11]"
                }`}
              >
                <div
                  className="flex items-center justify-between px-1.5 pb-2.5 mb-2 border-b-2"
                  style={{ borderColor: `${col.accent}33` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.accent }} />
                    <span className="text-[12px] font-semibold text-slate-300">{col.label}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 tabular-nums">
                    {grouped[col.key].length}
                  </span>
                </div>

                <div className="space-y-2">
                  {grouped[col.key].length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-[11px] text-slate-700">No applications</p>
                    </div>
                  ) : (
                    grouped[col.key].map((app) => (
                      <ApplicationCard
                        key={app.id}
                        app={app}
                        onEdit={setModalApp}
                        onDelete={handleDelete}
                        onDragStart={handleDragStart}
                        onDragOver={handleCardDragOver}
                        onDrop={handleCardDrop}
                        dragging={draggedApp?.id === app.id}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalApp && (
        <ApplicationModal
          initial={modalApp.id ? modalApp : null}
          onClose={() => setModalApp(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default InternshipTracker;