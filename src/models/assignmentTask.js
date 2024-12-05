const dbPool = require('../config/database');

const getQuestionsByAssignmentId = (assignmentId, userId) => {
    const SQLQuery = `
    SELECT 
        qa.question_id,
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

const getAssignmentType = (assignmentId) => {
    const SQLQuery = `
    SELECT question_type 
    FROM assignment 
    WHERE assignment_id = ? 
    LIMIT 1;
    `;
    return dbPool.execute(SQLQuery, [assignmentId]);
};

const getScore = (userId, assignmentId) => {
    const SQLQuery = `
    SELECT score 
    FROM score_user_assignment 
    WHERE user_id = ? AND assignment_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId, assignmentId]);
};

const updateTotalScore = (userId, assignmentId, totalScore) => {
    const SQLQuery = `
    UPDATE score_user_assignment 
    SET score = ? 
    WHERE user_id = ? AND assignment_id = ?;
    `;
    return dbPool.execute(SQLQuery, [totalScore, userId, assignmentId]);
};

const insertTotalScore = (userId, assignmentId, totalScore) => {
    const SQLQuery = `
    INSERT INTO score_user_assignment (user_id, assignment_id, score) 
    VALUES (?, ?, ?);
    `;
    return dbPool.execute(SQLQuery, [userId, assignmentId, totalScore]);
};

const getCorrectOption = (questionId) => {
    const SQLQuery = `
    SELECT 
        mco.option_id, 
        mco.is_correct
    FROM 
        multiple_choice_option_assignment mco
    WHERE 
        mco.question_assignment_question_id = ?
        AND mco.is_correct = 'benar';
    `;
    return dbPool.execute(SQLQuery, [questionId]);
};

const getUserAndAssignmentDetails = (userId, assignmentId) => {
    const SQLQuery = `
    SELECT 
        u.nama_lengkap AS user_name,
        c.nama_course AS course_name,
        c.course_id,
        a.title AS assignment_name,
        a.assignment_id
    FROM 
        user u
    JOIN 
        course_enrollment ce ON u.user_id = ce.user_user_id
    JOIN 
        course c ON ce.course_id = c.course_id
    JOIN 
        assignment a ON c.course_id = a.course_id
    WHERE 
        u.user_id = ? AND a.assignment_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId, assignmentId]);
};



module.exports = {
    getQuestionsByAssignmentId,
    getAnswerByQuestionsId,
    getAssignmentType,
    insertTotalScore,
    getScore,
    updateTotalScore,
    getCorrectOption,
    getUserAndAssignmentDetails,
}