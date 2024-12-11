require("dotenv").config();
const PORT = process.env.PORT || 5000;

// Set path ke file key.json secara eksplisit
// process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
//   __dirname,
//   "src/config/key.json"
// );

// process.env.GOOGLE_APPLICATION_CREDENTIALS = "/secrets/key-file";


const express = require("express");

const usersRoutes = require("./routes/users");
const coursesRoutes = require("./routes/courses");
const preReadingRoutes = require("./routes/preReading");
const assignmentRoutes = require("./routes/assignment");
const assignmentTask = require("./routes/assignmentTask");
const reportRoutes = require("./routes/report");
const participantRoutes = require("./routes/participantData");
const mentoringRoutes = require("./routes/mentoring");
const assessmentRoutes = require("./routes/assessment");
const filesRoutes = require("./routes/files");
const kirkpatrickRoutes = require("./routes/kirkpatrick");
const notificationRoutes = require("./routes/notification");

const middlewareLogRequest = require("./middleware/logs");
const authenticateJWT = require("./middleware/auth");

// auth = users
const excludedRoutes = ["/auth/login", "/auth/register"];

// const upload = require('./middleware/multer');

const app = express();

app.use(authenticateJWT(excludedRoutes));
app.use(middlewareLogRequest);
app.use(express.json());
// app.use('/assets', express.static('public/images'))

app.use("/auth", usersRoutes);

app.use("/courses", coursesRoutes);

app.use("/preReading", preReadingRoutes);

app.use("/assignment", assignmentRoutes);

app.use("/assignmentTask", assignmentTask);

app.use("/report", reportRoutes);

app.use("/participantData", participantRoutes);

app.use("/mentoring", mentoringRoutes);

app.use("/assessment", assessmentRoutes);

app.use("/files", filesRoutes);

app.use("/kirkpatrick", kirkpatrickRoutes);

app.use("/notification", notificationRoutes);

// app.post('/upload',upload.single('photo'),(req, res) => {
//     res.json({
//         message: 'Upload berhasil'
//     })
// })

app.use((err, req, res, next) => {
  res.json({
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server berhasil di running di port ${PORT}`);
});
