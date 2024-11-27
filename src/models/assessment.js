const dbPool = require('../config/database');

const getAssessmentData = async (userId) => {
    const SQLQuery = `
    SELECT 
        a.category_assessment AS category,
        a.topik_id,
        t.nama_topik AS nama_topik,
        p.phase_id,
        p.nama_phase AS nama_phase,
        a.title,
        a.user_user_id AS user_id,
        u.nama_lengkap AS nama_user,
        a.description,
        a.tanggal_mulai,
        a.tanggal_selesai,
        a.active AS status
    FROM 
        assessment a
    JOIN 
        user u ON a.user_user_id = u.user_id
    JOIN 
        topik t ON a.topik_id = t.topik_id
    JOIN 
        phase p ON t.phase_id = p.phase_id
    WHERE 
        a.user_user_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId]);
};

const getAssessmentByPhaseTopic = async (userId, phase, topic) => {
    const SQLQuery = `
    SELECT 
        a.category_assessment AS category,
        a.topik_id,
        t.nama_topik AS nama_topik,
        p.phase_id,
        p.nama_phase AS nama_phase,
        a.title,
        a.user_user_id AS user_id,
        u.nama_lengkap AS nama_user,
        a.description,
        a.tanggal_mulai,
        a.tanggal_selesai,
        a.active AS status
    FROM 
        assessment a
    JOIN 
        user u ON a.user_user_id = u.user_id
    JOIN 
        topik t ON a.topik_id = t.topik_id
    JOIN 
        phase p ON t.phase_id = p.phase_id
    WHERE 
        a.user_user_id = ?
        AND t.phase_id = ?
        AND t.topik_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId, phase, topic]);
};

const getAssessmentByPhaseTopicCategory = async (userId, phase, topic, categoryAssessment) => {
    const SQLQuery = `
    SELECT 
        a.category_assessment AS category,
        a.topik_id,
        t.nama_topik AS nama_topik,
        p.phase_id,
        p.nama_phase AS nama_phase,
        a.title,
        a.user_user_id AS user_id,
        u.nama_lengkap AS nama_user,
        a.description,
        a.tanggal_mulai,
        a.tanggal_selesai,
        a.active AS status
    FROM 
        assessment a
    JOIN 
        user u ON a.user_user_id = u.user_id
    JOIN 
        topik t ON a.topik_id = t.topik_id
    JOIN 
        phase p ON t.phase_id = p.phase_id
    WHERE 
        a.user_user_id = ?
        AND t.phase_id = ?
        AND t.topik_id = ?
        AND a.category_assessment = ?;
    `;
    return dbPool.execute(SQLQuery, [userId, phase, topic, categoryAssessment]);
};

module.exports = {
    getAssessmentData,
    getAssessmentByPhaseTopic,
    getAssessmentByPhaseTopicCategory,
};