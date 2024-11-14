const dbPool = require('../config/database');

const getMateriByUser = (userId) => {
    const SQLQuery = `
    SELECT 
        m.materi_id,
        m.title_materi,
        m.description_materi,
        m.konten_materi,
        m.category,
        c.course_id,
        c.nama_course,
        b.batch_name
    FROM 
        materi m
    JOIN 
        course c ON m.course_id = c.course_id
    JOIN 
        course_enrollment ce ON c.course_id = ce.course_id
    JOIN 
        user u ON ce.user_user_id = u.user_id
    JOIN 
        batch_data b ON u.batch_data_batch_id = b.batch_id
    WHERE 
        u.user_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId]);
}

const getMateriByUserCourse = (userId, courseId) => {
    const SQLQuery = `
    SELECT 
        m.materi_id,
        m.title_materi,
        m.description_materi,
        m.konten_materi,
        m.category,
        c.course_id,
        c.nama_course,
        b.batch_name
    FROM 
        materi m
    JOIN 
        course c ON m.course_id = c.course_id
    JOIN 
        course_enrollment ce ON c.course_id = ce.course_id
    JOIN 
        user u ON ce.user_user_id = u.user_id
    JOIN 
        batch_data b ON u.batch_data_batch_id = b.batch_id
    WHERE 
        u.user_id = ? 
        AND c.course_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId, courseId]);
}

module.exports = {
    getMateriByUser,
    getMateriByUserCourse,
}