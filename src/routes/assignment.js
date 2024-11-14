const express = require("express");
const AssignmentController = require("../controller/assignment.js");

const router = express.Router();

// GET - course by userId
router.get("/", AssignmentController.getAssignmentByUser);

// GET - course by userId dan CourseId
router.get("/:courseId", AssignmentController.getAssignmentByUserCourse);

// GET - course PRE-ACTIVITY by userId dan CourseId
router.get("/PreActivity/:courseId", AssignmentController.getAssignmentByUserCoursePreActivity);

module.exports = router;