const mammoth = require("mammoth");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

// mammoth.extractRawText() only returns visible printed words and silently
// drops the URL behind hyperlinked text (e.g. a "GitHub" link would come
// through as just the word "GitHub", no URL). convertToHtml() preserves
// hyperlinks as <a href="...">, so we use that and pull hrefs out too.
const htmlToTextWithLinks = (html) => {
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const visibleText = html
    .replace(/<[^>]+>/g, " ") // strip tags, keep visible text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

  return visibleText + (hrefs.length ? "\n" + hrefs.join("\n") : "");
};

const parseDOCX = async (filePathOrUrl) => {
  if (filePathOrUrl.startsWith("http")) {
    // ✅ Cloudinary URL — download to temp file first
    const response = await axios.get(filePathOrUrl, {
      responseType: "arraybuffer",
    });
    const tempPath = path.join(os.tmpdir(), `resume_${Date.now()}.docx`);
    fs.writeFileSync(tempPath, Buffer.from(response.data));
    const result = await mammoth.convertToHtml({ path: tempPath });
    fs.unlinkSync(tempPath); // cleanup temp file
    return htmlToTextWithLinks(result.value);
  } else {
    // ✅ Local file path
    const result = await mammoth.convertToHtml({ path: filePathOrUrl });
    return htmlToTextWithLinks(result.value);
  }
};

module.exports = parseDOCX;