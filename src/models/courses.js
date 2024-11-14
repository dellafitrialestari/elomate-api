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

const getCoursesByUserIdAndPhaseAndTopic = (userId, phase, topic) => {
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
        AND topik.phase_id = ?
        AND topik.topik_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId, phase, topic]);
};

const getCoursesByUserIdAndPhaseNameAndTopicName = (userId, phaseName, topicName) => {
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
        AND phase.nama_phase = ?
        AND topik.nama_topik = ?;
    `;
    return dbPool.execute(SQLQuery, [userId, phaseName, topicName]);
}

const getPhaseCourses = () => {
    const SQLQuery = 'SELECT * FROM phase';
    return dbPool.execute(SQLQuery);
}

const getPhaseCoursesByUserId = (userId) => {
    const SQLQuery = `
    SELECT 
        phase.phase_id,
        phase.nama_phase
    FROM 
        user
    JOIN 
        course_enrollment ON user.user_id = course_enrollment.user_user_id
    JOIN 
        course ON course_enrollment.course_id = course.course_id
    JOIN 
        topik ON course.topik_id = topik.topik_id
    JOIN 
        phase ON topik.phase_id = phase.phase_id
    WHERE 
        user.user_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId]);
}

const getTopicByPhase = (phaseCourse) => {
    const SQLQuery = 'SELECT * FROM topik WHERE phase_id = ?';
    return dbPool.execute(SQLQuery, [phaseCourse]);
}

const getTopicByPhaseUserId = (userId, phaseCourse) => {
    const SQLQuery = `
    SELECT 
        topik.*
    FROM 
        user
    JOIN 
        batch_data ON user.batch_data_batch_id = batch_data.batch_id
    JOIN 
        course ON batch_data.batch_id = course.batch_data_batch_id
    JOIN 
        topik ON course.topik_id = topik.topik_id
    JOIN    
        phase ON topik.phase_id = phase.phase_id
    WHERE 
        user.user_id = ?
        AND phase.phase_id = ?;
    `;
    return dbPool.execute(SQLQuery, [userId, phaseCourse]);
}

const TopicByPhaseUserId = (userId, phaseCourse) => {
    const SQLQuery = `
    SELECT 
        topik.*
    FROM 
        user
    JOIN 
        batch_data ON user.batch_data_batch_id = batch_data.batch_id
    JOIN 
        course ON batch_data.batch_id = course.batch_data_batch_id
    JOIN 
        topik ON course.topik_id = topik.topik_id
    JOIN    
        phase ON topik.phase_id = phase.phase_id
    WHERE 
        user.user_id = ?
        AND phase.nama_phase = ?;
    `;
    return dbPool.execute(SQLQuery, [userId, phaseCourse]);
}

module.exports = {
    getCoursesByUserId,
    getCoursesByUserIdAndPhaseAndTopic,
    getCoursesByUserIdAndPhaseNameAndTopicName,
    getPhaseCourses,
    getPhaseCoursesByUserId,
    getTopicByPhase,
    getTopicByPhaseUserId,
    TopicByPhaseUserId,
};
