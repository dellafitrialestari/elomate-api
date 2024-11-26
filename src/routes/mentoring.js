const express = require("express");
const MentoringController = require("../controller/mentoring.js");

const router = express.Router();


router.get('/mentoringData', MentoringController.getMentoringData);

router.post("/insert", MentoringController.postMentoring);

router.patch("/insertFeedback/:mentoringId", MentoringController.postMentoringFeedback);

router.get("/method", MentoringController.getMetodeMentoring);

router.get("/type", MentoringController.getTypeMentoring);

// DELETE - DELETE
router.delete("/delete/:mentoringId", MentoringController.deleteMentoring);

module.exports = router;