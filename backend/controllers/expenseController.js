const Expense = require('../models/expense');
const Group = require('../models/group');
const User = require('../models/user');

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
    const { title, description, amount, groupId, splitType, splits, category, date } = req.body;

    try {
        // Check if group exists and user is a member
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const isMember = group.members.some(
            member => member.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You must be a member of the group to add expenses'
            });
        }

        // Create expense
        const expense = await Expense.create({
            title,
            description,
            amount,
            paidBy: req.user._id,
            group: groupId,
            splitType: splitType || 'equal',
            splits,
            category: category || 'other',
            date: date || Date.now()
        });

        // Populate fields
        const populatedExpense = await Expense.findById(expense._id)
            .populate('paidBy', 'name email')
            .populate('group', 'name')
            .populate('splits.user', 'name email');

        res.status(201).json({
            success: true,
            expense: populatedExpense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all expenses for a group
// @route   GET /api/expenses/group/:groupId
// @access  Private
const getGroupExpenses = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Check if user is member of group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const isMember = group.members.some(
            member => member.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        const expenses = await Expense.find({ group: groupId })
            .populate('paidBy', 'name email')
            .populate('splits.user', 'name email')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: expenses.length,
            expenses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id)
            .populate('paidBy', 'name email phoneNumber')
            .populate('group', 'name')
            .populate('splits.user', 'name email');

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Check if user is in the group
        const group = await Group.findById(expense.group._id);
        const isMember = group.members.some(
            member => member.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this expense'
            });
        }

        res.status(200).json({
            success: true,
            expense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private (only person who created it)
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Only the person who paid can update
        if (expense.paidBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the person who paid can update this expense'
            });
        }

        const { title, description, amount, splitType, splits, category, date } = req.body;

        // Update fields
        if (title) expense.title = title;
        if (description) expense.description = description;
        if (amount) expense.amount = amount;
        if (splitType) expense.splitType = splitType;
        if (splits) expense.splits = splits;
        if (category) expense.category = category;
        if (date) expense.date = date;

        await expense.save();

        const updatedExpense = await Expense.findById(expense._id)
            .populate('paidBy', 'name email')
            .populate('splits.user', 'name email');

        res.status(200).json({
            success: true,
            expense: updatedExpense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (only person who created it)
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Check if user is the payer OR the group admin
        const group = await Group.findById(expense.group);
        const isAdmin = group && group.admin.toString() === req.user._id.toString();
        const isPayer = expense.paidBy.toString() === req.user._id.toString();

        if (!isPayer && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only the payer or group admin can delete this expense'
            });
        }

        await expense.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Calculate balances for a group (who owes whom)
// @route   GET /api/expenses/group/:groupId/balances
// @access  Private
const getGroupBalances = async (req, res) => {
    try {
        const { groupId } = req.params;

        // Check if user is member
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const isMember = group.members.some(
            member => member.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        // Get all expenses for the group
        const expenses = await Expense.find({ group: groupId });

        // Calculate net balance for each user
        const balances = {};

        expenses.forEach(expense => {
            const paidById = expense.paidBy.toString();

            // Initialize if not exists
            if (!balances[paidById]) {
                balances[paidById] = 0;
            }

            // Person who paid gets positive balance
            balances[paidById] += expense.amount;

            // People who owe get negative balance
            expense.splits.forEach(split => {
                const userId = split.user.toString();
                if (!balances[userId]) {
                    balances[userId] = 0;
                }
                balances[userId] -= split.amount;
            });
        });

        // Convert to array and populate user details
        const balanceArray = await Promise.all(
            Object.entries(balances).map(async ([userId, balance]) => {
                const user = await User.findById(userId).select('name email');
                return {
                    user,
                    balance: Math.round(balance * 100) / 100  // Round to 2 decimals
                };
            })
        );

        // Separate who owes and who is owed
        const owes = balanceArray.filter(b => b.balance < 0);
        const owed = balanceArray.filter(b => b.balance > 0);
        const settled = balanceArray.filter(b => b.balance === 0);

        res.status(200).json({
            success: true,
            balances: {
                owes,      // People who owe money
                owed,      // People who are owed money
                settled    // People with no balance
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createExpense,
    getGroupExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getGroupBalances
};