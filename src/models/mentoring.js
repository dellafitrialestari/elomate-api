const dbPool = require('../config/database');

const getMentoringDataByUserId = async (userId) => {
    const SQLQuery = `
    SELECT 
        ce.fasilitator_id AS mentor_id,
        u.nama_lengkap AS nama_mentor,
        cr.topik_id AS topik,
        m.course_id,
        cr.nama_course,
        m.tipe_mentoring,
        m.metode_mentoring,
        m.tanggal_mentoring,
        m.jam_mulai,
        m.jam_selesai,
        CONCAT(m.jam_mulai, ' - ', m.jam_selesai) AS waktu_mentoring,
        cr.nama_course AS kompetensi_yang_dievaluasi,
        m.lesson_learned_competencies,
        m.catatan_mentor,
        m.status
    FROM 
        mentoring m
    INNER JOIN 
        course cr ON m.course_id = cr.course_id
    INNER JOIN 
        course_enrollment ce ON ce.course_id = m.course_id
    INNER JOIN 
        user u ON ce.fasilitator_id = u.user_id
    WHERE 
        m.user_user_id = ?;
    `;

    const [rows] = await dbPool.execute(SQLQuery, [userId]);
    return rows;
};

const getCourseIdByName = async (namaCourse) => {
    const SQLQuery = `
        SELECT course_id 
        FROM course 
        WHERE nama_course = ?;
    `;

    const [rows] = await dbPool.execute(SQLQuery, [namaCourse]);
    return rows.length > 0 ? rows[0].course_id : null;
};

const postMentoring = async ({ userId, courseId, tanggal_mentoring, jam_mulai, jam_selesai, metode_mentoring, tipe_mentoring }) => {
    const SQLQuery = `
        INSERT INTO mentoring (
            course_id, 
            user_user_id, 
            tanggal_mentoring, 
            jam_mulai, 
            jam_selesai, 
            metode_mentoring, 
            tipe_mentoring
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    await dbPool.execute(SQLQuery, [courseId, userId, tanggal_mentoring, jam_mulai, jam_selesai, metode_mentoring, tipe_mentoring]);
};


const postMentoringFeedback = async (userId, mentoringId, lesson_learned_competencies, catatan_mentor) => {
    const SQLQuery = `
        UPDATE mentoring
        SET
            lesson_learned_competencies = ?, 
            catatan_mentor = ?,
            status = 'Need Approval'
        WHERE 
            user_user_id = ?
            AND mentoring_id = ?
    `;

    await dbPool.execute(SQLQuery, [lesson_learned_competencies, catatan_mentor, userId, mentoringId]);
};

const getMetodeMentoring = async () => {
    const query = `SHOW COLUMNS FROM mentoring LIKE 'metode_mentoring'`;
    const [rows] = await dbPool.query(query);
    const enumValues = rows[0].Type.match(/enum\(([^)]+)\)/)[1] // Ekstrak enum values
        .split(',')
        .map(value => value.replace(/'/g, '')); // Hapus tanda kutip
    return enumValues;
};

const getTypeMentoring = async () => {
    const query = `SHOW COLUMNS FROM mentoring LIKE 'tipe_mentoring'`;
    const [rows] = await dbPool.query(query);
    const enumValues = rows[0].Type.match(/enum\(([^)]+)\)/)[1] // Ekstrak enum values
        .split(',')
        .map(value => value.replace(/'/g, '')); // Hapus tanda kutip
    return enumValues;
};

const deleteMentoring = (mentoringId, userId) => {
    const SQLQuery = `
    DELETE FROM 
        mentoring 
    WHERE 
        mentoring_id = ?
        AND user_user_id = ?;
    `;
    return dbPool.execute(SQLQuery, [mentoringId, userId]);
}

module.exports = {
    getMentoringDataByUserId,
    getCourseIdByName,
    postMentoring,
    postMentoringFeedback,
    getMetodeMentoring,
    getTypeMentoring,
    deleteMentoring,
};