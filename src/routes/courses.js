const express = require("express");
const CoursesController = require("../controller/courses.js");

const router = express.Router();

// Route untuk mendapatkan courses berdasarkan user yang login
router.get("/", CoursesController.getCoursesByUser);

router.get("/phase", CoursesController.getPhaseCourses);

// GET - phase by id user
router.get("/phaseUser", CoursesController.getPhaseCoursesByUserId);

router.get("/phase/:phaseCourse", CoursesController.getTopicByPhase);

// GET - Topic by id user & phase
router.get("/phaseUser/:phaseCourse", CoursesController.getTopicByPhaseUserId);

// POST GET - Topic by id user
router.post("/phaseUserContext", CoursesController.TopicByPhaseUserId);

// GET - courses by Id phase topic
router.get("/:phase/:topic", CoursesController.getCoursesByUserIdAndPhaseAndTopic);

// GET - courses by Id course
router.get("/:courseId", CoursesController.getCoursesByUserIdCourseId);

// POST - courses by Id phaseName topicName
router.post("/name", CoursesController.getCoursesByUserIdAndPhaseNameAndTopicName);

module.exports = router;
