import ComingSoon from "./ComingSoon";
import { Building2 } from "lucide-react";

const CompanyPrep = () => (
  <ComingSoon
    icon={Building2}
    title="Company Prep"
    phase="Phase 6"
    description="Company and role-specific prep: past interview questions, hiring bar, and a tailored roadmap."
    features={[
      "Company + role question bank",
      "Interview process breakdown by company",
      "Tailored prep roadmap per target company",
    ]}
  />
);

export default CompanyPrep;