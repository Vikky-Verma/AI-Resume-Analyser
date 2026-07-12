import ComingSoon from "./ComingSoon";
import { Route } from "lucide-react";

const AiRoadmap = () => (
  <ComingSoon
    icon={Route}
    title="AI Roadmap"
    phase="Phase 3"
    description="A personalized, week-by-week prep plan generated from your resume, DSA profile, and target role."
    features={[
      "Auto-generated weekly study plan",
      "Adapts as you complete DSA problems and mock interviews",
      "Target-role-specific milestones",
    ]}
  />
);

export default AiRoadmap;