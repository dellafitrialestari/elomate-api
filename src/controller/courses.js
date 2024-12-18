const CoursesModel = require("../models/courses");

const getCoursesByUser = async (req, res) => {
  try {
      const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
      
      // Fetch courses based on user ID
      const [courses] = await CoursesModel.getCoursesByUserId(userId);
      
      if (!courses || courses.length === 0) {
          return res.status(404).json({
              message: "No courses found for this user",
              data: null,
          });
      }

      // Return all courses related to the user
      // return res.status(200).json({ courses });

      // Return the array directly without wrapping in an object
      return res.status(200).json(courses);
  } catch (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({
          message: "Internal server error",
          serverMessage: error.message,
      });
  }
};

const getCoursesProgressByUser = async (req, res) => {
  try {
      const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
      
      // Fetch courses based on user ID
      const [courses] = await CoursesModel.getCoursesProgressByUser(userId);
      
      if (!courses || courses.length === 0) {
          return res.status(404).json({
              message: "No courses found for this user",
              data: null,
          });
      }

      // Return all courses related to the user
      // return res.status(200).json({ courses });

      // Return the array directly without wrapping in an object
      return res.status(200).json(courses);
  } catch (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({
          message: "Internal server error",
          serverMessage: error.message,
      });
  }
};

const getTopicProgressByUser = async (req, res) => {
  try {
      const userId = req.user.userId; // Ensure userId is extracted via middleware authentication

      const [courses] = await CoursesModel.getTopicProgressByUser(userId);

      if (!courses || courses.length === 0) {
          return res.status(404).json({
              message: "No courses found for this user",
              data: null,
          });
      }

      // Group courses by topik_id and calculate progress per topic
      const topicProgress = courses.reduce((acc, course) => {
          const {
              topik_id,
              nama_topik,
              progress,
              phase_id,
              nama_phase,
              mentee_name,
              batch_name,
          } = course;

          if (!acc[topik_id]) {
              acc[topik_id] = {
                  topik_id,
                  nama_topik,
                  phase_id,
                  nama_phase,
                  mentee_name,
                  batch_name,
                  total_progress: 0,
                  course_count: 0,
              };
          }

          acc[topik_id].total_progress += progress;
          acc[topik_id].course_count += 1;

          return acc;
      }, {});

      const result = Object.values(topicProgress).map((topic) => ({
          topik_id: topic.topik_id,
          nama_topik: topic.nama_topik,
          phase_id: topic.phase_id,
          nama_phase: topic.nama_phase,
          mentee_name: topic.mentee_name,
          batch_name: topic.batch_name,
          progress: Math.round(topic.total_progress / topic.course_count),
      }));

      return res.status(200).json(result);
  } catch (error) {
      console.error("Error fetching topic progress:", error);
      return res.status(500).json({
          message: "Internal server error",
          serverMessage: error.message,
      });
  }
};

const getCoursesByUserIdAndPhaseAndTopic = async (req, res) => {
  
  const { phase, topic } = req.params;

  // Check if phase or topic is missing
  if (!phase || !topic) {
    return res.status(400).json({
      message: "Phase and topic are required parameters",
      data: null,
    });
  }

  try {
    const userId = req.user.userId; // User ID dari middleware authentication

    // Fetch courses berdasarkan phase dan topic
    const [courses] = await CoursesModel.getCoursesByUserIdAndPhaseAndTopic(userId, phase, topic);

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        message: "No courses found for this user",
        data: null,
      });
    }

    // Perbarui progress setiap course (gunakan Promise.all)
    await Promise.all(
      courses.map(async (course) => {
        const courseId = course.course_id;

        // Fetch total assignments untuk kursus tertentu
        const [[{ total_assignments }]] = await CoursesModel.getTotalAssignmentsByCourseId(courseId);

        // Fetch jumlah assignments yang sudah selesai
        const [[{ completed_assignments }]] = await CoursesModel.getCompletedAssignmentsByUserIdAndCourseId(userId, courseId);

        // Hitung progress
        const progress =
          total_assignments > 0
            ? Math.floor((completed_assignments / total_assignments) * 100)
            : 0;

        // Update progress to database
        await CoursesModel.updateCourseProgress(userId, courseId, progress);
      })
    );

    // Response dengan daftar courses (dengan progress yang sudah diperbarui)
    return res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      message: "Internal server error",
      serverMessage: error.message,
    });
  }
};

const getCoursesByUserIdCourseId = async (req, res) => {
  
  const { courseId } = req.params;

  // Check if phase or topic is missing
  if (!courseId) {
      return res.status(400).json({
          message: "Phase and topic are required parameters",
          data: null,
      });
  }

  try {
      const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
      
      // Fetch courses based on user ID
      const [courses] = await CoursesModel.getCoursesByUserIdCourseId(userId, courseId);
      
      if (!courses || courses.length === 0) {
          return res.status(404).json({
              message: "No courses found for this user",
              data: null,
          });
      }

      // Return all courses related to the user
      // return res.status(200).json({ courses });

      // Return the array directly without wrapping in an object
      return res.status(200).json(courses);
  } catch (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({
          message: "Internal server error",
          serverMessage: error.message,
      });
  }
};


const getCoursesByUserIdAndPhaseNameAndTopicName = async (req, res) => {
  const { phaseName, topicName } = req.body;

  // Check if phase or topic is missing in request body
  if (!phaseName || !topicName) {
      return res.status(400).json({
          message: "Phase and topic are required in the request body",
          data: null,
      });
  }

  try {
      const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
      
      // Fetch courses based on user ID, phaseName, and topicName
      const [courses] = await CoursesModel.getCoursesByUserIdAndPhaseNameAndTopicName(userId, phaseName, topicName);
      
      if (!courses || courses.length === 0) {
          return res.status(404).json({
              message: "No courses found for this user",
              data: null,
          });
      }

      // Return the array of courses directly without wrapping in an object
      return res.status(200).json(courses);
  } catch (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({
          message: "Internal server error",
          serverMessage: error.message,
      });
  }
};


const getPhaseCourses = async (req, res) => {
    try {
      const [data] = await CoursesModel.getPhaseCourses();
  
    //   res.json({
    //     message: "GET all users success",
    //     data: data,
    //   });
      res.json(data);
    } catch (error) {
      res.status(500).json({
        message: "Server Error",
        serverMessage: error,
      });
    }
};

const getPhaseCoursesByUserId = async (req, res) => {
  try {
      const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
      
      // Fetch courses based on user ID
      const [courses] = await CoursesModel.getPhaseCoursesByUserId(userId);
      
      if (!courses || courses.length === 0) {
          return res.status(404).json({
              message: "No phase found for this user",
              data: null,
          });
      }

      // // Remove duplicates based on phase_id
      // const uniqueCourses = courses.filter(
      //     (course, index, self) => index === self.findIndex(c => c.phase_id === course.phase_id)
      // );

      // Return the array directly without wrapping in an object
      return res.status(200).json(courses);
  } catch (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({
          message: "Internal server error",
          serverMessage: error.message,
      });
  }
};

const getTopicByPhase = async (req, res) => {
    const { phaseCourse } = req.params;
    try {
      const [data] = await CoursesModel.getTopicByPhase(phaseCourse);

      if (data.length === 0) {
        return res.status(404).json({
          message: "Topic not found",
          data: null,
        });
      }

      res.json(data);

    } catch (error) {
      res.status(500).json({
        message: "Server Error",
        serverMessage: error,
      });
    }
};

const getTopicByPhaseUserId = async (req, res) => {
  const { phaseCourse } = req.params;
  try {
    const userId = req.user.userId;
    const [data] = await CoursesModel.getTopicByPhaseUserId(userId, phaseCourse);

    if (data.length === 0) {
      return res.status(404).json({
        message: "Topic not found",
        data: null,
      });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error,
    });
  }
};

const TopicByPhaseUserId = async (req, res) => {
  const { phaseCourse } = req.body;
  try {
    const userId = req.user.userId;
    const [data] = await CoursesModel.TopicByPhaseUserId(userId, phaseCourse);

    if (data.length === 0) {
      return res.status(404).json({
        message: "Topic not found",
        data: null,
      });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error,
    });
  }
};


// Fasilitator ---------------------------------------------------------------------------------------------------------------
const insertCourse = async (req, res) => {
  const { batch, topik, nama_course } = req.body;

  try {
      // Validasi batch dan topik
      const [batchResult] = await CoursesModel.getBatchById(batch);
      const [topikResult] = await CoursesModel.getTopikById(topik);

      if (batchResult.length === 0) {
          return res.status(400).json({ message: "Batch tidak ditemukan" });
      }

      if (topikResult.length === 0) {
          return res.status(400).json({ message: "Topik tidak ditemukan" });
      }

      // Insert
      const [insertResult] = await CoursesModel.insertCourse(batch, topik, nama_course);

      return res.status(201).json({
          message: "Course berhasil ditambahkan",
          courseId: insertResult.insertId,
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const updateCourseById = async (req, res) => {
  const { courseId } = req.params;
  const { batch, topik, nama_course } = req.body;

  try {
    // Validasi batch dan topik
    if (batch) {
      const [batchResult] = await CoursesModel.getBatchById(batch);
      if (batchResult.length === 0) {
        return res.status(400).json({ message: "Batch tidak ditemukan" });
      }
    }

    if (topik) {
      const [topikResult] = await CoursesModel.getTopikById(topik);
      if (topikResult.length === 0) {
        return res.status(400).json({ message: "Topik tidak ditemukan" });
      }
    }

    // Update
    const [updateResult] = await CoursesModel.updateCourseById(courseId, batch, topik, nama_course);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "Course tidak ditemukan" });
    }

    return res.status(200).json({ message: "Course berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};



module.exports = {
    getCoursesByUser,
    getCoursesProgressByUser,
    getTopicProgressByUser,
    getCoursesByUserIdAndPhaseAndTopic,
    getCoursesByUserIdAndPhaseNameAndTopicName,
    getCoursesByUserIdCourseId,
    getPhaseCourses,
    getPhaseCoursesByUserId,
    getTopicByPhase,
    getTopicByPhaseUserId,
    TopicByPhaseUserId,

    // Fasilitator -----------------------------
    insertCourse,
    updateCourseById,
};
