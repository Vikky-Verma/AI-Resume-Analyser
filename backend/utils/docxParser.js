const mammoth = require("mammoth");

const parseDOCX = async (filePath) => {
  const result =
    await mammoth.extractRawText({
      path: filePath,
    });

  return result.value;
};

module.exports = parseDOCX;