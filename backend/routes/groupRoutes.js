const express=require('express')
const router=express.Router()
const {  createGroup,
    getMyGroups,
    getGroupById,
    updateGroup,
    addMember,
    removeMember,
    leaveGroup,
    deleteGroup}=require('../controllers/groupController')
const { protect } = require('../middlewares/authMiddleware')
 router.use(protect);
 //// @route   POST /api/groups
// @desc    Create a new group
// @access  Private
router.post('/', createGroup);

// @route   GET /api/groups
// @desc    Get all groups for logged-in user
// @access  Private
router.get('/', getMyGroups);

// @route   GET /api/groups/:id
// @desc    Get single group by ID
// @access  Private
router.get('/:id', getGroupById);

// @route   PUT /api/groups/:id
// @desc    Update group details (admin only)
// @access  Private
router.put('/:id', updateGroup);

// @route   POST /api/groups/:id/members
// @desc    Add member to group (admin only)
// @access  Private
router.post('/:id/members', addMember);

// @route   DELETE /api/groups/:id/members/:userId
// @desc    Remove member from group (admin only)
// @access  Private
router.delete('/:id/members/:userId', removeMember);

// @route   POST /api/groups/:id/leave
// @desc    Leave a group
// @access  Private
router.post('/:id/leave', leaveGroup);

// @route   DELETE /api/groups/:id
// @desc    Delete group (creator only)
// @access  Private
router.delete('/:id', deleteGroup);

module.exports = router;
   