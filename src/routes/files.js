const express = require("express");
const FilesController = require("../controller/files");

const router = express.Router();

// Endpoint untuk mendapatkan Signed URL
router.get("/data", FilesController.getFileData);

module.exports = router;
