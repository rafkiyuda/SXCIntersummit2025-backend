const { getAllUsers, getAllStaff } = require('./admin.service');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve user data' });
    }
};

exports.getAllStaff = async (req, res) => {
    try {
        const staffs = await getAllStaff();
        res.status(200).json(staffs);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve staff data' });
    }
};