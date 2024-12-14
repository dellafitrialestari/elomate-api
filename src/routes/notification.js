const express = require("express");
const notificationController = require("../controller/notification.js");

const router = express.Router();

router.get('/all', notificationController.getNotificationData);

module.exports = router;