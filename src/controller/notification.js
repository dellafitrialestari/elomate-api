const notificationModel = require('../models/notification');

const formatTanggal = (tanggal) => {
    if (tanggal) {
        const tanggalObj = new Date(tanggal);
        const [year, month, day] = tanggalObj.toISOString().split("T")[0].split("-");

        const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const hari = namaHari[tanggalObj.getDay()];

        const namaBulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];

        return `Deadline ${hari}, ${parseInt(day, 10)} ${namaBulan[parseInt(month, 10) - 1]} ${year}`;
    }
    return null;
};

const getNotificationData = async (req, res) => {
    const userId = req.user.userId;

    try {
        const notifications = await notificationModel.getNotificationData(userId);

        if (!notifications || notifications.length === 0) {
            return res.status(200).json({
                message: "Tidak ada notifikasi yang tersedia.",
                data: []
            });
        }

        // Format tanggal pada setiap notifikasi
        const formattedNotifications = notifications.map(notification => ({
            ...notification,
            deadline: notification.deadline ? formatTanggal(notification.deadline) : null,
        }));

        res.status(200).json({
            data_notif: formattedNotifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications.',
            error: error.message,
        });
    }
};

module.exports = {
    getNotificationData,
};