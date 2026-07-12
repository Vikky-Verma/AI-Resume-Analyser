const pdf = require("pdf-parse");
const fs = require("fs");
const axios = require("axios");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

// Extracts real embedded hyperlinks (e.g. GitHub/LinkedIn icons or
// custom-labelled links) that pdf-parse's plain-text extraction misses,
// since pdf-parse only reads what's visibly printed, not the underlying
// clickable URL.
const extractEmbeddedLinks = async (dataBuffer) => {
  try {
    const data = new Uint8Array(dataBuffer);
    const doc = await pdfjsLib.getDocument({ data }).promise;
    const urls = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const annotations = await page.getAnnotations();
      for (const a of annotations) {
        if (a.subtype === "Link" && a.url) urls.push(a.url);
      }
    }
    return urls;
  } catch (err) {
    return [];
  }
};

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
  const embeddedLinks = await extractEmbeddedLinks(dataBuffer);

  // Append hidden hyperlinks as plain text so handle-detection regexes
  // (which scan for things like linkedin.com/in/... or github.com/...)
  // can find profiles hidden behind icons or shortened link labels.
  const linksText = embeddedLinks.length ? "\n" + embeddedLinks.join("\n") : "";

  return data.text + linksText;
};

module.exports = parsePDF;