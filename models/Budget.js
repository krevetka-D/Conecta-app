import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;