const express = require("express");
const MentoringController = require("../controller/mentoring.js");

const router = express.Router();


router.get('/mentoringData', MentoringController.getMentoringData);

router.get('/:mentoringId', MentoringController.getMentoringById);

router.get("/category/:statusMentoring", MentoringController.getMentoringByStatus);

router.get('/UpcomingData', MentoringController.getUpcomingData);

router.get('/FeedbackData', MentoringController.getFeedbackData);

router.get('/ApproveData', MentoringController.getApproveData);

router.post("/insert", MentoringController.postMentoring);

router.patch("/insertFeedback/:mentoringId", MentoringController.postMentoringFeedback);

router.get("/method", MentoringController.getMetodeMentoring);

router.get("/type", MentoringController.getTypeMentoring);

// DELETE - DELETE
router.delete("/delete/:mentoringId", MentoringController.deleteMentoring);

module.exports = router;