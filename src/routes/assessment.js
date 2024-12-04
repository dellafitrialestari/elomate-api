const express = require("express");
const AssessmentController = require("../controller/assessment.js");

const router = express.Router();


router.get("/", AssessmentController.getAssessmentData); 

router.get("/question/:assessmentId", AssessmentController.getQuestionByAssessmentId); 

// Self Assessment

router.get("/selfAssessment", AssessmentController.getSelfAssessment); 

router.post("/selfAssessment/:assessmentId", AssessmentController.submitSelfAssessment);

// Peer Asssessment

router.get("/peerAssessment", AssessmentController.getPeerAssessment); 

router.post("/peerAssessment/:assessmentId/:assessedId", AssessmentController.submitPeerAssessment);

router.get("/statusPeerParticipant/:assessmentId", AssessmentController.getStatusPeerParticipant);


module.exports = router; 