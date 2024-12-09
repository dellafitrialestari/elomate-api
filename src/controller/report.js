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
                            total_point: "0"
                        };
                    }

                    combined[category][point_kirkpatrick].data_label.push({
                        label: "Rekan Kerja",
                        average_score: parseFloat(average_score).toString()
                    });

                    combined[category][point_kirkpatrick].total_point = (parseFloat(combined[category][point_kirkpatrick].total_point) + parseFloat(average_score)).toString();
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
                            total_point: "0"
                        };
                    }

                    combined[category][point_kirkpatrick].data_label.push({
                        label: "Self",
                        average_score: parseFloat(average_score).toString() 
                    });

                    combined[category][point_kirkpatrick].total_point = (parseFloat(combined[category][point_kirkpatrick].total_point) + parseFloat(average_score)).toString();
                });
            });

            // Format Data per Category
            return Object.keys(combined).map((category) => {
                const items = Object.values(combined[category]);

                // Sort by total_point
                const sortedItems = items.sort((a, b) => parseFloat(b.total_point) - parseFloat(a.total_point));

                return {
                    category,
                    data_detail: {
                        highest_data: sortedItems.slice(0, 3),
                        lowest_data: sortedItems.slice(-3).reverse()
                    }
                };
            });
        };

        const formattedData = combineAndCalculateScores(peerScores, selfScores);

        res.status(200).json({
            kirkpatrick_detail: formattedData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
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
