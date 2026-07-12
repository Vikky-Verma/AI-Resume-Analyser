import ComingSoon from "./ComingSoon";
import { FolderGit2 } from "lucide-react";

const ProjectIntelligence = () => (
  <ComingSoon
    icon={FolderGit2}
    title="Project Intelligence"
    phase="Phase 4"
    description="Connect your GitHub and get recruiter-grade feedback on your projects, not just your resume."
    features={[
      "README quality scoring with rewrite suggestions",
      "Tech-stack and complexity analysis per repo",
      "Recruiter-facing project score",
      "Suggestions on which projects to lead with",
    ]}
  />
);

export default ProjectIntelligence;