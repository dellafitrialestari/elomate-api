// config/jwt.js
require("dotenv").config();

module.exports = {
  secret: process.env.JWT_SECRET || "your_default_secret_key",
  expiresIn: process.env.JWT_EXPIRES_IN || "1h", // Atur waktu kedaluwarsa sesuai kebutuhan, misalnya '1h' untuk 1 jam
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN // Refresh token expires in 7 days
};
