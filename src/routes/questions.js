const express = require("express");
const QuestionsController = require("../controller/questions.js");

const router = express.Router();

// GET - questions by assignment_id & type (multiple_choice atau essay)
// router.get("/:assignmentId/:type", QuestionsController.getQuestionsByType);

router.get("/:questionId", QuestionsController.getAnswerByQuestionsId);

// GET - questions by assignment_id
router.get("/assignment/:assignmentId", QuestionsController.getQuestionsByAssignmentId);

// POST - insert score based on user's answer
router.post("/score", QuestionsController.insertScoreAnswer);

// router.post("/scores/:assignmentId", QuestionsController.insertScoreForMultipleChoice);

module.exports = router;