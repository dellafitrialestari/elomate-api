const CoursesModel = require("../models/materi");

const getMateriByUser = async (req, res) => {
    try {
      const [data] = await CoursesModel.getMateriByUser();
  
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

module.exports = {
    getMateriByUser,
  };