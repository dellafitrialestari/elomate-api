const PaericipantModel = require('../models/participantData');

const getParticipantData = async (req, res) => {
    try {
        const userId = req.user.userId; // Ensure userId is extracted via middleware authentication
        
        // Fetch courses based on user ID
        const [participant] = await PaericipantModel.getParticipantData(userId);
        
        if (!participant || participant.length === 0) {
            return res.status(404).json({
                message: "No participant found for this user",
                data: null,
            });
        }

        // Format tanggal untuk setiap tugas tanpa mengubah zona waktu
      const formatTanggal = (tanggal) => {
        if (tanggal) {
            const tanggalObj = new Date(tanggal);
            const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");
            
            // Nama bulan dalam bahasa Indonesia
            const namaBulan = [
                "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                "Juli", "Agustus", "September", "Oktober", "November", "Desember"
            ];

            return `${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
        }
        return tanggal;
      };

      // Proses setiap assignment untuk format tanggal_mulai dan tanggal_selesai
      const formattedParticipant = participant.map((participant) => ({
        ...participant,
        tanggal_lahir: formatTanggal(participant.tanggal_lahir),
      }));

        return res.status(200).json(formattedParticipant);
    } catch (error) {
        console.error("Error fetching participant:", error);
        return res.status(500).json({
            message: "Internal server error",
            serverMessage: error.message,
        });
    }
};

module.exports = {
    getParticipantData,
};
