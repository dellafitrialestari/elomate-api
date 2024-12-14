const express = require("express");
const ParticipantController = require("../controller/participantData.js");

const router = express.Router();


router.get("/", ParticipantController.getParticipantData);

router.get("/education/:userId", ParticipantController.getParticipantEducation);


module.exports = router;