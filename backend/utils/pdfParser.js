const pdf = require("pdf-parse");
const fs = require("fs");
const axios = require("axios");

const parsePDF = async (filePathOrUrl) => {
  let dataBuffer;

  if (filePathOrUrl.startsWith("http")) {
    // ✅ Cloudinary URL — download first
    const response = await axios.get(filePathOrUrl, {
      responseType: "arraybuffer",
    });
    dataBuffer = Buffer.from(response.data);
  } else {
    // ✅ Local file path
    dataBuffer = fs.readFileSync(filePathOrUrl);
  }

  const data = await pdf(dataBuffer);
  return data.text;
};

module.exports = parsePDF;