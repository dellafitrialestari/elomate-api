const AssignmentModel = require("../models/assignment");

const getAssignmentByUser = async (req, res) => {
  try {
      const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
      
      // Fetch courses based on user ID
      const [assignment] = await AssignmentModel.getAssignmentByUser(userId);
      
      if (!assignment || assignment.length === 0) {
          return res.status(404).json({
              message: "No assignment found for this user",
              data: null,
          });
      }
      

      // Format tanggal untuk setiap tugas tanpa mengubah zona waktu
      const formatTanggal = (tanggal) => {
        if (tanggal) {
            const tanggalObj = new Date(tanggal);
            const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");
            return `${day}-${month}-${year}`;
        }
        return tanggal;
      };

      // Proses setiap assignment untuk format tanggal_mulai dan tanggal_selesai
      const formattedAssignments = assignment.map((assignment) => ({
        ...assignment,
        tanggal_mulai: formatTanggal(assignment.tanggal_mulai),
        tanggal_selesai: formatTanggal(assignment.tanggal_selesai),
      }));

      // Return the array directly without wrapping in an object
      return res.status(200).json(formattedAssignments);
  } catch (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({
          message: "Internal server error",
          serverMessage: error.message,
      });
  }
};

const getAssignmentByUserCourse = async (req, res) => {
    const { courseId } = req.params;

    try {
        const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
        
        // Fetch courses based on user ID
        const [assignment] = await AssignmentModel.getAssignmentByUserCourse(userId, courseId);
        
        if (!assignment || assignment.length === 0) {
            return res.status(404).json({
                message: "No assignment found for this user",
                data: null,
            });
        }

        // Format tanggal untuk setiap tugas tanpa mengubah zona waktu
        const formatTanggal = (tanggal) => {
            if (tanggal) {
                const tanggalObj = new Date(tanggal);
                const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");
                return `${day}-${month}-${year}`;
            }
            return tanggal;
        };

        // Proses setiap assignment untuk format tanggal_mulai dan tanggal_selesai
        const formattedAssignments = assignment.map((assignment) => ({
            ...assignment,
            tanggal_mulai: formatTanggal(assignment.tanggal_mulai),
            tanggal_selesai: formatTanggal(assignment.tanggal_selesai),
        }));
  
        // Return the array directly without wrapping in an object
        return res.status(200).json(formattedAssignments);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
  };

  const getAssignmentByUserCoursePreActivity = async (req, res) => {
    const { courseId } = req.params;

    try {
        const userId = req.user.userId; // Ensure userId is extracted via middleware authentication

        // Fetch courses based on user ID
        const [assignment] = await AssignmentModel.getAssignmentByUserCoursePreActivity(userId, courseId);

        if (!assignment || assignment.length === 0) {
            return res.status(404).json({
                message: "No activity found for this user",
                data: null,
            });
        }

        // Format tanggal untuk setiap tugas tanpa mengubah zona waktu
        const formatTanggal = (tanggal) => {
            if (tanggal) {
                const tanggalObj = new Date(tanggal);
                const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");
                return `${day}-${month}-${year}`;
            }
            return tanggal;
        };

        // Proses setiap assignment untuk format tanggal_mulai, tanggal_selesai, dan kategori
        const formattedAssignments = assignment.map((assignment) => ({
            ...assignment,
            tanggal_mulai: formatTanggal(assignment.tanggal_mulai),
            tanggal_selesai: formatTanggal(assignment.tanggal_selesai),
            question_type:
                assignment.question_type === "multiple_choice"
                    ? "Pilihan ganda"
                    : assignment.question_type === "essay"
                    ? "Essay"
                    : assignment.question_type, // Default jika kategori tidak sesuai
        }));

        // Return the array directly without wrapping in an object
        return res.status(200).json(formattedAssignments);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getAssignmentByUserCoursePostActivity = async (req, res) => {
    const { courseId } = req.params;

    try {
        const userId = req.user.userId; // Ensure userId is extracted via middleware authentication

        // Fetch courses based on user ID
        const [assignment] = await AssignmentModel.getAssignmentByUserCoursePostActivity(userId, courseId);

        if (!assignment || assignment.length === 0) {
            return res.status(404).json({
                message: "No activity found for this user",
                data: null,
            });
        }

        // Format tanggal untuk setiap tugas tanpa mengubah zona waktu
        const formatTanggal = (tanggal) => {
            if (tanggal) {
                const tanggalObj = new Date(tanggal);
                const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");
                return `${day}-${month}-${year}`;
            }
            return tanggal;
        };

        // Proses setiap assignment untuk format tanggal_mulai, tanggal_selesai, dan kategori
        const formattedAssignments = assignment.map((assignment) => ({
            ...assignment,
            tanggal_mulai: formatTanggal(assignment.tanggal_mulai),
            tanggal_selesai: formatTanggal(assignment.tanggal_selesai),
            question_type:
                assignment.question_type === "multiple_choice"
                    ? "Pilihan ganda"
                    : assignment.question_type === "essay"
                    ? "Essay"
                    : assignment.question_type, // Default jika kategori tidak sesuai
        }));

        // Return the array directly without wrapping in an object
        return res.status(200).json(formattedAssignments);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getAssignmentByAssignmentId = async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
        
        // Fetch courses based on user ID
        const [assignment] = await AssignmentModel.getAssignmentByAssignmentId(userId, assignmentId);
        
        if (!assignment || assignment.length === 0) {
            return res.status(404).json({
                message: "No assignment found for this user",
                data: null,
            });
        }

        // Format tanggal untuk setiap tugas tanpa mengubah zona waktu
        const formatTanggal = (tanggal) => {
            if (tanggal) {
                const tanggalObj = new Date(tanggal);
                const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");
                return `${day}-${month}-${year}`;
            }
            return tanggal;
        };

        // Proses setiap assignment untuk format tanggal_mulai dan tanggal_selesai
        const formattedAssignments = assignment.map((assignment) => ({
            ...assignment,
            tanggal_mulai: formatTanggal(assignment.tanggal_mulai),
            tanggal_selesai: formatTanggal(assignment.tanggal_selesai),
            question_type:
                assignment.question_type === "multiple_choice"
                    ? "Pilihan ganda"
                    : assignment.question_type === "essay"
                    ? "Essay"
                    : assignment.question_type, // Default jika kategori tidak sesuai
        }));
  
        // Return the array directly without wrapping in an object
        return res.status(200).json(formattedAssignments);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
  };

module.exports = {
    getAssignmentByUser,
    getAssignmentByUserCourse,
    getAssignmentByUserCoursePreActivity,
    getAssignmentByUserCoursePostActivity,
    getAssignmentByAssignmentId,
};