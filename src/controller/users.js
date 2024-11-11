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
  const { idUser } = req.params;
  const { body } = req;
  try {
    await UsersModel.updateUser(body, idUser);
    res.json({
      message: "UPDATE user success",
      data: {
        id: idUser,
        ...body,
      },
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

module.exports = {
  loginUser,
  getAllUsers,
  getUserById,
  getUserByNrp,
  getUserByEmail,
  createNewUser,
  updateUser,
  deleteUser,
};
