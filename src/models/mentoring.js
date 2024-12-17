const dbPool = require('../config/database');

const getCoursesByUserId = (userId) => {
    const SQLQuery = `
    SELECT 
        course.course_id,
        course.nama_course,
        user.nama_lengkap AS mentee_name,
        fasilitator.nama_lengkap AS fasilitator_name,
        batch_data.batch_name,
        topik.topik_id,
        topik.nama_topik,
        phase.phase_id,
        phase.nama_phase,
        course_enrollment.progress
    FROM 
        course
    JOIN 
        course_enrollment ON course.course_id = course_enrollment.course_id
    JOIN 
        user ON course_enrollment.user_user_id = user.user_id
    JOIN 
        user AS fasilitator ON course_enrollment.fasilitator_id = fasilitator.user_id
    JOIN 
        batch_data ON course.batch_data_batch_id = batch_data.batch_id
    JOIN 
        topik ON course.topik_id = topik.topik_id
    JOIN 
        phase ON topik.phase_id = phase.phase_id
    WHERE 
        user.user_id = ?
    ORDER BY course.course_id
    `;
    return dbPool.execute(SQLQuery, [userId]);
};

const getMentoringDataByUserId = async (userId) => {
    const SQLQuery = `
    SELECT DISTINCT 
        m.mentoring_id,
        ce.fasilitator_id AS mentor_id,
        u.nama_lengkap AS nama_fasilitator,
        cr.topik_id,
        t.nama_topik,
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
    INNER JOIN 
        topik t ON cr.topik_id = t.topik_id
    WHERE 
        m.user_user_id = ?
    ORDER BY 
        m.tanggal_mentoring ASC, m.jam_mulai ASC;
    `;

    const [rows] = await dbPool.execute(SQLQuery, [userId]);
    return rows;
};

const getMentoringById = async (userId, mentoringId) => {
    const SQLQuery = `
    SELECT DISTINCT 
        m.mentoring_id,
        ce.fasilitator_id AS mentor_id,
        u.nama_lengkap AS nama_fasilitator,
        cr.topik_id,
        t.nama_topik,
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
    INNER JOIN 
        topik t ON cr.topik_id = t.topik_id
    WHERE 
        m.user_user_id = ?
        AND m.mentoring_id = ?
    ORDER BY 
        m.tanggal_mentoring ASC, m.jam_mulai ASC;
    `;

    const [rows] = await dbPool.execute(SQLQuery, [userId, mentoringId]);
    return rows;
};

const getUpcomingData = async (userId) => {
    const SQLQuery = `
    SELECT DISTINCT 
        m.mentoring_id,
        ce.fasilitator_id AS mentor_id,
        u.nama_lengkap AS nama_fasilitator,
        cr.topik_id,
        t.nama_topik,
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
    INNER JOIN 
        topik t ON cr.topik_id = t.topik_id
    WHERE 
        m.user_user_id = ?
        AND m.status IN ("Upcoming", "Overdue")
    ORDER BY 
        m.tanggal_mentoring ASC, m.jam_mulai ASC;
    `;

    const [rows] = await dbPool.execute(SQLQuery, [userId]);
    return rows;
};

const updateOverdueStatus = async (currentDate, userId) => {
    const updateQuery = `
    UPDATE mentoring
    SET status = "Overdue"
    WHERE tanggal_mentoring < ? 
      AND status = "Upcoming" 
      AND user_user_id = ?;
    `;
    await dbPool.execute(updateQuery, [currentDate, userId]);
};

const getMentoringByStatus = async (userId, statusMentoring) => {
    const SQLQuery = `
    SELECT DISTINCT 
        m.mentoring_id,
        ce.fasilitator_id AS mentor_id,
        u.nama_lengkap AS nama_fasilitator,
        cr.topik_id,
        t.nama_topik,
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
    INNER JOIN 
        topik t ON cr.topik_id = t.topik_id
    WHERE 
        m.user_user_id = ?
        AND m.status = ?
    ORDER BY 
        m.tanggal_mentoring ASC, m.jam_mulai ASC;
    `;

    const [rows] = await dbPool.execute(SQLQuery, [userId, statusMentoring]);
    return rows;
};

const getFeedbackData = async (userId) => {
    const SQLQuery = `
    SELECT DISTINCT 
        m.mentoring_id,
        ce.fasilitator_id AS mentor_id,
        u.nama_lengkap AS nama_fasilitator,
        cr.topik_id,
        t.nama_topik,
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
    INNER JOIN 
        topik t ON cr.topik_id = t.topik_id
    WHERE 
        m.user_user_id = ?
        AND m.status = "Need Revision"
    ORDER BY 
        m.tanggal_mentoring ASC, m.jam_mulai ASC;
    `;

    const [rows] = await dbPool.execute(SQLQuery, [userId]);
    return rows;
};

const getApproveData = async (userId) => {
    const SQLQuery = `
    SELECT DISTINCT 
        m.mentoring_id,
        ce.fasilitator_id AS mentor_id,
        u.nama_lengkap AS nama_fasilitator,
        cr.topik_id,
        t.nama_topik,
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
    INNER JOIN 
        topik t ON cr.topik_id = t.topik_id
    WHERE 
        m.user_user_id = ?
        AND m.status = "Approve"
    ORDER BY 
        m.tanggal_mentoring ASC, m.jam_mulai ASC;
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
    getCoursesByUserId,
    getMentoringDataByUserId,
    getMentoringById,
    getMentoringByStatus,
    getUpcomingData,
    updateOverdueStatus,
    getFeedbackData,
    getApproveData,
    getCourseIdByName,
    postMentoring,
    postMentoringFeedback,
    getMetodeMentoring,
    getTypeMentoring,
    deleteMentoring,
};