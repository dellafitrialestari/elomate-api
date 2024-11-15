const dbPool = require('../config/database');

const getQuestionsByType = (assignmentId, type) => {
    const SQLQuery = `
    SELECT * 
    FROM 
        question_assignment 
    WHERE 
        assignment_id = ? 
        AND question_type = ?
    `;
    return dbPool.execute(SQLQuery, [assignmentId, type]);
}

const getAnswerByQuestionId = (questionId) => {
    const SQLQuery = `
    SELECT * 
    FROM 
        multiple_choice_option_assignment 
    WHERE 
        question_assignment_question_id = ?
    `;
    return dbPool.execute(SQLQuery, [questionId]);
}


module.exports = {
    getQuestionsByType,
    getAnswerByQuestionId,
}