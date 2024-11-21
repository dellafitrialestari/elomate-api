const dbPool = require('../config/database');

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


const postMentoringFeedback = (userId) => {

};

module.exports = {
    getCourseIdByName,
    postMentoring,
    postMentoringFeedback,
};