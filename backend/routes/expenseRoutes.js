const express = require('express');
const router = express.Router();
const {
    createExpense,
    getGroupExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getGroupBalances
} = require('../controllers/expenseController');
const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

// @route   POST /api/expenses
// @desc    Create a new expense
router.post('/', createExpense);

// @route   GET /api/expenses/group/:groupId
// @desc    Get all expenses for a group
router.get('/group/:groupId', getGroupExpenses);

// @route   GET /api/expenses/group/:groupId/balances
// @desc    Get balances for a group (who owes whom)
router.get('/group/:groupId/balances', getGroupBalances);

// @route   GET /api/expenses/:id
// @desc    Get single expense
router.get('/:id', getExpenseById);

// @route   PUT /api/expenses/:id
// @desc    Update expense
router.put('/:id', updateExpense);

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
router.delete('/:id', deleteExpense);

module.exports = router;