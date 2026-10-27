
const express = require("express");
const { summarizeText } = require("../controllers/summarize.controller");

const router = express.Router();

router.post("/", summarizeText);

module.exports = router;
