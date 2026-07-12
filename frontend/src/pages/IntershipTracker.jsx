import ComingSoon from "./ComingSoon";
import { KanbanSquare } from "lucide-react";

const InternshipTracker = () => (
  <ComingSoon
    icon={KanbanSquare}
    title="Internship Tracker"
    phase="Phase 6"
    description="A Kanban board to track every application from Applied to Offer, with deadline reminders."
    features={[
      "Drag-and-drop Kanban: Applied → OA → Interview → Offer",
      "Deadline and follow-up reminders",
      "Application notes and status history",
    ]}
  />
);

export default InternshipTracker;