const QuestionsModel = require("../models/assignmentTask");

const { Storage } = require("@google-cloud/storage");
const { format } = require("util");

const path = require("path");

const storage = new Storage({
    keyFilename: path.join(__dirname, "../config/key.json"),
    projectId: "cogent-node-424708-d7",
});

const bucketName = "elomate-files";
const bucket = storage.bucket(bucketName);

// Helper mengunggah file ke GCS dalam folder
async function uploadToGCS(file, folderName = "") {
    // '/' untuk menyimbolkan folder di GCS
    const filePath = folderName ? `${folderName}/${file.originalname}` : file.originalname;
    const blob = bucket.file(filePath);

    const stream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
    });

    return new Promise((resolve, reject) => {
        stream.on("finish", async () => {
            const publicUrl = format(
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            );
            resolve({ fileName: file.originalname, publicUrl });
        });
        stream.on("error", (err) => reject(err));
        stream.end(file.buffer);
    });
}

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

// ------------------------------------------------------

// insert jawaban esai
const insertUserEssayAnswer = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const userId = req.user?.userId || 1;
        const { essay_answer } = req.body;
        const file = req.file;

        // Periksa jika lebih dari satu file diunggah
        if (req.files && req.files.length > 1) {
            return res.status(400).json({ message: "You can only upload one file." });
        }

        if (!assignmentId || !essay_answer) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Cek assignment_id
        const assignmentExists = await QuestionsModel.checkAssignmentId(assignmentId);
        if (!assignmentExists || assignmentExists.length === 0) {
            return res.status(404).json({ message: `Assignment with ID ${assignmentId} does not exist.` });
        }

        const questions = await QuestionsModel.findQuestionsByAssignmentId(assignmentId);
        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: `No questions found for assignment ${assignmentId}.` });
        }

        const questionTypes = await Promise.all(
            questions.map((question) =>
                QuestionsModel.findQuestionByIdAndAssignment(question.question_id, assignmentId)
            )
        );

        const nonEssayQuestions = questionTypes.filter((q) => q.question_type !== 'essay');
        if (nonEssayQuestions.length > 0) {
            return res.status(400).json({ message: "Only 'essay' type questions are allowed for this operation." });
        }

        const userAnswers = questions.map((question) => ({
            user_user_id: userId,
            question_id: question.question_id,
            essay_answer,
            answer_option_id: null,
        }));

        const insertedAnswers = await QuestionsModel.insertUserAnswersBulk(userAnswers);

        if (file) {
            const folderName = `assignments/${assignmentId}/answers`;
            const fileData = await uploadToGCS(file, folderName);

            const userAnswerIds = insertedAnswers.map((answer) => ({
                user_answer_id: answer.user_answer_id,
            }));

            await QuestionsModel.insertAssignmentFile({
                file_name_id: fileData.fileName,
                bucket_name: bucketName,
                file_size: file.size,
                content_type: file.mimetype,
                user_answers: userAnswerIds,
            });
        }

        res.status(201).json({ message: "Answers submitted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || "An error occurred." });
    }
};

const insertScoreEssay = async (req, res) => { 
    const { assignmentId } = req.params;
    const { score_answer } = req.body;

    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "User ID tidak ditemukan. Pastikan Anda telah login." });
        }

        const assignment = await QuestionsModel.checkAssignmentId(assignmentId);
        if (assignment.length === 0) {
            return res.status(404).json({ message: "Assignment ID tidak ditemukan." });
        }

        // check assignment bertipe essay
        const questionType = assignment[0].question_type;
        if (questionType !== "essay") {
            return res.status(400).json({ message: "Assignment bukan tipe essay." });
        }

        // Cek jika score_user_assignment ada
        const existingScore = await QuestionsModel.findScoreUserAssignment(userId, assignmentId);
        if (existingScore.length === 0) {
            // Insert score baru
            await QuestionsModel.insertOrUpdateScore({
                user_id: userId, 
                assignment_id: assignmentId,
                score: score_answer,
                active_status: "Complete",
            });
            return res.status(201).json({ message: "Score berhasil ditambahkan." });
        } else {
            // Update score
            await QuestionsModel.insertOrUpdateScore({
                user_id: userId,
                assignment_id: assignmentId,
                score: score_answer,
                active_status: "Complete",
            });
            return res.status(200).json({ message: "Score berhasil diperbarui." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};


module.exports = {
    getAnswerByQuestionsId,
    getQuestionsByAssignmentId,
    insertUserAnswer,
    insertUserEssayAnswer,
    insertScoreEssay,
};