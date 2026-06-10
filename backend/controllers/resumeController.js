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

    const resume =
      await prisma.resume.findUnique({
        where: {
          id: resumeId,
        },
      });

    if (!resume) {
      return res.status(404).json({
        message: "Resume Not Found",
      });
    }

    let extractedText = "";

    const ext =
      path.extname(
        resume.originalName
      ).toLowerCase();

    if (ext === ".pdf") {
      extractedText =
        await parsePDF(
          resume.filePath
        );
    } else if (ext === ".docx") {
      extractedText =
        await parseDOCX(
          resume.filePath
        );
    } else {
      return res.status(400).json({
        message:
          "Unsupported File Type",
      });
    }

    await prisma.resume.update({
      where: {
        id: resumeId,
      },

      data: {
        extractedText,
      },
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

module.exports = {
  uploadResume,
  getMyResumes,
  parseResume,
};