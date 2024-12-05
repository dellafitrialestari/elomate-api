const dbPool = require('../config/database');

// const getQuestionsByAssignmentId = (assignmentId, userId) => {
//     const SQLQuery = `
//     SELECT 
//         qa.question_id,
//         qa.question_text,
//         a.question_type,
//         GROUP_CONCAT(DISTINCT mco.option_text ORDER BY mco.option_id) AS all_options,
//         GROUP_CONCAT(DISTINCT CASE WHEN mco.is_correct = 'benar' THEN mco.option_text END) AS correct_options,

//         COALESCE(
//             CASE 
//                 WHEN a.question_type = 'multiple_choice' THEN 
//                     (SELECT mco.option_text 
//                     FROM user_has_answers_assignment uha
//                     JOIN multiple_choice_option_assignment mco 
//                         ON uha.answer_option_id = mco.option_id
//                     WHERE uha.user_user_id = ? 
//                     AND mco.question_assignment_question_id = qa.question_id
//                     LIMIT 1)
//                 WHEN a.question_type = 'essay' THEN 
//                     (SELECT uha.essay_answer 
//                     FROM user_has_answers_assignment uha
//                     WHERE uha.user_user_id = ? 
//                     AND uha.question_id = qa.question_id
//                     LIMIT 1)
//             END,
//             'Tidak ada jawaban'
//         ) AS user_answer
//     FROM 
//         question_assignment qa
//     JOIN 
//         assignment a ON qa.assignment_id = a.assignment_id
//     LEFT JOIN 
//         multiple_choice_option_assignment mco ON qa.question_id = mco.question_assignment_question_id

//     WHERE 
//         qa.assignment_id = ?
//     GROUP BY 
//         qa.question_id, a.question_type;
//     `;
//     return dbPool.execute(SQLQuery, [userId, userId, assignmentId]);
// };

const getQuestionsByAssignmentId = (assignmentId, userId) => {
    const SQLQuery = `
    SELECT 
        qa.question_id,
        qa.question_text,
        a.question_type,
        GROUP_CONCAT(DISTINCT mco.option_text ORDER BY mco.option_id) AS all_options
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

    return dbPool.execute(SQLQuery, [assignmentId]); // Hapus userId karena tidak diperlukan
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

//     const SQLQuery = `
//     SELECT question_type 
//     FROM assignment 
//     WHERE assignment_id = ? 
//     LIMIT 1;
//     `;
//     return dbPool.execute(SQLQuery, [assignmentId]);
// };

// const getScore = (userId, assignmentId) => {
//     const SQLQuery = `
//     SELECT score 
//     FROM score_user_assignment 
//     WHERE user_id = ? AND assignment_id = ?;
//     `;
//     return dbPool.execute(SQLQuery, [userId, assignmentId]);
// };

// const updateTotalScore = (userId, assignmentId, totalScore) => {
//     const SQLQuery = `
//     UPDATE score_user_assignment 
//     SET score = ? 
//     WHERE user_id = ? AND assignment_id = ?;
//     `;
//     return dbPool.execute(SQLQuery, [totalScore, userId, assignmentId]);
// };

// const insertTotalScore = (userId, assignmentId, totalScore) => {
//     const SQLQuery = `
//     INSERT INTO score_user_assignment (user_id, assignment_id, score) 
//     VALUES (?, ?, ?);
//     `;
//     return dbPool.execute(SQLQuery, [userId, assignmentId, totalScore]);
// };

const getCorrectOption = async (questionId) => {
    const query = `
        SELECT 
            option_id, 
            option_text
        FROM 
            multiple_choice_option_assignment
        WHERE 
            question_assignment_question_id = ? AND is_correct = 'benar';
    `;
    const [results] = await dbPool.query(query, [questionId]);
    return results;
};

const insertUserAnswer = async (data) => {
    const query = `
        INSERT INTO user_has_answers_assignment
            (user_user_id, question_id, essay_answer, answer_option_id, submitted_at)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            essay_answer = VALUES(essay_answer),
            answer_option_id = VALUES(answer_option_id),
            submitted_at = NOW();
    `;
    const values = [data.user_user_id, data.question_id, data.essay_answer, data.answer_option_id];
    await dbPool.query(query, values);
};

const findQuestionByIdAndAssignment = async (questionId, assignmentId) => {
    const query = `
        SELECT qa.question_id, a.question_type
        FROM question_assignment qa
        JOIN assignment a ON qa.assignment_id = a.assignment_id
        WHERE qa.question_id = ? AND qa.assignment_id = ?
    `;
    const [results] = await dbPool.query(query, [questionId, assignmentId]);
    return results[0];
};

// const findOptionByIdAndQuestion = async (optionId, questionId) => {
//     const query = `
//         SELECT * FROM multiple_choice_option_assignment
//         WHERE option_id = ? AND question_assignment_question_id = ?
//     `;
//     const [results] = await dbPool.query(query, [optionId, questionId]);
//     return results[0];
// };

const findOptionIdByTextAndQuestion = async (optionText, questionId) => {
    const query = `
        SELECT option_id 
        FROM multiple_choice_option_assignment
        WHERE option_text = ? AND question_assignment_question_id = ?
    `;
    const [results] = await dbPool.query(query, [optionText, questionId]);
    return results[0]?.option_id;
};

const insertOrUpdateScore = async (data) => {
    const query = `
        INSERT INTO score_user_assignment (user_id, assignment_id, score, active_status)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            score = VALUES(score),
            active_status = VALUES(active_status);
    `;
    await dbPool.query(query, [data.user_id, data.assignment_id, data.score, data.active_status]);
};

const checkAssignmentId = async(assignmentId) => {
    const query =  `SELECT * FROM assignment WHERE assignment_id = ?`;
    await dbPool.query(query, [assignmentId]);
}

module.exports = {
    getQuestionsByAssignmentId,
    getAnswerByQuestionsId,
    getCorrectOption,
    insertUserAnswer,
    findQuestionByIdAndAssignment,
    findOptionIdByTextAndQuestion,
    insertOrUpdateScore,
    checkAssignmentId,
}