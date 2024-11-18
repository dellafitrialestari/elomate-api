const MateriModel = require("../models/pre-reading");

const getMateriByUser = async (req, res) => {
  try {
      const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
      
      // Fetch courses based on user ID
      const [materi] = await MateriModel.getMateriByUser(userId);
      
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
        return res.status(200).json(materi);
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