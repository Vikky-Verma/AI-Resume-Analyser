const {
  STATUSES,
  listApplications,
  createApplication,
  updateApplication,
  moveApplication,
  deleteApplication,
} = require("../services/applicationService");

const getApplications = async (req, res) => {
  try {
    const applications = await listApplications(req.user.id);
    return res.status(200).json({
      success: true,
      data: { applications, statuses: STATUSES },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to load applications",
    });
  }
};

const addApplication = async (req, res) => {
  try {
    const { company, role } = req.body;

    if (!company?.trim() || !role?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company and role are required",
      });
    }

    const application = await createApplication(req.user.id, req.body);
    return res.status(201).json({ success: true, data: { application } });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to create application",
    });
  }
};

const editApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await updateApplication(req.user.id, id, req.body);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({ success: true, data: { application } });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to update application",
    });
  }
};

const moveApplicationCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, position } = req.body;

    if (!status || typeof position !== "number") {
      return res.status(400).json({
        success: false,
        message: "status and position are required",
      });
    }

    const application = await moveApplication(req.user.id, id, {
      status,
      position,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({ success: true, data: { application } });
  } catch (error) {
    console.log(error);
    const status = error.message === "Invalid status" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message === "Invalid status"
        ? "Invalid status"
        : "Failed to move application",
    });
  }
};

const removeApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteApplication(req.user.id, id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete application",
    });
  }
};

module.exports = {
  getApplications,
  addApplication,
  editApplication,
  moveApplicationCard,
  removeApplication,
};