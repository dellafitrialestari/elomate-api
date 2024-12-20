const MentoringModel = require('../models/mentoring');

const getCoursesByUser = async (req, res) => {
    try {
        const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
        
        // Fetch courses based on user ID
        const [courses] = await MentoringModel.getCoursesByUserId(userId);
        
        if (!courses || courses.length === 0) {
            return res.status(404).json({
                message: "No courses found for this user",
                data: null,
            });
        }

        const modifiedCourses = courses.map(course => ({
            ...course,
            nama_course: `${course.nama_course} - ${course.nama_topik}`, // Concatenate 'nama_course' and 'nama_topik'
            // nama_topik: undefined, // 'nama_topik' still in response
        }));

        // Return the modified array of courses
        return res.status(200).json(modifiedCourses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getMentoringData = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch mentoring data
        const mentoringData = await MentoringModel.getMentoringDataByUserId(userId);

        if (!mentoringData || mentoringData.length === 0) {
            return res.status(404).json({ message: "No mentoring data found" });
        }

        // Format tanggal tanpa mengubah zona waktu
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
      
        const formattedData = mentoringData.map((item) => {
            return Object.fromEntries(
                Object.entries(item).map(([key, value]) => {
                    if (key === "tanggal_mentoring") {
                        return [key, formatTanggal(value)];
                    }
                    return [key, value !== null ? value : "-"];
                })
            );
        });

        return res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching mentoring data:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getMentoringById = async (req, res) => {

    const { mentoringId } = req.params;

    try {
        const userId = req.user.userId;

        // Fetch mentoring data
        const mentoringData = await MentoringModel.getMentoringById(userId, mentoringId);

        if (!mentoringData || mentoringData.length === 0) {
            return res.status(404).json({ message: "No mentoring data found" });
        }

        // Format tanggal tanpa mengubah zona waktu
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
      
        const formattedData = mentoringData.map((item) => {
            return Object.fromEntries(
                Object.entries(item).map(([key, value]) => {
                    if (key === "tanggal_mentoring") {
                        return [key, formatTanggal(value)];
                    }
                    return [key, value !== null ? value : "-"];
                })
            );
        });

        return res.status(200).json(formattedData[0]);
    } catch (error) {
        console.error("Error fetching mentoring data:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getMentoringByStatus = async (req, res) => {

    const { statusMentoring } = req.params;

    try {
        const userId = req.user.userId;

        // Fetch mentoring data
        const mentoringData = await MentoringModel.getMentoringByStatus(userId, statusMentoring);

        if (!mentoringData || mentoringData.length === 0) {
            return res.status(404).json({ message: "No mentoring data found" });
        }

        // Format tanggal tanpa mengubah zona waktu
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
      
        const formattedData = mentoringData.map((item) => {
            return Object.fromEntries(
                Object.entries(item).map(([key, value]) => {
                    if (key === "tanggal_mentoring") {
                        return [key, formatTanggal(value)];
                    }
                    return [key, value !== null ? value : "-"];
                })
            );
        });

        return res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching mentoring data:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};


const getUpcomingData = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Perbarui status mentoring berdasarkan tanggal
        const currentDate = new Date().toISOString().split("T")[0];
        await MentoringModel.updateOverdueStatus(currentDate, userId);

        // Fetch mentoring data dengan status "Upcoming" dan "Missed"
        const mentoringData = await MentoringModel.getUpcomingData(userId);

        if (!mentoringData || mentoringData.length === 0) {
            return res.status(404).json({ message: "No mentoring data found" });
        }

        // Format tanggal tanpa mengubah zona waktu
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

        const formattedData = mentoringData.map((item) => {
            return Object.fromEntries(
                Object.entries(item).map(([key, value]) => {
                    if (key === "tanggal_mentoring") {
                        return [key, formatTanggal(value)];
                    }
                    return [key, value !== null ? value : "-"];
                })
            );
        });

        return res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching mentoring data:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getFeedbackData = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch mentoring data
        const mentoringData = await MentoringModel.getFeedbackData(userId);

        if (!mentoringData || mentoringData.length === 0) {
            return res.status(404).json({ message: "No mentoring data found" });
        }

        // Format tanggal tanpa mengubah zona waktu
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
      
        const formattedData = mentoringData.map((item) => {
            return Object.fromEntries(
                Object.entries(item).map(([key, value]) => {
                    if (key === "tanggal_mentoring") {
                        return [key, formatTanggal(value)];
                    }
                    return [key, value !== null ? value : "-"];
                })
            );
        });

        return res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching mentoring data:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getApproveData = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch mentoring data
        const mentoringData = await MentoringModel.getApproveData(userId);

        if (!mentoringData || mentoringData.length === 0) {
            return res.status(404).json({ message: "No mentoring data found" });
        }

        // Format tanggal tanpa mengubah zona waktu
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
      
        const formattedData = mentoringData.map((item) => {
            return Object.fromEntries(
                Object.entries(item).map(([key, value]) => {
                    if (key === "tanggal_mentoring") {
                        return [key, formatTanggal(value)];
                    }
                    return [key, value !== null ? value : "-"];
                })
            );
        });

        return res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching mentoring data:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const postMentoring = async (req, res) => {
    try {
        // Extract user ID from authenticated middleware
        const userId = req.user.userId; // Ensure middleware sets req.user.userId

        // Extract data from request body
        const { nama_course, tanggal_mentoring, jam_mulai, jam_selesai, metode_mentoring, tipe_mentoring } = req.body;

        if (!nama_course || !tanggal_mentoring || !jam_mulai || !jam_selesai || !metode_mentoring || !tipe_mentoring) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Convert tanggal_mentoring from DD-MM-YYYY to YYYY-MM-DD
        const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/; // Regex for DD-MM-YYYY format
        if (!dateRegex.test(tanggal_mentoring)) {
            return res.status(400).json({ message: "Format tanggal mentoring harus DD-MM-YYYY" });
        }

        const [day, month, year] = tanggal_mentoring.split("-");
        const formattedDate = `${year}-${month}-${day}`;

        // Validate format of jam_mulai and jam_selesai
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Regex for HH:mm format
        if (!timeRegex.test(jam_mulai) || !timeRegex.test(jam_selesai)) {
            return res.status(400).json({ message: "Format dari jam mulai dan jam selesai harus HH:mm" });
        }

        // Extract course and topic from the combined 'nama_course'
        const [courseName, topicName] = nama_course.split(" - "); // Assuming the format is "course - topik"

        // Fetch course_id from the database using courseName
        const courseId = await MentoringModel.getCourseIdByName(courseName);

        if (!courseId) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Insert data into mentoring table
        await MentoringModel.postMentoring({
            userId,
            courseId,
            tanggal_mentoring: formattedDate, // Save formatted date
            jam_mulai,
            jam_selesai,
            metode_mentoring,
            tipe_mentoring,
        });

        res.status(201).json({ message: "Mentoring data inserted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const postMentoringFeedback = async (req, res) => {
    try {
        // Extract user ID from authenticated middleware
        const userId = req.user.userId; // Ensure middleware sets req.user.userId
        
        // Extract mentoringId from request params
        const { mentoringId } = req.params;

        // Extract data from request body
        const { lesson_learned_competencies, catatan_mentor } = req.body;

        // Validate required fields
        if (!lesson_learned_competencies || !catatan_mentor) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Update mentoring feedback in the database
        await MentoringModel.postMentoringFeedback(userId, mentoringId, lesson_learned_competencies, catatan_mentor);

        res.status(200).json({ message: "Mentoring feedback insert successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const getMetodeMentoring = async (req, res) => {
  
    // const { phase, topic } = req.params;
  
    // if (!phase || !topic) {
    //     return res.status(400).json({
    //         message: "Phase and topic are required parameters",
    //         data: null,
    //     });
    // }
  
    try {
        // const userId = req.user.userId;
        
        // Fetch courses based on user ID
        // const [courses] = await CoursesModel.getMetodeMentoring(userId, phase, topic);
        
        // if (!courses || courses.length === 0) {
        //     return res.status(404).json({
        //         message: "No courses found for this user",
        //         data: null,
        //     });
        // }

        const metodeMentoring = await MentoringModel.getMetodeMentoring();

        return res.status(200).json(metodeMentoring);
    } catch (error) {
        console.error("Error fetching metode:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getTypeMentoring = async (req, res) => {
  
    try {

        const tipeMentoring = await MentoringModel.getTypeMentoring();

        // return res.status(200).json({
        //     tipe_mentoring: tipeMentoring
        // });

        return res.status(200).json(tipeMentoring);
    } catch (error) {
        console.error("Error fetching tipe_mentoring:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const deleteMentoring = async (req, res) => {
    const { mentoringId } = req.params;

    try {
        const userId = req.user.userId; // Ambil userId dari token

        // Validasi parameter mentoringId
        if (!mentoringId || isNaN(Number(mentoringId))) {
            return res.status(400).json({
                message: "Invalid mentoring ID",
            });
        }

        // Panggil fungsi delete di model
        const [result] = await MentoringModel.deleteMentoring(Number(mentoringId), userId);

        // Cek apakah ada baris yang dihapus
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Mentoring not found or access denied",
            });
        }

        // Respon sukses
        res.status(200).json({
            message: "Delete mentoring success",
        });
    } catch (error) {
        console.error("Error deleting mentoring:", error);
        res.status(500).json({
            message: "Server Error",
            serverMessage: error.message,
        });
    }
};

module.exports = {
    getCoursesByUser,
    getMentoringData,
    getMentoringById,
    getMentoringByStatus,
    getUpcomingData,
    getFeedbackData,
    getApproveData,
    postMentoring,
    postMentoringFeedback,
    getMetodeMentoring,
    getTypeMentoring,
    deleteMentoring,
};