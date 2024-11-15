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

// const getAnswerByQuestionId = (questionId) => {
//     const SQLQuery = `
//     SELECT * 
//     FROM 
//         multiple_choice_option_assignment 
//     WHERE 
//         question_assignment_question_id = ?
//     `;
//     return dbPool.execute(SQLQuery, [questionId]);
// }

const getQuestionsByAssignmentId = (assignmentId) => {
    const SQLQuery = `
    SELECT q.question, o.options, o.correct_answer, o.score
    FROM question_assignment q
    LEFT JOIN multiple_choice_option_assignment o 
    ON q.question_id = o.question_assignment_question_id
    WHERE q.assignment_id = ?`;
    return dbPool.execute(SQLQuery, [assignmentId]);
};

const getCorrectAnswer = (questionId) => {
    const SQLQuery = `
    SELECT correct_answer 
    FROM multiple_choice_option_assignment 
    WHERE question_assignment_question_id = ?`;
    return dbPool.execute(SQLQuery, [questionId]);
};

const insertScore = (questionId, score) => {
    const SQLQuery = `
    INSERT INTO scores (question_id, score) 
    VALUES (?, ?)`;
    return dbPool.execute(SQLQuery, [questionId, score]);
};

module.exports = {
    getQuestionsByType,
    // getAnswerByQuestionId,
    getQuestionsByAssignmentId,
    getCorrectAnswer,
    insertScore,
}