const dbPool = require('../config/database');

const getReportData = async (userId) => {
  const SQLQuery = `
  SELECT 
    c.course_id,
    c.nama_course,
    -- Hitung nilai rata-rata hanya untuk assignment yang memiliki skor
    COALESCE(ROUND(AVG(sua.score), 2), 0) AS nilai_total_course,
    -- Status course
    CASE
        -- Check jika kursus tidak memiliki assignment
        WHEN NOT EXISTS (
            SELECT 1
            FROM assignment a
            WHERE a.course_id = c.course_id
        ) THEN '-' -- THEN 'Tidak ada assignment'
        -- Check jika ada assignment yang tidak ada di score_user_assignment atau status "Incomplete" untuk user tertentu
        WHEN EXISTS (
            SELECT 1
            FROM assignment a
            LEFT JOIN score_user_assignment sua_sub 
            ON a.assignment_id = sua_sub.assignment_id 
                AND sua_sub.user_id = ? -- Hanya untuk user tertentu
            WHERE a.course_id = c.course_id
            -- Assignment yang tidak ada skor (NULL) atau berstatus Incomplete
            AND (sua_sub.assignment_id IS NULL OR sua_sub.active_status = 'Incomplete')
        ) THEN 'Not Yet'
        ELSE 'Done'
    END AS status,
    -- Jumlah assignment yang "Incomplete" untuk user tertentu
    (
        SELECT COUNT(*)
        FROM assignment a
        LEFT JOIN score_user_assignment sua_sub 
        ON a.assignment_id = sua_sub.assignment_id 
            AND sua_sub.user_id = ?
        WHERE a.course_id = c.course_id
        AND (sua_sub.assignment_id IS NULL OR sua_sub.active_status = 'Incomplete')
    ) AS jumlah_assignment_incomplete,
    -- Jumlah assignment yang "Complete" untuk user tertentu
    (
        SELECT COUNT(*)
        FROM assignment a
        LEFT JOIN score_user_assignment sua_sub 
        ON a.assignment_id = sua_sub.assignment_id 
            AND sua_sub.user_id = ?
        WHERE a.course_id = c.course_id
        AND sua_sub.active_status = 'Complete'
    ) AS jumlah_assignment_complete
    FROM 
    course c
    LEFT JOIN 
        assignment a ON c.course_id = a.course_id
    JOIN 
        course_enrollment ce ON c.course_id = ce.course_id
    LEFT JOIN 
        score_user_assignment sua ON a.assignment_id = sua.assignment_id 
    AND sua.user_id = ? -- Pastikan hanya data untuk user tertentu
    WHERE 
    	ce.user_user_id = ? 
    GROUP BY 
    c.course_id, c.nama_course;
  `;

  return dbPool.execute(SQLQuery, [userId, userId, userId, userId, userId]);
};

const getReportByPhaseTopic = async (userId, phase, topic) => {
    const SQLQuery = `
    SELECT 
      c.course_id,
      c.nama_course,
      -- Hitung nilai rata-rata hanya untuk assignment yang memiliki skor
      COALESCE(ROUND(AVG(sua.score), 2), 0) AS nilai_total_course,
      -- Status course
      CASE
          -- Check jika kursus tidak memiliki assignment
          WHEN NOT EXISTS (
              SELECT 1
              FROM assignment a
              WHERE a.course_id = c.course_id
          ) THEN '-' -- THEN 'Tidak ada assignment'
          -- Check jika ada assignment yang tidak ada di score_user_assignment atau status "Incomplete" untuk user tertentu
          WHEN EXISTS (
              SELECT 1
              FROM assignment a
              LEFT JOIN score_user_assignment sua_sub 
              ON a.assignment_id = sua_sub.assignment_id 
                  AND sua_sub.user_id = ?
              WHERE a.course_id = c.course_id
              -- Assignment yang tidak ada skor (NULL) atau berstatus Incomplete
              AND (sua_sub.assignment_id IS NULL OR sua_sub.active_status = 'Incomplete')
          ) THEN 'Not Yet'
          ELSE 'Done'
      END AS status,
      -- Jumlah assignment yang "Incomplete" untuk user tertentu
      (
          SELECT COUNT(*)
          FROM assignment a
          LEFT JOIN score_user_assignment sua_sub 
          ON a.assignment_id = sua_sub.assignment_id 
              AND sua_sub.user_id = ?
          WHERE a.course_id = c.course_id
          AND (sua_sub.assignment_id IS NULL OR sua_sub.active_status = 'Incomplete')
      ) AS jumlah_assignment_incomplete,
      -- Jumlah assignment yang "Complete" untuk user tertentu
      (
          SELECT COUNT(*)
          FROM assignment a
          LEFT JOIN score_user_assignment sua_sub 
          ON a.assignment_id = sua_sub.assignment_id 
              AND sua_sub.user_id = ?
          WHERE a.course_id = c.course_id
          AND sua_sub.active_status = 'Complete'
      ) AS jumlah_assignment_complete
    FROM 
      course c
    INNER JOIN 
    	topik t ON c.topik_id = t.topik_id
    INNER JOIN 
    	phase p ON t.phase_id = p.phase_id
    LEFT JOIN 
    	assignment a ON c.course_id = a.course_id
    JOIN 
        course_enrollment ce ON c.course_id = ce.course_id
    LEFT JOIN 
    	score_user_assignment sua 
    ON a.assignment_id = sua.assignment_id 
    AND sua.user_id = ?
    WHERE 
    	ce.user_user_id = ? 
        AND p.phase_id = ? 
        AND t.topik_id = ? 
    GROUP BY 
      c.course_id, c.nama_course;
    `;

    return dbPool.execute(SQLQuery, [userId, userId, userId, userId, userId, phase, topic]);
};

// Kirkpatrick --------------------------------------------------------------------------------

const getPeerAssessmentScores = async (userId) => {
    const SQLQuery = `
        SELECT 
            k.category_kirkpatrick AS category,
            k.point_kirkpatrick,
            kp.description AS description,
            AVG(apa.score) AS average_score
        FROM assessment_peer_answer apa
        INNER JOIN kirkpatrick k 
            ON apa.question_id = k.question_id
        INNER JOIN kirkpatrick_points kp 
            ON k.point_kirkpatrick = kp.point_kirkpatrick
        WHERE apa.assessed_id = ?
        GROUP BY k.category_kirkpatrick, k.point_kirkpatrick, kp.description;
    `;
    const [rows] = await dbPool.execute(SQLQuery, [userId]);

    // Group by category and format scores
    const groupedData = rows.reduce((acc, row) => {
        const { category, point_kirkpatrick, description, average_score } = row;

        // Handle null and format average_score
        const formattedScore = average_score !== null 
            ? parseFloat(Number(average_score).toFixed(2)).toString() 
            : "0";

        const categoryIndex = acc.findIndex((item) => item.category === category);

        if (categoryIndex === -1) {
            acc.push({
                category,
                data: [{ point_kirkpatrick, description, average_score: formattedScore }]
            });
        } else {
            acc[categoryIndex].data.push({ point_kirkpatrick, description, average_score: formattedScore });
        }

        return acc;
    }, []);

    return groupedData;
};

const getSelfAssessmentScores = async (userId) => {
    const SQLQuery = `
        SELECT 
            k.category_kirkpatrick AS category,
            k.point_kirkpatrick,
            kp.description AS description,
            AVG(asa.score) AS average_score
        FROM assessment_self_answer asa
        INNER JOIN kirkpatrick k 
            ON asa.question_assessment_question_id = k.question_id
        INNER JOIN kirkpatrick_points kp 
            ON k.point_kirkpatrick = kp.point_kirkpatrick
        WHERE asa.user_user_id = ?
        GROUP BY k.category_kirkpatrick, k.point_kirkpatrick, kp.description;
    `;
    const [rows] = await dbPool.execute(SQLQuery, [userId]);

    // Group by category and format scores
    const groupedData = rows.reduce((acc, row) => {
        const { category, point_kirkpatrick, description, average_score } = row;

        // Handle null and format average_score
        const formattedScore = average_score !== null 
            ? parseFloat(Number(average_score).toFixed(2)).toString() 
            : "0";

        const categoryIndex = acc.findIndex((item) => item.category === category);

        if (categoryIndex === -1) {
            acc.push({
                category,
                data: [{ point_kirkpatrick, description, average_score: formattedScore }]
            });
        } else {
            acc[categoryIndex].data.push({ point_kirkpatrick, description, average_score: formattedScore });
        }

        return acc;
    }, []);

    return groupedData;
};


module.exports = {
    getReportData,
    getReportByPhaseTopic,

    // Kirkpatrick ------------
    getPeerAssessmentScores,
    getSelfAssessmentScores,
}
