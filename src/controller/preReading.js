const MateriModel = require("../models/preReading");

const { Storage } = require("@google-cloud/storage");

// Google Cloud Storage
const storage = new Storage();

const getMateriByUser = async (req, res) => {
  try {
    const userId = req.user.userId; // userId dari middleware autentikasi

    // Mendapatkan materi berdasarkan userId
    const [materi] = await MateriModel.getMateriByUser(userId);

    if (!materi || materi.length === 0) {
      return res.status(404).json({
        message: "No learning materials found for this user",
        data: null,
      });
    }

    // Mengelompokkan materi berdasarkan materi_id
    const groupedMateri = materi.reduce((acc, item) => {
      const { materi_id, file_name_id, bucket_name, content_type, ...rest } = item;
      if (!acc[materi_id]) {
        acc[materi_id] = { ...rest, materi_id, files: [] };
      }
      if (file_name_id) {
        acc[materi_id].files.push({ file_name_id, bucket_name, content_type });
      }
      return acc;
    }, {});

    // Menambahkan Signed URL untuk setiap file
    const materiWithSignedUrl = await Promise.all(
      Object.values(groupedMateri).map(async (materi) => {
        const updatedFiles = await Promise.all(
          materi.files.map(async (file) => {
            if (file.file_name_id && file.bucket_name) {
              try {
                const storageFile = storage
                  .bucket(file.bucket_name)
                  .file(file.file_name_id);

                // Memeriksa keberadaan file
                const [exists] = await storageFile.exists();
                if (!exists) {
                  console.error(`File not found: ${file.file_name_id}`);
                  return { ...file, signed_url: "File not found" };
                }

                // Membuat Signed URL
                const options = {
                  version: "v4",
                  action: "read",
                  expires: Date.now() + 6 * 60 * 60 * 1000, // Berlaku selama 6 jam
                };

                const [signedUrl] = await storageFile.getSignedUrl(options);
                return { ...file, signed_url: signedUrl };
              } catch (error) {
                console.error(
                  `Error generating Signed URL for file: ${file.file_name_id}`,
                  error
                );
                return { ...file, signed_url: "Error generating URL" };
              }
            } else {
              return { ...file, signed_url: "No content" };
            }
          })
        );

        return { ...materi, files: updatedFiles };
      })
    );

    return res.status(200).json(materiWithSignedUrl);
  } catch (error) {
    console.error("Error fetching learning materials:", error);
    return res.status(500).json({
      message: "Internal server error",
      serverMessage: error.message,
    });
  }
};

const getMateriByUserCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const userId = req.user.userId; // userId dari middleware autentikasi

    const [materi] = await MateriModel.getMateriByUserCourse(userId, courseId);

    if (!materi || materi.length === 0) {
      return res.status(404).json({
        message: "No learning materials found for this user",
        data: null,
      });
    }

    // materi by `materi_id`
    const groupedMateri = materi.reduce((acc, item) => {
      const { materi_id, file_name_id, bucket_name, content_type, ...rest } = item;
      if (!acc[materi_id]) {
        acc[materi_id] = { ...rest, materi_id, files: [] };
      }
      if (file_name_id) {
        acc[materi_id].files.push({ file_name_id, bucket_name, content_type });
      }
      return acc;
    }, {});

    // Signed URL setiap file
    const materiWithSignedUrl = await Promise.all(
      Object.values(groupedMateri).map(async (materi) => {
        const updatedFiles = await Promise.all(
          materi.files.map(async (file) => {
            if (file.file_name_id && file.bucket_name) {
              try {
                const storageFile = storage
                  .bucket(file.bucket_name) // bucket_name
                  .file(file.file_name_id);

                const [exists] = await storageFile.exists();
                if (!exists) {
                  console.error(`File not found: ${file.file_name_id}`);
                  return { ...file, signed_url: "File not found" };
                }

                const options = {
                  version: "v4",
                  action: "read",
                  // expires: Date.now() + 15 * 60 * 1000, // Berlaku 15 menit
                  expires: Date.now() + 6 * 60 * 60 * 1000, // Berlaku 6 jam
                };

                const [signedUrl] = await storageFile.getSignedUrl(options);
                return { ...file, signed_url: signedUrl };
              } catch (error) {
                console.error(
                  `Error generating Signed URL for file: ${file.file_name_id}`,
                  error
                );
                return { ...file, signed_url: "Error generating URL" };
              }
            } else {
              return { ...file, signed_url: "No content" };
            }
          })
        );

        return { ...materi, files: updatedFiles };
      })
    );

    return res.status(200).json(materiWithSignedUrl);
  } catch (error) {
    console.error("Error fetching learning materials:", error);
    return res.status(500).json({
      message: "Internal server error",
      serverMessage: error.message,
    });
  }
};  

const getMateriByMateriId = async (req, res) => {
  const { materiId } = req.params;

  try {
    const userId = req.user.userId; // userId dari middleware autentikasi

    const [materi] = await MateriModel.getMateriByMateriId(userId, materiId);

    if (!materi || materi.length === 0) {
      return res.status(404).json({
        message: "No learning materials found for this user",
        data: null,
      });
    }

    // materi by `materi_id`
    const groupedMateri = materi.reduce((acc, item) => {
      const { materi_id, file_name_id, bucket_name, content_type, file_path, ...rest } = item;
      if (!acc[materi_id]) {
        acc[materi_id] = { ...rest, materi_id, files: [] };
      }
      if (file_name_id) {
        const fileLocation = file_path
          ? `${file_path}/${file_name_id}` // Jika file dalam folder
          : file_name_id; // Jika file tidak dalam folder
        acc[materi_id].files.push({ file_name_id: fileLocation, bucket_name, content_type });
      }
      return acc;
    }, {});

    // Signed URL setiap file
    const materiWithSignedUrl = await Promise.all(
      Object.values(groupedMateri).map(async (materi) => {
        const updatedFiles = await Promise.all(
          materi.files.map(async (file) => {
            if (file.file_name_id && file.bucket_name) {
              try {
                const storageFile = storage
                  .bucket(file.bucket_name) // bucket_name
                  .file(file.file_name_id);

                const [exists] = await storageFile.exists();
                if (!exists) {
                  console.error(`File not found: ${file.file_name_id}`);
                  return { ...file, signed_url: "File not found" };
                }

                const options = {
                  version: "v4",
                  action: "read",
                  // expires: Date.now() + 15 * 60 * 1000, // Berlaku 15 menit
                  expires: Date.now() + 6 * 60 * 60 * 1000, // Berlaku 6 jam
                };

                const [signedUrl] = await storageFile.getSignedUrl(options);
                return { ...file, signed_url: signedUrl };
              } catch (error) {
                console.error(
                  `Error generating Signed URL for file: ${file.file_name_id}`,
                  error
                );
                return { ...file, signed_url: "Error generating URL" };
              }
            } else {
              return { ...file, signed_url: "No content" };
            }
          })
        );

        return { ...materi, files: updatedFiles };
      })
    );

    return res.status(200).json(materiWithSignedUrl[0]);
  } catch (error) {
    console.error("Error fetching learning materials:", error);
    return res.status(500).json({
      message: "Internal server error",
      serverMessage: error.message,
    });
  }
}; 

// const getMateriByMateriId = async (req, res) => {
//     const { materiId } = req.params;
//     try {
//         const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
        
//         // Fetch courses based on user ID
//         const [materi] = await MateriModel.getMateriByMateriId(userId, materiId);
        
//         if (!materi || materi.length === 0) {
//             return res.status(404).json({
//                 message: "No learning materials found for this user",
//                 data: null,
//             });
//         }
  
//         // Return all courses related to the user
//         // return res.status(200).json({ courses });
  
//         // Return the array directly without wrapping in an object
//         return res.status(200).json(materi[0]);
//     } catch (error) {
//         console.error("Error fetching courses:", error);
//         return res.status(500).json({
//             message: "Internal server error",
//             serverMessage: error.message,
//         });
//     }
//   };
  
module.exports = {
    getMateriByUser,
    getMateriByUserCourse,
    getMateriByMateriId,
  };