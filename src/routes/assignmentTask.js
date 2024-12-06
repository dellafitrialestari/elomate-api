const express = require("express");
const assessmentTaskController = require("../controller/assignmentTask.js");

const router = express.Router();

const { upload } = require("../middleware/upload");

router.get("/:questionId", assessmentTaskController.getAnswerByQuestionsId);

// GET - questions by assignment_id
router.get("/question/:assignmentId", assessmentTaskController.getQuestionsByAssignmentId);

// POST
router.post("/answer/:assignmentId", assessmentTaskController.insertUserAnswer);

// router.post("/answerEssay/:assignmentId", assessmentTaskController.insertUserEssayAnswer);


router.post(
    "/answerEssay/:assignmentId",
    upload.single("lampiran_file"),
    assessmentTaskController.insertUserEssayAnswer
);


module.exports = router;