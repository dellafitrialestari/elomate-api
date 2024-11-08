const express = require('express');

const UserController = require('../controller/users.js');

const router = express.Router();

// LOGIN - POST
router.post('/login', UserController.loginUser);

// CREATE - POST
router.post('/', UserController.createNewUser);

// READ - GET by ID
router.get('/:idUser', UserController.getUserById);

// READ - GET by NRP
router.get('/nrp/:nrpUser', UserController.getUserByNrp);

// READ - GET by Email
router.get('/email/:emailUser', UserController.getUserByEmail);

// READ - GET
router.get('/', UserController.getAllUsers);

// UPDATE - PATCH
router.patch('/:idUser', UserController.updateUser);

// DELETE - DELETE
router.delete('/:idUser', UserController.deleteUser);



module.exports = router;