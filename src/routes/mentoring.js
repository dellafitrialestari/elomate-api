const express = require("express");
const MentoringController = require("../controller/mentoring.js");

const router = express.Router();


router.get('/mentoringData', MentoringController.getMentoringData);

router.post("/insert", MentoringController.postMentoring);

// 
router.patch("/insertFeedback/:mentoringId", MentoringController.postMentoringFeedback);

router.get("/metode", MentoringController.getMetodeMentoring);

router.get("/tipe", MentoringController.getTypeMentoring);

module.exports = router;