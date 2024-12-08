const dbPool = require("../config/database");


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
    getPeerAssessmentScores,
    getSelfAssessmentScores,
};