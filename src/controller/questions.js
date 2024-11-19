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


// const getQuestionsByType = async (req, res) => {
//     const { assignmentId, type } = req.params;
  
//     // Check if phase or topic is missing in request body
//     if (!assignmentId || !type) {
//         return res.status(400).json({
//             message: "Required in the request body",
//             data: null,
//         });
//     }
  
//     try {
//         // const userId = req.user.userId; // Ensure userId is extracted via middleware authentication

//         const [questions] = await QuestionsModel.getQuestionsByType(assignmentId, type);
        
//         if (!questions || questions.length === 0) {
//             return res.status(404).json({
//                 message: "No question found for this user",
//                 data: null,
//             });
//         }
  
//         // Return the array of courses directly without wrapping in an object
//         return res.status(200).json(questions);
//     } catch (error) {
//         console.error("Error fetching courses:", error);
//         return res.status(500).json({
//             message: "Internal server error",
//             serverMessage: error.message,
//         });
//     }
// };

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

///////////

// const getQuestionsByAssignmentId = async (req, res) => {
//     const { assignmentId } = req.params;

//     if (!assignmentId) {
//         return res.status(400).json({
//             message: "assignmentId is required in the request params",
//             data: null,
//         });
//     }

//     try {
//         const [questions] = await QuestionsModel.getQuestionsByAssignmentId(assignmentId);

//         if (!questions || questions.length === 0) {
//             return res.status(404).json({
//                 message: "No questions found for this assignment",
//                 data: null,
//             });
//         }

//         return res.status(200).json(questions);
//     } catch (error) {
//         console.error("Error fetching questions:", error);
//         return res.status(500).json({
//             message: "Internal server error",
//             serverMessage: error.message,
//         });
//     }
// };

const insertScoreAnswer = async (req, res) => {
    const { questionId, userAnswer } = req.body;

    if (!questionId || !userAnswer) {
        return res.status(400).json({
            message: "questionId and userAnswer are required",
            data: null,
        });
    }

    try {
        const [correctAnswer] = await QuestionsModel.getCorrectAnswer(questionId);

        if (!correctAnswer) {
            return res.status(404).json({
                message: "Correct answer not found",
                data: null,
            });
        }

        const score = correctAnswer.answer === userAnswer ? 1 : 0;

        await QuestionsModel.insertScore(questionId, score);

        return res.status(200).json({
            message: "Score inserted successfully",
            data: { score },
        });
    } catch (error) {
        console.error("Error inserting score:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const insertScoreForMultipleChoice = async (req, res) => {
    const { assignmentId } = req.body;
    const userId = req.user.userId; // Pastikan userId diambil dari middleware autentikasi

    if (!assignmentId) {
        return res.status(400).json({
            message: "assignmentId is required",
            data: null,
        });
    }

    try {
        // Ambil semua soal pilihan ganda untuk assignment
        const [questions] = await QuestionsModel.getMultipleChoiceQuestions(assignmentId, userId);

        if (!questions || questions.length === 0) {
            return res.status(404).json({
                message: "No multiple-choice questions found for this assignment",
                data: null,
            });
        }

        // Hitung skor untuk setiap soal
        let correctAnswers = 0;
        for (const question of questions) {
            const isCorrect = question.user_answer === question.correct_options;
            correctAnswers += isCorrect ? 1 : 0;

            // Simpan skor per soal ke database
            const score = isCorrect ? 1 : 0;
            await QuestionsModel.insertScore(question.question_id, score);
        }

        // Hitung total score (skor maksimal 100 jika semua benar)
        const totalQuestions = questions.length;
        const totalScore = (correctAnswers / totalQuestions) * 100;

        // Simpan total score ke database
        await QuestionsModel.insertTotalScore(userId, assignmentId, totalScore);

        return res.status(200).json({
            message: "Score calculated and inserted successfully",
            data: { correctAnswers, totalScore },
        });
    } catch (error) {
        console.error("Error inserting score:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};


module.exports = {
    // getQuestionsByType,
    getAnswerByQuestionsId,
    getQuestionsByAssignmentId,
    insertScoreAnswer,
    insertScoreForMultipleChoice,
};