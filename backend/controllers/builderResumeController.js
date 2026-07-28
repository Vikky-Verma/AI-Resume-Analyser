const {
  listMyResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  importFromParsedResume,
} = require("../services/builderResumeService");

const getResumes = async (req, res) => {
  try {
    const resumes = await listMyResumes(req.user.id);
    return res.status(200).json({ success: true, data: { resumes } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to load resumes" });
  }
};

const getResume = async (req, res) => {
  try {
    const resume = await getResumeById(req.user.id, req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    return res.status(200).json({ success: true, data: { resume } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to load resume" });
  }
};

const postResume = async (req, res) => {
  try {
    const resume = await createResume(req.user.id, req.body);
    return res.status(201).json({ success: true, data: { resume } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to create resume" });
  }
};

const putResume = async (req, res) => {
  try {
    const resume = await updateResume(req.user.id, req.params.id, req.body);
    if (!resume) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    return res.status(200).json({ success: true, data: { resume } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to update resume" });
  }
};

const removeResume = async (req, res) => {
  try {
    const ok = await deleteResume(req.user.id, req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: "Resume not found" });
    }
    return res.status(200).json({ success: true, message: "Resume deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to delete resume" });
  }
};

const importResume = async (req, res) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId) {
      return res.status(400).json({ success: false, message: "resumeId is required" });
    }
    const resume = await importFromParsedResume(req.user.id, resumeId);
    return res.status(201).json({ success: true, data: { resume } });
  } catch (error) {
    if (error.message === "RESUME_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Uploaded resume not found" });
    }
    console.log(error);
    res.status(500).json({ success: false, message: "Import failed" });
  }
};

module.exports = {
  getResumes,
  getResume,
  postResume,
  putResume,
  removeResume,
  importResume,
};