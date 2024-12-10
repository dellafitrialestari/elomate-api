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

        // 3 highest dan 3 lowest
        const getHighestAndLowest = (data) => {
            if (data.length <= 1) return { data }; // Tidak ada highest/lowest jika hanya satu data

            const sortedData = [...data].sort((a, b) => b.average_score - a.average_score);

            return {
                highestData: sortedData.slice(0, 3),
                lowestData: sortedData.slice(-3).reverse(),
            };
        };

        // Handle description null
        const handleNullDescription = (data) => {
            return data.map((item) => ({
                ...item,
                data: item.data.map((entry) => ({
                    ...entry,
                    description: entry.description || entry.point_kirkpatrick,
                })),
            }));
        };

        // Peer Assessment
        const formattedPeerScores = handleNullDescription(peerScores).map((item) => {
            const { data, ...rest } = item;
            const result = getHighestAndLowest(data);

            return {
                ...rest,
                ...result,
            };
        });

        // Self Assessment
        const formattedSelfScores = handleNullDescription(selfScores).map((item) => {
            const { data, ...rest } = item;
            const result = getHighestAndLowest(data);

            return {
                ...rest,
                ...result,
            };
        });

        res.status(200).json({
            peerAssessment: {
                label: "Rekan Kerja",
                allData: formattedPeerScores,
            },
            selfAssessment: {
                label: "Self",
                allData: formattedSelfScores,
            },
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
