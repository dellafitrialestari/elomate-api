const ReportModel = require('../models/report');

const getReportData = async (req, res) => {
    try {
        const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
        
        // Fetch courses based on user ID
        const [report] = await ReportModel.getReportData(userId);
        
        if (!report || report.length === 0) {
            return res.status(404).json({
                message: "No report found for this user",
                data: null,
            });
        }

        // float to integer
        const convertedReport = report.map(course => ({
            ...course,
            nilai_total_course: Math.round(course.nilai_total_course) // Pembulatan
        }));

        // Return the array directly without wrapping in an object
        return res.status(200).json(convertedReport);
    } catch (error) {
        console.error("Error fetching report:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

const getReportByPhaseTopic = async (req, res) => {
    const { phase, topic } = req.params;

    try {
        const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
        
        // Fetch courses based on user ID
        const [report] = await ReportModel.getReportByPhaseTopic(userId, phase, topic);
        
        if (!report || report.length === 0) {
            return res.status(404).json({
                message: "No report found for this user",
                data: null,
            });
        }

        // Float to integer and calculate average score
        const convertedReport = report.map(course => ({
            ...course,
            nilai_total_course: Math.round(course.nilai_total_course) // Pembulatan
        }));

        const averageScore = convertedReport.length > 0 
        ? Math.round(
            convertedReport.reduce((sum, course) => sum + course.nilai_total_course, 0) / convertedReport.length
        )
        : 0;

        // Response structure
        const response = {
            "rata-rata_semua_course": parseFloat(averageScore),
            "list_course": convertedReport,
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching report:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

// Kirkpatrick --------------------------------------------------------------------
const getKirkpatrickUser = async (req, res) => {
    const userId = req.user.userId;

    try {
        // Get Peer Assessment scores
        const peerScores = await ReportModel.getPeerAssessmentScores(userId);

        // Get Self Assessment scores
        const selfScores = await ReportModel.getSelfAssessmentScores(userId);

        // Remove description from the response
        const removeDescription = (data) => {
            return data.map((item) => ({
                ...item,
                data: item.data.map(({ description, ...rest }) => rest),
            }));
        };

        res.status(200).json({
            peerAssessment: {
                label: "Rekan Kerja",
                allData: removeDescription(peerScores),
            },
            selfAssessment: {
                label: "Self",
                allData: removeDescription(selfScores),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getKirkpatrickUserDetail = async (req, res) => {
    const userId = req.user.userId;

    try {
        const peerScores = await ReportModel.getPeerAssessmentScores(userId);
        const selfScores = await ReportModel.getSelfAssessmentScores(userId);
        const relatedQuestions = await ReportModel.getRelatedQuestions();

        const combineAndCalculateScores = (peer, self) => {
            const combined = {};

            // Merge Peer Scores
            peer.forEach(({ category, data }) => {
                if (!combined[category]) combined[category] = {};

                data.forEach(({ point_kirkpatrick, description, average_score }) => {
                    if (!combined[category][point_kirkpatrick]) {
                        combined[category][point_kirkpatrick] = {
                            point_kirkpatrick,
                            description: description || point_kirkpatrick,
                            data_label: [],
                            total_point: 0, // Initialize as a number
                        };
                    }

                    // Retrieve related questions for Peer Assessment
                    const questions = relatedQuestions
                        .filter(
                            (q) =>
                                q.point_kirkpatrick === point_kirkpatrick &&
                                q.assessment_type === "Peer Assessment"
                        )
                        .map((q) => q.question_text);

                    combined[category][point_kirkpatrick].data_label.push({
                        label: "Rekan Kerja",
                        average_score: parseFloat(average_score).toString(),
                        questions,
                    });

                    // Add weighted peer score (75%)
                    combined[category][point_kirkpatrick].total_point +=
                        parseFloat(average_score) * 0.75;
                });
            });

            // Merge Self Scores
            self.forEach(({ category, data }) => {
                if (!combined[category]) combined[category] = {};

                data.forEach(({ point_kirkpatrick, description, average_score }) => {
                    if (!combined[category][point_kirkpatrick]) {
                        combined[category][point_kirkpatrick] = {
                            point_kirkpatrick,
                            description: description || point_kirkpatrick,
                            data_label: [],
                            total_point: 0, // Initialize as a number
                        };
                    }

                    // Retrieve related questions for Self Assessment
                    const questions = relatedQuestions
                        .filter(
                            (q) =>
                                q.point_kirkpatrick === point_kirkpatrick &&
                                q.assessment_type === "Self Assessment"
                        )
                        .map((q) => q.question_text);

                    combined[category][point_kirkpatrick].data_label.push({
                        label: "Self",
                        average_score: parseFloat(average_score).toString(),
                        questions,
                    });

                    // Add weighted self score (25%)
                    combined[category][point_kirkpatrick].total_point +=
                        parseFloat(average_score) * 0.25;
                });
            });

            // Format data by category
            return Object.keys(combined).map((category) => {
                const items = Object.values(combined[category]);

                // Format total_point
                items.forEach((item) => {
                    const total = item.total_point;

                    // Check if total is integer or float
                    item.total_point =
                        total % 1 === 0
                            ? total.toFixed(0) // Remove decimal if total is an integer
                            : total.toFixed(2); // Keep 2 significant decimals for floats

                    item.total_point = item.total_point.toString(); // Convert to string
                });

                // Sort by total_point
                const sortedItems = items.sort(
                    (a, b) => parseFloat(b.total_point) - parseFloat(a.total_point)
                );

                return {
                    category,
                    data_detail: {
                        highest_data: sortedItems.slice(0, 3), // 3 tertinggi
                        lowest_data: sortedItems.slice(-3).reverse(), // 3 terendah
                    },
                };
            });
        };

        const formattedData = combineAndCalculateScores(peerScores, selfScores);

        res.status(200).json({
            kirkpatrick_detail: formattedData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getKirkpatrickUserDetailQuestion = async (req, res) => {
    const userId = req.user.userId;

    if (!userId) {
        console.error('Error: userId is missing in the request');
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const relatedQuestions = await ReportModel.getRelatedQuestions();
        const peerScores = await ReportModel.getPeerAssessmentScores(userId);

        // Log data yang diambil
        // console.log("Related Questions:", relatedQuestions);
        // console.log("Peer Scores:", peerScores);

        if (!Array.isArray(relatedQuestions) || !Array.isArray(peerScores)) {
            throw new Error('Database query did not return expected data');
        }

        const scoreMap = {};
        peerScores.forEach((scoreCategory) => {
            const category = scoreCategory.category.trim(); // kategori
            scoreCategory.data.forEach((scoreData) => {
                const point = scoreData.point_kirkpatrick.trim(); // Poin Kirkpatrick
                const key = `${category}-${point}`;
                const formattedScore = parseFloat(scoreData.average_score).toFixed(2); // Format awal "4.00" atau "4.33"
                scoreMap[key] = parseFloat(formattedScore).toString().replace(/\.0+$/, ''); // Hapus .00, tetap tampilkan satu desimal jika ada
            });
        });

        // Log scoreMap
        // console.log("Score Map:", scoreMap);

        const groupedCategories = {};

        relatedQuestions.forEach((question) => {
            const {
                category_kirkpatrick,
                point_kirkpatrick,
                question_text
            } = question;

            if (!category_kirkpatrick || !point_kirkpatrick || !question_text) {
                console.warn('Invalid question data:', question);
                return;
            }

            // Bersihkan whitespace
            const cleanedCategory = category_kirkpatrick.trim();
            const cleanedPoint = point_kirkpatrick.trim();

            // skor from scoreMap
            const key = `${cleanedCategory}-${cleanedPoint}`;
            const average_score = scoreMap[key] || "0";

            console.log(`Mapping key: ${key}, Score Found: ${average_score}`); // Log untuk setiap skor

            if (!groupedCategories[cleanedCategory]) {
                groupedCategories[cleanedCategory] = [];
            }

            groupedCategories[cleanedCategory].push({
                question: question_text,
                point_kirkpatrick: cleanedPoint,
                score: average_score,
                // score: parseFloat(average_score),
            });
        });

        const kirkpatrickDetail = Object.entries(groupedCategories).map(([category, data]) => {
            const sortedData = [...data].sort((a, b) => b.score - a.score);

            return {
                category,
                highest_data: sortedData.slice(0, 3), // 3 tertinggi
                lowest_data: sortedData.slice(-3), // 3 terendah
            };
        });

        res.json({ kirkpatrick_detail: kirkpatrickDetail });
    } catch (error) {
        console.error('Error fetching Kirkpatrick details:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



module.exports = {
    getReportData,
    getReportByPhaseTopic,

    // Kirkpatrick ---------
    getKirkpatrickUser,
    getKirkpatrickUserDetail,
    getKirkpatrickUserDetailQuestion,
};
