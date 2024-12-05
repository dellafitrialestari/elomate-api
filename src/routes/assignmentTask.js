const express = require("express");
const assessmentTaskController = require("../controller/assignmentTask.js");

const router = express.Router();


router.get("/:questionId", assessmentTaskController.getAnswerByQuestionsId);

// GET - questions by assignment_id
router.get("/question/:assignmentId", assessmentTaskController.getQuestionsByAssignmentId);

// POST
router.post("/answer/:assignmentId", assessmentTaskController.insertUserAnswer);


module.exports = router;