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

module.exports = {
    getReportData,
    getReportByPhaseTopic,
};
