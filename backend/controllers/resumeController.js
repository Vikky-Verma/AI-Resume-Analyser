const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const parsePDF = require("../utils/pdfParser");
const parseDOCX = require("../utils/docxParser");
const prisma = require("../utils/prisma");

const uploadResume = async (req, res) => {
  try {
    const resume = await prisma.resume.create({
      data: {
        originalName: req.file.originalname,
        // ✅ Cloudinary returns URL in req.file.path
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
    res.status(500).json({ message: "Server Error" });
  }
};

const getMyResumes = async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user.id },
      orderBy: { uploadedAt: "desc" },
    });

    res.status(200).json({ success: true, resumes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed To Fetch Resumes" });
  }
};

const parseResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume Not Found" });
    }

    let extractedText = "";
    const ext = path.extname(resume.originalName).toLowerCase();

    if (ext === ".pdf") {
      // ✅ works for both Cloudinary URL and local path
      extractedText = await parsePDF(resume.filePath);
    } else if (ext === ".docx") {
      // ✅ works for both Cloudinary URL and local path
      extractedText = await parseDOCX(resume.filePath);
    } else {
      return res.status(400).json({ message: "Unsupported File Type" });
    }

    await prisma.resume.update({
      where: { id: resumeId },
      data: { extractedText },
    });

    return res.status(200).json({ success: true, extractedText });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Parsing Failed" });
  }
};

const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    const resume = await prisma.resume.findUnique({ where: { id } });

    if (!resume) {
      return res.status(404).json({ message: "Resume Not Found" });
    }

    if (resume.userId !== req.user.id) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    // Delete related Analysis first
    await prisma.analysis.deleteMany({ where: { resumeId: id } });

    // Delete resume record
    await prisma.resume.delete({ where: { id } });

    // ✅ Delete from Cloudinary if URL
    if (resume.filePath.startsWith("http")) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = resume.filePath.split("/");
        const fileWithExt = urlParts[urlParts.length - 1];
        const publicId = `resumes/${fileWithExt.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "raw",
        });
      } catch (err) {
        console.log("Cloudinary delete error:", err.message);
        // Don't fail the request if Cloudinary delete fails
      }
    } else {
      // Local file delete
      if (fs.existsSync(resume.filePath)) {
        fs.unlinkSync(resume.filePath);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Resume Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Delete Failed" });
  }
};

module.exports = {
  uploadResume,
  getMyResumes,
  parseResume,
  deleteResume,
};