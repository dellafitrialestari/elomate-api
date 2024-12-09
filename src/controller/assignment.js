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
            
            // Nama bulan dalam bahasa Indonesia
            const namaBulan = [
                "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ];

            return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
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

const getTodoUser = async (req, res) => {
    try {
        const userId = req.user.userId; // Pastikan userId diekstrak dari middleware autentikasi

        // Ambil semua assignment dan status assessment berdasarkan userId
        const [assignments] = await AssignmentModel.getTodoUser(userId);
        const [assessments] = await AssignmentModel.getAssessmentStatusByUser(userId);

        if ((!assignments || assignments.length === 0) && (!assessments || assessments.length === 0)) {
            return res.status(404).json({
                message: "No to-do found for this user",
                data: null,
            });
        }

        // Format tanggal untuk tugas dan assessment
        const formatTanggal = (tanggal) => {
            if (tanggal) {
                const tanggalObj = new Date(tanggal);
                const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");

                // Nama bulan
                const namaBulan = [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ];

                return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
            }
            return tanggal;
        };

        // Format data untuk response
        const formattedTodos = [
            ...assignments.map((assignment) => ({
                assignment_id: assignment.assignment_id,
                course_id: assignment.course_id,
                nama_course: assignment.nama_course,
                title: assignment.title,
                question_type: assignment.question_type,
                tanggal_mulai: formatTanggal(assignment.tanggal_mulai),
                tanggal_selesai: formatTanggal(assignment.tanggal_selesai),
                category: assignment.category,
                active: assignment.active,
            })),
            ...assessments.map((assessment) => ({
                assessment_id: assessment.assessment_id,
                nama_course: assessment.title,
                title: assessment.category_assessment,
                tanggal_mulai: formatTanggal(assessment.tanggal_mulai),
                tanggal_selesai: formatTanggal(assessment.tanggal_selesai),
                category: "assessment",
                active: assessment.active,
            })),
        ];

        return res.status(200).json(formattedTodos);
    } catch (error) {
        console.error("Error fetching todos:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getTodoUserSchedule = async (req, res) => {
    try {
        const userId = req.user.userId; // Pastikan userId diekstrak dari middleware autentikasi
        const { date } = req.params;

        if (!date) {
            return res.status(400).json({ message: "Date parameter is required" });
        }

        // Validasi dan parsing format tanggal DD-MM-YYYY ke format ISO (YYYY-MM-DD)
        const [day, month, year] = date.split("-");
        if (!day || !month || !year || isNaN(Date.parse(`${year}-${month}-${day}`))) {
            return res.status(400).json({ message: "Invalid date format. Use DD-MM-YYYY." });
        }
        const parsedDate = `${year}-${month}-${day}`;

        const [assignments] = await AssignmentModel.getTodoUser(userId);
        const [assessments] = await AssignmentModel.getAssessmentStatusByUser(userId);

        if ((!assignments || assignments.length === 0) && (!assessments || assessments.length === 0)) {
            return res.status(404).json({
                message: "No to-do found for this user",
                data: null,
            });
        }

        // Format tanggal untuk tugas dan assessment
        const formatTanggal = (tanggal) => {
            if (tanggal) {
                const tanggalObj = new Date(tanggal);
                const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");

                // Nama bulan
                const namaBulan = [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ];

                return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
            }
            return tanggal;
        };

        // Format dan filter data berdasarkan tanggal selesai
        const filteredTodos = [
            ...assignments.map((assignment) => ({
                assignment_id: assignment.assignment_id,
                course_id: assignment.course_id,
                nama_course: assignment.nama_course,
                title: assignment.title,
                question_type: assignment.question_type,
                tanggal_mulai: formatTanggal(assignment.tanggal_mulai),
                tanggal_selesai: assignment.tanggal_selesai, // Tetap gunakan format ISO untuk filtering
                category: assignment.category,
                active: assignment.active,
            })),
            ...assessments.map((assessment) => ({
                assessment_id: assessment.assessment_id,
                nama_course: assessment.title,
                title: assessment.category_assessment,
                tanggal_mulai: formatTanggal(assessment.tanggal_mulai),
                tanggal_selesai: assessment.tanggal_selesai, // Tetap gunakan format ISO untuk filtering
                category: "assessment",
                active: assessment.active,
            })),
        ].filter((todo) => {
            const todoTanggalSelesai = new Date(todo.tanggal_selesai).toISOString().split("T")[0];
            return todoTanggalSelesai === parsedDate; // Filter berdasarkan tanggal selesai
        });

        if (filteredTodos.length === 0) {
            return res.status(404).json({
                message: `No to-do found with the specified end date: ${date}`,
            });
        }

        // Format tanggal selesai untuk output
        const formattedTodos = filteredTodos.map((todo) => ({
            ...todo,
            tanggal_selesai: formatTanggal(todo.tanggal_selesai),
        }));

        return res.status(200).json(formattedTodos);
    } catch (error) {
        console.error("Error fetching todos:", error);
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
                
                // Nama bulan dalam bahasa Indonesia
                const namaBulan = [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ];

                return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
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
                
                // Nama bulan dalam bahasa Indonesia
                const namaBulan = [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ];

                return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
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
        const userId = req.user.userId; // Pastikan userId diambil melalui middleware

        // Ambil data assignment dari model
        const [assignments] = await AssignmentModel.getAssignmentByUserCoursePostActivity(userId, courseId);

        if (!assignments || assignments.length === 0) {
            return res.status(404).json({
                message: "No activity found for this user",
                data: null,
            });
        }

        // Fungsi untuk format tanggal
        const formatTanggal = (tanggal) => {
            if (tanggal) {
                const tanggalObj = new Date(tanggal);
                const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");

                const namaBulan = [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ];

                return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
            }
            return tanggal;
        };

        // Format assignments dan hitung progress
        let totalAssignments = assignments.length;
        let completedAssignments = 0;

        const formattedAssignments = assignments.map((assignment) => {
            if (assignment.active === "Complete") {
                completedAssignments += 1;
            }

            return {
                ...assignment,
                tanggal_mulai: formatTanggal(assignment.tanggal_mulai),
                tanggal_selesai: formatTanggal(assignment.tanggal_selesai),
                question_type:
                    assignment.question_type === "multiple_choice"
                        ? "Pilihan ganda"
                        : assignment.question_type === "essay"
                        ? "Essay"
                        : assignment.question_type, // Default jika tipe soal tidak sesuai
            };
        });

        // Hitung progress sebagai integer (tanpa desimal)
        const progress = Math.round((completedAssignments / totalAssignments) * 100);

        // Respon JSON dengan format yang diinginkan
        return res.status(200).json({
            course_id: courseId,
            progress: `${progress}`,
            list_activity: formattedAssignments,
        });
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
                
                // Nama bulan dalam bahasa Indonesia
                const namaBulan = [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ];

                return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
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
        return res.status(200).json(formattedAssignments[0]);
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
    getTodoUser,
    getTodoUserSchedule,
    getAssignmentByUserCourse,
    getAssignmentByUserCoursePreActivity,
    getAssignmentByUserCoursePostActivity,
    getAssignmentByAssignmentId,
};