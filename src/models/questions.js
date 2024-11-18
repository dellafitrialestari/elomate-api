const dbPool = require('../config/database');

const getQuestionsByAssignmentId = (assignmentId, userId) => {
    const SQLQuery = `
    SELECT 
        qa.question_text,
        a.question_type,
        GROUP_CONCAT(DISTINCT mco.option_text ORDER BY mco.option_id) AS all_options,
        GROUP_CONCAT(DISTINCT CASE WHEN mco.is_correct = 'benar' THEN mco.option_text END) AS correct_options,

        COALESCE(
            CASE 
                WHEN a.question_type = 'multiple_choice' THEN 
                    (SELECT mco.option_text 
                    FROM user_has_answers_assignment uha
                    JOIN multiple_choice_option_assignment mco 
                        ON uha.answer_option_id = mco.option_id
                    WHERE uha.user_user_id = ? 
                    AND mco.question_assignment_question_id = qa.question_id
                    LIMIT 1)
                WHEN a.question_type = 'essay' THEN 
                    (SELECT uha.essay_answer 
                    FROM user_has_answers_assignment uha
                    WHERE uha.user_user_id = ? 
                    AND uha.question_id = qa.question_id
                    LIMIT 1)
            END,
            'Tidak ada jawaban'
        ) AS user_answer
    FROM 
        question_assignment qa
    JOIN 
        assignment a ON qa.assignment_id = a.assignment_id
    LEFT JOIN 
        multiple_choice_option_assignment mco ON qa.question_id = mco.question_assignment_question_id

    WHERE 
        qa.assignment_id = ?
    GROUP BY 
        qa.question_id, a.question_type;
    `;
    return dbPool.execute(SQLQuery, [userId, userId, assignmentId]);
};

const getAnswerByQuestionsId = (userId, questionId) => {
    const SQLQuery = `
    SELECT 
        uhaa.user_user_id,
        uhaa.question_id,
        a.question_type,
        CASE 
            WHEN a.question_type = 'multiple_choice' THEN mcoa.option_text
            WHEN a.question_type = 'essay' THEN uhaa.essay_answer
            ELSE NULL
        END AS user_answer
    FROM 
        user_has_answers_assignment uhaa
    JOIN 
        question_assignment qa ON uhaa.question_id = qa.question_id
    JOIN 
        assignment a ON qa.assignment_id = a.assignment_id
    LEFT JOIN 
        multiple_choice_option_assignment mcoa 
        ON uhaa.answer_option_id = mcoa.option_id
    WHERE 
        uhaa.user_user_id = ? 
        AND uhaa.question_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId, questionId]);
};




// const getQuestionsByType = (assignmentId, type) => {
//     const SQLQuery = `
//     SELECT * 
//     FROM 
//         question_assignment 
//     WHERE 
//         assignment_id = ? 
//         AND question_type = ?
//     `;
//     return dbPool.execute(SQLQuery, [assignmentId, type]);
// }

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

//////////////

// const getQuestionsByAssignmentId = (assignmentId) => {
//     const SQLQuery = `
//     SELECT 
//         qa.question_text,
//         GROUP_CONCAT(DISTINCT mco.option_text ORDER BY mco.option_id) AS all_options,
//         GROUP_CONCAT(DISTINCT CASE WHEN mco.is_correct = 'benar' THEN mco.option_text END) AS correct_options
//     FROM 
//         question_assignment qa
//     LEFT JOIN 
//         multiple_choice_option_assignment mco ON qa.question_id = mco.question_assignment_question_id
//     WHERE 
//         qa.assignment_id = ?
//     GROUP BY 
//         qa.question_text;
//     `;
//     return dbPool.execute(SQLQuery, [assignmentId]);
// };

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
    // getQuestionsByType,
    // getAnswerByQuestionId,
    getQuestionsByAssignmentId,
    getAnswerByQuestionsId,
    getCorrectAnswer,
    insertScore,
}