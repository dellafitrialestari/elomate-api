const dbPool = require('../config/database');

const getMateriByUser = (userId) => {
    const SQLQuery = `
    SELECT 
        m.materi_id,
        m.title_materi,
        m.description_materi,
        m.category,
        c.course_id,
        c.nama_course,
        b.batch_name,
        f.file_name_id,
        f.bucket_name,
        f.content_type,
        f.file_path
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
    LEFT JOIN 
        materi_files f ON m.materi_id = f.materi_id
    WHERE 
        u.user_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId]);
};


const getMateriByUserCourse = (userId, courseId) => {
    const SQLQuery = `
    SELECT 
        m.materi_id,
        m.title_materi,
        m.description_materi,
        m.category,
        c.course_id,
        c.nama_course,
        b.batch_name,
        f.file_name_id,
        f.bucket_name,
        f.content_type,
        f.file_path
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
    LEFT JOIN 
        materi_files f ON m.materi_id = f.materi_id
    WHERE 
        u.user_id = ?
		AND c.course_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId, courseId]);
}

const getMateriByMateriId = (userId, materiId) => {
    const SQLQuery = `
    SELECT 
        m.materi_id,
        m.title_materi,
        m.description_materi,
        m.category,
        c.course_id,
        c.nama_course,
        b.batch_name,
        f.file_name_id,
        f.bucket_name,
        f.content_type,
        f.file_path
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
    LEFT JOIN 
        materi_files f ON m.materi_id = f.materi_id
    WHERE 
        u.user_id = ?
        AND m.materi_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId, materiId]);
}

module.exports = {
    getMateriByUser,
    getMateriByUserCourse,
    getMateriByMateriId,
}