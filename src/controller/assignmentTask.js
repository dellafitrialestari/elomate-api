const QuestionsModel = require("../models/assignmentTask");

// const getQuestionsByAssignmentId = async (req, res) => {
//     const { assignmentId } = req.params;
//     const userId = req.user.userId; // Pastikan userId diambil dari middleware autentikasi

//     if (!assignmentId) {
//         return res.status(400).json({
//             message: "assignmentId is required in the request params",
//             data: null,
//         });
//     }

//     try {
//         const [questions] = await QuestionsModel.getQuestionsByAssignmentId(assignmentId, userId);

//         if (!questions || questions.length === 0) {
//             return res.status(404).json({
//                 message: "No questions found for this assignment",
//             });
//         }

//         const formattedQuestions = questions.map((question) => {
//             if (question.question_type === "multiple_choice") {
//                 // const answerStatus =
//                 //     question.user_answer !== "Tidak ada jawaban" &&
//                 //     question.user_answer === question.correct_options
//                 //         ? "benar"
//                 //         : "salah";

//                 return {
//                     question_id: question.question_id,
//                     question_text: question.question_text,
//                     question_type: "Pilihan Ganda",
//                     all_options: question.all_options ? question.all_options.split(",") : [],
//                     // correct_options: question.correct_options || "",
//                     // user_answer: question.user_answer || "Tidak ada jawaban",
//                     // answer_status: answerStatus,
//                 };
//             }

//             if (question.question_type === "essay") {
//                 return {
//                     question_id: question.question_id,
//                     question_text: question.question_text,
//                     question_type: "Essay",
//                     all_options: [], // Null for essay
//                     // correct_options: "", // Null for essay
//                     // user_answer: question.user_answer || "",
//                     // answer_status: "", // Tidak ada benar/salah otomatis for essay
//                 };
//             }

//             return null;
//         }).filter(Boolean); // Hapus entri null jika ada

//         return res.status(200).json(formattedQuestions);
//     } catch (error) {
//         console.error("Error fetching questions:", error);
//         return res.status(500).json({
//             message: "Internal server error",
//             serverMessage: error.message,
//         });
//     }
// };

const getQuestionsByAssignmentId = async (req, res) => {
    const { assignmentId } = req.params;

    if (!assignmentId) {
        return res.status(400).json({
            message: "assignmentId is required in the request params",
            data: null,
        });
    }

    try {
        const [questions] = await QuestionsModel.getQuestionsByAssignmentId(assignmentId);

        if (!questions || questions.length === 0) {
            return res.status(404).json({
                message: "No questions found for this assignment",
            });
        }

        const formattedQuestions = questions.map((question) => ({
            question_id: question.question_id,
            question_text: question.question_text,
            question_type: question.question_type === "multiple_choice" ? "Pilihan Ganda" : "Essay",
            all_options: question.all_options ? question.all_options.split(",") : [],
        }));

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


const insertUserAnswer = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const userId = req.user.userId; // userId dari middleware
        const answers = req.body; // Array jawaban pengguna

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: "Answers must be a non-empty array." });
        }

        let totalQuestions = 0;
        let correctAnswers = 0;
        const detailedResults = [];

        // Proses jawaban secara urut
        for (const answer of answers) {
            const { question_id, user_answer } = answer;

            // get question
            const question = await QuestionsModel.findQuestionByIdAndAssignment(question_id, assignmentId);
            if (!question) {
                throw new Error(`Invalid question ID ${question_id} for assignment.`);
            }

            const { question_type } = question;
            let correctOptions = [];
            let answerStatus = "salah";

            if (question_type === "multiple_choice") {
                // search true option
                const correctOptionRows = await QuestionsModel.getCorrectOption(question_id);
                correctOptions = correctOptionRows.map((row) => row.option_text);

                // id select option user
                const optionId = await QuestionsModel.findOptionIdByTextAndQuestion(user_answer, question_id);

                // Cek benar salah
                const isCorrect = correctOptionRows.some((opt) => opt.option_id === optionId);
                if (isCorrect) {
                    correctAnswers++;
                    answerStatus = "benar";
                }

                // insert
                await QuestionsModel.insertUserAnswer({
                    user_user_id: userId,
                    question_id,
                    essay_answer: null,
                    answer_option_id: optionId || null,
                });
            } else if (question_type === "essay") {
                // essay input manual nilainya
                answerStatus = "-";
                await QuestionsModel.insertUserAnswer({
                    user_user_id: userId,
                    question_id,
                    essay_answer: user_answer,
                    answer_option_id: null,
                });
            } else {
                throw new Error(`Invalid question type for question ID ${question_id}.`);
            }

            totalQuestions++;

            // insert
            detailedResults.push({
                question_id,
                correct_options: correctOptions.length > 0 ? correctOptions.join(", ") : "Tidak ada jawaban benar",
                user_answer,
                answer_status: answerStatus,
            });
        }

        // total skor
        const totalScore = Math.round((correctAnswers / totalQuestions) * 100);

        // insert skor
        await QuestionsModel.insertOrUpdateScore({
            user_id: userId,
            assignment_id: assignmentId,
            score: totalScore,
            active_status: "Complete",
        });

        // respon urut
        return res.status(201).json({
            message: "Answers submitted successfully.",
            totalScore,
            results: detailedResults,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || "An error occurred." });
    }
};



module.exports = {
    getAnswerByQuestionsId,
    getQuestionsByAssignmentId,
    insertUserAnswer,
};