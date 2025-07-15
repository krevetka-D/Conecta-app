// models/BudgetEntry.js

import mongoose from 'mongoose';

const budgetEntrySchema = mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    description: { type: String, trim: true },
    entryDate: { type: Date, required: true },
}, { timestamps: true });

const BudgetEntry = mongoose.model('BudgetEntry', budgetEntrySchema);
export default BudgetEntry;