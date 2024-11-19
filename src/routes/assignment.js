const express = require("express");
const AssignmentController = require("../controller/assignment.js");

const router = express.Router();

// GET - course by userId
router.get("/", AssignmentController.getAssignmentByUser);

// GET - course by userId dan CourseId
router.get("/:courseId", AssignmentController.getAssignmentByUserCourse);

// GET - ToDo List
router.get("/user/todo", AssignmentController.getTodoUser);

// GET - assignment by assignmentId
router.get("/id/:assignmentId", AssignmentController.getAssignmentByAssignmentId);

// GET - course PRE-ACTIVITY by userId dan CourseId dan pre_activity
router.get("/PreActivity/:courseId", AssignmentController.getAssignmentByUserCoursePreActivity);

// GET - course POST-ACTIVITY by userId dan CourseId dan post_activity
router.get("/PostActivity/:courseId", AssignmentController.getAssignmentByUserCoursePostActivity);

module.exports = router;