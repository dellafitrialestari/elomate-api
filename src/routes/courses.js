const express = require("express");
const CoursesController = require("../controller/courses.js");

const router = express.Router();

// Route untuk mendapatkan courses berdasarkan user yang login
router.get("/", CoursesController.getCoursesByUser);

module.exports = router;
