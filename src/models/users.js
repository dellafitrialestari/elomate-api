const dbPool = require('../config/database');

const verifyUser = async (email, password) => {
    const SQLQuery = `SELECT * FROM user WHERE email = ? AND password = ?`;
    console.log("SQL Query:", SQLQuery);
    console.log("Parameters:", [email, password]); // Log parameters to confirm values
    
    return dbPool.execute(SQLQuery, [email, password]);
};


const getAllUsers = () => {
    const SQLQuery = 'SELECT * FROM user';
    return dbPool.execute(SQLQuery);
}

const getUserById = (idUser) => {
    const SQLQuery = `
      SELECT 
          user.user_id,
          user.nama_lengkap,
          role.role_name,
          batch_data.batch_name,
          user.nrp,
          user.email,
          user.posisi,
          user.asal_universitas,
          user.jurusan,
          user.tahun_lulus,
          user.jenjang_studi,
          user.tempat_lahir,
          user.tanggal_lahir,
          user.domisili,
          user.no_hp
      FROM 
          user
      LEFT JOIN 
          role ON user.role_id = role.role_id
      LEFT JOIN 
          course_enrollment ON user.user_id = course_enrollment.user_user_id
      LEFT JOIN 
          course ON course_enrollment.course_id = course.course_id
      LEFT JOIN 
          batch_data ON user.batch_data_batch_id = batch_data.batch_id
      WHERE 
          user.user_id = ?;
    `;
  
    return dbPool.execute(SQLQuery, [idUser]);
};

const getUserByNrp = (nrpUser) => {
    const SQLQuery = `SELECT * FROM user WHERE nrp=${nrpUser}`;
    return dbPool.execute(SQLQuery);
}

const getUserByEmail = (emailUser) => {
    const SQLQuery = `SELECT * FROM user WHERE email = ?`;
    return dbPool.execute(SQLQuery, [emailUser]);
};

const createNewUser = (body) => {
    const SQLQuery = `INSERT INTO user (batch_data_batch_id, role_id, nama_lengkap, nrp, password, email, posisi, asal_universitas, jurusan, tempat_lahir, tanggal_lahir, domisili, no_hp) 
                      VALUES ('${body.batch_data_batch_id}', '${body.role_id}', '${body.nama_lengkap}', '${body.nrp}', 
                      '${body.password}', '${body.email}', '${body.posisi}', '${body.asal_universitas}', '${body.jurusan}', 
                      '${body.tempat_lahir}', '${body.tanggal_lahir}', '${body.domisili}', '${body.no_hp}')`;

    return dbPool.execute(SQLQuery);
}

const updateUser = (body, idUser) => {
    const SQLQuery = `UPDATE user 
                      SET asal_universitas = ?, jurusan = ?, tempat_lahir = ?, tanggal_lahir = ?, domisili = ?, no_hp = ?, tahun_lulus = ?, jenjang_studi = ? 
                      WHERE user_id = ?`;
    const values = [body.asal_universitas, body.jurusan, body.tempat_lahir, body.tanggal_lahir, body.domisili, body.no_hp, body.tahun_lulus, body.jenjang_studi, idUser];

    return dbPool.execute(SQLQuery, values);
}

const updatePassword = (hashedPassword, userId) => {
    const SQLQuery = `
        UPDATE user
        SET password = ? 
        WHERE user_id = ?
    `;
    const values = [hashedPassword, userId];
    return dbPool.execute(SQLQuery, values);
};
    

const deleteUser = (idUser) => {
    const SQLQuery = `DELETE FROM user WHERE user_id = ?`;
    return dbPool.execute(SQLQuery, [idUser]);
}

const getPasswordById = async (userId) => {
    const SQLQuery = `
        SELECT password
        FROM user
        WHERE user_id = ?
        LIMIT 1;
    `;
    return dbPool.execute(SQLQuery, [userId]);
};


module.exports = {
    verifyUser,
    getAllUsers,
    getUserById,
    getUserByNrp,
    getUserByEmail,
    createNewUser,
    updateUser,
    deleteUser,
    updatePassword,
    getPasswordById,
}
