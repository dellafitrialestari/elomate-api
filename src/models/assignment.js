const dbPool = require('../config/database');

const getAssignmentByUser = (userId) => {
    const SQLQuery = `
    SELECT 
        a.assignment_id,
        a.course_id,
        a.title,
        a.tanggal_mulai,
        a.tanggal_selesai,
        a.category,
        COALESCE(MAX(sua.active_status), 'Incomplete') AS active
    FROM 
        assignment a
    JOIN 
        course_enrollment ce ON a.course_id = ce.course_id
    LEFT JOIN 
        score_user_assignment sua ON a.assignment_id = sua.assignment_id AND ce.user_user_id = sua.user_id
    WHERE 
        ce.user_user_id = ?
    GROUP BY 
        a.assignment_id, a.course_id, a.title, a.tanggal_mulai, a.tanggal_selesai, a.category;
    `;
    return dbPool.execute(SQLQuery, [userId]);
}

const getTodoUser = (userId) => {
    const SQLQuery = `
    SELECT  
        a.assignment_id,
        a.course_id,
        c.nama_course,
        a.title,
        a.question_type,
        a.tanggal_mulai,
        a.tanggal_selesai,
        a.category,
        COALESCE(MAX(sua.active_status), 'Incomplete') AS active
    FROM 
        assignment a
    JOIN
        course c ON a.course_id = c.course_id
    JOIN 
        course_enrollment ce ON a.course_id = ce.course_id
    LEFT JOIN 
        score_user_assignment sua ON a.assignment_id = sua.assignment_id AND sua.user_id = ce.user_user_id
    WHERE 
        ce.user_user_id = ?
        AND COALESCE(sua.active_status, 'Incomplete') = 'Incomplete'

    GROUP BY 
        a.assignment_id, a.course_id, c.nama_course, a.title, a.question_type, a.tanggal_mulai, a.tanggal_selesai, a.category;
    `;
    return dbPool.execute(SQLQuery, [userId]);
}

const getAssignmentByUserCourse = (userId, courseId) => {
    const SQLQuery = `
    SELECT 
        a.assignment_id,
        a.course_id,
        a.title,
        a.tanggal_mulai,
        a.tanggal_selesai,
        a.category,
        COALESCE(MAX(sua.active_status), 'Incomplete') AS active
    FROM 
        assignment a
    JOIN 
        course_enrollment ce ON a.course_id = ce.course_id
    LEFT JOIN 
        score_user_assignment sua ON a.assignment_id = sua.assignment_id AND ce.user_user_id = sua.user_id
    WHERE 
        ce.user_user_id = ? 
        AND a.course_id = ?
    GROUP BY 
        a.assignment_id, a.course_id, a.title, a.tanggal_mulai, a.tanggal_selesai, a.category;
    `;
    return dbPool.execute(SQLQuery, [userId, courseId]);
}

const getAssignmentByUserCoursePreActivity = (userId, courseId) => {
    const SQLQuery = `
    SELECT  
        a.assignment_id,
        a.course_id,
        c.nama_course,
        a.title,
        a.question_type,
        a.tanggal_mulai,
        a.tanggal_selesai,
        a.category,
        COALESCE(MAX(sua.active_status), 'Incomplete') AS active
    FROM 
        assignment a
    JOIN
        course c ON a.course_id = c.course_id
    JOIN 
        course_enrollment ce ON a.course_id = ce.course_id
    LEFT JOIN 
        score_user_assignment sua ON a.assignment_id = sua.assignment_id AND sua.user_id = ce.user_user_id
    WHERE 
        ce.user_user_id = ? 
        AND a.course_id = ?
        AND a.category = "pre_activity"
    GROUP BY 
        a.assignment_id, a.course_id, c.nama_course, a.title, a.question_type, a.tanggal_mulai, a.tanggal_selesai, a.category;
    `;
    return dbPool.execute(SQLQuery, [userId, courseId]);
}

const getAssignmentByUserCoursePostActivity = (userId, courseId) => {
    const SQLQuery = `
    SELECT  
        a.assignment_id,
        a.course_id,
        c.nama_course,
        a.title,
        a.question_type,
        a.tanggal_mulai,
        a.tanggal_selesai,
        a.category,
        COALESCE(MAX(sua.active_status), 'Incomplete') AS active
    FROM 
        assignment a
    JOIN
        course c ON a.course_id = c.course_id
    JOIN 
        course_enrollment ce ON a.course_id = ce.course_id
    LEFT JOIN 
        score_user_assignment sua ON a.assignment_id = sua.assignment_id AND sua.user_id = ce.user_user_id
    WHERE 
        ce.user_user_id = ? 
        AND a.course_id = ?
        AND a.category = "post_activity"
    GROUP BY 
        a.assignment_id, a.course_id, c.nama_course, a.title, a.question_type, a.tanggal_mulai, a.tanggal_selesai, a.category;
    `;
    return dbPool.execute(SQLQuery, [userId, courseId]);
}

const getAssignmentByAssignmentId = (userId, assignmentId) => {
    const SQLQuery = `
    SELECT 
        a.assignment_id,
        a.course_id,
        c.nama_course,
        a.title,
        a.question_type,
        a.tanggal_mulai,
        a.tanggal_selesai,
        a.category,
        COALESCE(sua.active_status, 'Incomplete') AS active, -- Status aktifitas
        COALESCE(sua.score, 0) AS user_score, -- Nilai user
        COUNT(qa.question_id) AS total_questions -- Jumlah pertanyaan
    FROM 
        assignment a
    JOIN
        course c ON a.course_id = c.course_id
    JOIN 
        course_enrollment ce ON a.course_id = ce.course_id
    LEFT JOIN 
        score_user_assignment sua ON a.assignment_id = sua.assignment_id AND sua.user_id = ce.user_user_id
    LEFT JOIN 
        question_assignment qa ON a.assignment_id = qa.assignment_id
    WHERE 
        ce.user_user_id = ? 
        AND a.assignment_id = ?
    GROUP BY 
        a.assignment_id, 
        a.course_id, 
        c.nama_course, 
        a.title, 
        a.question_type, 
        a.tanggal_mulai, 
        a.tanggal_selesai, 
        a.category, 
        sua.active_status, 
        sua.score;
    `;
    return dbPool.execute(SQLQuery, [userId, assignmentId]);
}

module.exports = {
    getAssignmentByUser,
    getTodoUser,
    getAssignmentByUserCourse,
    getAssignmentByUserCoursePreActivity,
    getAssignmentByUserCoursePostActivity,
    getAssignmentByAssignmentId,
}