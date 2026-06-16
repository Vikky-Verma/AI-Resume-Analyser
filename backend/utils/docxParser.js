const mammoth = require("mammoth");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

const parseDOCX = async (filePathOrUrl) => {
  if (filePathOrUrl.startsWith("http")) {
    // ✅ Cloudinary URL — download to temp file first
    const response = await axios.get(filePathOrUrl, {
      responseType: "arraybuffer",
    });
    const tempPath = path.join(os.tmpdir(), `resume_${Date.now()}.docx`);
    fs.writeFileSync(tempPath, Buffer.from(response.data));
    const result = await mammoth.extractRawText({ path: tempPath });
    fs.unlinkSync(tempPath); // cleanup temp file
    return result.value;
  } else {
    // ✅ Local file path
    const result = await mammoth.extractRawText({ path: filePathOrUrl });
    return result.value;
  }
};

module.exports = parseDOCX;