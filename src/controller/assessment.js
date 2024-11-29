const AssessmentModel = require('../models/assessment');

const getAssessmentData = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [assessments] = await AssessmentModel.getAssessmentData(userId);

        if (!assessments || assessments.length === 0) {
            return res.status(404).json({
                message: "No assessment found for this user",
                data: null,
            });
        }

        // Format tanggal tanpa mengubah zona waktu
        const formatTanggal = (tanggal) => {
            if (tanggal) {
                const tanggalObj = new Date(tanggal);
                const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");
                const namaBulan = [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
                ];
                return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
            }
            return tanggal;
        };

        // Assessments by category
        const groupedAssessments = assessments.reduce((acc, assessment) => {
            const key = `${assessment.category_assessment}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(assessment);
            return acc;
        }, {});

        // add status_total
        const formattedData = Object.values(groupedAssessments).map((group) => {
            const statusTotal = group.every((item) => item.status === "Complete") ? "Complete" : "Incomplete";

            return {
                category: group[0].category_assessment,
                user_id: group[0].user_id,
                nama_user: group[0].nama_lengkap,
                status_total: statusTotal,
                assessments: group.map((item) => ({
                    assessment_id : item.assessment_id,
                    title: item.title,
                    description: item.description,
                    tanggal_mulai: formatTanggal(item.tanggal_mulai),
                    tanggal_selesai: formatTanggal(item.tanggal_selesai),
                    status: item.status,
                })),
            };
        });

        return res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching report:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getQuestionByAssessmentId = async (req, res) => {

    const { assessmentId } = req.params;

    try {
        // const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
        
        // Fetch courses based on user ID
        const [assessment] = await AssessmentModel.getQuestionByAssessmentId(assessmentId);
        
        if (!assessment || assessment.length === 0) {
            return res.status(404).json({
                message: "No question assessment found for this user",
                data: null,
            });
        }

        const formattedData = {
            assessment_id: assessment[0].assessment_id,
            assessment_title: assessment[0].assessment_title,
            question: assessment.map((item) => ({
                question_id: item.question_id,
                question_text: item.question_text,
            })),
        };

        // Return the array directly without wrapping in an object
        return res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching report:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getSelfAssessment = async (req, res) => {

    try {
        const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
        
        // Fetch courses based on user ID
        const [assessment] = await AssessmentModel.getSelfAssessment(userId);
        
        if (!assessment || assessment.length === 0) {
            return res.status(404).json({
                message: "No assessment found for this user",
                data: null,
            });
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

        // Proses setiap assignment untuk format tanggal_mulai dan tanggal_selesai
        const formattedAssessments = assessment.map((assessment) => ({
            ...assessment,
            tanggal_mulai: formatTanggal(assessment.tanggal_mulai),
            tanggal_selesai: formatTanggal(assessment.tanggal_selesai),
        }));


        // Return the array directly without wrapping in an object
        return res.status(200).json(formattedAssessments);
    } catch (error) {
        console.error("Error fetching report:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getPeerAssessment = async (req, res) => {

    try {
        const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
        
        // Fetch courses based on user ID
        const [assessment] = await AssessmentModel.getPeerAssessment(userId);
        
        if (!assessment || assessment.length === 0) {
            return res.status(404).json({
                message: "No assessment found for this user",
                data: null,
            });
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

        // Proses setiap assignment untuk format tanggal_mulai dan tanggal_selesai
        const formattedAssessments = assessment.map((assessment) => ({
            ...assessment,
            tanggal_mulai: formatTanggal(assessment.tanggal_mulai),
            tanggal_selesai: formatTanggal(assessment.tanggal_selesai),
        }));


        // Return the array directly without wrapping in an object
        return res.status(200).json(formattedAssessments);
    } catch (error) {
        console.error("Error fetching report:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

// const getAssessmentByPhaseTopic = async (req, res) => {

//     const { phase, topic } = req.params;

//     try {
//         const userId = req.user.userId;

//         const [assessments] = await AssessmentModel.getAssessmentByPhaseTopic(userId, phase, topic);

//         if (!assessments || assessments.length === 0) {
//             return res.status(404).json({
//                 message: "No assessment found for this user",
//                 data: null,
//             });
//         }

//         // Format tanggal tanpa mengubah zona waktu
//         const formatTanggal = (tanggal) => {
//             if (tanggal) {
//                 const tanggalObj = new Date(tanggal);
//                 const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");
//                 const namaBulan = [
//                     "Januari", "Februari", "Maret", "April", "Mei", "Juni",
//                     "Juli", "Agustus", "September", "Oktober", "November", "Desember",
//                 ];
//                 return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
//             }
//             return tanggal;
//         };

//         // Assessments by category, topik, dan phase
//         const groupedAssessments = assessments.reduce((acc, assessment) => {
//             const key = `${assessment.category}-${assessment.topik_id}-${assessment.phase_id}`;
//             if (!acc[key]) acc[key] = [];
//             acc[key].push(assessment);
//             return acc;
//         }, {});

//         // add status_total
//         const formattedData = Object.values(groupedAssessments).map((group) => {
//             const statusTotal = group.every((item) => item.status === "Complete") ? "Complete" : "Incomplete";

//             return {
//                 category: group[0].category,
//                 topik_id: group[0].topik_id,
//                 nama_topik: group[0].nama_topik,
//                 phase_id: group[0].phase_id,
//                 nama_phase: group[0].nama_phase,
//                 user_id: group[0].user_id,
//                 nama_user: group[0].nama_user,
//                 status_total: statusTotal,
//                 assessments: group.map((item) => ({
//                     assessment_id: item.assessment_id,
//                     title: item.title,
//                     description: item.description,
//                     tanggal_mulai: formatTanggal(item.tanggal_mulai),
//                     tanggal_selesai: formatTanggal(item.tanggal_selesai),
//                     status: item.status,
//                 })),
//             };
//         });

//         return res.status(200).json(formattedData);
//     } catch (error) {
//         console.error("Error fetching report:", error);
//         return res.status(500).json({
//             message: "Internal server error",
//             serverMessage: error.message,
//         });
//     }
// }; 

// const getAssessmentByPhaseTopicCategory = async (req, res) => {

//     const { phase, topic, categoryAssessment } = req.params;

//     try {
//         const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
        
//         // Fetch courses based on user ID
//         const [assessment] = await AssessmentModel.getAssessmentByPhaseTopicCategory(userId, phase, topic, categoryAssessment);
        
//         if (!assessment || assessment.length === 0) {
//             return res.status(404).json({
//                 message: "No assessment found for this user",
//                 data: null,
//             });
//         }

//         // Format tanggal tanpa mengubah zona waktu
//         const formatTanggal = (tanggal) => {
//             if (tanggal) {
//                 const tanggalObj = new Date(tanggal);
//                 const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");
                
//                 // Nama bulan dalam bahasa Indonesia
//                 const namaBulan = [
//                     "Januari", "Februari", "Maret", "April", "Mei", "Juni",
//                     "Juli", "Agustus", "September", "Oktober", "November", "Desember"
//                 ];

//                 return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
//             }
//             return tanggal;
//         };

//         // Proses setiap assignment untuk format tanggal_mulai dan tanggal_selesai
//         const formattedAssessments = assessment.map((assessment) => ({
//             ...assessment,
//             tanggal_mulai: formatTanggal(assessment.tanggal_mulai),
//             tanggal_selesai: formatTanggal(assessment.tanggal_selesai),
//         }));


//         // Return the array directly without wrapping in an object
//         return res.status(200).json(formattedAssessments);
//     } catch (error) {
//         console.error("Error fetching report:", error);
//         return res.status(500).json({
//             message: "Internal server error",
//             serverMessage: error.message,
//         });
//     }
// };

module.exports = {
    getAssessmentData,
    getQuestionByAssessmentId,
    getSelfAssessment,
    getPeerAssessment,
    // getAssessmentByPhaseTopic,
    // getAssessmentByPhaseTopicCategory,
};