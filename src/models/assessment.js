const dbPool = require('../config/database');


const getAssessmentData = async (userId) => {
    const SQLQuery = `
    SELECT 
        u.user_id,
        u.nama_lengkap,
        a.assessment_id,
        a.title,
        a.description,
        a.category_assessment,
        COALESCE(ad.tanggal_mulai, '-') AS tanggal_mulai,
        COALESCE(ad.tanggal_selesai, '-') AS tanggal_selesai,
        COALESCE(ae.status, 'Incomplete') AS status
    FROM 
        assessment a
    LEFT JOIN 
        assessment_date ad 
        ON a.assessment_id = ad.assessment_id AND ad.batch_id = (
            SELECT batch_data_batch_id 
            FROM user 
            WHERE user_id = ?
        )
    LEFT JOIN 
        user u
        ON u.user_id = ?
    LEFT JOIN 
        assessment_enrollment ae
        ON a.assessment_id = ae.assessment_id AND ae.user_user_id = u.user_id
    ORDER BY 
        a.assessment_id;
    `;
    return dbPool.execute(SQLQuery, [userId, userId]);
};

const getQuestionByAssessmentId = async (assessmentId) => {
    const SQLQuery = `
    SELECT 
        qa.assessment_id,
        a.title AS assessment_title,
        a.category_assessment,
        qa.question_id,
        qa.question_text
    FROM 
        question_assessment qa
    JOIN 
        assessment a 
    ON 
        qa.assessment_id = a.assessment_id
    WHERE 
        qa.assessment_id = ?;
    `;
    return dbPool.execute(SQLQuery, [assessmentId]);
};

const getSelfAssessment = async (userId) => {
    const SQLQuery = `        
    SELECT 
        u.user_id,
        u.nama_lengkap,
        a.assessment_id,
        a.title,
        a.description,
        a.category_assessment,
        COALESCE(ad.tanggal_mulai, '-') AS tanggal_mulai,
        COALESCE(ad.tanggal_selesai, '-') AS tanggal_selesai,
        COALESCE(ae.status, 'Incomplete') AS status
    FROM 
        assessment a
    LEFT JOIN 
        assessment_date ad 
        ON a.assessment_id = ad.assessment_id AND ad.batch_id = (
            SELECT batch_data_batch_id 
            FROM user 
            WHERE user_id = ?
        )
    LEFT JOIN 
        user u
        ON u.user_id = ?
    LEFT JOIN 
        assessment_enrollment ae
        ON a.assessment_id = ae.assessment_id AND ae.user_user_id = u.user_id
    WHERE 
        a.category_assessment = 'Self Assessment'
    ORDER BY 
        a.assessment_id;
    `;
    return dbPool.execute(SQLQuery, [userId, userId]);
};

const getPeerAssessment = async (userId) => {
    const SQLQuery = `
    SELECT 
        u.user_id,
        u.nama_lengkap,
        a.assessment_id,
        a.title,
        a.description,
        a.category_assessment,
        COALESCE(ad.tanggal_mulai, '-') AS tanggal_mulai,
        COALESCE(ad.tanggal_selesai, '-') AS tanggal_selesai,
        COALESCE(ae.status, 'Incomplete') AS status
    FROM 
        assessment a
    LEFT JOIN 
        assessment_date ad 
        ON a.assessment_id = ad.assessment_id AND ad.batch_id = (
            SELECT batch_data_batch_id 
            FROM user 
            WHERE user_id = ?
        )
    LEFT JOIN 
        user u
        ON u.user_id = ?
    LEFT JOIN 
        assessment_enrollment ae
        ON a.assessment_id = ae.assessment_id AND ae.user_user_id = u.user_id
    WHERE 
        a.category_assessment = 'Peer Assessment'
    ORDER BY 
        a.assessment_id;
    `;
    return dbPool.execute(SQLQuery, [userId, userId]);
};

const getStatusPeerParticipant = async (assessmentId, userId) => {
    const SQLQuery = `
    SELECT DISTINCT
        a.assessment_id,
        a.title AS assessment_title,
        u.user_id,
        u.nama_lengkap,
        r.role_name,
        b.batch_name,
        u.nrp,
        u.email,
        u.posisi
    FROM 
        user u
    JOIN 
        role r ON u.role_id = r.role_id
    JOIN 
        batch_data b ON u.batch_data_batch_id = b.batch_id
    JOIN 
        assessment a ON a.assessment_id = ? AND a.category_assessment = 'Peer Assessment'
    LEFT JOIN 
        assessment_enrollment ae ON ae.assessment_id = a.assessment_id AND ae.user_user_id = u.user_id
    WHERE 
        u.batch_data_batch_id = (
            SELECT batch_data_batch_id
            FROM user
            WHERE user_id = ?
        )
    AND 
        u.role_id = (
            SELECT role_id
            FROM user
            WHERE user_id = ?
        )
    AND 
        EXISTS (
            SELECT 1
            FROM course_enrollment ce
            JOIN course c ON ce.course_id = c.course_id
            WHERE ce.user_user_id = ?
            AND c.batch_data_batch_id = u.batch_data_batch_id
        )
    AND 
        u.user_id != ?; -- Exclude the current user
    `;
    return dbPool.execute(SQLQuery, [assessmentId, userId, userId, userId, userId]);
};

const checkIfAssessed = async (assessmentId, assessorId, assessedId) => {
    const SQLQuery = `
    SELECT 1
    FROM assessment_peer_answer
    WHERE assessment_id = ? AND assessor_id = ? AND assessed_id = ?
    LIMIT 1;
    `;
    const [rows] = await dbPool.execute(SQLQuery, [assessmentId, assessorId, assessedId]);
    return rows.length > 0;
};

const getCategoryByAssessmentId = async (assessmentId) => {
    const SQLQuery = `
    SELECT category_assessment
    FROM assessment
    WHERE assessment_id = ?;
    `;
    const [rows] = await dbPool.execute(SQLQuery, [assessmentId]);
    return rows.length > 0 ? rows[0] : null;
};

const submitSelfAssessment = async (userId, scores) => {
    try {
        const values = scores.map((score) => [
            userId,
            score.question_id,
            score.answer_likert,
            score.score,
        ]);

        const query = `
            INSERT INTO assessment_self_answer (user_user_id, question_assessment_question_id, answer_likert, score)
            VALUES ?
            ON DUPLICATE KEY UPDATE 
                answer_likert = VALUES(answer_likert), 
                score = VALUES(score); -- Jika sudah ada, perbarui nilai
        `;

        await dbPool.query(query, [values]);
    } catch (error) {
        console.error(error);
        throw new Error("Failed to insert scores into the database");
    }
};
 
const getValidQuestionIds = async (assessmentId, questionIds) => {
    try {
        const query = `
            SELECT question_id 
            FROM question_assessment 
            WHERE assessment_id = ? AND question_id IN (?);
        `;
        const [rows] = await dbPool.query(query, [assessmentId, questionIds]);
        return rows.map((row) => row.question_id);
    } catch (error) {
        throw new Error("Failed to fetch valid question IDs");
    }
};

const checkAllQuestionsAnswered = async (assessmentId, userId) => {
    try {
        // total pertanyaan for assessment tertentu
        const queryTotal = `
            SELECT COUNT(*) AS total_questions
            FROM question_assessment
            WHERE assessment_id = ?;
        `;
        const [total] = await dbPool.query(queryTotal, [assessmentId]);

        // total pertanyaan yang sudah dijawab
        const queryAnswered = `
            SELECT COUNT(DISTINCT question_assessment_question_id) AS answered_questions
            FROM assessment_self_answer
            WHERE user_user_id = ? AND question_assessment_question_id IN (
                SELECT question_id
                FROM question_assessment
                WHERE assessment_id = ?
            );
        `;
        const [answered] = await dbPool.query(queryAnswered, [userId, assessmentId]);

        return total[0].total_questions === answered[0].answered_questions;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to check if all questions were answered");
    }
};

const updateAssessmentEnrollmentStatus = async (assessmentId, userId, status) => {
    try {
        const query = `
            INSERT INTO assessment_enrollment (assessment_id, user_user_id, status)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status);
        `;
        await dbPool.query(query, [assessmentId, userId, status]);
    } catch (error) {
        console.error(error);
        throw new Error("Failed to update assessment enrollment status");
    }
};

const insertPeerScores = async (assessmentId, scores) => {
    const values = scores.map(score => [
        assessmentId,
        score.assessor_id,
        score.assessed_id,
        score.question_id,
        score.answer_likert,
        score.score,
    ]);

    const query = `
        INSERT INTO assessment_peer_answer (assessment_id, assessor_id, assessed_id, question_id, answer_likert, score)
        VALUES ?
        ON DUPLICATE KEY UPDATE 
            answer_likert = VALUES(answer_likert),
            score = VALUES(score);
    `;

    return dbPool.query(query, [values]);
};

const getAssessmentById = async (assessmentId) => {
    const query = `
        SELECT category_assessment
        FROM assessment
        WHERE assessment_id = ?
    `;
    const [rows] = await dbPool.query(query, [assessmentId]);
    if (rows.length === 0) return null;
    return rows[0];
};

const getAssessmentTitleById = async (assessmentId) => {
    const SQLQuery = `
    SELECT 
        title AS assessment_title,
        category_assessment
    FROM 
        assessment
    WHERE 
        assessment_id = ?;
    `;
    return dbPool.execute(SQLQuery, [assessmentId]);
};

// Fasilitator ----------------------------------------------------
const insertQuestionAndKirkpatrick = async (assessmentId, questionText, pointKirkpatrick, categoryKirkpatrick) => {
    const connection = await dbPool.getConnection();

    try {
        await connection.beginTransaction();

        // Check if the question already exists
        const existingQuestionQuery = `
            SELECT qa.question_id
            FROM question_assessment qa
            WHERE qa.assessment_id = ? AND qa.question_text = ?;
        `;
        const [existingQuestionRows] = await connection.query(existingQuestionQuery, [assessmentId, questionText]);

        let questionId;
        if (existingQuestionRows.length > 0) {
            questionId = existingQuestionRows[0].question_id;
        } else {
            // Insert question into question_assessment table
            const insertQuestionQuery = `
                INSERT INTO question_assessment (assessment_id, question_text)
                VALUES (?, ?);
            `;
            const [insertQuestionResult] = await connection.query(insertQuestionQuery, [assessmentId, questionText]);
            questionId = insertQuestionResult.insertId;
        }

        // Insert into kirkpatrick table
        const insertKirkpatrickQuery = `
            INSERT INTO kirkpatrick (question_id, point_kirkpatrick, category_kirkpatrick)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                point_kirkpatrick = VALUES(point_kirkpatrick),
                category_kirkpatrick = VALUES(category_kirkpatrick);
        `;
        await connection.query(insertKirkpatrickQuery, [questionId, pointKirkpatrick, categoryKirkpatrick]);

        await connection.commit();
        return { success: true };
    } catch (error) {
        await connection.rollback();
        console.error(error);
        return { success: false, message: "Failed to insert question and kirkpatrick." };
    } finally {
        connection.release();
    }
};

const checkPointKirkpatrick = async (pointKirkpatrick) => {
    const query = `
        SELECT 1
        FROM kirkpatrick_points
        WHERE point_kirkpatrick = ?
        LIMIT 1;
    `;
    const [rows] = await dbPool.query(query, [pointKirkpatrick]);
    return rows.length > 0;
};

const checkCategoryKirkpatrick = async (categoryKirkpatrick) => {
    const query = `
        SELECT COLUMN_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'kirkpatrick' AND COLUMN_NAME = 'category_kirkpatrick';
    `;
    const [rows] = await dbPool.query(query);

    if (rows.length > 0) {
        const enumValues = rows[0].COLUMN_TYPE.match(/enum\((.+)\)/i)[1]
            .replace(/'/g, '') // Remove single quotes
            .split(','); // Split into an array of allowed values
        return enumValues.includes(categoryKirkpatrick);
    }

    return false;
};


module.exports = {
    getAssessmentData,
    getQuestionByAssessmentId,
    getSelfAssessment,
    getPeerAssessment,
    getStatusPeerParticipant,
    checkIfAssessed,
    getCategoryByAssessmentId,
    submitSelfAssessment,
    getValidQuestionIds,
    checkAllQuestionsAnswered,
    updateAssessmentEnrollmentStatus,
    insertPeerScores,
    getAssessmentById,
    getAssessmentTitleById,

    // Fasilitator ----------------------------------------
    insertQuestionAndKirkpatrick,
    checkPointKirkpatrick,
    checkCategoryKirkpatrick,
};