const express = require("express");
const AssessmentController = require("../controller/assessment.js");

const router = express.Router();


router.get("/", AssessmentController.getAssessmentData); 

router.get("/question/:assessmentId", AssessmentController.getQuestionByAssessmentId); 

router.get("/selfAssessment", AssessmentController.getSelfAssessment); 

router.get("/peerAssessment", AssessmentController.getPeerAssessment); 

// router.get("/:phase/:topic", AssessmentController.getAssessmentByPhaseTopic);

// router.get("/:phase/:topic/:categoryAssessment", AssessmentController.getAssessmentByPhaseTopicCategory);

module.exports = router; 