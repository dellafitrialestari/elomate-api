const express = require("express");
const UserController = require("../controller/users.js");

const router = express.Router();

// LOGIN - POST
router.post("/login", UserController.loginUser);

// CREATE - POST
router.post("/register", UserController.createNewUser);

// READ - GET by Token
router.get("/me", UserController.getCurrentUser);

// UPDATE - PATCH
router.patch("/me", UserController.updateUser);

// READ - GET by ID
router.get("/:idUser", UserController.getUserById);

// READ - GET by NRP
router.get("/nrp/:nrpUser", UserController.getUserByNrp);

// READ - GET by Email
router.get("/email/:emailUser", UserController.getUserByEmail);

// READ - GET
router.get("/", UserController.getAllUsers);

// DELETE - DELETE
router.delete("/:idUser", UserController.deleteUser);

module.exports = router;
