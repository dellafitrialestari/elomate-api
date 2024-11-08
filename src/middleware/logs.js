const express = require('express');
const app = express();

// Middleware untuk parsing request body
app.use(express.json()); // Untuk JSON
app.use(express.urlencoded({ extended: true })); // Untuk x-www-form-urlencoded

const logRequest = (req, res, next) => {
    console.log('Terjadi request ke PATH: ', req.path);
    next();
}

module.exports = logRequest;