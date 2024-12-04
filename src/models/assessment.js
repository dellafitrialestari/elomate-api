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
        a.tanggal_mulai,
        a.tanggal_selesai,
        COALESCE(ae.status, 'Incomplete') AS status
    FROM 
        assessment a
    LEFT JOIN 
        assessment_enrollment ae 
        ON a.assessment_id = ae.assessment_id AND ae.user_user_id = ?
    LEFT JOIN 
        user u
        ON u.user_id = ?
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
        -- u.user_id,
        -- u.nama_lengkap,
        a.assessment_id,
        a.title,
        a.description,
        -- a.category_assessment,
        a.tanggal_mulai,
        a.tanggal_selesai,
        COALESCE(ae.status, 'Incomplete') AS status
    FROM 
        assessment a
    LEFT JOIN 
        assessment_enrollment ae 
        ON a.assessment_id = ae.assessment_id AND ae.user_user_id = ?
    LEFT JOIN 
        user u
        ON u.user_id = ?
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
        -- u.user_id,
        -- u.nama_lengkap,
        a.assessment_id,
        a.title,
        a.description,
        -- a.category_assessment,
        a.tanggal_mulai,
        a.tanggal_selesai,
        COALESCE(ae.status, 'Incomplete') AS status
    FROM 
        assessment a
    LEFT JOIN 
        assessment_enrollment ae 
        ON a.assessment_id = ae.assessment_id AND ae.user_user_id = ?
    LEFT JOIN 
        user u
        ON u.user_id = ?
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
        u.posisi,
        -- u.asal_universitas,
        -- u.jurusan,
        -- u.tempat_lahir,
        -- u.tanggal_lahir,
        -- u.domisili,
        -- u.no_hp,
        CASE 
            WHEN ae.user_user_id IS NULL THEN 'Incomplete'
            ELSE ae.status
        END AS status_peer_assessment
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
    -- AND 
        -- c.course_id IN (
            -- SELECT course_id
            -- FROM course_enrollment
            -- WHERE user_user_id = ?
        -- )
    ;
    `;
    return dbPool.execute(SQLQuery, [assessmentId, userId, userId]);
    // console.log("Executing SQL with parameters:", assessmentId, userId);
    // const [result] = await dbPool.execute(SQLQuery, [assessmentId, userId, userId]);
    // console.log("Query result:", result);
    // return result;
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

const insertScoreAssessment = async (userId, scores) => {
    try {
        const values = scores.map((score) => [
            userId,
            score.question_id,
            score.answer_likert,
            score.score,
        ]);

        const query = `
            INSERT INTO answers_assessment (user_user_id, question_assessment_question_id, answer_likert, score)
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
            FROM answers_assessment
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


module.exports = {
    getAssessmentData,
    getQuestionByAssessmentId,
    getSelfAssessment,
    getPeerAssessment,
    getStatusPeerParticipant,
    getCategoryByAssessmentId,
    insertScoreAssessment,
    getValidQuestionIds,
    checkAllQuestionsAnswered,
    updateAssessmentEnrollmentStatus,
};