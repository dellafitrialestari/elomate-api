const QuestionsModel = require("../models/questions");

const getQuestionsByAssignmentId = async (req, res) => {
    const { assignmentId } = req.params;
    const userId = req.user.userId; // Pastikan userId diambil dari middleware autentikasi

    if (!assignmentId) {
        return res.status(400).json({
            message: "assignmentId is required in the request params",
            data: null,
        });
    }

    try {
        const [questions] = await QuestionsModel.getQuestionsByAssignmentId(assignmentId, userId);

        if (!questions || questions.length === 0) {
            return res.status(404).json({
                message: "No questions found for this assignment",
                data: null,
            });
        }

        const formattedQuestions = questions.map((question) => {
            let answerStatus = "-"; // Jawaban manual akan diinputkan kemudian

            if (question.user_answer !== "Tidak ada jawaban" && question.question_type === "multiple_choice") {
                answerStatus = question.user_answer === question.correct_options ? "benar" : "salah";
            }

            return {
                question_text: question.question_text,
                ...(question.question_type === "multiple_choice" && {
                    all_options: question.all_options ? question.all_options.split(",") : [],
                    correct_options: question.correct_options || null,
                }),
                user_answer: question.user_answer || "Tidak ada jawaban",
                answer_status: answerStatus,
            };
        });

        return res.status(200).json(formattedQuestions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getAnswerByQuestionsId = async (req, res) => {
    const { questionId } = req.params;
    const userId = req.user.userId; 
  
    // Check if phase or topic is missing in request body
    if (!questionId) {
        return res.status(400).json({
            message: "Required in the request params",
            data: null,
        });
    }
  
    try {
        // const userId = req.user.userId; // Ensure userId is extracted via middleware authentication

        const [answerQuestion] = await QuestionsModel.getAnswerByQuestionsId(userId, questionId);
        
        if (!answerQuestion || answerQuestion.length === 0) {
            return res.status(404).json({
                message: "No answer found",
                data: null,
            });
        }
  
        // Return the array of courses directly without wrapping in an object
        return res.status(200).json(answerQuestion);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const insertScoreForMultipleChoice = async (req, res) => {
    const { assignmentId } = req.params;
    const userId = req.user.userId; // Pastikan userId diambil dari middleware autentikasi

    if (!assignmentId) {
        return res.status(400).json({
            message: "assignmentId is required",
            data: null,
        });
    }

    try {
        // Dapatkan detail user, course, dan assignment
        const [userAndAssignmentDetails] = await QuestionsModel.getUserAndAssignmentDetails(userId, assignmentId);

        if (!userAndAssignmentDetails || userAndAssignmentDetails.length === 0) {
            return res.status(404).json({
                message: "User or assignment details not found",
                data: null,
            });
        }

        const { user_name, course_name, course_id, assignment_name } = userAndAssignmentDetails[0];

        // Periksa tipe soal assignment
        const [assignmentTypeResult] = await QuestionsModel.getAssignmentType(assignmentId);

        if (!assignmentTypeResult || assignmentTypeResult.length === 0) {
            return res.status(404).json({
                message: "Assignment not found",
                data: null,
            });
        }

        const { question_type } = assignmentTypeResult[0];

        if (question_type !== "multiple_choice") {
            return res.status(400).json({
                message: "Assignment is not of type multiple_choice",
                data: null,
            });
        }

        // Ambil pertanyaan dan jawaban pengguna
        const [questions] = await QuestionsModel.getQuestionsByAssignmentId(assignmentId, userId);

        if (!questions || questions.length === 0) {
            return res.status(404).json({
                message: "No questions found for this assignment",
                data: null,
            });
        }

        // Hitung total skor berdasarkan jawaban benar
        const totalQuestions = questions.length;
        const scorePerQuestion = 100 / totalQuestions; // Skor setiap soal agar total menjadi 100
        let totalScore = 0;
        let correctAnswers = 0;

        questions.forEach((question) => {
            if (
                question.user_answer &&
                question.correct_options &&
                question.user_answer === question.correct_options
            ) {
                correctAnswers += 1; // Hitung jawaban benar
                totalScore += scorePerQuestion; // Tambahkan skor proporsional
            }
        });

        // Cek apakah skor sudah ada di database
        const [existingScore] = await QuestionsModel.getScore(userId, assignmentId);

        if (existingScore.length > 0) {
            // Jika skor ada, update nilai skor
            await QuestionsModel.updateTotalScore(userId, assignmentId, totalScore);
        } else {
            // Jika skor tidak ada, insert skor baru
            await QuestionsModel.insertTotalScore(userId, assignmentId, totalScore);
        }

        return res.status(200).json({
            userId,
            userName: user_name,
            courseName: course_name,
            courseId: course_id,
            assignmentId,
            assignmentName: assignment_name,
            totalCorrectAnswers: correctAnswers,
            totalScore: Math.round(totalScore).toString(),
        });
    } catch (error) {
        console.error("Error calculating score:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};



module.exports = {
    getAnswerByQuestionsId,
    getQuestionsByAssignmentId,
    insertScoreForMultipleChoice,
};