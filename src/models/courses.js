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

const getCoursesProgressByUser = (userId) => {
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
    ORDER BY 
        course_enrollment.progress ASC;
    `;
    return dbPool.execute(SQLQuery, [userId]);
};

const getTopicProgressByUser = (userId) => {
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
    -- ORDER BY 
        -- course_enrollment.progress ASC;
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
        AND topik.topik_id = ?
    ORDER BY course.course_id;
    `;
    return dbPool.execute(SQLQuery, [userId, phase, topic]);
};

const getCoursesByUserIdCourseId = (userId, courseId) => {
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
        AND course.course_id = ?
    ORDER BY course.course_id;
    `;
    return dbPool.execute(SQLQuery, [userId, courseId]);
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
        AND topik.nama_topik = ?
    ORDER BY course.course_id;
    `;
    return dbPool.execute(SQLQuery, [userId, phaseName, topicName]);
}

const getPhaseCourses = () => {
    const SQLQuery = 'SELECT * FROM phase';
    return dbPool.execute(SQLQuery);
}

const getPhaseCoursesByUserId = (userId) => {
    const SQLQuery = `
    SELECT DISTINCT
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
    SELECT DISTINCT 
        t.topik_id, t.nama_topik
    FROM 
        course_enrollment ce
    JOIN 
        course c ON ce.course_id = c.course_id
    JOIN 
        topik t ON c.topik_id = t.topik_id
    JOIN 
        phase p ON t.phase_id = p.phase_id
    WHERE 
        ce.user_user_id = ? 
        AND t.phase_id = ?;
    
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

const getTotalAssignmentsByCourseId = (courseId) => {
    const SQLQuery = `
        SELECT COUNT(*) AS total_assignments
        FROM assignment
        WHERE course_id = ?;
    `;
    return dbPool.execute(SQLQuery, [courseId]);
};

const getCompletedAssignmentsByUserIdAndCourseId = (userId, courseId) => {
    const SQLQuery = `
        SELECT COUNT(*) AS completed_assignments
        FROM score_user_assignment sua
        JOIN assignment a ON sua.assignment_id = a.assignment_id
        WHERE sua.user_id = ? AND a.course_id = ? AND sua.active_status = 'Complete';
    `;
    return dbPool.execute(SQLQuery, [userId, courseId]);
};

const updateCourseProgress = (userId, courseId, progress) => {
    const SQLQuery = `
        UPDATE course_enrollment
        SET progress = ?
        WHERE user_user_id = ? AND course_id = ?;
    `;
    return dbPool.execute(SQLQuery, [progress, userId, courseId]);
};

// Fasilitator ------------------------------------------------------------------------------------------
const insertCourse = (batch, topik, nama_course) => {
    const SQLQuery = `
        INSERT INTO course (batch_data_batch_id, topik_id, nama_course)
        VALUES (?, ?, ?);
    `;
    return dbPool.execute(SQLQuery, [batch, topik, nama_course]);
};

const getBatchById = (batchId) => {
    const SQLQuery = `SELECT * FROM batch_data WHERE batch_id = ?;`;
    return dbPool.execute(SQLQuery, [batchId]);
};

const getTopikById = (topikId) => {
    const SQLQuery = `SELECT * FROM topik WHERE topik_id = ?;`;
    return dbPool.execute(SQLQuery, [topikId]);
};

const updateCourseById = async (courseId, batch, topik, nama_course) => {
    const query = `
      UPDATE course
      SET 
        batch_data_batch_id = COALESCE(?, batch_data_batch_id),
        topik_id = COALESCE(?, topik_id),
        nama_course = COALESCE(?, nama_course)
      WHERE course_id = ?;
    `;
    return db.execute(query, [batch, topik, nama_course, courseId]);
  };

  

module.exports = {
    getCoursesByUserId,
    getCoursesProgressByUser,
    getTopicProgressByUser,
    getCoursesByUserIdAndPhaseAndTopic,
    getCoursesByUserIdCourseId,
    getCoursesByUserIdAndPhaseNameAndTopicName,
    getPhaseCourses,
    getPhaseCoursesByUserId,
    getTopicByPhase,
    getTopicByPhaseUserId,
    TopicByPhaseUserId,
    // course progress
    getTotalAssignmentsByCourseId,
    getCompletedAssignmentsByUserIdAndCourseId,
    updateCourseProgress,

    // Fasilitator --------------------------------------------------------------------------------------
    insertCourse,
    getBatchById,
    getTopikById,
    updateCourseById,
};
