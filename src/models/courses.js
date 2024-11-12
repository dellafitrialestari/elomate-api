const dbPool = require('../config/database');

const getCoursesByUserId = (userId) => {
    const SQLQuery = `
    SELECT 
    course.course_id,
    course.nama_course,
    user.nama_lengkap AS mentee_name,
    fasilitator.nama_lengkap AS fasilitator_name,
    batch_data.batch_name,
    topik.nama_topik,
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
    WHERE 
        user.user_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId]);
};

module.exports = {
    getCoursesByUserId,
};
