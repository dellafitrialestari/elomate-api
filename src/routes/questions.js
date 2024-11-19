const express = require("express");
const QuestionsController = require("../controller/questions.js");

const router = express.Router();


router.get("/:questionId", QuestionsController.getAnswerByQuestionsId);

// GET - questions by assignment_id
router.get("/assignment/:assignmentId", QuestionsController.getQuestionsByAssignmentId);

// POST - insert score based on user's answer for multiple-choice questions
router.post("/scores/:assignmentId", QuestionsController.insertScoreForMultipleChoice);


module.exports = router;