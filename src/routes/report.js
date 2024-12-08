const express = require("express");
const ReportController = require("../controller/report.js");

const router = express.Router();


router.get("/", ReportController.getReportData);

// GET - report by Id phase topic
router.get("/:phase/:topic", ReportController.getReportByPhaseTopic);

// Kirkpatrick

router.get("/kirkpatrick", ReportController.getKirkpatrickUser);

router.get("/kirkpatrickDetail", ReportController.getKirkpatrickUserDetail);


module.exports = router;