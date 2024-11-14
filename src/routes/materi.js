const express = require("express");
const MateriController = require("../controller/materi.js");

const router = express.Router();

// Route untuk mendapatkan courses berdasarkan user yang login
router.get("/", MateriController.getMateriByUser);

// GET - materi by userId dan courseId
router.get("/:courseId", MateriController.getMateriByUserCourse);

module.exports = router;