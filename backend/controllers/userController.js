const User = require('../models/user');

// @desc    Search users by email or phone
// @route   GET /api/users/search?query=...
// @access  Private
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        // Search by email or phone number
        const users = await User.find({
            $or: [
                { email: { $regex: query, $options: 'i' } },
                { phoneNumber: query }
            ]
        }).select('name email phoneNumber').limit(10);

        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { searchUsers };