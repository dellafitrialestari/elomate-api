const kirkpatrickModel = require("../models/kirkpatrick");

const getKirkpatrickUser = async (req, res) => {
    const userId = req.user.userId;

    try {
        // Get Peer Assessment scores
        const peerScores = await kirkpatrickModel.getPeerAssessmentScores(userId);

        // Get Self Assessment scores
        const selfScores = await kirkpatrickModel.getSelfAssessmentScores(userId);

        // Remove description from the response
        const removeDescription = (data) => {
            return data.map((item) => ({
                ...item,
                data: item.data.map(({ description, ...rest }) => rest),
            }));
        };

        res.status(200).json({
            peerAssessment: {
                label: "Rekan Kerja",
                data: removeDescription(peerScores),
            },
            selfAssessment: {
                label: "Self",
                data: removeDescription(selfScores),
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getKirkpatrickUserDetail = async (req, res) => {
    const userId = req.user.userId;

    try {
        const peerScores = await kirkpatrickModel.getPeerAssessmentScores(userId);
        const selfScores = await kirkpatrickModel.getSelfAssessmentScores(userId);

        // 3 highest dan 3 lowest
        const getHighestAndLowest = (data) => {
            if (data.length <= 1) return { data }; // Tidak ada highest/lowest jika hanya satu data

            const sortedData = [...data].sort((a, b) => b.average_score - a.average_score);

            return {
                highestData: sortedData.slice(0, 3),
                lowestData: sortedData.slice(-3).reverse(),
            };
        };

        // Handle description null
        const handleNullDescription = (data) => {
            return data.map((item) => ({
                ...item,
                data: item.data.map((entry) => ({
                    ...entry,
                    description: entry.description || entry.point_kirkpatrick,
                })),
            }));
        };

        // Peer Assessment
        const formattedPeerScores = handleNullDescription(peerScores).map((item) => {
            const { data, ...rest } = item;
            const result = getHighestAndLowest(data);

            return {
                ...rest,
                ...result,
            };
        });

        // Self Assessment
        const formattedSelfScores = handleNullDescription(selfScores).map((item) => {
            const { data, ...rest } = item;
            const result = getHighestAndLowest(data);

            return {
                ...rest,
                ...result,
            };
        });

        res.status(200).json({
            peerAssessment: {
                label: "Rekan Kerja",
                data: formattedPeerScores,
            },
            selfAssessment: {
                label: "Self",
                data: formattedSelfScores,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getKirkpatrickUser,
    getKirkpatrickUserDetail,
};
