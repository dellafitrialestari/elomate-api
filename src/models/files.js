const dbPool = require("../config/database");

const FilesModel = {
  async getFileById(fileNameId) {
    const query = `SELECT * FROM files WHERE file_name_id = ?`;
    console.log("Requested file_name_id:", fileNameId);
    const [rows] = await dbPool.execute(query, [fileNameId]);
    return rows[0]; // Mengambil hanya satu file
  },
};

module.exports = FilesModel;