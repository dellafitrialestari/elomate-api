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
        // Siapkan data untuk dimasukkan
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


// const getAssessmentByPhaseTopic = async (userId, phase, topic) => {
//     const SQLQuery = `
//     SELECT 
//         a.assessment_id,
//         a.category_assessment AS category,
//         a.topik_id,
//         t.nama_topik AS nama_topik,
//         p.phase_id,
//         p.nama_phase AS nama_phase,
//         a.title,
//         a.user_user_id AS user_id,
//         u.nama_lengkap AS nama_user,
//         a.description,
//         a.tanggal_mulai,
//         a.tanggal_selesai,
//         a.active AS status
//     FROM 
//         assessment a
//     JOIN 
//         user u ON a.user_user_id = u.user_id
//     JOIN 
//         topik t ON a.topik_id = t.topik_id
//     JOIN 
//         phase p ON t.phase_id = p.phase_id
//     WHERE 
//         a.user_user_id = ?
//         AND t.phase_id = ?
//         AND t.topik_id = ?;
//     `;
//     return dbPool.execute(SQLQuery, [userId, phase, topic]);
// }; 

// const getAssessmentByPhaseTopicCategory = async (userId, phase, topic, categoryAssessment) => {
//     const SQLQuery = `
//     SELECT 
//         a.assessment_id,
//         a.category_assessment AS category,
//         a.topik_id,
//         t.nama_topik AS nama_topik,
//         p.phase_id,
//         p.nama_phase AS nama_phase,
//         a.title,
//         a.user_user_id AS user_id,
//         u.nama_lengkap AS nama_user,
//         a.description,
//         a.tanggal_mulai,
//         a.tanggal_selesai,
//         a.active AS status
//     FROM 
//         assessment a
//     JOIN 
//         user u ON a.user_user_id = u.user_id
//     JOIN 
//         topik t ON a.topik_id = t.topik_id
//     JOIN 
//         phase p ON t.phase_id = p.phase_id
//     WHERE 
//         a.user_user_id = ?
//         AND t.phase_id = ?
//         AND t.topik_id = ?
//         AND a.category_assessment = ?;
//     `;
//     return dbPool.execute(SQLQuery, [userId, phase, topic, categoryAssessment]);
// };

module.exports = {
    getAssessmentData,
    getQuestionByAssessmentId,
    getSelfAssessment,
    getPeerAssessment,
    getStatusPeerParticipant,
    getCategoryByAssessmentId,
    insertScoreAssessment,
    getValidQuestionIds,
    // getAssessmentByPhaseTopic,
    // getAssessmentByPhaseTopicCategory,
};