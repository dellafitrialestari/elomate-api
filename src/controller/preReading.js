const MateriModel = require("../models/preReading");

const { Storage } = require("@google-cloud/storage");

// Google Cloud Storage
const storage = new Storage();

const getMateriByUser = async (req, res) => {
    try {
      const userId = req.user.userId; // userId dari middleware autentikasi
  
      const [materi] = await MateriModel.getMateriByUser(userId);
  
      if (!materi || materi.length === 0) {
        return res.status(404).json({
          message: "No learning materials found for this user",
          data: null,
        });
      }
  
      // Generate Signed URL setiap materi
      const materiWithSignedUrl = await Promise.all(
        materi.map(async (item) => {
          if (item.file_name_id) {
            try {
              const file = storage
                          .bucket("elomate-files")
                          .file(item.file_name_id);
              const [exists] = await file.exists(); // Cek apakah file ada di storage
  
              if (!exists) {
                console.error(`File not found in storage: ${item.file_name_id}`);
                return { ...item, signed_url: "File not found" };
              }
  
              const options = {
                version: "v4",
                action: "read",
                expires: Date.now() + 15 * 60 * 1000, // Berlaku 15 menit
              };
  
              const [signedUrl] = await file.getSignedUrl(options);
              return { ...item, signed_url: signedUrl };
            } catch (error) {
              console.error(
                `Error generating Signed URL for file: ${item.konten_materi}`,
                error
              );
              return { ...item, signed_url: "Error generating URL" };
            }
          } else {
            return { ...item, signed_url: "No content" };
          }
        })
      );
  
      return res.status(200).json(materiWithSignedUrl);
    } catch (error) {
      console.error("Error fetching learning materials:", error);
      return res.status(500).json({
        message: "Internal server error",
        serverMessage: error.message,
      });
    }
};
  
const getMateriByUserCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
      const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
      
      // Fetch courses based on user ID
      const [materi] = await MateriModel.getMateriByUserCourse(userId, courseId);
      
      if (!materi || materi.length === 0) {
          return res.status(404).json({
              message: "No learning materials found for this user",
              data: null,
          });
      }

      // Return all courses related to the user
      // return res.status(200).json({ courses });

      // Return the array directly without wrapping in an object
      return res.status(200).json(materi);
  } catch (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({
          message: "Internal server error",
          serverMessage: error.message,
      });
  }
};

const getMateriByMateriId = async (req, res) => {
    const { materiId } = req.params;
    try {
        const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
        
        // Fetch courses based on user ID
        const [materi] = await MateriModel.getMateriByMateriId(userId, materiId);
        
        if (!materi || materi.length === 0) {
            return res.status(404).json({
                message: "No learning materials found for this user",
                data: null,
            });
        }
  
        // Return all courses related to the user
        // return res.status(200).json({ courses });
  
        // Return the array directly without wrapping in an object
        return res.status(200).json(materi[0]);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
  };
  
module.exports = {
    getMateriByUser,
    getMateriByUserCourse,
    getMateriByMateriId,
  };