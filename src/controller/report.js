const ReportModel = require('../models/report');

const getReportData = async (req, res) => {
    try {
        const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
        
        // Fetch courses based on user ID
        const [materi] = await ReportModel.getReportData(userId);
        
        if (!materi || materi.length === 0) {
            return res.status(404).json({
                message: "No report found for this user",
                data: null,
            });
        }

        // float to integer
        const convertedMateri = materi.map(course => ({
            ...course,
            nilai_total_course: Math.round(course.nilai_total_course) // Pembulatan
        }));

        // Return the array directly without wrapping in an object
        return res.status(200).json(convertedMateri);
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
};
