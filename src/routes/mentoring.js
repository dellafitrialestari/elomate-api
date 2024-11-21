const express = require("express");
const ReportController = require("../controller/mentoring.js");

const router = express.Router();


router.post("/insert", ReportController.postMentoring);

// 
router.post("/insertFeedback", ReportController.postMentoringFeedback);


module.exports = router;