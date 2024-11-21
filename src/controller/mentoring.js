const MentoringModel = require('../models/mentoring');

const postMentoring = async (req, res) => {
    try {
        // Extract user ID from authenticated middleware
        const userId = req.user.userId; // Ensure middleware sets req.user.userId
        
        // Extract data from request body
        const { nama_course, tanggal_mentoring, jam_mulai, jam_selesai, metode_mentoring, tipe_mentoring } = req.body;

        if (!nama_course || !tanggal_mentoring || !jam_mulai || !jam_selesai || !metode_mentoring || !tipe_mentoring) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Fetch course_id from database using nama_course
        const courseId = await MentoringModel.getCourseIdByName(nama_course);

        if (!courseId) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Insert data into mentoring table
        await MentoringModel.postMentoring({
            userId,
            courseId,
            tanggal_mentoring,
            jam_mulai,
            jam_selesai,
            metode_mentoring,
            tipe_mentoring,
        });

        res.status(201).json({ message: "Mentoring data inserted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const postMentoringFeedback = async(req, res) => {

}

module.exports = {
    postMentoring,
    postMentoringFeedback,
};