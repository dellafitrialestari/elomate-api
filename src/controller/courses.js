const CoursesModel = require("../models/courses");

const getCoursesByUser = async (req, res) => {
    try {
        const userId = req.user.userId; // User ID yang didapat dari token setelah melalui middleware authentication

        const [courses] = await CoursesModel.getCoursesByUserId(userId);
        
        if (courses.length === 0) {
            return res.status(404).json({
                message: "No courses found for this user",
                data: null,
            });
        }
        
        return res.status(200).json(courses[0]);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({
            message: "Internal server error",
            serverMessage: error,
        });
    }
};

module.exports = {
    getCoursesByUser,
};
