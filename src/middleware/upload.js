const multer = require("multer");

// Konfigurasi penyimpanan file di memori
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal ukuran file 5 MB
});

module.exports = { upload };
