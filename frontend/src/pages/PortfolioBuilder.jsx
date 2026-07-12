import ComingSoon from "./ComingSoon";
import { Layout } from "lucide-react";

const PortfolioBuilder = () => (
  <ComingSoon
    icon={Layout}
    title="Portfolio Builder"
    phase="Phase 6"
    description="Turn your resume and projects into a public portfolio page, auto-generated and always in sync."
    features={[
      "Auto-generated public portfolio page",
      "Pulls projects straight from Project Intelligence",
      "Shareable link for recruiters",
    ]}
  />
);

export default PortfolioBuilder;