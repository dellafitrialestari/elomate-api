const express = require("express");
const CoursesController = require("../controller/courses.js");

const router = express.Router();

// Route untuk mendapatkan courses berdasarkan user yang login
router.get("/", CoursesController.getCoursesByUser);

router.get("/phase", CoursesController.getPhaseCourses);

router.get("/phase/:phaseCourse", CoursesController.getTopicByPhase);

// GET - courses by Id phase topic
router.get("/:phase/:topic", CoursesController.getCoursesByUserIdAndPhaseAndTopic);

// POST - courses by Id phaseName topicName
router.post("/name", CoursesController.getCoursesByUserIdAndPhaseNameAndTopicName);

module.exports = router;
