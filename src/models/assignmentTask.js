const dbPool = require('../config/database');

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
    // const values = [data.user_user_id, data.question_id, data.essay_answer, data.answer_option_id];
    // await dbPool.query(query, values);

    const values = [data.user_user_id, data.question_id, data.essay_answer, data.answer_option_id];
    const [result] = await dbPool.query(query, values);
    return result;
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

const findOptionIdByTextAndQuestion = async (optionText, questionId) => {
    const query = `
        SELECT option_id 
        FROM multiple_choice_option_assignment
        WHERE option_text = ? AND question_assignment_question_id = ?
    `;
    const [results] = await dbPool.query(query, [optionText, questionId]);
    return results[0]?.option_id;
};

const insertOrUpdateScoreMultiple = async ({ user_id, assignment_id, score, active_status }) => {
    const checkQuery = `
        SELECT * 
        FROM score_user_assignment 
        WHERE user_id = ? AND assignment_id = ?
    `;
    const [existingScore] = await dbPool.query(checkQuery, [user_id, assignment_id]);

    if (existingScore.length > 0) {
        // Jika data sudah ada, update skor dan tambahkan jumlah attempt
        const updateQuery = `
            UPDATE score_user_assignment
            SET score = GREATEST(score, ?), 
                attempts = attempts + 1, 
                active_status = ?
            WHERE user_id = ? AND assignment_id = ?
        `;
        await dbPool.query(updateQuery, [score, active_status, user_id, assignment_id]);
    } else {
        // Jika belum ada data, tambahkan skor baru
        const insertQuery = `
            INSERT INTO score_user_assignment (user_id, assignment_id, score, attempts, active_status)
            VALUES (?, ?, ?, 1, ?)
            ON DUPLICATE KEY UPDATE
                score = VALUES(score),
                active_status = VALUES(active_status);
        `;
        await dbPool.query(insertQuery, [user_id, assignment_id, score, active_status]);
    }
};

const insertOrUpdateScore = async ({ user_id, assignment_id, score, active_status }) => {
    const checkQuery = `
        SELECT * 
        FROM score_user_assignment 
        WHERE user_id = ? AND assignment_id = ?
    `;
    const [existingScore] = await dbPool.query(checkQuery, [user_id, assignment_id]);

    if (existingScore.length > 0) {
        // Jika data sudah ada, update skor dan tambahkan jumlah attempt
        const updateQuery = `
            UPDATE score_user_assignment
            SET score = ?, 
                attempts = attempts + 1, 
                active_status = ?
            WHERE user_id = ? AND assignment_id = ?;
        `;
        await dbPool.query(updateQuery, [score, active_status, user_id, assignment_id]);
    } else {
        // Jika belum ada data, tambahkan skor baru
        const insertQuery = `
            INSERT INTO score_user_assignment (user_id, assignment_id, score, attempts, active_status)
            VALUES (?, ?, ?, 1, ?)
            ON DUPLICATE KEY UPDATE
                score = VALUES(score),
                active_status = VALUES(active_status);
        `;
        await dbPool.query(insertQuery, [user_id, assignment_id, score, active_status]);
    }
};

const checkAssignmentId = async(assignmentId) => {
    const query =  `SELECT * FROM assignment WHERE assignment_id = ?`;
    const [rows] = await dbPool.query(query, [assignmentId]);
    return rows;
}

const insertUserAnswer2 = async (data) => {
    const query = `
        INSERT INTO user_has_answers_assignment
            (user_user_id, question_id, essay_answer, answer_option_id, submitted_at)
        VALUES ?
        ON DUPLICATE KEY UPDATE
            essay_answer = VALUES(essay_answer),
            answer_option_id = VALUES(answer_option_id),
            submitted_at = NOW();
    `;

    // array nilai for setiap question_id
    const values = data.question_ids.map((question_id) => [
        data.user_user_id,
        question_id,
        data.essay_answer,
        null, // null -> answer_option_id
    ]);

    const [result] = await dbPool.query(query, [values]);
    return result;
};


const insertAssignmentFile = async (data) => {
    // cek for setiap user_answer_id
    const existingFiles = await Promise.all(
        data.user_answers.map(async (userAnswer) => {
            const queryCheck = `
                SELECT * 
                FROM assignment_files 
                WHERE file_name_id = ? 
                  AND bucket_name = ? 
                  AND file_size = ? 
                  AND content_type = ? 
                  AND user_answer_id = ?;
            `;
            const [rows] = await dbPool.query(queryCheck, [
                data.file_name_id,
                data.bucket_name,
                data.file_size,
                data.content_type,
                userAnswer.user_answer_id,
            ]);
            return rows.length > 0 ? rows[0] : null;
        })
    );

    // Filter data yang belum ada
    const newValues = data.user_answers.filter((userAnswer, index) => !existingFiles[index]);

    // Insert
    if (newValues.length > 0) {
        const queryInsert = `
            INSERT INTO assignment_files 
                (file_name_id, bucket_name, file_size, content_type, created_at, user_answer_id)
            VALUES ?;
        `;

        const values = newValues.map((userAnswer) => [
            data.file_name_id,
            data.bucket_name,
            data.file_size,
            data.content_type,
            new Date(),
            userAnswer.user_answer_id,
        ]);

        const [result] = await dbPool.query(queryInsert, [values]);
        return result;
    }

    return { affectedRows: 0 };
};

const insertUserAnswersBulk = async (answers) => {
    const query = `
        INSERT INTO user_has_answers_assignment
            (user_user_id, question_id, essay_answer, answer_option_id, submitted_at)
        VALUES ?
        ON DUPLICATE KEY UPDATE
            essay_answer = VALUES(essay_answer),
            answer_option_id = VALUES(answer_option_id),
            submitted_at = VALUES(submitted_at);
    `;
    const values = answers.map((answer) => [
        answer.user_user_id,
        answer.question_id,
        answer.essay_answer,
        answer.answer_option_id,
        new Date(), // submitted_at
    ]);

    const [result] = await dbPool.query(query, [values]);

    const insertedIds = await dbPool.query(`
        SELECT user_answer_id FROM user_has_answers_assignment
        WHERE user_user_id = ? AND question_id IN (?)`,
        [answers[0].user_user_id, answers.map((a) => a.question_id)]
    );

    return insertedIds[0];
};

const findQuestionsByAssignmentId = async (assignmentId) => {
    const query = `
        SELECT question_id
        FROM question_assignment
        WHERE assignment_id = ?;
    `;
    const [rows] = await dbPool.query(query, [assignmentId]);
    return rows;
};

const findScoreUserAssignment = async (userId, assignmentId) => {
    const query = `
        SELECT COUNT(*) AS attempts 
        FROM score_user_assignment 
        WHERE user_id = ? AND assignment_id = ?;
    `;
    const [rows] = await dbPool.query(query, [userId, assignmentId]);
    // console.log("Scores fetched for user:", rows); // Debugging
    return rows;
};

const getAttemptCount = async (userId, assignmentId) => {
    const query = `
        SELECT attempts 
        FROM score_user_assignment 
        WHERE user_id = ? AND assignment_id = ?;
    `;
    const [rows] = await dbPool.query(query, [userId, assignmentId]);
    return rows.length > 0 ? rows[0].attempts : 0;
};


module.exports = {
    getQuestionsByAssignmentId,
    getAnswerByQuestionsId,
    getCorrectOption,
    insertUserAnswer,
    findQuestionByIdAndAssignment,
    findOptionIdByTextAndQuestion,
    insertOrUpdateScoreMultiple,
    insertOrUpdateScore,
    checkAssignmentId,
    insertAssignmentFile,
    insertUserAnswer2,
    insertUserAnswersBulk,
    findQuestionsByAssignmentId,
    findScoreUserAssignment,
    getAttemptCount,
}