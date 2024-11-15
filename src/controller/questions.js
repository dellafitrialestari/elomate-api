const QuestionsModel = require("../models/questions");

const getQuestionsByType = async (req, res) => {
    const { assignmentId, type } = req.params;
  
    // Check if phase or topic is missing in request body
    if (!assignmentId || !type) {
        return res.status(400).json({
            message: "Required in the request body",
            data: null,
        });
    }
  
    try {
        // const userId = req.user.userId; // Ensure userId is extracted via middleware authentication

        const [questions] = await QuestionsModel.getQuestionsByType(assignmentId, type);
        
        if (!questions || questions.length === 0) {
            return res.status(404).json({
                message: "No courses found for this user",
                data: null,
            });
        }
  
        // Return the array of courses directly without wrapping in an object
        return res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getAnswerByQuestionId = async (req, res) => {
    const { questionId } = req.params;
  
    // Check if phase or topic is missing in request body
    if (!questionId) {
        return res.status(400).json({
            message: "Required in the request params",
            data: null,
        });
    }
  
    try {
        // const userId = req.user.userId; // Ensure userId is extracted via middleware authentication

        const [answerQuestion] = await QuestionsModel.getAnswerByQuestionId(questionId);
        
        if (!answerQuestion || answerQuestion.length === 0) {
            return res.status(404).json({
                message: "No courses found for this user",
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

module.exports = {
    getQuestionsByType,
    getAnswerByQuestionId,
};