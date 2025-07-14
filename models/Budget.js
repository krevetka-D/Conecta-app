// models/Budget.js
const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        required: true,
        enum: ['setup_deposit', 'monthly_student', 'monthly_employee']
    },
    entries: [{
        category: { type: String, required: true },
        amount: { type: Number, required: true, default: 0 },
        description: { type: String },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Budget', BudgetSchema);