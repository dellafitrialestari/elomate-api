const express = require("express");
const QuestionsController = require("../controller/assignmentTask.js");

const router = express.Router();


router.get("/:questionId", QuestionsController.getAnswerByQuestionsId);

// GET - questions by assignment_id
router.get("/question/:assignmentId", QuestionsController.getQuestionsByAssignmentId);

// POST - insert score based on user's answer for multiple-choice questions
router.post("/scores/:assignmentId", QuestionsController.insertScoreForMultipleChoice);


module.exports = router;