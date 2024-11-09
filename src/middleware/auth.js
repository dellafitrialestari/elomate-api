// middleware/auth.js
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt"); // Pastikan Anda memiliki file konfigurasi JWT dengan secret key

// Middleware untuk autentikasi dan pengecualian URL
const authenticateJWT = (excludedRoutes = []) => {
  return (req, res, next) => {
    // Mengecek apakah URL ada di dalam daftar pengecualian
    if (excludedRoutes.includes(req.path)) {
      return next(); // Lanjutkan tanpa autentikasi
    }

    // Mendapatkan token dari header Authorization
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    // Verifikasi token
    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }

      // Jika valid, tambahkan data user ke req dan lanjutkan
      req.user = decoded;
      next();
    });
  };
};

module.exports = authenticateJWT;
