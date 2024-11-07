const dbPool = require('../config/database');

const verifyUser = async (email, password_) => {
    const SQLQuery = `SELECT * FROM user WHERE email = ? AND password_ = ?`;
    console.log("SQL Query:", SQLQuery);
    console.log("Parameters:", [email, password_]); // Log parameters to confirm values
    
    return dbPool.execute(SQLQuery, [email, password_]);
};


const getAllUsers = () => {
    const SQLQuery = 'SELECT * FROM user';
    return dbPool.execute(SQLQuery);
}

const getUserById = (idUser) => {
    const SQLQuery = `SELECT * FROM user WHERE user_id=${idUser}`;
    return dbPool.execute(SQLQuery);
}

const getUserByNrp = (nrpUser) => {
    const SQLQuery = `SELECT * FROM user WHERE nrp=${nrpUser}`;
    return dbPool.execute(SQLQuery);
}

const getUserByEmail = (emailUser) => {
    const SQLQuery = `SELECT * FROM user WHERE email = ?`;
    return dbPool.execute(SQLQuery, [emailUser]);
};

const createNewUser = (body) => {
    const SQLQuery = `INSERT INTO user (batch_data_batch_id, role_id, nama_lengkap, nrp, password_, email, posisi, asal_universitas, jurusan, tempat_lahir, tanggal_lahir, domisili, no_hp) 
                      VALUES ('${body.batch_data_batch_id}', '${body.role_id}', '${body.nama_lengkap}', '${body.nrp}', 
                      '${body.password_}', '${body.email}', '${body.posisi}', '${body.asal_universitas}', '${body.jurusan}', 
                      '${body.tempat_lahir}', '${body.tanggal_lahir}', '${body.domisili}', '${body.no_hp}')`;

    return dbPool.execute(SQLQuery);
}

const updateUser = (body, idUser) => {
    const SQLQuery = `UPDATE user 
                      SET nama_lengkap = ?, email = ?, domisili = ? 
                      WHERE user_id = ?`;
    const values = [body.nama_lengkap, body.email, body.domisili, idUser];

    return dbPool.execute(SQLQuery, values);
}

const deleteUser = (idUser) => {
    const SQLQuery = `DELETE FROM user WHERE user_id = ?`;
    return dbPool.execute(SQLQuery, [idUser]);
}

module.exports = {
    verifyUser,
    getAllUsers,
    getUserById,
    getUserByNrp,
    getUserByEmail,
    createNewUser,
    updateUser,
    deleteUser,
}
