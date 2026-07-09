const ScoreCard = ({ label, score, max = 100, color = "#6366f1" }) => {
  const pct = Math.min((score / max) * 100, 100);
  const r = 42;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="bg-[#11151d] border border-[#232838] rounded-2xl p-5 flex flex-col items-center gap-3">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" className="-rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#232838" strokeWidth="8" />
          <circle
            cx="48" cy="48" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>{score}</span>
          <span className="text-[10px] text-slate-500">/ {max}</span>
        </div>
      </div>
      <p className="text-xs font-600 text-slate-400 font-semibold text-center">{label}</p>
    </div>
  );
};

export default ScoreCard;