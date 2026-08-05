// GitHub-style activity heatmap, themed for the streak/flame motif used
// across the Progress page. Takes the `calendarActivity` array returned by
// GET /progress/summary — [{ date: "YYYY-MM-DD", count: number }, ...],
// oldest first.
const levelForCount = (count) => {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
};

const LEVEL_CLASSES = [
  "bg-[#20243b]", // 0 — no activity
  "bg-orange-900/70",
  "bg-orange-600/80",
  "bg-orange-400",
];

const StreakCalendar = ({ calendarActivity = [] }) => {
  if (calendarActivity.length === 0) return null;

  // Pad the front so the grid always starts on a Sunday, then chunk into
  // week columns of 7 (Sun -> Sat), matching the GitHub contribution graph.
  const first = new Date(calendarActivity[0].date);
  const leadingBlanks = first.getDay(); // 0 (Sun) - 6 (Sat)

  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...calendarActivity,
  ];

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const monthLabels = weeks.map((week, i) => {
    const firstReal = week.find(Boolean);
    if (!firstReal) return null;
    const d = new Date(firstReal.date);
    const prevFirstReal = i > 0 ? weeks[i - 1].find(Boolean) : null;
    if (prevFirstReal && new Date(prevFirstReal.date).getMonth() === d.getMonth()) {
      return null;
    }
    return d.toLocaleDateString("en-US", { month: "short" });
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1 min-w-full">
        <div className="flex gap-[3px] pl-6">
          {monthLabels.map((label, i) => (
            <div key={i} className="w-[13px] text-[10px] text-slate-500 shrink-0">
              {label || ""}
            </div>
          ))}
        </div>
        <div className="flex gap-[3px]">
          <div className="flex flex-col gap-[3px] pr-1 shrink-0">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
              <div key={i} className="h-[13px] text-[10px] text-slate-500 leading-[13px]">
                {label}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px] shrink-0">
              {week.map((day, di) =>
                day ? (
                  <div
                    key={di}
                    title={`${day.date} — ${day.count} ${day.count === 1 ? "activity" : "activities"}`}
                    className={`w-[13px] h-[13px] rounded-[3px] ${LEVEL_CLASSES[levelForCount(day.count)]}`}
                  />
                ) : (
                  <div key={di} className="w-[13px] h-[13px]" />
                )
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-2 pl-6 text-[10px] text-slate-500">
          <span>Less</span>
          {LEVEL_CLASSES.map((c, i) => (
            <div key={i} className={`w-[11px] h-[11px] rounded-[3px] ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;