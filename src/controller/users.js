const UsersModel = require('../models/users');

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
    getAllUsers,
    getUserById,
    createNewUser,
    updateUser,
    deleteUser,
}