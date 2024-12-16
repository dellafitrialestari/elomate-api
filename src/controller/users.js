const UsersModel = require("../models/users");
const jwt = require("jsonwebtoken");
const { secret, expiresIn, refreshExpiresIn } = require("../config/jwt");

const bcrypt = require("bcrypt");

const loginUser = async (req, res) => {
  const { nrp, password } = req.body;

  if (!nrp || !password) {
    return res.status(400).json({
      message: "NRP and password are required",
      data: null,
    });
  }

  try {
    const [userCheck] = await UsersModel.getUserByNRP(nrp);

    if (!userCheck || userCheck.length === 0) {
      return res.status(401).json({
        message: "Invalid NRP",
        data: null,
      });
    }

    const user = userCheck[0];

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid Password",
        data: null,
      });
    }

    const role =
      user.role_id === 1 ? "admin" :
      user.role_id === 2 ? "fasilitator" : "management trainee";

    // User is valid, create tokens
    const token = jwt.sign(
      { userId: user.user_id, name: user.nama_lengkap, role: role },
      secret,
      {
        expiresIn: expiresIn,
      }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id, role: role },
      secret,
      {
        expiresIn: refreshExpiresIn,
      }
    );

    res.json({
      token: token,
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      message: "Failed to login user",
      serverMessage: error,
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing or invalid",
        data: null,
      });
    }

    // Pisahkan 'Bearer' dari token
    const token = authHeader.split(" ")[1];

    // Verifikasi token
    const decoded = jwt.verify(token, secret); // Pastikan variabel 'secret' ada di file config JWT
    
    // Ambil userId dari token yang telah didekode
    const userId = decoded.userId;

    // Ambil data pengguna dari database
    const [data] = await UsersModel.getUserById(userId);
    if (data.length === 0) {
      return res.status(404).json({
        message: "User not found",
        data: null,
      });
    }

    // Format tanggal_lahir tanpa mengubah zona waktu
    const userData = data[0];
    if (userData.tanggal_lahir) {
      const tanggalLahir = new Date(userData.tanggal_lahir);
      const [year, month, day] = tanggalLahir.toISOString().split("T")[0].split("-");
      userData.tanggal_lahir = `${day}-${month}-${year}`;
    }

    // Kembalikan data pengguna dengan format tanggal yang diubah
    return res.status(200).json(userData);
    
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({
      message: "Internal server error",
      serverMessage: error,
    });
  }
};

const getEducationUser = async (req, res) => {

  try {
      const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
      
      // Fetch courses based on user ID
      const [courses] = await UsersModel.getEducationUser(userId);
      
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

const getEducationUserById = async (req, res) => {

  const { educationId } = req.params;
  try {
      const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
      
      // Fetch courses based on user ID
      const [courses] = await UsersModel.getEducationUserById(userId, educationId);
      
      if (!courses || courses.length === 0) {
          return res.status(404).json({
              message: "No courses found for this user",
              data: null,
          });
      }

      // Return all courses related to the user
      // return res.status(200).json({ courses });

      // Return the array directly without wrapping in an object
      return res.status(200).json(courses[0]);
  } catch (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({
          message: "Internal server error",
          serverMessage: error.message,
      });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [data] = await UsersModel.getAllUsers();

    res.json({
      message: "GET all users success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error,
    });
  }
};

const getUserById = async (req, res) => {
  const { idUser } = req.params;
  try {
    const [data] = await UsersModel.getUserById(idUser);

    if (data.length === 0) {
      return res.status(404).json({
        message: "User not found",
        data: null,
      });
    }

    // Format tanggal_lahir tanpa mengubah zona waktu
    const userData = data[0];
    if (userData.tanggal_lahir) {
      const tanggalLahir = new Date(userData.tanggal_lahir);
      const [year, month, day] = tanggalLahir.toISOString().split("T")[0].split("-");
      userData.tanggal_lahir = `${day}-${month}-${year}`;
    }

    res.json(userData);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error,
    });
  }
};

const getUserByNrp = async (req, res) => {
  const { nrpUser } = req.params;
  try {
    const [data] = await UsersModel.getUserByNrp(nrpUser);

    if (data.length === 0) {
      return res.status(404).json({
        message: "User not nrp found",
        data: null,
      });
    }

    // Format tanggal_lahir tanpa mengubah zona waktu
    const userData = data[0];
    if (userData.tanggal_lahir) {
      const tanggalLahir = new Date(userData.tanggal_lahir);
      const [year, month, day] = tanggalLahir.toISOString().split("T")[0].split("-");
      userData.tanggal_lahir = `${day}-${month}-${year}`;
    }

    res.json(userData);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error,
    });
  }
};

const getUserByEmail = async (req, res) => {
  const { emailUser } = req.params;
  try {
    const [data] = await UsersModel.getUserByEmail(emailUser);

    if (data.length === 0) {
      return res.status(404).json({
        message: "User not found",
        data: null,
      });
    }

    res.json({
      message: "GET user by email success",
      data: data[0],
    });
  } catch (error) {
    console.error("Error:", error); // Log error for debugging
    res.status(500).json({
      message: "Server Error",
      serverMessage: error,
    });
  }
};

const createNewUser = async (req, res) => {
  const { body } = req;

  if (!body.batch_data_batch_id || !body.role_id || !body.nama_lengkap || !body.nrp || !body.password) {
    return res.status(400).json({
      message: "Incomplete data: batch, role, full name, nrp, and password are required.",
      data: null,
    });
  }

  try {
    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const newUser = { ...body, password: hashedPassword };

    await UsersModel.createNewUser(newUser);
    res.status(201).json({
      message: "CREATE new user success",
      data: {
        email: body.email,
        nama_lengkap: body.nama_lengkap,
        domisili: body.domisili,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error,
    });
  }
};

const updateUser = async (req, res) => {
  const {
      email, 
      posisi,
      divisi,
      tempat_lahir,
      tanggal_lahir,
      domisili,
      no_hp,
  } = req.body;

  // Validasi input
  if (
      !email ||
      !posisi ||
      !divisi ||
      !tempat_lahir ||
      !tanggal_lahir ||
      !domisili ||
      !no_hp 
  ) {
      return res.status(400).json({
          message: "All fields are required",
      });
  }

  try {
      // Konversi tanggal dari DD-MM-YYYY ke YYYY-MM-DD
      const [day, month, year] = tanggal_lahir.split("-");
      const formattedDate = `${year}-${month}-${day}`;

      // Ambil userId dari middleware auth
      const userId = req.user.userId;

      // Panggil model untuk update data
      await UsersModel.updateUser(
          {
              email, 
              posisi,
              divisi,
              tempat_lahir,
              tanggal_lahir: formattedDate,
              domisili,
              no_hp,
          },
          userId
      );

      return res.json({
          message: "User profile updated successfully",
      });
  } catch (error) {
      console.error("Error updating user profile:", error.message);
      return res.status(500).json({
          message: "Server Error",
          serverMessage: error.message,
      });
  }
};

const updateEducationUser = async (req, res) => {
  const {
      tahun_lulus,
      jenjang_studi,
      universitas,
      jurusan
  } = req.body;

  const { educationId } = req.params;

  if (
      !tahun_lulus ||
      !jenjang_studi ||
      !universitas ||
      !jurusan ||
      !educationId
  ) {
      return res.status(400).json({
          message: "All fields are required",
      });
  }

  try {
      // userId dari middleware auth
      const userId = req.user.userId;

      const result = await UsersModel.updateEducationUser(
          {
              tahun_lulus,
              jenjang_studi,
              universitas,
              jurusan,
          },
          userId,
          educationId
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({
              message: "No matching education record found for this user",
          });
      }

      return res.json({
          message: "User education updated successfully",
      });
  } catch (error) {
      console.error("Error updating user education:", error.message);
      return res.status(500).json({
          message: "Server Error",
          serverMessage: error.message,
      });
  }
};

const deleteUser = async (req, res) => {
  const { idUser } = req.params;
  try {
    await UsersModel.deleteUser(idUser);
    res.json({
      message: "DELETE user success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error,
    });
  }
};

const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validasi input
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            message: "Current password and new password are required",
        });
    }

    try {
        // Ambil data user berdasarkan userId dari middleware auth
        const userId = req.user.userId; // Pastikan middleware auth benar
        const [userData] = await UsersModel.getPasswordById(userId);

        if (!userData.length) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const user = userData[0];

        // console.log("Debugging:", { userId, currentPassword, newPassword, user });

        if (!user.password) {
            return res.status(400).json({
                message: "Password not set for this user",
            });
        }

        // Bandingkan password lama dengan hash di database
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Current password is incorrect",
            });
        }

        // Hash password baru
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password di database
        await UsersModel.updatePassword(hashedNewPassword, userId);

        return res.json({
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error("Error updating password:", error.message);
        return res.status(500).json({
            message: "Server Error",
            serverMessage: error.message,
        });
    }
};

const insertEducationUser = async (req, res) => {
  const { body } = req;

  if (!body.tahun_lulus || !body.jenjang_studi || !body.universitas || !body.jurusan) {
    return res.status(400).json({
      message: "Incomplete data: graduation year, level of study, university, and major are required.",
      data: null,
    });
  }

  try {
    // userId dari middleware auth
    const userId = req.user.userId;

    // userId ke data
    const newEducation = { ...body, user_id: userId };

    // Insert
    await UsersModel.insertEducationUser(newEducation);

    res.status(201).json({
      message: "Insert user education success"
    });
  } catch (error) {
    console.error("Error inserting user education:", error.message);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

const deleteEducationUser = async (req, res) => {
  const { educationId } = req.params;

  try {
    const userId = req.user.userId;

    await UsersModel.deleteEducationUser(userId, educationId);
    res.json({
      message: "DELETE user success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error,
    });
  }
};

const getLevelEducation = async (req, res) => {
  
  try {

      const tipeMentoring = await UsersModel.getLevelEducation();

      // return res.status(200).json({
      //     tipe_mentoring: tipeMentoring
      // });

      return res.status(200).json(tipeMentoring);
  } catch (error) {
      console.error("Error fetching jenjang studi:", error);
      return res.status(500).json({
          message: "Internal server error",
          serverMessage: error.message,
      });
  }
};



module.exports = {
  loginUser,
  getCurrentUser,
  getEducationUser,
  getEducationUserById,
  getAllUsers,
  getUserById,
  getUserByNrp,
  getUserByEmail,
  createNewUser,
  updateUser,
  updateEducationUser,
  deleteUser,
  updatePassword,
  insertEducationUser,
  deleteEducationUser,
  getLevelEducation,
};
