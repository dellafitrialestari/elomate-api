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
            if (tanggal && tanggal !== "-") {
                const tanggalObj = new Date(tanggal);
                const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");
                const namaBulan = [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
                ];
                return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
            }
            return "-";
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
                    assessment_id: item.assessment_id,
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
            // Jika tidak ada data dalam query, tampilkan assessment_id dan assessment_title dengan question kosong
            const [titleResult] = await AssessmentModel.getAssessmentTitleById(assessmentId);

            if (!titleResult || titleResult.length === 0) {
                return res.status(404).json({
                    message: "Assessment not found",
                    assessment_id: assessmentId,
                    assessment_title: null,
                });
            }

            return res.status(404).json({
                message: "No question assessment found for this user",
                assessment_id: assessmentId,
                assessment_title: titleResult[0].assessment_title,
                category_assessment: titleResult[0].category_assessment,
            });
        }

        const formattedData = {
            assessment_id: assessment[0].assessment_id,
            assessment_title: assessment[0].assessment_title,
            category_assessment: assessment[0].category_assessment,
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
            if (tanggal && tanggal !== "-") {
                const tanggalObj = new Date(tanggal);
                const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");
                const namaBulan = [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
                ];
                return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
            }
            return "-";
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
            if (tanggal && tanggal !== "-") {
                const tanggalObj = new Date(tanggal);
                const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");
                const namaBulan = [
                    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
                ];
                return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
            }
            return "-";
        };  

        // format tanggal_mulai dan tanggal_selesai untuk setiap assessment
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

const getStatusPeerParticipant = async (req, res) => {
    const { assessmentId } = req.params;

    try {
        const userId = req.user.userId;

        console.log("Received parameters:", { assessmentId, userId });

        // get kategori assessment
        const assessmentData = await AssessmentModel.getCategoryByAssessmentId(assessmentId);

        if (!assessmentData) {
            return res.status(404).json({
                message: `Assessment with ID ${assessmentId} not found.`,
            });
        }

        // Validasi kategori assessment
        const categoryAssessment = assessmentData.category_assessment;
        if (categoryAssessment !== "Peer Assessment") {
            return res.status(400).json({
                message: `Assessment with ID ${assessmentId} is not categorized as Peer Assessment.`,
            });
        }

        // get peserta se-batch & se-role
        const [participants] = await AssessmentModel.getStatusPeerParticipant(assessmentId, userId);

        if (!participants || participants.length === 0) {
            return res.status(404).json({
                message: "No participants found for this assessment",
            });
        }

        // Cek apakah user sudah memberikan penilaian 360 derajat
        const data = await Promise.all(
            participants.map(async (participant) => {
                const hasAssessed = await AssessmentModel.checkIfAssessed(
                    assessmentId,
                    userId,
                    participant.user_id
                );

                return {
                    user_id: participant.user_id,
                    nama_lengkap: participant.nama_lengkap,
                    role_name: participant.role_name,
                    batch_name: participant.batch_name,
                    nrp: participant.nrp,
                    email: participant.email,
                    posisi: participant.posisi,
                    status_peer_assessment: hasAssessed ? "Complete" : "Incomplete",
                };
            })
        );

        // status total apakah semua "Complete" atau ada yang "Incomplete"
        const allComplete = data.every((item) => item.status_peer_assessment === "Complete");
        const overallStatus = allComplete ? "Complete" : "Incomplete";

        // if `overall_status` = "Complete", masukkan ke tabel `assessment_enrollment`
        if (overallStatus === "Complete") {
            await AssessmentModel.updateAssessmentEnrollmentStatus(assessmentId, userId, overallStatus);
        }

        const response = {
            assessment_id: assessmentId,
            assessment_title: participants[0]?.assessment_title || "N/A",
            overall_status: overallStatus,
            data,
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching participants:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const submitSelfAssessment = async (req, res) => {
    try {
        const userId = req.user.userId; // userId from middleware
        const responses = req.body;
        const assessmentId = req.params.assessmentId;

        if (!assessmentId) {
            return res.status(400).json({ message: "Assessment ID is required" });
        }

        // Assessment category check
        const assessment = await AssessmentModel.getAssessmentById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found." });
        }
        if (assessment.category_assessment !== "Self Assessment") {
            return res.status(400).json({ message: "This assessment is not a Self Assessment." });
        }

        // Check if the user has already submitted all answers
        const allQuestionsAnswered = await AssessmentModel.checkAllQuestionsAnswered(assessmentId, userId);
        if (allQuestionsAnswered) {
            return res.status(400).json({ message: "Assessment already submitted, submitting again is not allowed." });
        }

        // Validate input
        if (!Array.isArray(responses) || responses.length === 0) {
            return res.status(400).json({ message: "Responses must be a non-empty array" });
        }

        // Validate question IDs for the assessment
        const questionIds = responses.map((response) => response.question_id);
        const validQuestionIds = await AssessmentModel.getValidQuestionIds(assessmentId, questionIds);

        if (validQuestionIds.length !== questionIds.length) {
            return res.status(400).json({ message: "Some question IDs are invalid for this assessment" });
        }

        // Map Likert scores to numeric and descriptive format
        const likertMapping = {
            1: "1 - Sangat Kurang Baik",
            2: "2 - Kurang Baik",
            3: "3 - Cukup Baik",
            4: "4 - Baik",
            5: "5 - Sangat Baik",
        };

        // Konversi jawaban -> format yang benar
        const scores = responses.map((response) => {
            const numericValue = parseInt(response.answer_likert, 10);
            if (!likertMapping[numericValue]) {
                throw new Error(`Invalid answer_likert value: ${response.answer_likert}`);
            }

            return {
                question_id: response.question_id,
                answer_likert: likertMapping[numericValue],
                score: numericValue,
            };
        });

        // Insert scores into the database
        await AssessmentModel.submitSelfAssessment(userId, scores);

        // Check again if all questions are answered
        const updatedAllQuestionsAnswered = await AssessmentModel.checkAllQuestionsAnswered(assessmentId, userId);
        const status = updatedAllQuestionsAnswered ? "Complete" : "Incomplete";
        await AssessmentModel.updateAssessmentEnrollmentStatus(assessmentId, userId, status);

        return res.status(201).json({ message: "Scores inserted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const submitPeerAssessment = async (req, res) => {
    const assessorId = req.user.userId; // Assessor ID dari middleware
    const assessedId = req.params.assessedId; // Assessed ID - teman yang dinilai
    const { assessmentId } = req.params;
    const assessments = req.body;

    try {
        // Cek kategori assessment
        const assessment = await AssessmentModel.getAssessmentById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found." });
        }
        if (assessment.category_assessment !== "Peer Assessment") {
            return res.status(400).json({ message: "This assessment is not a Peer Assessment." });
        }

        // Cek apakah sudah ada jawaban untuk kombinasi assessor dan assessed
        const alreadyAssessed = await AssessmentModel.checkIfAssessed(assessmentId, assessorId, assessedId);
        if (alreadyAssessed) {
            return res.status(400).json({
                message: "Assessment already submitted, submitting again is not allowed."
            });
        }

        // Validasi question_id di assessment
        const questionIds = assessments.map(a => a.question_id);
        const validQuestionIds = await AssessmentModel.getValidQuestionIds(assessmentId, questionIds);

        // Cek apakah semua question_id valid
        const invalidQuestionIds = questionIds.filter(id => !validQuestionIds.includes(id));
        if (invalidQuestionIds.length > 0) {
            return res.status(400).json({ 
                message: "Some question IDs are invalid.", 
                invalidQuestionIds 
            });
        }

        // Mapping Likert -> format lengkap
        const likertMapping = {
            "1": "1 - Sangat Kurang Baik",
            "2": "2 - Kurang Baik",
            "3": "3 - Cukup Baik",
            "4": "4 - Baik",
            "5": "5 - Sangat Baik",
        };

        const formattedScores = assessments.map(assessment => {
            const answerLikertFull = likertMapping[assessment.answer_likert];
            if (!answerLikertFull) {
                throw new Error(`Invalid answer_likert value: ${assessment.answer_likert}`);
            }
            return {
                assessor_id: assessorId,
                assessed_id: assessedId,
                question_id: assessment.question_id,
                answer_likert: answerLikertFull,
                score: parseInt(assessment.answer_likert, 10), // Simpan skor numerik
            };
        });

        // insert
        await AssessmentModel.insertPeerScores(assessmentId, formattedScores);

        return res.status(201).json({ message: "Peer assessment submitted successfully." });
    } catch (error) {
        console.error("Error submitting peer assessment:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Fasilitator ---------------------------------------------------------------------------------
const postQuestionByAssessmentId = async (req, res) => {
    const { assessmentId } = req.params;
    const questions = req.body; // Array of questions

    try {
        // Validasi assessment_id
        const isAssessmentValid = await AssessmentModel.getAssessmentById(assessmentId);
        if (!isAssessmentValid) {
            return res.status(400).json({
                message: `Invalid assessment_id: '${assessmentId}'. Please provide a valid ID.`,
            });
        }

        for (const { question, point_kirkpatrick, category_kirkpatrick } of questions) {
            // Validasi point_kirkpatrick dan category_kirkpatrick
            const isPointValid = await AssessmentModel.checkPointKirkpatrick(point_kirkpatrick);
            const isCategoryValid = await AssessmentModel.checkCategoryKirkpatrick(category_kirkpatrick);

            if (!isPointValid) {
                return res.status(400).json({
                    message: `Invalid point_kirkpatrick: '${point_kirkpatrick}'. Please provide a valid value.`,
                });
            }

            if (!isCategoryValid) {
                return res.status(400).json({
                    message: `Invalid category_kirkpatrick: '${category_kirkpatrick}'. Please provide a valid value.`,
                });
            }

            // Insert question and kirkpatrick
            const result = await AssessmentModel.insertQuestionAndKirkpatrick(
                assessmentId,
                question,
                point_kirkpatrick,
                category_kirkpatrick
            );

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }
        }

        res.status(201).json({ message: "All data successfully inserted." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while inserting data." });
    }
};



module.exports = {
    getAssessmentData,
    getQuestionByAssessmentId,
    getSelfAssessment,
    getPeerAssessment,
    getStatusPeerParticipant,
    submitSelfAssessment,
    submitPeerAssessment,
    // Fasilitator
    postQuestionByAssessmentId,
};