const express = require("express");
const ReportController = require("../controller/report.js");

const router = express.Router();


router.get("/", ReportController.getReportData);



module.exports = router;