import ComingSoon from "./ComingSoon";
import { Trophy } from "lucide-react";

const Progress = () => (
  <ComingSoon
    icon={Trophy}
    title="Progress"
    phase="Phase 6"
    description="Your prep activity in one place: streaks, achievements, and momentum across every module."
    features={[
      "Daily streak tracking",
      "Achievements across resume, DSA, and interview modules",
      "Weekly activity summary",
    ]}
  />
);

export default Progress;