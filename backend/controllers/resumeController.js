const fs = require("fs");
const path = require("path");

const parsePDF = require("../utils/pdfParser");
const parseDOCX = require("../utils/docxParser");
const prisma = require("../utils/prisma");

const uploadResume = async (req, res) => {
  try {
    const resume = await prisma.resume.create({
      data: {
        originalName: req.file.originalname,
        filePath: req.file.path,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      resume,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getMyResumes = async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      resumes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed To Fetch Resumes",
    });
  }
};

const parseResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume Not Found",
      });
    }

    let extractedText = "";

    const ext = path.extname(resume.originalName).toLowerCase();

    if (ext === ".pdf") {
      extractedText = await parsePDF(resume.filePath);
    } else if (ext === ".docx") {
      extractedText = await parseDOCX(resume.filePath);
    } else {
      return res.status(400).json({
        message: "Unsupported File Type",
      });
    }

    await prisma.resume.update({
      where: { id: resumeId },
      data: { extractedText },
    });

    return res.status(200).json({
      success: true,
      extractedText,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Parsing Failed",
    });
  }
};

// ✅ Delete Resume
const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    // Check resume exists
    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume Not Found",
      });
    }

    // Make sure resume belongs to logged-in user
    if (resume.userId !== req.user.id) {
      return res.status(403).json({
        message: "Not Authorized",
      });
    }

    // Delete related Analysis first (foreign key constraint)
    await prisma.analysis.deleteMany({
      where: { resumeId: id },
    });

    // Now delete the resume record
    await prisma.resume.delete({
      where: { id },
    });

    // Delete physical file from disk
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    return res.status(200).json({
      success: true,
      message: "Resume Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Delete Failed",
    });
  }
};

module.exports = {
  uploadResume,
  getMyResumes,
  parseResume,
  deleteResume, // ✅ exported
};