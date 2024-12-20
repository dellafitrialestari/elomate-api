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
          user.divisi,
          -- user.asal_universitas,
          -- user.jurusan,
          -- user.tahun_lulus,
          -- user.jenjang_studi,
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


const getEducationUser = (idUser) => {
    const SQLQuery = `
    SELECT 
        user_education.id_education,
        user.user_id,
        user.nama_lengkap,
        user_education.jenjang_studi,
        user_education.universitas,
        user_education.jurusan,
        user_education.tahun_lulus
    FROM 
        user_education
    LEFT JOIN 
        user ON user_education.user_id = user.user_id
    WHERE 
        user.user_id = ?;
    `;
  
    return dbPool.execute(SQLQuery, [idUser]);
};

const getEducationUserById = (idUser, educationId) => {
    const SQLQuery = `
    SELECT 
        user_education.id_education,
        user.user_id,
        user.nama_lengkap,
        user_education.jenjang_studi,
        user_education.universitas,
        user_education.jurusan,
        user_education.tahun_lulus
    FROM 
        user_education
    LEFT JOIN 
        user ON user_education.user_id = user.user_id
    WHERE 
        user.user_id = ?
        AND user_education.id_education = ?;
    `;
  
    return dbPool.execute(SQLQuery, [idUser, educationId]);
};

const getUserByNrp = (nrpUser) => {
    const SQLQuery = `
    SELECT 
          user.user_id,
          user.nama_lengkap,
          role.role_name,
          batch_data.batch_name,
          user.nrp,
          user.email,
          user.posisi,
          -- user.asal_universitas,
          -- user.jurusan,
          -- user.tahun_lulus,
          -- user.jenjang_studi,
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
          user.nrp=${nrpUser};
    `;
    return dbPool.execute(SQLQuery);
}

const getUserByEmail = (emailUser) => {
    const SQLQuery = `SELECT * FROM user WHERE email = ?`;
    return dbPool.execute(SQLQuery, [emailUser]);
};

const getUserByNRP = (nrpUser) => {
    const SQLQuery = `SELECT * FROM user WHERE nrp = ?`;
    return dbPool.execute(SQLQuery, [nrpUser]);
};

const createNewUser = (body) => {
    const SQLQuery = `
      INSERT INTO user (
        batch_data_batch_id, 
        role_id, 
        nama_lengkap, 
        nrp, 
        password, 
        email, 
        posisi, 
        divisi, 
        tempat_lahir, 
        tanggal_lahir, 
        domisili, 
        no_hp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    // Use NULL for optional field
    const values = [
      body.batch_data_batch_id,
      body.role_id,
      body.nama_lengkap,
      body.nrp,
      body.password,
      body.email || null,
      body.posisi || null,
      body.divisi || null,
      body.tempat_lahir || null,
      body.tanggal_lahir || null,
      body.domisili || null,
      body.no_hp || null,
    ];
  
    return dbPool.execute(SQLQuery, values);
  };  

const updateUser = (body, idUser) => {
    const SQLQuery = `UPDATE user 
                      SET email = ?, posisi = ?, divisi = ?, tempat_lahir = ?, tanggal_lahir = ?, domisili = ?, no_hp = ?
                      WHERE user_id = ?`;
    const values = [body.email, body.posisi, body.divisi, body.tempat_lahir, body.tanggal_lahir, body.domisili, body.no_hp, idUser];

    return dbPool.execute(SQLQuery, values);
}

const updateEducationUser = async (body, idUser, educationId) => {
    const SQLQuery = `UPDATE user_education 
                      SET tahun_lulus = ?, jenjang_studi = ?, universitas = ?, jurusan = ? 
                      WHERE user_id = ? AND id_education = ?`;
    const values = [
        body.tahun_lulus,
        body.jenjang_studi,
        body.universitas,
        body.jurusan,
        idUser,
        educationId,
    ];

    const [result] = await dbPool.execute(SQLQuery, values);

    return result;
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

const insertEducationUser = (body) => {
    const SQLQuery = `
        INSERT INTO 
            user_education (user_id, tahun_lulus, jenjang_studi, universitas, jurusan) 
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [body.user_id, body.tahun_lulus, body.jenjang_studi, body.universitas, body.jurusan];

    return dbPool.execute(SQLQuery, values);
};

const deleteEducationUser = (userId, educationId) => {
    const SQLQuery = `DELETE FROM user_education WHERE user_id = ? AND id_education = ?`;
    return dbPool.execute(SQLQuery, [userId, educationId]);
}

const getLevelEducation = async () => {
    const query = `SHOW COLUMNS FROM user_education LIKE 'jenjang_studi'`;
    const [rows] = await dbPool.query(query);
    const enumValues = rows[0].Type.match(/enum\(([^)]+)\)/)[1] // Ekstrak enum values
        .split(',')
        .map(value => value.replace(/'/g, '')); // Hapus tanda kutip
    return enumValues;
  };

module.exports = {
    verifyUser,
    getAllUsers,
    getUserById,
    getEducationUser,
    getEducationUserById,
    getUserByNRP,
    getUserByNrp,
    getUserByEmail,
    createNewUser,
    updateUser,
    deleteUser,
    updatePassword,
    updateEducationUser,
    getPasswordById,
    insertEducationUser,
    deleteEducationUser,
    getLevelEducation,
}
