const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Expense title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    splitType: {
        type: String,
        enum: ['equal', 'exact', 'percentage'],
        default: 'equal'
    },
    splits: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    category: {
        type: String,
        enum: ['food', 'transport', 'accommodation', 'entertainment', 'utilities', 'shopping', 'other'],
        default: 'other'
    },
    date: {
        type: Date,
        default: Date.now
    },
    receipt: {
        type: String
    }
},
    { timestamps: true });

// Validate that splits add up to total amount - FIXED VERSION
expenseSchema.pre('save', function () {
    const totalSplit = this.splits.reduce((sum, split) => sum + split.amount, 0);

    // Allow small rounding differences (0.01)
    if (Math.abs(totalSplit - this.amount) > 0.01) {
        throw new Error(`Splits total (${totalSplit}) must equal expense amount (${this.amount})`);
    }
    // No next() call needed with async/await style
});

module.exports = mongoose.model('Expense', expenseSchema);