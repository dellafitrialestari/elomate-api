const { Storage } = require("@google-cloud/storage");
const FilesModel = require("../models/files");

// Inisialisasi Google Cloud Storage
const storage = new Storage();

const FilesController = {
  async getFileData(req, res) {
    // Ambil fileNameId dari body request
    const { fileNameId } = req.body;

    if (!fileNameId) {
      return res.status(400).json({
        status: "error",
        message: "file_name_id is required",
      });
    }

    try {
      // Log fileNameId untuk debugging
      console.log("Requested file_name_id:", fileNameId);

      // Ambil informasi file dari database
      const fileData = await FilesModel.getFileById(fileNameId);

      if (!fileData) {
        return res.status(404).json({
          status: "error",
          message: `File with file_name_id '${fileNameId}' not found in database`,
        });
      }

      const { bucket_name, file_name_id } = fileData;

      // Generate Signed URL untuk akses file privat
      const options = {
        version: "v4",
        action: "read",
        expires: Date.now() + 15 * 60 * 1000, // Berlaku selama 15 menit
      };

      const [signedUrl] = await storage
        .bucket(bucket_name)
        .file(file_name_id)
        .getSignedUrl(options);

      // Kirim Signed URL ke pengguna
      return res.status(200).json({
        status: "success",
        message: "Signed URL generated successfully",
        data: {
          file_name: file_name_id,
          signed_url: signedUrl,
        },
      });
    } catch (error) {
      console.error("Error generating Signed URL:", error);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while generating Signed URL",
        error: error.message,
      });
    }
  },
};

module.exports = FilesController;
