
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const summarizeRoutes = require("./src/routes/summarize.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    message: "Reusable AI Summarization Plugin API is running!",
    status: "success",
  });
});

app.use("/api/summarize", summarizeRoutes);

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

