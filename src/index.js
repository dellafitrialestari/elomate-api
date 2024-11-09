require("dotenv").config();
const PORT = process.env.PORT || 5000;
const express = require("express");

const usersRoutes = require("./routes/users");

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
