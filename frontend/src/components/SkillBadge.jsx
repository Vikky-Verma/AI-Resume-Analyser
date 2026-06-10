const variants = {
  purple: "bg-indigo-950 text-indigo-300 border border-indigo-800",
  green:  "bg-emerald-950 text-emerald-300 border border-emerald-800",
  yellow: "bg-amber-950  text-amber-300  border border-amber-800",
  red:    "bg-red-950    text-red-300    border border-red-800",
};

const SkillBadge = ({ skill, variant = "purple" }) => (
  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold m-1 ${variants[variant]}`}>
    {skill}
  </span>
);

export default SkillBadge;