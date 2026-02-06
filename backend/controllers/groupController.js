const Group = require('../models/group');
const User = require('../models/user');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
    const { name, description, members } = req.body;

    try {
        // Create group with the logged-in user as admin
        const group = await Group.create({
            name,
            description,
            admin: req.user._id,  // SINGULAR: admin
            members: [req.user._id, ...(members || [])]  // Include creator in members
        });

        // Populate member and admin details
        const populatedGroup = await Group.findById(group._id)
            .populate('members', 'name email')
            .populate('admin', 'name email');  // SINGULAR: admin

        res.status(201).json({
            success: true,
            group: populatedGroup
        });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all groups for logged-in user
// @route   GET /api/groups
// @access  Private
const getMyGroups = async (req, res) => {
    try {
        const groups = await Group.find({
            members: req.user._id
        })
            .populate('members', 'name email')
            .populate('admin', 'name email')  // SINGULAR: admin
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: groups.length,
            groups
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'name email phoneNumber')
            .populate('admin', 'name email');  // SINGULAR: admin

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is a member of the group
        const isMember = group.members.some(
            member => member._id.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        res.status(200).json({
            success: true,
            group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update group details
// @route   PUT /api/groups/:id
// @access  Private (Admin only)
const updateGroup = async (req, res) => {
    const { name, description } = req.body;

    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is admin (SINGULAR)
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only group admin can update group details'
            });
        }

        // Update fields
        if (name) group.name = name;
        if (description) group.description = description;

        await group.save();

        const updatedGroup = await Group.findById(group._id)
            .populate('members', 'name email')
            .populate('admin', 'name email');  // SINGULAR: admin

        res.status(200).json({
            success: true,
            group: updatedGroup
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add members to group
// @route   POST /api/groups/:id/members
// @access  Private (Admin only)
const addMember = async (req, res) => {
    const { userId } = req.body;

    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is admin (SINGULAR)
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only admin can add members'
            });
        }

        // Check if user exists
        const userToAdd = await User.findById(userId);
        if (!userToAdd) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is already a member
        if (group.members.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'User is already a member of this group'
            });
        }

        group.members.push(userId);
        await group.save();

        const updatedGroup = await Group.findById(group._id)
            .populate('members', 'name email');

        res.status(200).json({
            success: true,
            message: 'Member added successfully',
            group: updatedGroup
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private (Admin only)
const removeMember = async (req, res) => {
    const { userId } = req.params;

    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if user is admin (SINGULAR)
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only admin can remove members'
            });
        }

        // Can't remove the admin
        if (group.admin.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove the group admin'
            });
        }

        // Remove member
        group.members = group.members.filter(
            member => member.toString() !== userId
        );

        await group.save();

        const updatedGroup = await Group.findById(group._id)
            .populate('members', 'name email');

        res.status(200).json({
            success: true,
            message: 'Member removed successfully',
            group: updatedGroup
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Leave a group
// @route   POST /api/groups/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Admin cannot leave their own group (SINGULAR)
        if (group.admin.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Group admin cannot leave. Delete the group instead.'
            });
        }

        // Remove user from members
        group.members = group.members.filter(
            member => member.toString() !== req.user._id.toString()
        );

        await group.save();

        res.status(200).json({
            success: true,
            message: 'You have left the group successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private (Admin only)
const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Only admin can delete (SINGULAR)
        if (group.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the group admin can delete this group'
            });
        }

        await group.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Group deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createGroup,
    getMyGroups,
    getGroupById,
    updateGroup,
    addMember,
    removeMember,
    leaveGroup,
    deleteGroup
};