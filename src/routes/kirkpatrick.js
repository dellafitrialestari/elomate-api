const express = require("express");
const kirkpatrickController = require("../controller/kirkpatrick");

const router = express.Router();


router.get("/", kirkpatrickController.getKirkpatrickUser);

router.get("/detail", kirkpatrickController.getKirkpatrickUserDetail);

module.exports = router;
