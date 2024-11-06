const dbPool = require('../config/database');

const getAllUsers = () => {
    const SQLQuery = 'SELECT * FROM user_';
    return dbPool.execute(SQLQuery);
}

const getUserById = (idUser) => {
    const SQLQuery = `SELECT * FROM user_ WHERE user_id=${idUser}`;
    return dbPool.execute(SQLQuery);
}

const createNewUser = (body) => {
    const SQLQuery = `INSERT INTO user_ (assessment_id, batch_data_batch_id, role_id, nama_lengkap, nrp, password_, email, posisi, asal_universitas, jurusan, tempat_lahir, tanggal_lahir, domisili, no_hp) 
                      VALUES ('${body.assessment_id}', '${body.batch_data_batch_id}', '${body.role_id}', '${body.nama_lengkap}', '${body.nrp}', 
                      '${body.password_}', '${body.email}', '${body.posisi}', '${body.asal_universitas}', '${body.jurusan}', 
                      '${body.tempat_lahir}', '${body.tanggal_lahir}', '${body.domisili}', '${body.no_hp}')`;

    return dbPool.execute(SQLQuery);
}

const updateUser = (body, idUser) => {
    const SQLQuery = `UPDATE user_ 
                      SET nama_lengkap = ?, email = ?, domisili = ? 
                      WHERE user_id = ?`;
    const values = [body.nama_lengkap, body.email, body.domisili, idUser];

    return dbPool.execute(SQLQuery, values);
}

const deleteUser = (idUser) => {
    const SQLQuery = `DELETE FROM user_ WHERE user_id = ?`;
    return dbPool.execute(SQLQuery, [idUser]);
}

module.exports = {
    getAllUsers,
    getUserById,
    createNewUser,
    updateUser,
    deleteUser,
}
