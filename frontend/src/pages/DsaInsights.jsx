import ComingSoon from "./ComingSoon";
import { Code2 } from "lucide-react";

const DsaInsights = () => (
  <ComingSoon
    icon={Code2}
    title="DSA Insights"
    phase="Phase 3"
    description="Link your LeetCode, Codeforces, CodeChef and GFG profiles to get a unified problem-solving readiness score."
    features={[
      "Per-platform solved counts by difficulty",
      "Combined readiness score across all platforms",
      "Weak-topic detection from your solve history",
      "Contest rating trend over time",
    ]}
  />
);

export default DsaInsights;