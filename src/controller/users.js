const UsersModel = require("../models/users");
const jwt = require("jsonwebtoken");
const { secret, expiresIn, refreshExpiresIn } = require("../config/jwt");

const bcrypt = require("bcrypt");

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
      data: null,
    });
  }

  try {
    const [userCheck] = await UsersModel.getUserByEmail(email);

    if (!userCheck || userCheck.length === 0) {
      return res.status(401).json({
        message: "Invalid Email",
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

    res.json({
      message: "GET user by ID success",
      data: data[0],
    });
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

    res.json({
      message: "GET user by NRP success",
      data: data[0],
    });
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

  if (!body.email || !body.nama_lengkap || !body.domisili || !body.password) {
    return res.status(400).json({
      message: "Incomplete data: email, full name, domicile, and password are required.",
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
  const { body } = req;
  try {
    const idUser = req.user.userId;
    await UsersModel.updateUser(body, idUser);
    res.json({
      message: "UPDATE user success",
      // data: {
      //   id: idUser,
      //   ...body,
      // },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error,
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
            data: null,
        });
    }

    try {
        // Ambil data user berdasarkan userId dari middleware auth
        const userId = req.user.userId; // Pastikan middleware auth benar
        const [userData] = await UsersModel.getPasswordById(userId);

        if (!userData.length) {
            return res.status(404).json({
                message: "User not found",
                data: null,
            });
        }

        const user = userData[0];

        // console.log("Debugging:", { userId, currentPassword, newPassword, user });

        if (!user.password) {
            return res.status(400).json({
                message: "Password not set for this user",
                data: null,
            });
        }

        // Bandingkan password lama dengan hash di database
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Current password is incorrect",
                data: null,
            });
        }

        // Hash password baru
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password di database
        await UsersModel.updatePassword(hashedNewPassword, userId);

        return res.json({
            message: "Password updated successfully",
            data: null,
        });
    } catch (error) {
        console.error("Error updating password:", error.message);
        return res.status(500).json({
            message: "Server Error",
            serverMessage: error.message,
        });
    }
};



module.exports = {
  loginUser,
  getCurrentUser,
  getAllUsers,
  getUserById,
  getUserByNrp,
  getUserByEmail,
  createNewUser,
  updateUser,
  deleteUser,
  updatePassword,
};
