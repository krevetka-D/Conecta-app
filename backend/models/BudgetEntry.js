
import mongoose from 'mongoose';

const budgetEntrySchema = mongoose.Schema({
    user: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'User', 
        required: true,
        index: true 
    },
    type: { 
        type: String, 
        enum: ['INCOME', 'EXPENSE'], 
        required: true,
        index: true 
    },
    category: { 
        type: String, 
        required: true, 
        trim: true,
        index: true 
    },
    amount: { 
        type: Number, 
        required: true,
        index: true 
    },
    description: { type: String, trim: true },
    entryDate: { 
        type: Date, 
        required: true,
        index: true 
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound indexes for common queries
budgetEntrySchema.index({ user: 1, entryDate: -1 });
budgetEntrySchema.index({ user: 1, type: 1, entryDate: -1 });
budgetEntrySchema.index({ user: 1, category: 1, entryDate: -1 });

// Virtual for formatted amount
budgetEntrySchema.virtual('formattedAmount').get(function() {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(this.amount);
});

const BudgetEntry = mongoose.model('BudgetEntry', budgetEntrySchema);

export default BudgetEntry;