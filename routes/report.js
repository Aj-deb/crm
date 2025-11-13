const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getReports } = require("../controllers/reportController");

router.get("/", auth, getReports);
module.exports = router;
