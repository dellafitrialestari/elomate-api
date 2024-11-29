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
    // getAssessmentByPhaseTopic,
    // getAssessmentByPhaseTopicCategory,
};