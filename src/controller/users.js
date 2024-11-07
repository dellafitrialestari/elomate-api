const UsersModel = require('../models/users');

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login Attempt with Email:", email, "and Password:", password); // Log incoming values
    
    try {
        // Step 1: Check if the email exists
        const [userCheck] = await UsersModel.getUserByEmail(email);
        
        if (!userCheck || userCheck.length === 0) {
            // email does not exist
            return res.status(401).json({
                message: 'Invalid Email',
                data: null,
            });
        }
        
        // Step 2: Verify password if email is valid
        const [data] = await UsersModel.verifyUser(email, password);
        
        if (!data || data.length === 0) {
            // Password is incorrect
            return res.status(401).json({
                message: 'Invalid Password',
                data: null,
            });
        }

        // Step 3: Successfully authenticated, return user data
        const user = data[0];
        const role = user.role_id === 1 ? 'admin' : user.role_id === 2 ? 'fasilitator' : 'management trainee';

        res.json({
            message: 'You successfully logged in',
            data: {
                userId: user.user_id,
                name: user.nama_lengkap,
                role: role,
            },
        });
    } catch (error) {
        console.error("Error logging in:", error); // Log error details
        res.status(500).json({
            message: 'Failed to login user',
            serverMessage: error,
        });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const [data] = await UsersModel.getAllUsers();
    
        res.json({
            message: 'GET all users success',
            data: data
        })
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            serverMessage: error,
        })
    }
}

const getUserById = async (req, res) => {
    const { idUser } = req.params;
    try {
        const [data] = await UsersModel.getUserById(idUser);
    
        if (data.length === 0) {
            return res.status(404).json({
                message: 'User not found',
                data: null,
            });
        }

        res.json({
            message: 'GET user by ID success',
            data: data[0]
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            serverMessage: error,
        });
    }
}

const getUserByNrp = async (req, res) => {
    const { nrpUser } = req.params;
    try {
        const [data] = await UsersModel.getUserByNrp(nrpUser);
    
        if (data.length === 0) {
            return res.status(404).json({
                message: 'User not nrp found',
                data: null,
            });
        }

        res.json({
            message: 'GET user by NRP success',
            data: data[0]
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            serverMessage: error,
        });
    }
}

const getUserByEmail = async (req, res) => {
    const { emailUser } = req.params;
    try {
        const [data] = await UsersModel.getUserByEmail(emailUser);
    
        if (data.length === 0) {
            return res.status(404).json({
                message: 'User not found',
                data: null,
            });
        }

        res.json({
            message: 'GET user by email success',
            data: data[0]
        });
    } catch (error) {
        console.error("Error:", error); // Log error for debugging
        res.status(500).json({
            message: 'Server Error',
            serverMessage: error,
        });
    }
};

const createNewUser = async (req, res) => {
    const {body} = req;

    if (!body.email || !body.nama_lengkap || !body.domisili) {
        return res.status(400).json({
            message: 'Anda mengirimkan data yang salah',
            data: null,
        });
    }

    try {
        await UsersModel.createNewUser(body);
        res.status(201).json({
            message: 'CREATE new user success',
            data: body
        })
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            serverMessage: error,
        })
    }
}

const updateUser = async (req, res) => {
    const {idUser} = req.params;
    const {body} = req;
    try {
        await UsersModel.updateUser(body, idUser);
        res.json({
            message: 'UPDATE user success',
            data: {
                id: idUser,
                ...body
            },
        })
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            serverMessage: error,
        })
    }
}

const deleteUser = async (req, res) => {
    const {idUser} = req.params;
    try {
        await UsersModel.deleteUser(idUser);
        res.json({
            message: 'DELETE user success',
            data: null
        })
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            serverMessage: error,
        })
    }
}

module.exports = {
    loginUser,
    getAllUsers,
    getUserById,
    getUserByNrp,
    getUserByEmail,
    createNewUser,
    updateUser,
    deleteUser,
}