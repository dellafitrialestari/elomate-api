const express = require("express");
const AssessmentController = require("../controller/assessment.js");

const router = express.Router();


router.get("/", AssessmentController.getAssessmentData);


module.exports = router;