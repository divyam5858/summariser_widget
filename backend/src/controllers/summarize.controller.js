
const { generateSummary } = require("../services/ai.service");

async function summarizeText(req, res) {
  try {
    const { text } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide text to summarize.",
      });
    }

    if (text.length > 30000) {
      return res.status(413).json({
        success: false,
        message: "Text must not exceed 30,000 characters.",
      });
    }

    const summary = await generateSummary(text);

    return res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Summarization error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to summarize text.",
    });
  }
}

module.exports = { summarizeText };
