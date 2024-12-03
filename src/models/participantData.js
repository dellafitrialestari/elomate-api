const dbPool = require('../config/database');

const getParticipantData = async (userId) => {
  const SQLQuery = `
  SELECT 
    u.user_id,
    u.nama_lengkap,
    r.role_name,
    b.batch_name,
    u.nrp,
    u.email,
    u.posisi,
    -- u.asal_universitas,
    -- u.jurusan,
    u.tempat_lahir,
    u.tanggal_lahir,
    u.domisili,
    u.no_hp
  FROM 
    user u
  JOIN 
    role r ON u.role_id = r.role_id
  JOIN 
    batch_data b ON u.batch_data_batch_id = b.batch_id
  WHERE u.role_id = (
    SELECT role_id
    FROM user
    WHERE user_id = ?
  )
  AND u.batch_data_batch_id = (
  SELECT batch_data_batch_id
  FROM user
  WHERE user_id = ?
  );
  `;

  return dbPool.execute(SQLQuery, [userId, userId]);
};


module.exports = {
    getParticipantData,
}
