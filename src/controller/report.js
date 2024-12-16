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
                            total_point: 0,
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
                            total_point: 0,
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
                return {
                    category,
                    data_detail: Object.values(combined[category]).map((item) => ({
                        ...item,
                        // Format total_point: No decimal for integers, up to 2 decimals for others
                        total_point:
                            Number.isInteger(item.total_point)
                                ? item.total_point.toString()
                                : item.total_point.toFixed(2),
                    })),
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



module.exports = {
    getReportData,
    getReportByPhaseTopic,

    // Kirkpatrick ---------
    getKirkpatrickUser,
    getKirkpatrickUserDetail,
};
