const dbPool = require('../config/database');

const getNotificationData = async (userId) => {
    const SQLQuery = `
        SELECT 
            'Assessment Deadline' AS notification_type, 
            a.title AS title, 
            ad.tanggal_selesai AS deadline
        FROM assessment_enrollment ae
        JOIN assessment a ON ae.assessment_id = a.assessment_id
        JOIN assessment_date ad ON a.assessment_id = ad.assessment_id
        WHERE ae.user_user_id = ? AND ad.tanggal_selesai >= CURDATE()

        UNION ALL

        SELECT 
            'Assignment Deadline' AS notification_type, 
            ass.title AS title, 
            ass.tanggal_selesai AS deadline
        FROM assignment ass
        JOIN course_enrollment ce ON ass.course_id = ce.course_id
        WHERE ce.user_user_id = ? AND ass.tanggal_selesai >= CURDATE()

        UNION ALL

        SELECT 
            'Missed Assessment' AS notification_type,
            a.description AS title,
            ad.tanggal_selesai AS deadline
        FROM assessment_enrollment ae
        JOIN assessment a ON ae.assessment_id = a.assessment_id
        JOIN assessment_date ad ON a.assessment_id = ad.assessment_id
        WHERE ae.user_user_id = ? AND ad.tanggal_selesai < CURDATE() AND ae.status = 'Incomplete'

        UNION ALL

        SELECT 
            'Missed Assignment' AS notification_type,
            ass.title AS title,
            ass.tanggal_selesai AS deadline
        FROM assignment ass
        JOIN course_enrollment ce ON ass.course_id = ce.course_id
        LEFT JOIN score_user_assignment sua ON sua.assignment_id = ass.assignment_id AND sua.user_id = ?
        WHERE ce.user_user_id = ? AND ass.tanggal_selesai < CURDATE() AND (sua.active_status IS NULL OR sua.active_status = 'Incomplete')

        UNION ALL

        SELECT 
            'New Course or Assessment' AS notification_type,
            c.nama_course AS title,
            NULL AS deadline
        FROM course c
        JOIN course_enrollment ce ON c.course_id = ce.course_id
        WHERE ce.user_user_id = ? AND c.batch_data_batch_id IN (
            SELECT batch_data_batch_id FROM user WHERE user_id = ?
        )

        UNION ALL

        SELECT 
            'Mentoring Schedule' AS notification_type,
            CONCAT('Mentoring on ', m.tanggal_mentoring, ' at ', m.jam_mulai) AS title,
            NULL AS deadline
        FROM mentoring m
        WHERE m.user_user_id = ? AND m.status = 'Processing';
    `;

    const [results] = await dbPool.execute(SQLQuery, [userId, userId, userId, userId, userId, userId, userId, userId]);
    return results;
};

module.exports = {
    getNotificationData,
};
